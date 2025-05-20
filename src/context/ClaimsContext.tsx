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
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des réclamations');
      console.error('Erreur lors du chargement des réclamations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les réclamations au montage du composant ou lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  const addClaim = async (claim: Partial<Claim>): Promise<string> => {
    try {
      const claimId = await claimService.createClaim(claim);
      await fetchClaims(); // Rafraîchir la liste après l'ajout
      return claimId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création de la réclamation');
      throw err;
    }
  };

  const updateClaim = async (id: string, updatedClaim: Partial<Claim>): Promise<void> => {
    try {
      await claimService.updateClaim(id, updatedClaim);

      // Mettre à jour le state local pour éviter un nouveau fetch complet
      setClaims(prevClaims =>
        prevClaims.map(claim =>
          claim.id === id ? { ...claim, ...updatedClaim, lastUpdated: new Date() } : claim
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la mise à jour de la réclamation");
      throw err;
    }
  };

  const getClaim = async (id: string): Promise<Claim | undefined> => {
    // D'abord chercher en local
    const localClaim = claims.find(claim => claim.id === id);

    // Si on a besoin des détails complets (communications, checklists, etc.)
    // ou si la réclamation n'est pas dans le state local, on fait un appel API
    try {
      const claim = await claimService.getClaim(id);
      return claim;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la récupération de la réclamation");
      console.error('Erreur lors de la récupération de la réclamation:', err);
      return localClaim; // Retourner la version locale en cas d'échec
     }
   };

   const uploadDocument = async (claimId: string, file: File, category: string): Promise<void> => {
     try {
       const newDocument = await claimService.uploadDocument(claimId, file, category);

       // Mettre à jour le state local
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
       setError(err instanceof Error ? err.message : "Une erreur est survenue lors du téléchargement du document");
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
