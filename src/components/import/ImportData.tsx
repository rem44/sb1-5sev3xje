// src/components/import/ImportData.tsx
import React, { useState } from 'react';
import { FileUp, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { importService, ImportResult } from '../../services/importService';

interface ImportDataProps {
  onClose: () => void;
}

const ImportData: React.FC<ImportDataProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'clients' | 'claims'>('clients');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      let importResult: ImportResult;

      if (importType === 'clients') {
        importResult = await importService.importClients(file);
      } else {
        importResult = await importService.importClaims(file);
      }

      setResult(importResult);
    } catch (error) {
      setResult({
        success: false,
        inserted: 0,
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Importer des Données</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de données à importer
                </label>
                <div className="flex space-x-4">
                  <button
                    className={`flex-1 p-4 rounded-lg border-2 ${
                      importType === 'clients'
                        ? 'border-[#0C3B5E] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } transition-colors`}
                    onClick={() => setImportType('clients')}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        importType === 'clients'
                         ? 'border-[#0C3B5E]'
                         : 'border-gray-300'
                       }`}>
                         {importType === 'clients' && (
                           <div className="w-2 h-2 rounded-full bg-[#0C3B5E]"></div>
                         )}
                       </div>
                       <span className="ml-2 font-medium">Clients</span>
                     </div>
                     <p className="text-xs text-gray-500 text-center">
                       Importer des données clients depuis un fichier CSV ou Excel
                     </p>
                   </button>

                   <button
                     className={`flex-1 p-4 rounded-lg border-2 ${
                       importType === 'claims'
                         ? 'border-[#0C3B5E] bg-blue-50'
                         : 'border-gray-200 hover:border-gray-300'
                     } transition-colors`}
                     onClick={() => setImportType('claims')}
                   >
                     <div className="flex items-center justify-center mb-2">
                       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                         importType === 'claims'
                         ? 'border-[#0C3B5E]'
                         : 'border-gray-300'
                       }`}>
                         {importType === 'claims' && (
                           <div className="w-2 h-2 rounded-full bg-[#0C3B5E]"></div>
                         )}
                       </div>
                       <span className="ml-2 font-medium">Réclamations</span>
                     </div>
                     <p className="text-xs text-gray-500 text-center">
                       Importer des réclamations depuis un fichier CSV ou Excel
                     </p>
                   </button>
                 </div>
               </div>

               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Fichier à importer
                 </label>
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                   <div className="space-y-1 text-center">
                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
                     <div className="flex text-sm text-gray-600">
                       <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#0C3B5E] hover:text-blue-800 focus-within:outline-none">
                         <span>Téléchargez un fichier</span>
                         <input
                           id="file-upload"
                           name="file-upload"
                           type="file"
                           className="sr-only"
                           accept=".csv,.xlsx,.xls"
                           onChange={handleFileChange}
                         />
                       </label>
                       <p className="pl-1">ou glissez-déposez</p>
                     </div>
                     <p className="text-xs text-gray-500">
                       Formats acceptés: CSV, Excel (.xlsx, .xls)
                     </p>
                   </div>
                 </div>

                 {file && (
                   <div className="mt-3 flex items-center bg-blue-50 p-2 rounded">
                     <FileUp size={16} className="text-blue-600 mr-2" />
                     <span className="text-sm">{file.name}</span>
                     <button
                       className="ml-auto text-gray-400 hover:text-gray-600"
                       onClick={() => setFile(null)}
                     >
                       <X size={16} />
                     </button>
                   </div>
                 )}
               </div>

               <div className="bg-yellow-50 p-4 rounded-md mb-6">
                 <div className="flex">
                   <AlertCircle size={20} className="text-yellow-600 mr-2 flex-shrink-0" />
                   <div>
                     <h4 className="text-sm font-medium text-yellow-800">
                       Avant de commencer l'importation
                     </h4>
                     <div className="mt-1 text-sm text-yellow-700">
                       <p>Assurez-vous que votre fichier contient les colonnes suivantes :</p>
                       <ul className="list-disc pl-5 mt-1">
                         {importType === 'clients' ? (
                           <>
                             <li>client_code (obligatoire) - Code identifiant unique du client</li>
                             <li>client_name (obligatoire) - Nom du client</li>
                             <li>contact_person - Personne à contacter</li>
                             <li>email - Email de contact</li>
                             <li>phone - Numéro de téléphone</li>
                             <li>address - Adresse</li>
                           </>
                         ) : (
                           <>
                             <li>claim_number (obligatoire) - Numéro de la réclamation</li>
                             <li>client_code (obligatoire) - Code du client</li>
                             <li>status - Statut de la réclamation</li>
                             <li>department - Département concerné</li>
                             <li>description - Description de la réclamation</li>
                             <li>claimed_amount - Montant réclamé</li>
                           </>
                         )}
                       </ul>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end space-x-3">
                 <button
                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                   onClick={onClose}
                 >
                   Annuler
                 </button>
                 <button
                   className={`px-4 py-2 bg-[#0C3B5E] text-white rounded-md flex items-center ${
                     !file || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0a3252]'
                   }`}
                   disabled={!file || isUploading}
                   onClick={handleImport}
                 >
                   {isUploading ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                       Importation...
                     </>
                   ) : (
                     <>
                       <Upload size={16} className="mr-2" />
                       Importer les données
                     </>
                   )}
                 </button>
               </div>
             </>
           ) : (
             <div>
               <div className={`mb-6 p-4 rounded-lg ${
                 result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
               }`}>
                 <div className="flex">
                   {result.success ? (
                     <CheckCircle size={20} className="text-green-600 mr-2" />
                   ) : (
                     <AlertCircle size={20} className="text-red-600 mr-2" />
                   )}
                   <div>
                     <h4 className={`text-sm font-medium ${
                       result.success ? 'text-green-800' : 'text-red-800'
                     }`}>
                       {result.success ? 'Importation réussie' : 'Échec de l\'importation'}
                     </h4>
                     <div className={`mt-1 text-sm ${
                       result.success ? 'text-green-700' : 'text-red-700'
                     }`}>
                       {result.success ? (
                         <p>{result.inserted} enregistrements ont été importés avec succès.</p>
                       ) : (
                         <>
                           <p>L'importation a échoué pour les raisons suivantes :</p>
                           <ul className="list-disc pl-5 mt-1">
                             {result.errors.map((err, index) => (
                               <li key={index}>{err}</li>
                             ))}
                           </ul>
                         </>
                       )}
                     </div>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end">
                 {result.success ? (
                   <button
                     className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                     onClick={onClose}
                   >
                     Fermer
                   </button>
                 ) : (
                   <div className="space-x-3">
                     <button
                       className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                       onClick={() => setResult(null)}
                     >
                       Réessayer
                     </button>
                     <button
                       className="px-4 py-2 bg-[#0C3B5E] text-white rounded-md hover:bg-[#0a3252]"
                       onClick={onClose}
                     >
                       Fermer
                     </button>
                   </div>
                 )}
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 };

 export default ImportData;
