// src/components/chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader, MessageSquare, FileText, Plus, Trash2, MessageCircle } from 'lucide-react';
import { chatService, ChatMessage, ChatSession } from '../../services/chatService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [retryMessage, setRetryMessage] = useState<ChatMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll automatique vers le bas quand de nouveaux messages sont ajoutés
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus sur l'input quand le chat est ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Charger les sessions au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    try {
      const fetchedSessions = await chatService.getSessions();
      setSessions(fetchedSessions);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent ?? newMessage.trim();
    if (!contentToSend) return;

    const userMessage: ChatMessage = {
      content: contentToSend,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const { response, sessionId } = await chatService.sendMessage(contentToSend, currentSessionId);

      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
        await loadSessions();
      }

      const assistantMessage: ChatMessage = {
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRetryMessage(null);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);

      const errorMessage: ChatMessage = {
        content: "❗ Une erreur est survenue. Cliquez ici pour réessayer.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setRetryMessage(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const loadSession = async (sessionId: string) => {
    setShowSessions(false);
    setIsLoading(true);

    try {
      const sessionMessages = await chatService.getSessionMessages(sessionId);
      setMessages(sessionMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Erreur lors du chargement de la session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowSessions(false);
    setRetryMessage(null);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      return;
    }

    try {
      await chatService.deleteSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));

      if (currentSessionId === sessionId) {
        setMessages([]);
        setCurrentSessionId(null);
        setRetryMessage(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la session:', error);
      alert('Erreur lors de la suppression de la conversation');
    }
  };

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  // Render
  const renderChatButton = () => {
    return (
      <button
        className="fixed bottom-6 right-6 p-4 rounded-full bg-[#0C3B5E] text-white shadow-lg hover:bg-[#0a3252] transition-colors z-20"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le chat"
      >
        <MessageSquare size={24} />
      </button>
    );
  };

  const renderChatWindow = () => {
    return (
      <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl z-20 transition-all duration-300 overflow-hidden ${
        expanded ? 'w-[800px] h-[600px]' : 'w-[380px] h-[500px]'
      }`}>
        {/* Header */}
        <div className="bg-[#0C3B5E] text-white p-3 flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle size={20} className="mr-2" />
            <h3 className="font-medium">
              {currentSessionId
                ? (sessions.find(s => s.id === currentSessionId)?.title || 'Assistant IA')
                : 'Nouvelle conversation'
              }
            </h3>
          </div>
          <div className="flex items-center">
            <button
              className="p-1 rounded-full hover:bg-blue-700 transition-colors mr-1"
              onClick={toggleExpanded}
              aria-label={expanded ? "Réduire" : "Agrandir"}
              title={expanded ? "Réduire" : "Agrandir"}
            >
              {expanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              className="p-1 rounded-full hover:bg-blue-700 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex h-[calc(100%-116px)]">
          {/* Sidebar (only in expanded mode) */}
          {expanded && (
            <div className="w-64 border-r border-gray-200 flex flex-col">
              {/* New chat button */}
              <div className="p-3 border-b border-gray-200">
                <button
                  className="w-full p-2 bg-[#0C3B5E] text-white rounded-md flex items-center justify-center hover:bg-[#0a3252] transition-colors"
                  onClick={startNewChat}
                >
                  <Plus size={18} className="mr-2" />
                  Nouvelle conversation
                </button>
              </div>

              {/* Sessions list */}
              <div className="flex-1 overflow-y-auto">
                {sessions.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {sessions.map(session => (
                      <li
                        key={session.id}
                        className={`p-3 hover:bg-gray-100 cursor-pointer ${
                          currentSessionId === session.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => loadSession(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MessageSquare size={16} className="text-gray-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{session.title}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(session.updatedAt), 'dd MMM, HH:mm', { locale: fr })}
                              </p>
                            </div>
                          </div>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            onClick={(e) => deleteSession(session.id, e)}
                            title="Supprimer la conversation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>Aucune conversation</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat area */}
          <div className={`flex-1 flex flex-col h-full ${showSessions && !expanded ? 'hidden' : 'block'}`}>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-[#0C3B5E] text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {format(new Date(msg.timestamp), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <FileText size={48} className="text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Assistant IA pour la Gestion des Réclamations
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Posez des questions sur les procédures, les produits ou les réclamations.
                  </p>
                  <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                    {[
                      "Comment analyser un défaut de fabrication ?",
                      "Quelle est la procédure pour les réclamations urgentes ?",
                      "Comment calculer un remboursement partiel ?"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-left"
                        onClick={() => setNewMessage(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end">
                <textarea
                  ref={inputRef}
                  className="flex-1 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                  placeholder="Écrivez votre message..."
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                ></textarea>
                <button
                  className={`ml-2 p-2 rounded-md ${
                    newMessage.trim() && !isLoading
                      ? 'bg-[#0C3B5E] text-white hover:bg-[#0a3252]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  } transition-colors`}
                  disabled={!newMessage.trim() || isLoading}
                  onClick={handleSendMessage}
                >
                {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
</button>
</div>
<p className="mt-1 text-xs text-gray-500">
Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne
</p>
</div>
</div>

{/* Sessions list for mobile (only when not expanded) */}
{showSessions && !expanded && (
<div className="flex-1 flex flex-col h-full">
<div className="p-3 border-b border-gray-200">
<div className="flex justify-between items-center">
<h3 className="font-medium">Conversations</h3>
<button
className="text-gray-500 hover:text-gray-700"
onClick={() => setShowSessions(false)}
>
<X size={18} />
</button>
</div>
</div>
<div className="flex-1 overflow-y-auto">
<div className="p-3 border-b border-gray-200">
<button
className="w-full p-2 bg-[#0C3B5E] text-white rounded-md flex items-center justify-center hover:bg-[#0a3252] transition-colors"
onClick={startNewChat}
>
<Plus size={18} className="mr-2" />
Nouvelle conversation
</button>
</div>
{sessions.length > 0 ? (
<ul className="divide-y divide-gray-200">
{sessions.map(session => (
  <li
    key={session.id}
    className="p-3 hover:bg-gray-100 cursor-pointer"
    onClick={() => loadSession(session.id)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <MessageSquare size={16} className="text-gray-500 mr-2" />
        <div>
          <p className="text-sm font-medium line-clamp-1">{session.title}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(session.updatedAt), 'dd MMM, HH:mm', { locale: fr })}
          </p>
        </div>
      </div>
      <button
        className="text-gray-400 hover:text-red-600"
        onClick={(e) => deleteSession(session.id, e)}
        title="Supprimer la conversation"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </li>
))}
</ul>
) : (
<div className="p-4 text-center text-gray-500">
<p>Aucune conversation</p>
</div>
)}
</div>
</div>
)}
</div>

{/* Footer */}
<div className="p-3 border-t border-gray-200 flex justify-between items-center">
{!expanded && (
<button
className="text-gray-600 hover:text-[#0C3B5E] flex items-center text-sm"
onClick={() => setShowSessions(!showSessions)}
>
<MessageSquare size={14} className="mr-1" />
{showSessions ? 'Retour au chat' : 'Conversations'}
</button>
)}
<div className="text-xs text-gray-500 flex-grow text-center">
Propulsé par OpenAI
</div>
</div>
</div>
);
};

return (
<>
{!isOpen ? renderChatButton() : renderChatWindow()}
</>
);
};

export default ChatInterface;
