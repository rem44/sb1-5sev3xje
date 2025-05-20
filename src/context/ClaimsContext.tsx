// src/context/ClaimsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Claim, ClaimStatus } from '../types/claim';
import { claimService } from '../services/claimService';
import { useAuth } from './AuthContext';

interface ClaimsContextType {
  claims: Claim[];
  loading: boolean;
  error: string | null;
  addClaim: (claim: Partial<Claim>) => Promise<string>;
  updateClaim: (id: string, updatedClaim: Partial<Claim>) => Promise<void>;
  getClaim: (id: string) => Promise<Claim | undefined>;
  uploadDocument: (claimId: string, file: File, category: string) => Promise<void>;
  calculateTotals: () => {
    totalSolution: number;
    totalClaimed: number;
    totalSaved: number;
  };
  refreshClaims: () => Promise<void>;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClaims = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedClaims = await claimService.fetchClaims();
      setClaims(fetchedClaims);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading claims');
      console.error('Error loading claims:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load claims when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  const addClaim = async (claim: Partial<Claim>): Promise<string> => {
    setLoading(true);
    try {
      const claimId = await claimService.createClaim(claim);
      await fetchClaims(); // Refresh the list after adding
      return claimId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the claim');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateClaim = async (id: string, updatedClaim: Partial<Claim>): Promise<void> => {
    try {
      await claimService.updateClaim(id, updatedClaim);

      // Update local state to avoid a complete fetch
      setClaims(prevClaims =>
        prevClaims.map(claim =>
          claim.id === id ? { ...claim, ...updatedClaim, lastUpdated: new Date() } : claim
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating the claim");
      throw err;
    }
  };

  const getClaim = async (id: string): Promise<Claim | undefined> => {
    // Try to find locally first
    const localClaim = claims.find(claim => claim.id === id);

    try {
      // Always get the latest data from the service
      const claim = await claimService.getClaim(id);
      return claim;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while retrieving the claim");
      console.error('Error retrieving claim:', err);
      // Return local claim as fallback
      return localClaim;
    }
  };

  const uploadDocument = async (claimId: string, file: File, category: string): Promise<void> => {
    try {
      const newDocument = await claimService.uploadDocument(claimId, file, category);

      // Update local state
      setClaims(prevClaims =>
        prevClaims.map(claim => {
          if (claim.id === claimId) {
            return {
              ...claim,
              documents: [...claim.documents, newDocument],
              lastUpdated: new Date()
            };
          }
          return claim;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while uploading the document");
      throw err;
    }
  };

  const calculateTotals = () => {
    const totalSolution = claims.reduce((sum, claim) => sum + claim.solutionAmount, 0);
    const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimedAmount, 0);
    const totalSaved = totalClaimed - totalSolution;

    return { totalSolution, totalClaimed, totalSaved };
  };

  const refreshClaims = async (): Promise<void> => {
    await fetchClaims();
  };

  return (
    <ClaimsContext.Provider value={{
      claims,
      loading,
      error,
      addClaim,
      updateClaim,
      getClaim,
      uploadDocument,
      calculateTotals,
      refreshClaims
    }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};
