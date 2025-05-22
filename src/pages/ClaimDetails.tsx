// src/pages/ClaimDetails.tsx (début du composant)
const ClaimDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClaim, updateClaim } = useClaims();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Redirection simple sans useEffect
  if (id === 'new') {
    navigate('/claims/new', { replace: true });
    return null;
  }

  // ✅ useEffect simplifié avec dépendances fixes
  useEffect(() => {
    let mounted = true;

    const loadClaim = async () => {
      if (!id || id === 'new') {
        setError('No claim ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const claimData = await getClaim(id);
        
        if (mounted) {
          if (claimData) {
            setClaim(claimData);
          } else {
            setError('Claim not found');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error loading claim');
          console.error('Error loading claim:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadClaim();

    return () => {
      mounted = false;
    };
  }, [id]); // ✅ Seulement id comme dépendance

  // ✅ Handlers avec useCallback pour éviter les re-renders
  const handleStatusChange = useCallback(async (newStatus: ClaimStatus) => {
    if (!claim) return;
    
    try {
      await updateClaim(claim.id, {
        status: newStatus,
        lastUpdated: new Date()
      });
      
      setClaim(prev => prev ? { ...prev, status: newStatus, lastUpdated: new Date() } : null);
    } catch (err) {
      console.error('Error updating claim status:', err);
    }
  }, [claim, updateClaim]);

  const handleInstallationDateChange = useCallback(async (date: string) => {
    if (!claim) return;
    
    try {
      await updateClaim(claim.id, {
        installationDate: new Date(date)
      });
      
      setClaim(prev => prev ? { ...prev, installationDate: new Date(date) } : null);
    } catch (err) {
      console.error('Error updating installation date:', err);
    }
  }, [claim, updateClaim]);

  
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
