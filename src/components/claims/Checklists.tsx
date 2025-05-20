// src/components/claims/Checklists.tsx
import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Save } from 'lucide-react';
import { ClaimChecklist, ClaimChecklistItem } from '../../types/claim';

interface ChecklistsProps {
  checklists?: ClaimChecklist[];
  isEditing: boolean;
  claimId: string;
  onUpdateChecklist?: (checklistId: string, items: ClaimChecklistItem[]) => Promise<void>;
  onAddChecklist?: (type: string) => Promise<void>;
}

const Checklists: React.FC<ChecklistsProps> = ({
  checklists = [],
  isEditing,
  claimId,
  onUpdateChecklist,
  onAddChecklist
}) => {
  const [activeChecklist, setActiveChecklist] = useState<string | null>(
    checklists.length > 0 ? checklists[0].id : null
  );
  const [newChecklistType, setNewChecklistType] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChecklistItemToggle = (checklistId: string, itemId: string, currentValue: boolean) => {
    if (!isEditing || !onUpdateChecklist) return;

    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, completed: !currentValue } : item
    );

    onUpdateChecklist(checklistId, updatedItems);
  };

  const handleAddChecklist = async () => {
    if (!isEditing || !onAddChecklist || !newChecklistType) return;

    setIsSaving(true);
    try {
      await onAddChecklist(newChecklistType);
      setNewChecklistType('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la checklist:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getChecklistProgress = (checklist: ClaimChecklist) => {
    if (!checklist.items || checklist.items.length === 0) return 0;
    const completedItems = checklist.items.filter(item => item.completed).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };

  const currentChecklist = checklists.find(c => c.id === activeChecklist);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Checklists d'Analyse</h3>
        {isEditing && (
          <div className="flex items-center">
            <select
              className="p-2 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
              value={newChecklistType}
              onChange={(e) => setNewChecklistType(e.target.value)}
            >
              <option value="">Sélectionner un type</option>
              <option value="Défaut de Fabrication">Défaut de Fabrication</option>
              <option value="Problème d'Installation">Problème d'Installation</option>
              <option value="Apparence/Performance">Apparence/Performance</option>
              <option value="Dommage lors du Transport">Dommage lors du Transport</option>
            </select>
            <button
              className={`bg-[#0C3B5E] text-white px-3 py-2 rounded flex items-center ${
                !newChecklistType || isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0a3252]'
              }`}
              onClick={handleAddChecklist}
              disabled={!newChecklistType || isSaving}
            >
              {isSaving ? 'Ajout...' : (
                <>
                  <Plus size={16} className="mr-1" />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {checklists.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Liste des checklists */}
          <div className="md:w-1/4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Types d'Analyse</h4>
              <ul className="space-y-2">
                {checklists.map(checklist => (
                  <li key={checklist.id}>
                    <button
                      className={`w-full p-3 text-left rounded-lg transition-colors ${
                        activeChecklist === checklist.id
                          ? 'bg-[#0C3B5E] text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setActiveChecklist(checklist.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{checklist.type}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activeChecklist === checklist.id
                            ? 'bg-white text-[#0C3B5E]'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {getChecklistProgress(checklist)}%
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Détail de la checklist active */}
          <div className="md:w-3/4">
            {currentChecklist ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">{currentChecklist.type}</h4>
                  {isEditing && (
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <Plus size={16} className="mr-1" />
                      Ajouter un élément
                    </button>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {currentChecklist.items && currentChecklist.items.length > 0 ? (
                    currentChecklist.items.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border ${item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-center">
                          <button
                            className={`flex-shrink-0 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => handleChecklistItemToggle(currentChecklist.id, item.id, item.completed)}
                            disabled={!isEditing}
                          >
                            {item.completed ? (
                              <CheckSquare size={20} className="text-green-600" />
                            ) : (
                              <Square size={20} className="text-gray-400" />
                            )}
                          </button>
                          <div className="ml-3 flex-grow">
                            <p className={`font-medium ${item.completed ? 'text-green-800' : 'text-gray-800'}`}>
                              {item.title}
                            </p>
                            {item.notes && (
                              <p className="text-sm mt-1 text-gray-600">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <textarea
                              className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              rows={2}
                              placeholder="Ajouter des notes..."
                              defaultValue={item.notes}
                            ></textarea>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                      <CheckSquare size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">Aucun élément dans cette checklist</p>
                      {isEditing && (
                        <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                          Ajouter le premier élément
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && currentChecklist.items && currentChecklist.items.length > 0 && (
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-[#0C3B5E] text-white rounded flex items-center hover:bg-[#0a3252]">
                      <Save size={16} className="mr-1" />
                      Enregistrer les modifications
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-10 text-center">
                <CheckSquare size={48} className="mx-auto text-gray-300 mb-3" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">Aucune checklist sélectionnée</h4>
                <p className="text-gray-500">
                  {checklists.length > 0
                    ? "Sélectionnez une checklist dans la liste à gauche pour voir son contenu"
                    : "Aucune checklist n'est disponible pour cette réclamation"}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <CheckSquare size={64} className="mx-auto text-gray-300 mb-4" />
          <h4 className="text-xl font-medium text-gray-700 mb-2">Aucune checklist</h4>
          <p className="text-gray-500 mb-6">
            Aucune checklist n'a encore été créée pour cette réclamation.
          </p>
          {isEditing && (
            <div className="inline-flex items-center">
              <select
                className="p-2 border border-gray-300 rounded-md rounded-r-none focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                value={newChecklistType}
                onChange={(e) => setNewChecklistType(e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="Défaut de Fabrication">Défaut de Fabrication</option>
                <option value="Problème d'Installation">Problème d'Installation</option>
                <option value="Apparence/Performance">Apparence/Performance</option>
                <option value="Dommage lors du Transport">Dommage lors du Transport</option>
              </select>
              <button
                className={`bg-[#0C3B5E] text-white px-4 py-2 rounded-md rounded-l-none flex items-center ${
                  !newChecklistType || isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0a3252]'
                }`}
                onClick={handleAddChecklist}
                disabled={!newChecklistType || isSaving}
              >
                {isSaving ? 'Ajout...' : (
                  <>
                    <Plus size={16} className="mr-1" />
                    <span>Créer une checklist</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Checklists;
