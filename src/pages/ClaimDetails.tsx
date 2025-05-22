import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimsContext';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import { ClaimStatus, Claim } from '../types/claim';
import {
  ArrowLeft,
  Printer,
  FileDown,
  Edit,
  Info,
  Package,
  Camera,
  CheckSquare,
  MessageSquare,
  Banknote,
  Calendar
} from 'lucide-react';

// ... (keep all the other interfaces and components the same)

const ClaimDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClaim, updateClaim } = useClaims();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load claim data
  useEffect(() => {
    const loadClaim = async () => {
      if (!id) {
        setError('No claim ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const claimData = await getClaim(id);
        if (claimData) {
          setClaim(claimData);
        } else {
          setError('Claim not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading claim');
        console.error('Error loading claim:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClaim();
  }, [id, getClaim]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0C3B5E] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading claim details...</p>
      </div>
    );
  }

  // Error state
  if (error || !claim) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">
          {error || 'Claim not found'}
        </h2>
        <p className="text-gray-500 mb-4">
          {error ? 'There was an error loading the claim.' : "The claim you're looking for doesn't exist or has been removed."}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#0C3B5E] text-white px-4 py-2 rounded-md hover:bg-[#0a3252] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: ClaimStatus) => {
    try {
      await updateClaim(claim.id, {
        status: newStatus,
        lastUpdated: new Date()
      });
      
      // Update local state
      setClaim(prev => prev ? { ...prev, status: newStatus, lastUpdated: new Date() } : null);
    } catch (err) {
      console.error('Error updating claim status:', err);
    }
  };

  const handleInstallationDateChange = async (date: string) => {
    if (claim) {
      try {
        await updateClaim(claim.id, {
          installationDate: new Date(date)
        });
        
        // Update local state
        setClaim(prev => prev ? { ...prev, installationDate: new Date(date) } : null);
      } catch (err) {
        console.error('Error updating installation date:', err);
      }
    }
  };

  // ... (rest of the component remains the same)
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={() => navigate('/')}
            className="mr-3 text-gray-500 hover:text-[#0C3B5E] transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              {claim.claimNumber}
              <StatusBadge status={claim.status} />
            </h1>
            <p className="text-gray-500">{claim.clientName} • Created {format(new Date(claim.creationDate), 'MMM d, yyyy')}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center">
            <Printer size={16} className="mr-1" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center">
            <FileDown size={16} className="mr-1" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0C3B5E] hover:bg-[#0a3252]'} text-white px-3 py-2 rounded transition-colors flex items-center`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit size={16} className="mr-1" />
            <span className="hidden sm:inline">{isEditing ? 'Save' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Rest of your component JSX remains the same... */}
    </div>
  );
};

export default ClaimDetails;
