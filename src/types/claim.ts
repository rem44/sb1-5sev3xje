export enum ClaimStatus {
  New = 'New',
  Screening = 'Screening',
  Analyzing = 'Analyzing',
  Negotiation = 'Negotiation',
  Accepted = 'Accepted',
  Closed = 'Closed'
}

export interface ClaimProduct {
  id: string;
  description: string;
  style: string;
  color: string;
  quantity: number;
  pricePerSY: number;
  totalPrice: number;
  claimedQuantity: number;
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: 'image' | 'document' | 'email';
  url: string;
  uploadDate: Date;
  category?: string;
}

export interface ClaimChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface ClaimChecklist {
  id: string;
  type: string;
  items: ClaimChecklistItem[];
}

export interface ClaimCommunication {
  id: string;
  date: Date;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject?: string;
  content: string;
  attachments?: string[];
  sender: string;
  recipients?: string[];
}

export interface Claim {
  id: string;
  claimNumber: string;
  clientName: string;
  clientId: string;
  creationDate: Date;
  status: ClaimStatus;
  department: string;
  identifiedCause?: string;
  installed: boolean;
  installationDate?: Date;
  invoiceLink?: string;
  solutionAmount: number;
  claimedAmount: number;
  savedAmount: number;
  description?: string;
  products: ClaimProduct[];
  documents: ClaimDocument[];
  checklists?: ClaimChecklist[];
  communications?: ClaimCommunication[];
  assignedTo?: string;
  lastUpdated: Date;
}
