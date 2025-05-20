// src/services/importService.ts
import { supabase } from './supabase';
import * as XLSX from 'xlsx';

export interface ImportResult {
  success: boolean;
  inserted: number;
  errors: string[];
}

export const importService = {
  async importClients(file: File): Promise<ImportResult> {
    try {
      const data = await readFileData(file);

      if (!data || data.length === 0) {
        return { success: false, inserted: 0, errors: ['Fichier vide ou format incorrect'] };
      }

      // Vérifier que les colonnes nécessaires sont présentes
      const requiredColumns = ['client_code', 'client_name'];
      const headers = Object.keys(data[0]);

      for (const col of requiredColumns) {
        if (!headers.includes(col)) {
          return {
            success: false,
            inserted: 0,
            errors: [`Colonne obligatoire manquante: ${col}`]
          };
        }
      }

      // Préparer les données pour l'insertion
      const clientsToInsert = data.map(row => ({
        client_code: row.client_code,
        client_name: row.client_name,
        contact_person: row.contact_person || null,
        email: row.email || null,
        phone: row.phone || null,
        address: row.address || null
      }));

      // Insertion dans Supabase
      const { data: insertedData, error } = await supabase
        .from('clients')
        .upsert(clientsToInsert, {
          onConflict: 'client_code',
          returning: 'minimal'
        });

      if (error) {
        return { success: false, inserted: 0, errors: [error.message] };
      }

      return { success: true, inserted: clientsToInsert.length, errors: [] };
    } catch (error) {
      return {
        success: false,
        inserted: 0,
        errors: [error instanceof Error ? error.message : 'Erreur lors de l\'importation']
      };
    }
  },

  async importClaims(file: File): Promise<ImportResult> {
    // Logique similaire pour l'importation des réclamations
    // ...
  }
};

// Fonction utilitaire pour lire le fichier (CSV ou Excel)
async function readFileData(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;

        if (!data) {
          reject(new Error('Erreur lors de la lecture du fichier'));
          return;
        }

        let parsedData: any[] = [];

        // Détecter le type de fichier
        if (file.name.endsWith('.csv')) {
          // Parsing CSV
          const text = data.toString();
          const rows = text.split('\n');
          const headers = rows[0].split(',').map(h => h.trim());

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i].split(',').map(cell => cell.trim());
            if (row.length === headers.length) {
              const obj: Record<string, string> = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              parsedData.push(obj);
            }
          }
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parsing Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
        }

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}
