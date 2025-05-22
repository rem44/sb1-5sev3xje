import Communications from '../components/claims/Communications';
import Resolution from '../components/claims/Resolution';
import Checklists from '../components/claims/Checklists';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimsContext';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import { ClaimStatus } from '../types/claim';
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

const ClaimDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateClaim } = useClaims();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const claimData = await claimService.getClaim(id);
        if (claimData) {
          setClaim(claimData);
        } else {
          setError('Claim not found');
        }
      } catch (err) {
        console.error('Error loading claim:', err);
        setError('Failed to load claim');
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]);

  const handleStatusChange = (newStatus: ClaimStatus) => {
    if (claim) {
      updateClaim(claim.id, {
        status: newStatus,
        lastUpdated: new Date()
      });
    }
  };

  const handleInstallationDateChange = (date: string) => {
    if (claim) {
      updateClaim(claim.id, {
        installationDate: new Date(date)
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading claim...</span>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">
          {error || 'Claim not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ...UI elements and tabs as in your current code... */}
    </div>
  );
};

export default ClaimDetails;
