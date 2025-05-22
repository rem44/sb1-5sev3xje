// src/services/claimService.ts
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
    products: item.claim_products || [],
    documents: item.claim_documents || [],
    checklists: [], // We'll handle this separately
    communications: item.communications || [],
    assignedTo: item.assigned_to,
    lastUpdated: new Date(item.last_updated || item.updated_at)
  };
};
