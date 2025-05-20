// src/services/claimService.ts
import { supabase } from './supabase';
import { Claim, ClaimStatus, ClaimDocument, ClaimProduct } from '../types/claim';
import { mockClaims } from '../data/mockData';

export const claimService = {
  async fetchClaims(): Promise<Claim[]> {
    try {
      // Dans une application réelle, nous ferions un appel à Supabase ici
      // const { data, error } = await supabase.from('claims').select('*');
      // if (error) throw error;
      // return transformClaimsData(data);

      // Pour le moment, retournons simplement les données mockées
      return mockClaims;
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  },

  async getClaim(id: string): Promise<Claim | undefined> {
    try {
      // Dans une application réelle, nous ferions un appel à Supabase ici
      // const { data, error } = await supabase
      //   .from('claims')
      //   .select('*')
      //   .eq('id', id)
      //   .single();
      // if (error) throw error;
      // return transformClaimData(data);

      // Pour le moment, utilisons les données mockées
      return mockClaims.find(claim => claim.id === id);
    } catch (error) {
      console.error(`Error fetching claim with id ${id}:`, error);
      return undefined;
    }
  },

  async createClaim(claim: Partial<Claim>): Promise<string> {
    try {
      // Générer un ID unique pour la nouvelle réclamation
      const newId = Date.now().toString(36) + Math.random().toString(36).substring(2);

      // Dans une application réelle, nous insérerions dans Supabase
      // const { data, error } = await supabase
      //   .from('claims')
      //   .insert({
      //     ...transformClaimForInsert(claim),
      //     id: newId
      //   })
      //   .select('id')
      //   .single();
      // if (error) throw error;
      // return data.id;

      // Pour le moment, simulons l'insertion et retournons l'ID généré
      console.log('Creating claim:', claim);
      return newId;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw new Error('Failed to create claim');
    }
  },

  async updateClaim(id: string, updates: Partial<Claim>): Promise<void> {
    try {
      // Dans une application réelle, nous mettrions à jour dans Supabase
      // const { error } = await supabase
      //   .from('claims')
      //   .update(transformClaimForUpdate(updates))
      //   .eq('id', id);
      // if (error) throw error;

      // Pour le moment, simulons la mise à jour
      console.log(`Updating claim ${id} with:`, updates);
    } catch (error) {
      console.error(`Error updating claim ${id}:`, error);
      throw new Error('Failed to update claim');
    }
  },

  async uploadDocument(claimId: string, file: File, category: string): Promise<ClaimDocument> {
    try {
      // Dans une application réelle, nous téléchargerions le fichier vers Supabase Storage

      // 1. Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${claimId}/${fileName}`;

      // 2. Dans une application réelle, télécharger vers Supabase Storage
      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('claim-documents')
      //   .upload(filePath, file);
      // if (uploadError) throw uploadError;

      // 3. Obtenir l'URL publique dans une application réelle
      // const { data: { publicUrl } } = supabase.storage
      //   .from('claim-documents')
      //   .getPublicUrl(filePath);

      // 4. Récupérer l'ID de l'utilisateur actuel
      // Ne pas utiliser await dans un objet littéral
      // Dans une application réelle, d'abord récupérer l'utilisateur
      // const { data: { user } } = await supabase.auth.getUser();
      // const userId = user?.id;

      // 5. Enregistrer le document dans la base de données
      // const { data, error } = await supabase
      //   .from('documents')
      //   .insert({
      //     claim_id: claimId,
      //     name: file.name,
      //     type: isImage ? 'image' : 'document',
      //     url: publicUrl,
      //     category,
      //     uploaded_by: userId
      //   })
      //   .select()
      //   .single();
      // if (error) throw error;

      // Pour le moment, simulons le téléchargement et créons un document mock
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileExt);
      const mockUrl = isImage
        ? `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`
        : `https://via.placeholder.com/100x100?text=${encodeURIComponent(fileExt.toUpperCase())}`;

      // Créer un document mock
      const mockDocument: ClaimDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        url: mockUrl,
        uploadDate: new Date(),
        category,
        // Dans un environnement réel, cela serait l'ID de l'utilisateur actuel
        uploadedBy: 'mock-user-id'
      };

      return mockDocument;
    } catch (error) {
      console.error(`Error uploading document for claim ${claimId}:`, error);
      throw new Error('Failed to upload document');
    }
  },

  // Fonctions utilitaires pour transformer les données

  // transformClaimsData(data: any[]): Claim[] {
  //   return data.map(item => this.transformClaimData(item));
  // },

  // transformClaimData(data: any): Claim {
  //   return {
  //     id: data.id,
  //     claimNumber: data.claim_number,
  //     clientName: data.client_name,
  //     clientId: data.client_id,
  //     creationDate: new Date(data.creation_date),
  //     status: data.status as ClaimStatus,
  //     department: data.department,
  //     identifiedCause: data.identified_cause,
  //     installed: data.installed,
  //     installationDate: data.installation_date ? new Date(data.installation_date) : undefined,
  //     invoiceLink: data.invoice_link,
  //     solutionAmount: parseFloat(data.solution_amount || 0),
  //     claimedAmount: parseFloat(data.claimed_amount || 0),
  //     savedAmount: parseFloat(data.saved_amount || 0),
  //     description: data.description,
  //     products: data.products || [],
  //     documents: data.documents || [],
  //     lastUpdated: new Date(data.last_updated)
  //   };
  // },

  // transformClaimForInsert(claim: Partial<Claim>): any {
  //   return {
  //     claim_number: claim.claimNumber,
  //     client_name: claim.clientName,
  //     client_id: claim.clientId,
  //     status: claim.status || ClaimStatus.New,
  //     department: claim.department,
  //     identified_cause: claim.identifiedCause,
  //     installed: claim.installed,
  //     installation_date: claim.installationDate,
  //     invoice_link: claim.invoiceLink,
  //     solution_amount: claim.solutionAmount || 0,
  //     claimed_amount: claim.claimedAmount || 0,
  //     saved_amount: claim.savedAmount || 0,
  //     description: claim.description,
  //     creation_date: new Date(),
  //     last_updated: new Date()
  //   };
  // },

  // transformClaimForUpdate(updates: Partial<Claim>): any {
  //   const result: any = {};
  //
  //   if (updates.claimNumber) result.claim_number = updates.claimNumber;
  //   if (updates.clientName) result.client_name = updates.clientName;
  //   if (updates.clientId) result.client_id = updates.clientId;
  //   if (updates.status) result.status = updates.status;
  //   if (updates.department) result.department = updates.department;
  //   if (updates.identifiedCause !== undefined) result.identified_cause = updates.identifiedCause;
  //   if (updates.installed !== undefined) result.installed = updates.installed;
  //   if (updates.installationDate) result.installation_date = updates.installationDate;
  //   if (updates.invoiceLink !== undefined) result.invoice_link = updates.invoiceLink;
  //   if (updates.solutionAmount !== undefined) result.solution_amount = updates.solutionAmount;
  //   if (updates.claimedAmount !== undefined) result.claimed_amount = updates.claimedAmount;
  //   if (updates.savedAmount !== undefined) result.saved_amount = updates.savedAmount;
  //   if (updates.description !== undefined) result.description = updates.description;
  //
  //   result.last_updated = new Date();
  //
  //   return result;
  // }
};
