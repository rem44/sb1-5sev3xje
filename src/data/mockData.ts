import { Claim, ClaimStatus, ClaimDocument, ClaimProduct } from '../types/claim';

// Generate mock data for initial development
export const mockClaims: Claim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2023-0135',
    clientName: 'Acme Corporation',
    clientId: 'ACME001',
    creationDate: new Date('2023-06-15'),
    status: ClaimStatus.New,
    department: 'Technical',
    identifiedCause: 'Manufacturing Defect',
    installed: true,
    invoiceLink: 'INV-88754',
    solutionAmount: 0,
    claimedAmount: 12500,
    savedAmount: -12500,
    description: 'Carpet tiles showing premature wear after only 3 months of installation.',
    products: [
      {
        id: 'p1',
        description: 'Venture Modular Carpet - Linear Pattern',
        style: 'VM-Linear',
        color: 'Charcoal Grey',
        quantity: 200,
        pricePerSY: 45,
        totalPrice: 9000,
        claimedQuantity: 200
      },
      {
        id: 'p2',
        description: 'Installation Labor',
        style: 'Service',
        color: 'N/A',
        quantity: 1,
        pricePerSY: 3500,
        totalPrice: 3500,
        claimedQuantity: 1
      }
    ],
    documents: [
      {
        id: 'd1',
        name: 'Site photo 1.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg',
        uploadDate: new Date('2023-06-15'),
        category: 'Site Condition'
      },
      {
        id: 'd2',
        name: 'Invoice.pdf',
        type: 'document',
        url: '/documents/invoice-88754.pdf',
        uploadDate: new Date('2023-06-15'),
        category: 'Financial'
      }
    ],
    lastUpdated: new Date('2023-06-15')
  },
  {
    id: '2',
    claimNumber: 'CLM-2023-0142',
    clientName: 'Global Offices Inc.',
    clientId: 'GLOB002',
    creationDate: new Date('2023-07-22'),
    status: ClaimStatus.Screening,
    department: 'Customer Service',
    identifiedCause: 'Color Variation',
    installed: false,
    invoiceLink: 'INV-90122',
    solutionAmount: 0,
    claimedAmount: 8750,
    savedAmount: -8750,
    description: 'Customer reports significant color variation between ordered samples and delivered product.',
    products: [
      {
        id: 'p3',
        description: 'Venture Modular Carpet - Geometric',
        style: 'VM-Geo',
        color: 'Blue Steel',
        quantity: 175,
        pricePerSY: 50,
        totalPrice: 8750,
        claimedQuantity: 175
      }
    ],
    documents: [
      {
        id: 'd3',
        name: 'Color comparison.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/4753928/pexels-photo-4753928.jpeg',
        uploadDate: new Date('2023-07-22'),
        category: 'Product Condition'
      }
    ],
    lastUpdated: new Date('2023-07-25')
  },
  {
    id: '3',
    claimNumber: 'CLM-2023-0118',
    clientName: 'Hospitality Group',
    clientId: 'HOSP003',
    creationDate: new Date('2023-05-03'),
    status: ClaimStatus.Analyzing,
    department: 'Technical',
    identifiedCause: 'Installation Issue',
    installed: true,
    invoiceLink: 'INV-87453',
    solutionAmount: 4200,
    claimedAmount: 15800,
    savedAmount: 11600,
    description: 'Carpet backing separation in high traffic areas of hotel lobby.',
    products: [
      {
        id: 'p4',
        description: 'Venture Modular Carpet - Textured Pattern',
        style: 'VM-Texture',
        color: 'Burgundy',
        quantity: 320,
        pricePerSY: 42,
        totalPrice: 13440,
        claimedQuantity: 80
      },
      {
        id: 'p5',
        description: 'Reinstallation Labor',
        style: 'Service',
        color: 'N/A',
        quantity: 1,
        pricePerSY: 2360,
        totalPrice: 2360,
        claimedQuantity: 1
      }
    ],
    documents: [
      {
        id: 'd4',
        name: 'Backing issue.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/6969936/pexels-photo-6969936.jpeg',
        uploadDate: new Date('2023-05-03'),
        category: 'Product Condition'
      },
      {
        id: 'd5',
        name: 'Technical report.pdf',
        type: 'document',
        url: '/documents/tech-report-103.pdf',
        uploadDate: new Date('2023-05-10'),
        category: 'Analysis'
      }
    ],
    lastUpdated: new Date('2023-06-02')
  },
  {
    id: '4',
    claimNumber: 'CLM-2023-0156',
    clientName: 'City Municipal Buildings',
    clientId: 'CITY004',
    creationDate: new Date('2023-08-30'),
    status: ClaimStatus.Negotiation,
    department: 'Customer Service',
    identifiedCause: 'Shipping Damage',
    installed: false,
    invoiceLink: 'INV-91235',
    solutionAmount: 3200,
    claimedAmount: 6400,
    savedAmount: 3200,
    description: 'Multiple tiles damaged during shipping. Customer requesting full replacement.',
    products: [
      {
        id: 'p6',
        description: 'Venture Modular Carpet - Solid',
        style: 'VM-Solid',
        color: 'Granite',
        quantity: 160,
        pricePerSY: 40,
        totalPrice: 6400,
        claimedQuantity: 160
      }
    ],
    documents: [
      {
        id: 'd6',
        name: 'Damaged packaging.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/4483608/pexels-photo-4483608.jpeg',
        uploadDate: new Date('2023-08-30'),
        category: 'Shipping'
      },
      {
        id: 'd7',
        name: 'Shipping manifest.pdf',
        type: 'document',
        url: '/documents/shipping-91235.pdf',
        uploadDate: new Date('2023-08-30'),
        category: 'Shipping'
      }
    ],
    lastUpdated: new Date('2023-09-15')
  },
  {
    id: '5',
    claimNumber: 'CLM-2023-0126',
    clientName: 'Tech Innovations Ltd',
    clientId: 'TECH005',
    creationDate: new Date('2023-05-18'),
    status: ClaimStatus.Accepted,
    department: 'Production',
    identifiedCause: 'Manufacturing Defect',
    installed: true,
    invoiceLink: 'INV-88221',
    solutionAmount: 18750,
    claimedAmount: 22500,
    savedAmount: 3750,
    description: 'Pattern misalignment noted across 50% of installed tiles in office space.',
    products: [
      {
        id: 'p7',
        description: 'Venture Modular Carpet - Designer Series',
        style: 'VM-Designer',
        color: 'Ocean Blue',
        quantity: 450,
        pricePerSY: 50,
        totalPrice: 22500,
        claimedQuantity: 450
      }
    ],
    documents: [
      {
        id: 'd8',
        name: 'Pattern issue.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/7319308/pexels-photo-7319308.jpeg',
        uploadDate: new Date('2023-05-18'),
        category: 'Product Condition'
      },
      {
        id: 'd9',
        name: 'Production report.pdf',
        type: 'document',
        url: '/documents/prod-report-118.pdf',
        uploadDate: new Date('2023-06-02'),
        category: 'Analysis'
      }
    ],
    lastUpdated: new Date('2023-07-08')
  },
  {
    id: '6',
    claimNumber: 'CLM-2023-0112',
    clientName: 'Northern Banking Corp',
    clientId: 'BANK006',
    creationDate: new Date('2023-04-05'),
    status: ClaimStatus.Closed,
    department: 'Technical',
    identifiedCause: 'Material Failure',
    installed: true,
    invoiceLink: 'INV-86554',
    solutionAmount: 8900,
    claimedAmount: 14500,
    savedAmount: 5600,
    description: 'Premature wear and fiber loss in executive boardroom after only 6 months of use.',
    products: [
      {
        id: 'p8',
        description: 'Venture Modular Carpet - Premium Weave',
        style: 'VM-Premium',
        color: 'Mahogany',
        quantity: 250,
        pricePerSY: 58,
        totalPrice: 14500,
        claimedQuantity: 250
      }
    ],
    documents: [
      {
        id: 'd10',
        name: 'Fiber loss close-up.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/5417675/pexels-photo-5417675.jpeg',
        uploadDate: new Date('2023-04-05'),
        category: 'Product Condition'
      },
      {
        id: 'd11',
        name: 'Lab test results.pdf',
        type: 'document',
        url: '/documents/lab-report-92.pdf',
        uploadDate: new Date('2023-04-15'),
        category: 'Analysis'
      },
      {
        id: 'd12',
        name: 'Settlement agreement.pdf',
        type: 'document',
        url: '/documents/settlement-112.pdf',
        uploadDate: new Date('2023-05-20'),
        category: 'Resolution'
      }
    ],
    lastUpdated: new Date('2023-05-20')
  }
];