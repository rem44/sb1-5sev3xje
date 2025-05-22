// src/services/claimService.ts
import { supabase, isSupabaseConfigured } from './supabase';
import { Claim, ClaimStatus, ClaimDocument, ClaimProduct } from '../types/claim';
import { mockClaims } from '../data/mockData';

// Helper function to get mock data from localStorage or initialize with the default mock data
const getMockClaims = (): Claim[] => {
  try {
    const storedClaims = localStorage.getItem('mock_claims');
    if (storedClaims) {
      const parsed = JSON.parse(storedClaims);
      // Ensure dates are properly converted
      return parsed.map((claim: any) => ({
        ...claim,
        creationDate: new Date(claim.creationDate),
        installationDate: claim.installationDate ? new Date(claim.installationDate) : undefined,
        lastUpdated: new Date(claim.lastUpdated),
        documents: claim.documents?.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate)
        })) || [],
        communications: claim.communications?.map((comm: any) => ({
          ...comm,
          date: new Date(comm.date)
        })) || []
      }));
    }
    // Initialize with mock data
    localStorage.setItem('mock_claims', JSON.stringify(mockClaims));
    return mockClaims;
  } catch (error) {
    console.error('Error parsing mock claims from localStorage:', error);
    // Return fresh mock data if localStorage is corrupted
    localStorage.setItem('mock_claims', JSON.stringify(mockClaims));
    return mockClaims;
  }
};

// Helper function to save mock data to localStorage
const saveMockClaims = (claims: Claim[]): void => {
  try {
    localStorage.setItem('mock_claims', JSON.stringify(claims));
  } catch (error) {
    console.error('Error saving mock claims to localStorage:', error);
  }
};

// Helper function to transform Supabase data to Claim object
const transformSupabaseClaimData = (item: any): Claim => {
  return {
    id: item.id,
    claimNumber: item.claim_number,
    clientName: item.client_name,
    clientId: item.client_id,
    creationDate: new Date(item.creation_date),
    status: item.status as ClaimStatus,
    department: item.department,
    identifiedCause: item.identified_cause,
    installed: Boolean(item.installed),
    installationDate: item.installation_date ? new Date(item.installation_date) : undefined,
    invoiceLink: item.invoice_link,
    solutionAmount: parseFloat(item.solution_amount || '0'),
    claimedAmount: parseFloat(item.claimed_amount || '0'),
    savedAmount: parseFloat(item.saved_amount || '0'),
    description: item.description || '',
    products: [], // Sera chargé séparément si nécessaire
    documents: [], // Sera chargé séparément si nécessaire
    checklists: [], // Sera chargé séparément si nécessaire
    communications: [], // Sera chargé séparément si nécessaire
    assignedTo: item.assigned_to,
    lastUpdated: new Date(item.last_updated)
  };
};

export const claimService = {
  async fetchClaims(): Promise<Claim[]> {
    try {
      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        console.log('Using mock claims data (Supabase not configured)');
        return getMockClaims();
      }

      // Requête simplifiée sans les jointures problématiques
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('creation_date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Transformer les données
      return data.map(transformSupabaseClaimData);
    } catch (error) {
      console.error('Error fetching claims:', error);
      // Fallback vers les données mock en cas d'erreur
      return getMockClaims();
    }
  },

  async getClaim(id: string): Promise<Claim | undefined> {
    try {
      // Valider l'input
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid claim ID provided');
      }

      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        return claims.find(claim => claim.id === id);
      }

      // Requête simplifiée pour une seule réclamation
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune ligne retournée
          return undefined;
        }
        throw error;
      }

      // Transformer les données
      const claim = transformSupabaseClaimData(data);

      // Charger les documents associés séparément
      try {
        const { data: documentsData, error: docsError } = await supabase
          .from('claim_documents')
          .select('*')
          .eq('claim_id', id);

        if (!docsError && documentsData) {
          claim.documents = documentsData.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            url: doc.url,
            uploadDate: new Date(doc.upload_date),
            category: doc.category,
            uploadedBy: doc.uploaded_by
          }));
        }
      } catch (docsError) {
        console.warn('Could not load documents for claim:', docsError);
      }

      // Charger les communications associées séparément
      try {
        const { data: commData, error: commError } = await supabase
          .from('claim_communications')
          .select('*')
          .eq('claim_id', id)
          .order('date', { ascending: false });

        if (!commError && commData) {
          claim.communications = commData.map((comm: any) => ({
            id: comm.id,
            date: new Date(comm.date),
            type: comm.type,
            subject: comm.subject,
            content: comm.content,
            sender: comm.sender,
            recipients: comm.recipients
          }));
        }
      } catch (commError) {
        console.warn('Could not load communications for claim:', commError);
      }

      return claim;
    } catch (error) {
      console.error(`Error fetching claim with id ${id}:`, error);
      // Fallback vers les données mock en cas d'erreur
      const claims = getMockClaims();
      return claims.find(claim => claim.id === id);
    }
  },

  async createClaim(claim: Partial<Claim>): Promise<string> {
    try {
      // Valider les champs requis
      if (!claim.clientName || !claim.clientId) {
        throw new Error('Client name and client ID are required');
      }

      // Générer un ID unique pour la nouvelle réclamation
      const newId = Date.now().toString(36) + Math.random().toString(36).substring(2);

      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();

        // Créer une nouvelle réclamation avec les champs requis
        const newClaim: Claim = {
          id: newId,
          claimNumber: claim.claimNumber || `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          clientName: claim.clientName,
          clientId: claim.clientId,
          creationDate: new Date(),
          status: claim.status || ClaimStatus.New,
          department: claim.department || 'Customer Service',
          identifiedCause: claim.identifiedCause,
          installed: Boolean(claim.installed),
          installationDate: claim.installationDate,
          invoiceLink: claim.invoiceLink,
          solutionAmount: claim.solutionAmount || 0,
          claimedAmount: claim.claimedAmount || 0,
          savedAmount: (claim.claimedAmount || 0) - (claim.solutionAmount || 0),
          description: claim.description || '',
          products: claim.products || [],
          documents: claim.documents || [],
          checklists: claim.checklists || [],
          communications: claim.communications || [],
          assignedTo: claim.assignedTo,
          lastUpdated: new Date()
        };

        claims.unshift(newClaim); // Ajouter au début pour l'ordre chronologique
        saveMockClaims(claims);
        return newId;
      }

      // Sinon, insérer dans Supabase
      const { data, error } = await supabase
        .from('claims')
        .insert({
          id: newId,
          claim_number: claim.claimNumber || `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          client_name: claim.clientName,
          client_id: claim.clientId,
          status: claim.status || ClaimStatus.New,
          department: claim.department || 'Customer Service',
          identified_cause: claim.identifiedCause,
          installed: Boolean(claim.installed),
          installation_date: claim.installationDate,
          invoice_link: claim.invoiceLink,
          solution_amount: claim.solutionAmount || 0,
          claimed_amount: claim.claimedAmount || 0,
          saved_amount: (claim.claimedAmount || 0) - (claim.solutionAmount || 0),
          description: claim.description || '',
          creation_date: new Date(),
          last_updated: new Date(),
          assigned_to: claim.assignedTo
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw new Error(`Failed to create claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updateClaim(id: string, updates: Partial<Claim>): Promise<void> {
    try {
      // Valider l'input
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid claim ID provided');
      }

      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        const claimIndex = claims.findIndex(claim => claim.id === id);

        if (claimIndex >= 0) {
          // Calculer le montant économisé si le montant de solution ou réclamé est mis à jour
          const updatedClaim = { ...claims[claimIndex], ...updates };
          if (updates.solutionAmount !== undefined || updates.claimedAmount !== undefined) {
            updatedClaim.savedAmount = updatedClaim.claimedAmount - updatedClaim.solutionAmount;
          }
          
          claims[claimIndex] = {
            ...updatedClaim,
            lastUpdated: new Date()
          };
          saveMockClaims(claims);
        } else {
          throw new Error(`Claim with ID ${id} not found`);
        }
        return;
      }

      // Sinon, mettre à jour dans Supabase
      const updateData: any = {};

      // Mapper les champs de réclamation aux champs de base de données
      if (updates.claimNumber !== undefined) updateData.claim_number = updates.claimNumber;
      if (updates.clientName !== undefined) updateData.client_name = updates.clientName;
      if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.department !== undefined) updateData.department = updates.department;
      if (updates.identifiedCause !== undefined) updateData.identified_cause = updates.identifiedCause;
      if (updates.installed !== undefined) updateData.installed = updates.installed;
      if (updates.installationDate !== undefined) updateData.installation_date = updates.installationDate;
      if (updates.invoiceLink !== undefined) updateData.invoice_link = updates.invoiceLink;
      if (updates.solutionAmount !== undefined) updateData.solution_amount = updates.solutionAmount;
      if (updates.claimedAmount !== undefined) updateData.claimed_amount = updates.claimedAmount;
      if (updates.savedAmount !== undefined) updateData.saved_amount = updates.savedAmount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;

      // Calculer le montant économisé si nécessaire
      if ((updates.solutionAmount !== undefined || updates.claimedAmount !== undefined) && updates.savedAmount === undefined) {
        // Récupérer les valeurs actuelles pour calculer le montant économisé
        const currentClaim = await this.getClaim(id);
        if (currentClaim) {
          const newClaimedAmount = updates.claimedAmount !== undefined ? updates.claimedAmount : currentClaim.claimedAmount;
          const newSolutionAmount = updates.solutionAmount !== undefined ? updates.solutionAmount : currentClaim.solutionAmount;
          updateData.saved_amount = newClaimedAmount - newSolutionAmount;
        }
      }

      // Toujours mettre à jour last_updated
      updateData.last_updated = new Date();

      const { error } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating claim ${id}:`, error);
      throw new Error(`Failed to update claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async uploadDocument(claimId: string, file: File, category: string): Promise<ClaimDocument> {
    try {
      // Valider les inputs
      if (!claimId || !file || !category) {
        throw new Error('Claim ID, file, and category are required');
      }

      // Valider la taille du fichier (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Générer un nom unique pour le fichier
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileExt);

      // Si Supabase n'est pas configuré, créer un document mock
      if (!isSupabaseConfigured()) {
        const mockUrl = isImage
          ? `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`
          : `https://via.placeholder.com/100x100?text=${encodeURIComponent(fileExt.toUpperCase())}`;

        // Créer un document mock
        const mockDocument: ClaimDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          name: file.name,
          type: isImage ? 'image' : 'document',
          url: mockUrl,
          uploadDate: new Date(),
          category,
          uploadedBy: 'mock-user-id'
        };

        // Mettre à jour la réclamation avec le nouveau document
        const claims = getMockClaims();
        const claimIndex = claims.findIndex(claim => claim.id === claimId);

        if (claimIndex >= 0) {
          claims[claimIndex].documents.push(mockDocument);
          claims[claimIndex].lastUpdated = new Date();
          saveMockClaims(claims);
        } else {
          throw new Error(`Claim with ID ${claimId} not found`);
        }

        return mockDocument;
      }

      // Sinon, uploader vers Supabase Storage
      const filePath = `documents/${claimId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('claim-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('claim-documents')
        .getPublicUrl(filePath);

      // Obtenir l'ID de l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();

      // Ajouter l'enregistrement du document dans la base de données
      const { data, error } = await supabase
        .from('claim_documents')
        .insert({
          claim_id: claimId,
          name: file.name,
          type: isImage ? 'image' : 'document',
          url: publicUrl,
          category,
          upload_date: new Date(),
          uploaded_by: user?.id || 'unknown'
        })
        .select()
        .single();

      if (error) throw error;

      // Transformer et retourner les données du document
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        url: data.url,
        uploadDate: new Date(data.upload_date),
        category: data.category,
        uploadedBy: data.uploaded_by
      };
    } catch (error) {
      console.error(`Error uploading document for claim ${claimId}:`, error);
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async deleteClaim(id: string): Promise<void> {
    try {
      // Valider l'input
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid claim ID provided');
      }

      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        const filteredClaims = claims.filter(claim => claim.id !== id);
        if (filteredClaims.length === claims.length) {
          throw new Error(`Claim with ID ${id} not found`);
        }
        saveMockClaims(filteredClaims);
        return;
      }

      // Sinon, supprimer de Supabase
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting claim ${id}:`, error);
      throw new Error(`Failed to delete claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async searchClaims(searchTerm: string): Promise<Claim[]> {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        return this.fetchClaims();
      }

      const searchLower = searchTerm.toLowerCase();

      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        return claims.filter(claim =>
          claim.claimNumber.toLowerCase().includes(searchLower) ||
          claim.clientName.toLowerCase().includes(searchLower) ||
          claim.clientId.toLowerCase().includes(searchLower) ||
          claim.description?.toLowerCase().includes(searchLower) ||
          claim.department.toLowerCase().includes(searchLower)
        );
      }

      // Sinon, rechercher dans Supabase
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .or(`claim_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,client_id.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('creation_date', { ascending: false });

      if (error) throw error;

      return data.map(transformSupabaseClaimData);
    } catch (error) {
      console.error('Error searching claims:', error);
      // Fallback vers la récupération normale
      return this.fetchClaims();
    }
  }
};

// S'assurer que le service est correctement exporté
export default claimService;
