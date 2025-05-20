// src/services/claimService.ts
import { supabase } from './supabase';
import { Claim, ClaimStatus, ClaimProduct, ClaimDocument } from '../types/claim';

export const claimService = {
  async fetchClaims(): Promise<Claim[]> {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        client:clients(client_name, client_code),
        products:claim_products(*),
        documents:documents(*)
      `)
      .order('creation_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Transformer les données pour correspondre à notre interface Claim
    return data.map(claim => ({
      id: claim.id,
      claimNumber: claim.claim_number,
      clientName: claim.client.client_name,
      clientId: claim.client.client_code,
      creationDate: new Date(claim.creation_date),
      status: claim.status as ClaimStatus,
      department: claim.department,
      identifiedCause: claim.identified_cause,
      installed: claim.installed,
      installationDate: claim.installation_date ? new Date(claim.installation_date) : undefined,
      invoiceLink: claim.invoice_link,
      solutionAmount: parseFloat(claim.solution_amount),
      claimedAmount: parseFloat(claim.claimed_amount),
      savedAmount: parseFloat(claim.saved_amount),
      description: claim.description,
      products: claim.products.map((p: any) => ({
        id: p.id,
        description: p.description,
        style: p.style,
        color: p.color,
        quantity: parseFloat(p.quantity),
        pricePerSY: parseFloat(p.price_per_sy),
        totalPrice: parseFloat(p.total_price),
        claimedQuantity: parseFloat(p.claimed_quantity)
      })),
      documents: claim.documents.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        url: d.url,
        uploadDate: new Date(d.upload_date),
        category: d.category
      })),
      lastUpdated: new Date(claim.last_updated)
    }));
  },

  async getClaim(id: string): Promise<Claim> {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        client:clients(client_name, client_code),
        products:claim_products(*),
        documents:documents(*),
        communications:communications(*),
        checklists:checklists(
          *,
          items:checklist_items(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Transformer les données pour correspondre à notre interface Claim
    return {
      id: data.id,
      claimNumber: data.claim_number,
      clientName: data.client.client_name,
      clientId: data.client.client_code,
      creationDate: new Date(data.creation_date),
      status: data.status,
      department: data.department,
      identifiedCause: data.identified_cause,
      installed: data.installed,
      installationDate: data.installation_date ? new Date(data.installation_date) : undefined,
      invoiceLink: data.invoice_link,
      solutionAmount: parseFloat(data.solution_amount),
      claimedAmount: parseFloat(data.claimed_amount),
      savedAmount: parseFloat(data.saved_amount),
      description: data.description,
      products: data.products.map((p: any) => ({
        id: p.id,
        description: p.description,
        style: p.style,
        color: p.color,
        quantity: parseFloat(p.quantity),
        pricePerSY: parseFloat(p.price_per_sy),
        totalPrice: parseFloat(p.total_price),
        claimedQuantity: parseFloat(p.claimed_quantity)
      })),
      documents: data.documents.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        url: d.url,
        uploadDate: new Date(d.upload_date),
        category: d.category
      })),
      communications: data.communications?.map((c: any) => ({
        id: c.id,
        date: new Date(c.date),
        type: c.type,
        subject: c.subject,
        content: c.content,
        sender: c.sender,
        recipients: c.recipients
      })),
      checklists: data.checklists?.map((c: any) => ({
        id: c.id,
        type: c.type,
        items: c.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          completed: item.completed,
          notes: item.notes
        }))
      })),
      lastUpdated: new Date(data.last_updated)
    };
  },

  async createClaim(claim: Partial<Claim>): Promise<string> {
    // D'abord récupérer l'ID du client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('client_code', claim.clientId)
      .single();

    if (clientError) {
      throw new Error(`Client non trouvé: ${clientError.message}`);
    }

    // Insérer la réclamation
    const { data, error } = await supabase
      .from('claims')
      .insert({
        claim_number: claim.claimNumber,
        client_id: clientData.id,
        status: claim.status || ClaimStatus.New,
        department: claim.department,
        identified_cause: claim.identifiedCause,
        installed: claim.installed,
        installation_date: claim.installationDate,
        invoice_link: claim.invoiceLink,
        solution_amount: claim.solutionAmount || 0,
        claimed_amount: claim.claimedAmount || 0,
        saved_amount: claim.savedAmount || 0,
        description: claim.description,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        creation_date: new Date(),
        last_updated: new Date()
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la réclamation: ${error.message}`);
    }

    const claimId = data.id;

    // Insérer les produits si présents
    if (claim.products && claim.products.length > 0) {
      const productRows = claim.products.map(p => ({
        claim_id: claimId,
        description: p.description,
        style: p.style,
        color: p.color,
        quantity: p.quantity,
        price_per_sy: p.pricePerSY,
        total_price: p.totalPrice,
        claimed_quantity: p.claimedQuantity
      }));

      const { error: productsError } = await supabase
        .from('claim_products')
        .insert(productRows);

      if (productsError) {
        throw new Error(`Erreur lors de l'ajout des produits: ${productsError.message}`);
      }
    }

    // Insérer les documents si présents
    if (claim.documents && claim.documents.length > 0) {
      const documentRows = claim.documents.map(d => ({
        claim_id: claimId,
        name: d.name,
        type: d.type,
        url: d.url,
        category: d.category,
        upload_date: d.uploadDate || new Date(),
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      }));

      const { error: documentsError } = await supabase
        .from('documents')
        .insert(documentRows);

      if (documentsError) {
        throw new Error(`Erreur lors de l'ajout des documents: ${documentsError.message}`);
      }
    }

    return claimId;
  },

  async updateClaim(id: string, updates: Partial<Claim>): Promise<void> {
    const { error } = await supabase
      .from('claims')
      .update({
        status: updates.status,
        department: updates.department,
        identified_cause: updates.identifiedCause,
        installed: updates.installed,
        installation_date: updates.installationDate,
        invoice_link: updates.invoiceLink,
        solution_amount: updates.solutionAmount,
        claimed_amount: updates.claimedAmount,
        saved_amount: updates.savedAmount,
        description: updates.description,
        last_updated: new Date()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la réclamation: ${error.message}`);
    }

    // Mise à jour des produits si présents
    if (updates.products) {
      // Pour simplifier, on supprime tous les produits et on les réinsère
      // Dans un cas réel, on pourrait faire des mises à jour plus ciblées
      await supabase.from('claim_products').delete().eq('claim_id', id);

      const productRows = updates.products.map(p => ({
        claim_id: id,
        description: p.description,
        style: p.style,
        color: p.color,
        quantity: p.quantity,
        price_per_sy: p.pricePerSY,
        total_price: p.totalPrice,
        claimed_quantity: p.claimedQuantity
      }));

      const { error: productsError } = await supabase
        .from('claim_products')
        .insert(productRows);

      if (productsError) {
        throw new Error(`Erreur lors de la mise à jour des produits: ${productsError.message}`);
      }
    }
  },

  async uploadDocument(claimId: string, file: File, category: string): Promise<ClaimDocument> {
    // Générer un nom de fichier unique pour le stockage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/${claimId}/${fileName}`;

    // Télécharger le fichier dans le stockage Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('claim-documents')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Erreur lors du téléchargement du fichier: ${uploadError.message}`);
    }

    // Obtenir l'URL publique du fichier
    const { data: { publicUrl } } = supabase.storage
      .from('claim-documents')
      .getPublicUrl(filePath);

    // Déterminer le type de document
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt?.toLowerCase() || '');
    const documentType = isImage ? 'image' : 'document';

    // Enregistrer le document dans la base de données
    const { data, error } = await supabase
      .from('documents')
      .insert({
        claim_id: claimId,
        name: file.name,
        type: documentType,
        url: publicUrl,
        category,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'enregistrement du document: ${error.message}`);
    }

    // Retourner le document formaté
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      url: data.url,
      uploadDate: new Date(data.upload_date),
      category: data.category
    };
  }
};
