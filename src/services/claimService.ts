// src/services/claimService.ts
import { supabase, isSupabaseConfigured } from './supabase';
import { Claim, ClaimStatus, ClaimDocument, ClaimProduct } from '../types/claim';
import { mockClaims } from '../data/mockData';

// Helper function to get mock data from localStorage or initialize with the default mock data
const getMockClaims = (): Claim[] => {
  const storedClaims = localStorage.getItem('mock_claims');
  if (storedClaims) {
    return JSON.parse(storedClaims);
  }
  // Initialize with mock data
  localStorage.setItem('mock_claims', JSON.stringify(mockClaims));
  return mockClaims;
};

// Helper function to save mock data to localStorage
const saveMockClaims = (claims: Claim[]): void => {
  localStorage.setItem('mock_claims', JSON.stringify(claims));
};

export const claimService = {
  async fetchClaims(): Promise<Claim[]> {
    try {
      // If Supabase is not configured, use mock data
      if (!isSupabaseConfigured()) {
        console.log('Using mock claims data (Supabase not configured)');
        return getMockClaims();
      }

      // Otherwise, fetch from Supabase
      const { data, error } = await supabase.from('claims').select('*');
      if (error) throw error;

      // Transform the data as needed
      // This is a placeholder - you'd need to implement transformClaimsData
      return data.map(item => ({
        id: item.id,
        claimNumber: item.claim_number,
        clientName: item.client_name,
        clientId: item.client_id,
        creationDate: new Date(item.creation_date),
        status: item.status as ClaimStatus,
        department: item.department,
        identifiedCause: item.identified_cause,
        installed: item.installed,
        installationDate: item.installation_date ? new Date(item.installation_date) : undefined,
        invoiceLink: item.invoice_link,
        solutionAmount: parseFloat(item.solution_amount || 0),
        claimedAmount: parseFloat(item.claimed_amount || 0),
        savedAmount: parseFloat(item.saved_amount || 0),
        description: item.description,
        products: item.products || [],
        documents: item.documents || [],
        lastUpdated: new Date(item.last_updated)
      }));
    } catch (error) {
      console.error('Error fetching claims:', error);
      // Fallback to mock data on error
      return getMockClaims();
    }
  },

  async getClaim(id: string): Promise<Claim | undefined> {
    try {
      // If Supabase is not configured, use mock data
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        return claims.find(claim => claim.id === id);
      }

      // Otherwise, fetch from Supabase
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the data
      return {
        id: data.id,
        claimNumber: data.claim_number,
        clientName: data.client_name,
        clientId: data.client_id,
        creationDate: new Date(data.creation_date),
        status: data.status as ClaimStatus,
        department: data.department,
        identifiedCause: data.identified_cause,
        installed: data.installed,
        installationDate: data.installation_date ? new Date(data.installation_date) : undefined,
        invoiceLink: data.invoice_link,
        solutionAmount: parseFloat(data.solution_amount || 0),
        claimedAmount: parseFloat(data.claimed_amount || 0),
        savedAmount: parseFloat(data.saved_amount || 0),
        description: data.description,
        products: data.products || [],
        documents: data.documents || [],
        lastUpdated: new Date(data.last_updated)
      };
    } catch (error) {
      console.error(`Error fetching claim with id ${id}:`, error);
      // Fallback to mock data on error
      const claims = getMockClaims();
      return claims.find(claim => claim.id === id);
    }
  },

  async createClaim(claim: Partial<Claim>): Promise<string> {
    try {
      // Generate a unique ID for the new claim
      const newId = Date.now().toString(36) + Math.random().toString(36).substring(2);

      // If Supabase is not configured, use mock data
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();

        // Create a new claim with required fields
        const newClaim: Claim = {
          id: newId,
          claimNumber: claim.claimNumber || `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          clientName: claim.clientName || 'Unknown Client',
          clientId: claim.clientId || 'UNKNOWN',
          creationDate: new Date(),
          status: claim.status || ClaimStatus.New,
          department: claim.department || 'General',
          identifiedCause: claim.identifiedCause,
          installed: claim.installed || false,
          installationDate: claim.installationDate,
          invoiceLink: claim.invoiceLink,
          solutionAmount: claim.solutionAmount || 0,
          claimedAmount: claim.claimedAmount || 0,
          savedAmount: (claim.claimedAmount || 0) - (claim.solutionAmount || 0),
          description: claim.description || '',
          products: claim.products || [],
          documents: claim.documents || [],
          lastUpdated: new Date()
        };

        claims.push(newClaim);
        saveMockClaims(claims);
        return newId;
      }

      // Otherwise, insert into Supabase
      const { data, error } = await supabase
        .from('claims')
        .insert({
          id: newId,
          claim_number: claim.claimNumber,
          client_name: claim.clientName,
          client_id: claim.clientId,
          status: claim.status || ClaimStatus.New,
          department: claim.department,
          identified_cause: claim.identifiedCause,
          installed: claim.installed,
          installation_date: claim.installationDate,
          invoice_link: claim.invoiceLink,
          solution_amount: claim.solutionAmount || 0,
          claimed_amount: claim.claimedAmount || 0,
          saved_amount: (claim.claimedAmount || 0) - (claim.solutionAmount || 0),
          description: claim.description,
          creation_date: new Date(),
          last_updated: new Date()
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw new Error('Failed to create claim');
    }
  },

  async updateClaim(id: string, updates: Partial<Claim>): Promise<void> {
    try {
      // If Supabase is not configured, use mock data
      if (!isSupabaseConfigured()) {
        const claims = getMockClaims();
        const claimIndex = claims.findIndex(claim => claim.id === id);

        if (claimIndex >= 0) {
          claims[claimIndex] = {
            ...claims[claimIndex],
            ...updates,
            lastUpdated: new Date()
          };
          saveMockClaims(claims);
        }
        return;
      }

      // Otherwise, update in Supabase
      const updateData: any = {};

      // Map claim fields to database fields
      if (updates.claimNumber) updateData.claim_number = updates.claimNumber;
      if (updates.clientName) updateData.client_name = updates.clientName;
      if (updates.clientId) updateData.client_id = updates.clientId;
      if (updates.status) updateData.status = updates.status;
      if (updates.department) updateData.department = updates.department;
      if (updates.identifiedCause !== undefined) updateData.identified_cause = updates.identifiedCause;
      if (updates.installed !== undefined) updateData.installed = updates.installed;
      if (updates.installationDate) updateData.installation_date = updates.installationDate;
      if (updates.invoiceLink !== undefined) updateData.invoice_link = updates.invoiceLink;
      if (updates.solutionAmount !== undefined) updateData.solution_amount = updates.solutionAmount;
      if (updates.claimedAmount !== undefined) updateData.claimed_amount = updates.claimedAmount;
      if (updates.savedAmount !== undefined) updateData.saved_amount = updates.savedAmount;
      if (updates.description !== undefined) updateData.description = updates.description;

      // Always update last_updated
      updateData.last_updated = new Date();

      const { error } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating claim ${id}:`, error);
      throw new Error('Failed to update claim');
    }
  },

  async uploadDocument(claimId: string, file: File, category: string): Promise<ClaimDocument> {
    try {
      // Generate a unique name for the file
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileExt);

      // If Supabase is not configured, create a mock document
      if (!isSupabaseConfigured()) {
        const mockUrl = isImage
          ? `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`
          : `https://via.placeholder.com/100x100?text=${encodeURIComponent(fileExt.toUpperCase())}`;

        // Create a mock document
        const mockDocument: ClaimDocument = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: isImage ? 'image' : 'document',
          url: mockUrl,
          uploadDate: new Date(),
          category,
          uploadedBy: 'mock-user-id'
        };

        // Update the claim with the new document
        const claims = getMockClaims();
        const claimIndex = claims.findIndex(claim => claim.id === claimId);

        if (claimIndex >= 0) {
          claims[claimIndex].documents.push(mockDocument);
          claims[claimIndex].lastUpdated = new Date();
          saveMockClaims(claims);
        }

        return mockDocument;
      }

      // Otherwise, upload to Supabase Storage
      const filePath = `documents/${claimId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('claim-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('claim-documents')
        .getPublicUrl(filePath);

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();

      // Add document record in the database
      const { data, error } = await supabase
        .from('documents')
        .insert({
          claim_id: claimId,
          name: file.name,
          type: isImage ? 'image' : 'document',
          url: publicUrl,
          category,
          upload_date: new Date(),
          uploaded_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Transform and return the document data
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
      throw new Error('Failed to upload document');
    }
  }
};
