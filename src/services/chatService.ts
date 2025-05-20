// src/services/chatService.ts
import { v4 as uuidv4 } from 'uuid';
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

// Mock responses for demo purposes
const mockResponses = [
  "I understand your concern about the manufacturing defect. Based on our analysis procedures, I recommend documenting the issue with photos and measurements as evidence.",
  "For urgent claims like this, you should follow protocol C-12 from our handbook. This ensures faster processing and resolution.",
  "The standard procedure for partial refunds involves calculating depreciation based on usage time. I can help you with that calculation if you have the installation date.",
  "Based on our company policy, shipping damage claims need to be reported within 72 hours of receipt with photographic evidence.",
  "I've checked our database and this type of claim typically takes 5-7 business days to process once all documentation is submitted.",
];

// Simple function to get a random response from our mock responses
const getRandomResponse = (query: string) => {
  // For a more realistic demo, tailor responses based on keywords in the query
  if (query.toLowerCase().includes('defect') || query.toLowerCase().includes('manufacturing')) {
    return mockResponses[0];
  } else if (query.toLowerCase().includes('urgent')) {
    return mockResponses[1];
  } else if (query.toLowerCase().includes('refund') || query.toLowerCase().includes('partial')) {
    return mockResponses[2];
  } else if (query.toLowerCase().includes('shipping') || query.toLowerCase().includes('damage')) {
    return mockResponses[3];
  } else {
    return mockResponses[4];
  }
};

// Get stored sessions from localStorage
const getStoredSessions = (): ChatSession[] => {
  const storedSessions = localStorage.getItem('chat_sessions');
  return storedSessions ? JSON.parse(storedSessions) : [];
};

// Save sessions to localStorage
const saveSessionsToStorage = (sessions: ChatSession[]) => {
  localStorage.setItem('chat_sessions', JSON.stringify(sessions));
};

// Get messages for a session from localStorage
const getStoredSessionMessages = (sessionId: string): ChatMessage[] => {
  const storedMessages = localStorage.getItem(`chat_messages_${sessionId}`);
  return storedMessages ? JSON.parse(storedMessages) : [];
};

// Save messages for a session to localStorage
const saveMessagesToStorage = (sessionId: string, messages: ChatMessage[]) => {
  localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
};

export const chatService = {
  async sendMessage(message: string, sessionId?: string): Promise<{response: string, sessionId: string}> {
    try {
      // Determine if we need to create a new session
      const isNewSession = !sessionId;
      let chatSessionId = sessionId || uuidv4();

      // If it's a new session, create one and save it
      if (isNewSession) {
        // Generate a title based on the first message
        const title = message.length > 30
          ? message.substring(0, 30) + '...'
          : message;

        const newSession: ChatSession = {
          id: chatSessionId,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const sessions = getStoredSessions();
        sessions.push(newSession);
        saveSessionsToStorage(sessions);
      }

      // Get existing messages for this session
      const sessionMessages = getStoredSessionMessages(chatSessionId);

      // Add the user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: message,
        role: 'user',
        timestamp: new Date()
      };
      sessionMessages.push(userMessage);

      // Generate a response (in a real app, this would be an API call)
      const responseText = getRandomResponse(message);

      // Add the assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseText,
        role: 'assistant',
        timestamp: new Date()
      };
      sessionMessages.push(assistantMessage);

      // Save the updated messages
      saveMessagesToStorage(chatSessionId, sessionMessages);

      // Update the session's updatedAt timestamp
      const sessions = getStoredSessions();
      const sessionIndex = sessions.findIndex(s => s.id === chatSessionId);
      if (sessionIndex >= 0) {
        sessions[sessionIndex].updatedAt = new Date();
        saveSessionsToStorage(sessions);
      }

      return {
        response: responseText,
        sessionId: chatSessionId
      };
    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    return getStoredSessionMessages(sessionId);
  },

  async getSessions(): Promise<ChatSession[]> {
    return getStoredSessions();
  },

  async deleteSession(sessionId: string): Promise<void> {
    // Remove messages
    localStorage.removeItem(`chat_messages_${sessionId}`);

    // Remove session from sessions list
    const sessions = getStoredSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveSessionsToStorage(updatedSessions);
  }
};
