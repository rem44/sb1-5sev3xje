// src/components/claims/Resolution.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign, Check, X, AlertTriangle } from 'lucide-react';
import { Claim, ClaimStatus } from '../../types/claim';

interface ResolutionProps {
  claim: Claim;
  isEditing: boolean;
  onUpdateClaim?: (id: string, updates: Partial<Claim>) => Promise<void>;
}

const Resolution: React.FC<ResolutionProps> = ({ claim, isEditing, onUpdateClaim }) => {
  const [solutionAmount, setSolutionAmount] = useState(claim.solutionAmount);
  const [isValidating, setIsValidating] = useState(false);

  const calculateSavings = () => {
    return claim.claimedAmount - solutionAmount;
  };

  const handleResolutionSubmit = async () => {
    if (!onUpdateClaim) return;

    setIsValidating(true);
    try {
      await onUpdateClaim(claim.id, {
        solutionAmount,
        savedAmount: calculateSavings(),
        status: ClaimStatus.Accepted,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réclamation:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const savingsAmount = calculateSavings();
  const savingsPercentage = claim.claimedAmount > 0
    ? (savingsAmount / claim.claimedAmount) * 100
    : 0;

  const isResolved = claim.status === ClaimStatus.Accepted || claim.status === ClaimStatus.Closed;

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Résolution de la Réclamation</h3>

      {isResolved ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
          <div className="p-2 rounded-full bg-green-100 text-green-700">
          <Check size={20} />
        </div>
        <div className="ml-3">
          <h4 className="text-green-800 font-medium">Réclamation Résolue</h4>
          <p className="text-green-700 text-sm">
            Cette réclamation a été acceptée et résolue le {format(new Date(claim.lastUpdated), 'dd/MM/yyyy')}.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-yellow-100 text-yellow-700">
          <AlertTriangle size={20} />
        </div>
        <div className="ml-3">
          <h4 className="text-yellow-800 font-medium">Résolution en Attente</h4>
          <p className="text-yellow-700 text-sm">
            Cette réclamation n'a pas encore été résolue. Veuillez compléter le processus de résolution.
          </p>
        </div>
      </div>
    </div>
  )}

  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <h4 className="text-md font-medium mb-4">Détails Financiers</h4>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Montant Réclamé</p>
        <p className="text-xl font-semibold text-red-600">${claim.claimedAmount.toLocaleString()}</p>
      </div>

      <div className={`bg-gray-50 p-4 rounded-lg ${isEditing ? 'border-2 border-blue-300' : ''}`}>
        <p className="text-sm text-gray-500 mb-1">Montant de la Solution</p>
        {isEditing && !isResolved ? (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-700">
              $
            </span>
            <input
              type="number"
              className="w-full p-2 pl-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
              value={solutionAmount}
              onChange={(e) => setSolutionAmount(Number(e.target.value))}
            />
          </div>
        ) : (
          <p className="text-xl font-semibold">${claim.solutionAmount.toLocaleString()}</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Économies</p>
        <p className={`text-xl font-semibold ${savingsAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${Math.abs(savingsAmount).toLocaleString()}
          <span className="text-xs ml-1">
            ({Math.abs(savingsPercentage).toFixed(1)}%)
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {savingsAmount >= 0 ? 'Économie réalisée' : 'Coût additionnel'}
        </p>
      </div>
    </div>

    {isEditing && !isResolved && (
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-medium mb-3">Justification de la Solution</h4>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
          rows={3}
          placeholder="Expliquez les raisons de la solution proposée..."
        ></textarea>
      </div>
    )}
  </div>

  <div className="bg-white rounded-lg shadow-sm p-6">
    <h4 className="text-md font-medium mb-4">Actions de Résolution</h4>

    {isResolved ? (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Montant final approuvé</p>
            <p className="text-sm text-gray-500">{format(new Date(claim.lastUpdated), 'dd/MM/yyyy')}</p>
          </div>
          <p className="text-lg font-semibold">${claim.solutionAmount.toLocaleString()}</p>
        </div>

        {claim.status !== ClaimStatus.Closed && isEditing && (
          <button
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center"
            onClick={() => onUpdateClaim && onUpdateClaim(claim.id, { status: ClaimStatus.Closed })}
          >
            <Check size={18} className="mr-2" />
            Clôturer la Réclamation
          </button>
        )}

        {claim.status === ClaimStatus.Closed && (
          <div className="p-3 bg-gray-100 rounded-lg text-center text-gray-700">
            <p>Cette réclamation est clôturée</p>
            <p className="text-sm text-gray-500">Aucune action supplémentaire n'est requise</p>
          </div>
        )}
      </div>
    ) : (
      <div className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                onClick={() => onUpdateClaim && onUpdateClaim(claim.id, { status: ClaimStatus.Closed, solutionAmount: 0 })}
              >
                <X size={18} className="mr-2" />
                Rejeter la Réclamation
              </button>
              <button
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                onClick={handleResolutionSubmit}
                disabled={isValidating}
              >
                {isValidating ? 'Validation...' : (
                  <>
                    <Check size={18} className="mr-2" />
                    Approuver la Solution
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              En approuvant cette solution, vous confirmez que le montant de solution est correct
              et que la réclamation peut passer au statut "Acceptée".
            </p>
          </>
        ) : (
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p>
              Cliquez sur le bouton "Modifier" en haut de la page pour gérer la résolution de cette réclamation.
            </p>
          </div>
        )}
      </div>
    )}
  </div>
</div>
);
};

export default Resolution;
