import React, { createContext, useContext, useState, useEffect } from 'react';
import { Claim, ClaimStatus } from '../types/claim';
import { mockClaims } from '../data/mockData';

interface ClaimsContextType {
  claims: Claim[];
  addClaim: (claim: Claim) => void;
  updateClaim: (id: string, updatedClaim: Partial<Claim>) => void;
  getClaim: (id: string) => Claim | undefined;
  calculateTotals: () => { 
    totalSolution: number;
    totalClaimed: number;
    totalSaved: number;
  };
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    // Simulating data fetch
    setClaims(mockClaims);
  }, []);

  const addClaim = (claim: Claim) => {
    setClaims(prevClaims => [...prevClaims, claim]);
  };

  const updateClaim = (id: string, updatedClaim: Partial<Claim>) => {
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.id === id ? { ...claim, ...updatedClaim } : claim
      )
    );
  };

  const getClaim = (id: string) => {
    return claims.find(claim => claim.id === id);
  };

  const calculateTotals = () => {
    const totalSolution = claims.reduce((sum, claim) => sum + claim.solutionAmount, 0);
    const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimedAmount, 0);
    const totalSaved = totalClaimed - totalSolution;

    return { totalSolution, totalClaimed, totalSaved };
  };

  return (
    <ClaimsContext.Provider value={{ 
      claims, 
      addClaim, 
      updateClaim, 
      getClaim,
      calculateTotals
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