// src/services/claimService.ts
import { supabase, isSupabaseConfigured } from './supabase';
import { Claim, ClaimStatus, ClaimDocument, ClaimProduct, ClaimChecklist, ClaimChecklistItem } from '../types/claim';
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
    clientName: item.client_name || '', 
    clientId: item.client_id || '',
    creationDate: new Date(item.creation_date || item.created_at),
    status: item.status as ClaimStatus,
    department: item.department || '',
    identifiedCause: item.identified_cause,
    installed: Boolean(item.installed),
    installationDate: item.installation_date ? new Date(item.installation_date) : undefined,
    invoiceLink: item.invoice_link,
    solutionAmount: parseFloat(item.solution_amount || '0'),
    claimedAmount: parseFloat(item.claimed_amount || '0'),
    savedAmount: parseFloat(item.saved_amount || '0'),
    description: item.description || '',
    products: item.claim_products?.map((product: any) => ({
      id: product.id,
      description: product.description,
      style: product.style || '',
      color: product.color || '',
      quantity: product.quantity || 0,
      pricePerSY: parseFloat(product.price_per_sy || '0'),
      totalPrice: parseFloat(product.total_price || '0'),
      claimedQuantity: product.claimed_quantity || 0
    })) || [],
    documents: item.claim_documents?.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      url: doc.url,
      uploadDate: new Date(doc.upload_date || doc.created_at),
      category: doc.category,
      uploadedBy: doc.uploaded_by
    })) || [],
    checklists: [], // Will be loaded separately
    communications: item.communications?.map((comm: any) => ({
      id: comm.id,
      date: new Date(comm.date),
      type: comm.type,
      subject: comm.subject,
      content: comm.content,
      sender: comm.sender,
      recipients: comm.recipients
    })) || [],
    assignedTo: item.assigned_to,
    lastUpdated: new Date(item.last_updated || item.updated_at)
  };
};

// Helper function to transform Claim object to Supabase format
const transformClaimToSupabaseData = (claim: Partial<Claim>): any => {
  const data: any = {};

  if (claim.claimNumber !== undefined) data.claim_number = claim.claimNumber;
  if (claim.clientName !== undefined) data.client_name = claim.clientName;
  if (claim.clientId !== undefined) data.client_id = claim.clientId;
  if (claim.status !== undefined) data.status = claim.status;
  if (claim.department !== undefined) data.department = claim.department;
  if (claim.identifiedCause !== undefined) data.identified_cause = claim.identifiedCause;
  if (claim.installed !== undefined) data.installed = claim.installed;
  if (claim.installationDate !== undefined) data.installation_date = claim.installationDate;
  if (claim.invoiceLink !== undefined) data.invoice_link = claim.invoiceLink;
  if (claim.solutionAmount !== undefined) data.solution_amount = claim.solutionAmount;
  if (claim.claimedAmount !== undefined) data.claimed_amount = claim.claimedAmount;
  if (claim.savedAmount !== undefined) data.saved_amount = claim.savedAmount;
  if (claim.description !== undefined) data.description = claim.description;
  if (claim.assignedTo !== undefined) data.assigned_to = claim.assignedTo;

  data.updated_at = new Date();

  return data;
};

export const claimService = {
  async fetchClaims(): Promise<Claim[]> {
    try {
      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        console.log('Using mock claims data (Supabase not configured)');
        return getMockClaims();
      }

      console.log('Fetching claims from Supabase...');

      // Requête avec les vrais noms de tables de votre DB
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          claim_documents(*),
          communications(*),
          claim_products(*)
        `)
        .order('creation_date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        
        // Si erreur de relation, essayer une requête simple
        if (error.code === 'PGRST200' || error.message.includes('relation')) {
          console.warn('Relation error, using simple query...');
          const { data: simpleData, error: simpleError } = await supabase
            .from('claims')
            .select('*')
            .order('creation_date', { ascending: false });
          
          if (simpleError) {
            console.error('Simple query also failed:', simpleError);
            throw simpleError;
          }
          return simpleData.map(transformSupabaseClaimData);
        }
        throw error;
      }

      console.log(`Successfully fetched ${data.length} claims from Supabase`);
      // Transformer les données
      return data.map(transformSupabaseClaimData);
    } catch (error) {
      console.error('Error fetching claims:', error);
      console.log('Falling back to mock data...');
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

      console.log(`Fetching claim ${id} from Supabase...`);

      // Requête avec les vrais noms de tables
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          claim_documents(*),
          communications(*),
          claim_products(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune ligne retournée
          console.log(`Claim ${id} not found in Supabase`);
          return undefined;
        }
        
        // Si erreur de relation, essayer une requête simple
        if (error.code === 'PGRST200' || error.message.includes('relation')) {
          console.warn('Relation error, trying simple query...');
          const { data: simpleData, error: simpleError } = await supabase
            .from('claims')
            .select('*')
            .eq('id', id)
            .single();
          
          if (simpleError) {
            if (simpleError.code === 'PGRST116') return undefined;
            throw simpleError;
          }
          
          const claim = transformSupabaseClaimData(simpleData);
          
          // Charger les documents séparément
          try {
            const { data: docsData } = await supabase
              .from('claim_documents')
              .select('*')
              .eq('claim_id', id);
            
            if (docsData) {
              claim.documents = docsData.map((doc: any) => ({
                id: doc.id,
                name: doc.name,
                type: doc.type,
                url: doc.url,
                uploadDate: new Date(doc.upload_date || doc.created_at),
                category: doc.category,
                uploadedBy: doc.uploaded_by
              }));
            }
          } catch (docsError) {
            console.warn('Could not load documents:', docsError);
          }
          
          // Charger les communications séparément
          try {
            const { data: commData } = await supabase
              .from('communications')
              .select('*')
              .eq('claim_id', id)
              .order('date', { ascending: false });
            
            if (commData) {
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
            console.warn('Could not load communications:', commError);
          }

          // Charger les produits séparément
          try {
            const { data: productsData } = await supabase
              .from('claim_products')
              .select('*')
              .eq('claim_id', id);
            
            if (productsData) {
              claim.products = productsData.map((product: any) => ({
                id: product.id,
                description: product.description,
                style: product.style || '',
                color: product.color || '',
                quantity: product.quantity || 0,
                pricePerSY: parseFloat(product.price_per_sy || '0'),
                totalPrice: parseFloat(product.total_price || '0'),
                claimedQuantity: product.claimed_quantity || 0
              }));
            }
          } catch (productsError) {
            console.warn('Could not load products:', productsError);
          }
          
          return claim;
        }
        
        throw error;
      }

      console.log(`Successfully fetched claim ${id} from Supabase`);
      return transformSupabaseClaimData(data);
    } catch (error) {
      console.error(`Error fetching claim with id ${id}:`, error);
      console.log('Falling back to mock data...');
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

      // Si Supabase n'est pas configuré, utiliser les données mock
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        const newId = Date.now().toString(36) + Math.random().toString(36).substring(2);

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

        claims.unshift(newClaim);
        saveMockClaims(claims);
        return newId;
      }

      console.log('Creating new claim in Supabase...');

      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();

      // Générer un claim number unique
      const claimNumber = claim.claimNumber || `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Insérer dans Supabase
      const insertData = {
        claim_number: claimNumber,
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
        updated_at: new Date(),
        created_by: user?.id,
        assigned_to: claim.assignedTo || user?.id
      };

      const { data, error } = await supabase
        .from('claims')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating claim:', error);
        throw error;
      }

      console.log(`Successfully created claim ${data.id} in Supabase`);
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

      console.log(`Updating claim ${id} in Supabase...`);

      // Transformer les données pour Supabase
      const updateData = transformClaimToSupabaseData(updates);

      // Calculer le montant économisé si nécessaire
      if ((updates.solutionAmount !== undefined || updates.claimedAmount !== undefined) && updates.savedAmount === undefined) {
        const currentClaim = await this.getClaim(id);
        if (currentClaim) {
          const newClaimedAmount = updates.claimedAmount !== undefined ? updates.claimedAmount : currentClaim.claimedAmount;
          const newSolutionAmount = updates.solutionAmount !== undefined ? updates.solutionAmount : currentClaim.solutionAmount;
          updateData.saved_amount = newClaimedAmount - newSolutionAmount;
        }
      }

      const { error } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating claim:', error);
        throw error;
      }

      console.log(`Successfully updated claim ${id} in Supabase`);
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

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileExt);

      // Si Supabase n'est pas configuré, créer un document mock
      if (!isSupabaseConfigured()) {
        const mockUrl = isImage
          ? `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`
          : `https://via.placeholder.com/100x100?text=${encodeURIComponent(fileExt.toUpperCase())}`;

        const mockDocument: ClaimDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          name: file.name,
          type: isImage ? 'image' : 'document',
          url: mockUrl,
          uploadDate: new Date(),
          category,
          uploadedBy: 'mock-user-id'
        };

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

      console.log(`Uploading document for claim ${claimId}...`);

      // Upload vers Supabase Storage
      const filePath = `claims/${claimId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('claim-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('claim-documents')
        .getPublicUrl(filePath);

      const { data: { user } } = await supabase.auth.getUser();

      // Insérer dans claim_documents
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

      if (error) {
        console.error('Error inserting document record:', error);
        throw error;
      }

      console.log(`Successfully uploaded document ${data.id} for claim ${claimId}`);

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
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid claim ID provided');
      }

      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        const filteredClaims = claims.filter(claim => claim.id !== id);
        if (filteredClaims.length === claims.length) {
          throw new Error(`Claim with ID ${id} not found`);
        }
        saveMockClaims(filteredClaims);
        return;
      }

      console.log(`Deleting claim ${id} from Supabase...`);

      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting claim:', error);
        throw error;
      }

      console.log(`Successfully deleted claim ${id} from Supabase`);
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

      console.log(`Searching claims for: ${searchTerm}`);

      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          claim_documents(*),
          communications(*),
          claim_products(*)
        `)
        .or(`claim_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,client_id.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('creation_date', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log(`Found ${data.length} claims matching search term`);
      return data.map(transformSupabaseClaimData);
    } catch (error) {
      console.error('Error searching claims:', error);
      console.log('Falling back to fetching all claims...');
      return this.fetchClaims();
    }
  },

  async getClaimChecklists(claimId: string): Promise<ClaimChecklist[]> {
    try {
      if (!isSupabaseConfigured()) {
        // Return empty array for mock data - checklists will be handled differently
        return [];
      }

      console.log(`Fetching checklists for claim ${claimId}...`);

      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('claim_id', claimId);

      if (error) {
        console.error('Error fetching checklists:', error);
        return [];
      }

      // Group checklist items by type
      const groupedItems = data.reduce((acc: any, item: any) => {
        const type = item.type || 'General';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push({
          id: item.id,
          title: item.description || 'Checklist item',
          completed: Boolean(item.completed),
          notes: item.value || ''
        });
        return acc;
      }, {});

      return Object.entries(groupedItems).map(([type, items]) => ({
        id: `checklist-${type}-${claimId}`,
        type,
        items: items as ClaimChecklistItem[]
      }));
    } catch (error) {
      console.error(`Error fetching checklists for claim ${claimId}:`, error);
      return [];
    }
  },

  async updateChecklistItem(claimId: string, itemId: string, updates: Partial<ClaimChecklistItem>): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        // Handle mock data updates if needed
        return;
      }

      console.log(`Updating checklist item ${itemId} for claim ${claimId}...`);

      const updateData: any = {};
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.notes !== undefined) updateData.value = updates.notes;
      if (updates.title !== undefined) updateData.description = updates.title;
      updateData.updated_at = new Date();

      const { error } = await supabase
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId)
        .eq('claim_id', claimId);

      if (error) {
        console.error('Error updating checklist item:', error);
        throw error;
      }

      console.log(`Successfully updated checklist item ${itemId}`);
    } catch (error) {
      console.error(`Error updating checklist item ${itemId}:`, error);
      throw new Error(`Failed to update checklist item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

export default claimService;
