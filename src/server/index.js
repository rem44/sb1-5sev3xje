// server/index.js
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configuration OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour créer des embeddings
async function createEmbedding(text) {
  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data.data[0].embedding;
}

// Route pour le chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Récupérer l'historique des messages si un sessionId est fourni
    let history = [];
    if (sessionId) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('content, role')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (!error && data) {
        history = data.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      }
    }

    // Créer l'embedding pour la question
    const questionEmbedding = await createEmbedding(message);

    // Rechercher les documents pertinents (supposons que nous avons une table 'documents' avec des embeddings)
    const { data: relevantDocs, error } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.5,
        match_count: 5
      }
    );

    if (error) {
      console.error('Erreur lors de la recherche de documents:', error);
    }

    // Construire le contexte à partir des documents pertinents
    const context = relevantDocs && relevantDocs.length > 0
      ? relevantDocs.map(doc => doc.content).join("\n\n")
      : "Vous êtes un assistant spécialisé dans la gestion des réclamations pour Venture Claims Management.";

    // Construire les messages pour ChatGPT
    const messages = [
      { role: "system", content: `Tu es un assistant spécialisé dans les réclamations clients pour Venture Claims Management. Réponds en utilisant le contexte fourni. Si tu ne connais pas la réponse, dis-le poliment sans inventer d'information.\n\nContexte:\n${context}` },
      ...history.slice(-5), // Limiter l'historique aux 5 derniers messages
      { role: "user", content: message }
    ];

    // Appeler l'API ChatGPT
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.3,
    });

    const responseContent = completion.data.choices[0].message.content;

    res.json({
      response: responseContent,
      relevantDocs: relevantDocs?.map(doc => ({
        content: doc.content,
        metadata: doc.metadata,
        similarity: doc.similarity
      })) || []
    });
  } catch (error) {
    console.error('Erreur lors du traitement du chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Route pour recevoir les emails depuis Power Automate
app.post('/api/email-webhook', async (req, res) => {
  try {
    const {
      subject,
      body,
      sender,
      recipients,
      receivedTime,
      hasAttachments,
      attachments
    } = req.body;

    console.log('Email reçu:', subject);

    // Vérifier si le sujet contient "[Réclamation]"
    if (!subject.includes('[Réclamation]')) {
      return res.json({
        success: false,
        message: 'Cet email n\'est pas identifié comme une réclamation'
      });
    }

    // Extraire les informations de base
    const clientName = sender.split('<')[0].trim();
    const clientEmail = sender.match(/<([^>]+)>/)?.[1] || sender;

    // Générer un numéro de réclamation
    const claimNumber = `CLM-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).substring(1)}`;

    // Traiter le corps de l'email pour extraire des informations
    // Ceci est une logique simplifiée - dans la réalité, vous pourriez utiliser
    // des expressions régulières ou du NLP pour extraire les informations
    const description = body
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/\r\n|\r|\n/g, ' ') // Remplacer les sauts de ligne par des espaces
      .trim()
      .substring(0, 500); // Limiter la longueur

    // Chercher si le client existe déjà
    let clientId = null;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', clientEmail)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Créer un nouveau client
      const clientCode = `C${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          client_code: clientCode,
          client_name: clientName,
          email: clientEmail,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Erreur lors de la création du client: ${error.message}`);
      }

      clientId = newClient.id;
    }

    // Créer la réclamation
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        client_id: clientId,
        status: 'New',
        department: 'Customer Service', // Département par défaut
        description: description,
        claimed_amount: 0, // À déterminer plus tard
        solution_amount: 0,
        saved_amount: 0,
        creation_date: new Date(),
        last_updated: new Date()
      })
      .select('id')
      .single();

    if (claimError) {
      throw new Error(`Erreur lors de la création de la réclamation: ${claimError.message}`);
    }

    // Ajouter la communication
    const { error: commError } = await supabase
      .from('communications')
      .insert({
        claim_id: claim.id,
        type: 'email',
        date: new Date(receivedTime),
        subject: subject,
        content: body,
        sender: sender,
        recipients: recipients
      });

    if (commError) {
      console.error('Erreur lors de l\'ajout de la communication:', commError);
    }

    // Traiter les pièces jointes si présentes
    if (hasAttachments && attachments) {
      for (const attachment of attachments) {
        // Dans un cas réel, vous téléchargeriez le fichier depuis Power Automate
        // vers votre stockage Supabase ou un autre service de stockage

        // Pour cet exemple, nous allons simplement enregistrer les références
        const { error: docError } = await supabase
          .from('documents')
          .insert({
            claim_id: claim.id,
            name: attachment.name,
            type: attachment.contentType.includes('image') ? 'image' : 'document',
            url: attachment.contentUrl, // URL temporaire fournie par Power Automate
            category: 'Email Attachment',
            upload_date: new Date()
          });

        if (docError) {
          console.error('Erreur lors de l\'ajout du document:', docError);
        }
      }
    }

    // Créer une alerte pour informer les utilisateurs
    const assignedTo = null; // À déterminer plus tard
    if (assignedTo) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          user_id: assignedTo,
          claim_id: claim.id,
          message: `Nouvelle réclamation reçue: ${claimNumber} - ${clientName}`,
          type: 'info',
          read: false,
          created_at: new Date()
        });

      if (alertError) {
        console.error('Erreur lors de la création de l\'alerte:', alertError);
      }
    }

    // Envoyer une réponse automatique
    // Dans un environnement réel, vous utiliseriez ici Power Automate ou un service d'email
    console.log(`Réponse automatique à envoyer à ${clientEmail} pour la réclamation ${claimNumber}`);

    res.json({
      success: true,
      claimNumber: claimNumber,
      message: `Réclamation créée avec succès: ${claimNumber}`
    });
  } catch (error) {
    console.error('Erreur lors du traitement de l\'email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue'
    });
  }
});
