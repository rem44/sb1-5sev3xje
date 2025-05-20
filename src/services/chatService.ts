// src/services/chatService.ts
import { supabase } from './supabase';

export interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const chatService = {
  async sendMessage(message: string, sessionId?: string): Promise<{response: string, sessionId: string}> {
    try {
      // Déterminer si une nouvelle session doit être créée
      const isNewSession = !sessionId;
      let chatSessionId = sessionId;

      // Si on n'a pas d'ID de session, créer une nouvelle session
      if (isNewSession) {
        const userId = (await supabase.auth.getUser()).data.user?.id;

        // Générer un titre basé sur le premier message
        const title = message.length > 30
          ? message.substring(0, 30) + '...'
          : message;

        // Créer la session dans Supabase
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: userId,
            title,
            created_at: new Date(),
            updated_at: new Date()
          })
          .select('id')
          .single();

        if (error) {
          throw new Error(`Erreur lors de la création de la session: ${error.message}`);
        }

        chatSessionId = data.id;
      }

      // Enregistrer le message de l'utilisateur
      const userMessageData = {
        session_id: chatSessionId,
        content: message,
        role: 'user',
        timestamp: new Date()
      };

      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert(userMessageData);

      if (userMsgError) {
        throw new Error(`Erreur lors de l'enregistrement du message: ${userMsgError.message}`);
      }

      // Appeler l'API du chatbot
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sessionId: chatSessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'appel à l'API: ${response.statusText}`);
      }

      const data = await response.json();

      // Enregistrer la réponse de l'assistant
      const assistantMessageData = {
        session_id: chatSessionId,
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      const { error: assistantMsgError } = await supabase
        .from('chat_messages')
        .insert(assistantMessageData);

      if (assistantMsgError) {
        throw new Error(`Erreur lors de l'enregistrement de la réponse: ${assistantMsgError.message}`);
      }

      // Mettre à jour la date de dernière modification de la session
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date() })
        .eq('id', chatSessionId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la session:', updateError);
      }

      return {
        response: data.response,
        sessionId: chatSessionId as string
      };
    } catch (error) {
      console.error('Erreur dans le service de chat:', error);
      throw error;
    }
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Erreur lors de la récupération des messages: ${error.message}`);
    }

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: new Date(msg.timestamp)
    }));
  },

  async getSessions(): Promise<ChatSession[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des sessions: ${error.message}`);
    }

    return data.map(session => ({
      id: session.id,
      title: session.title,
      messages: [],
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at)
    }));
  },

  async deleteSession(sessionId: string): Promise<void> {
    // Supprimer d'abord les messages (contrainte de clé étrangère)
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId);

    if (messagesError) {
      throw new Error(`Erreur lors de la suppression des messages: ${messagesError.message}`);
    }

    // Supprimer ensuite la session
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (sessionError) {
      throw new Error(`Erreur lors de la suppression de la session: ${sessionError.message}`);
    }
  }
};
