// src/context/ClaimsContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // ✅ Utiliser useCallback pour éviter les re-renders
  const fetchClaims = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedClaims = await claimService.fetchClaims();
      setClaims(fetchedClaims);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading claims');
      console.error('Error loading claims:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ Charger les claims seulement quand l'utilisateur change
  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const addClaim = useCallback(async (claim: Partial<Claim>): Promise<string> => {
    try {
      setLoading(true);
      const claimId = await claimService.createClaim(claim);
      await fetchClaims(); // Refresh après ajout
      return claimId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the claim');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchClaims]);

  const updateClaim = useCallback(async (id: string, updatedClaim: Partial<Claim>): Promise<void> => {
    try {
      await claimService.updateClaim(id, updatedClaim);

      // Mise à jour optimiste de l'état local
      setClaims(prevClaims =>
        prevClaims.map(claim =>
          claim.id === id ? { ...claim, ...updatedClaim, lastUpdated: new Date() } : claim
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating the claim");
      throw err;
    }
  }, []);

  // ✅ getClaim ne dépend plus de claims pour éviter les re-renders
  const getClaim = useCallback(async (id: string): Promise<Claim | undefined> => {
    try {
      // Toujours récupérer depuis le service pour avoir les données fraîches
      return await claimService.getClaim(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while retrieving the claim");
      console.error('Error retrieving claim:', err);
      // Fallback vers les données locales
      return claims.find(claim => claim.id === id);
    }
  }, [claims]);

  const uploadDocument = useCallback(async (claimId: string, file: File, category: string): Promise<void> => {
    try {
      const newDocument = await claimService.uploadDocument(claimId, file, category);

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
  }, []);

  const calculateTotals = useCallback(() => {
    const totalSolution = claims.reduce((sum, claim) => sum + claim.solutionAmount, 0);
    const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimedAmount, 0);
    const totalSaved = totalClaimed - totalSolution;

    return { totalSolution, totalClaimed, totalSaved };
  }, [claims]);

  const refreshClaims = useCallback(async (): Promise<void> => {
    await fetchClaims();
  }, [fetchClaims]);

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
