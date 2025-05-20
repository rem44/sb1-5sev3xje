// src/components/claims/Communications.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Mail, Phone, Users, MessageSquare, Send } from 'lucide-react';
import { ClaimCommunication } from '../../types/claim';
import { fr } from 'date-fns/locale';

interface CommunicationsProps {
  communications?: ClaimCommunication[];
  isEditing: boolean;
  claimId: string;
  onAddCommunication?: (comm: Partial<ClaimCommunication>) => Promise<void>;
}

const Communications: React.FC<CommunicationsProps> = ({
  communications = [],
  isEditing,
  claimId,
  onAddCommunication
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !onAddCommunication) return;

    setSending(true);
    try {
      await onAddCommunication({
        date: new Date(),
        type: 'note',
        content: newMessage,
        sender: 'Utilisateur actuel'
      });

      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setSending(false);
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail size={16} className="text-blue-600" />;
      case 'call':
        return <Phone size={16} className="text-green-600" />;
      case 'meeting':
        return <Users size={16} className="text-purple-600" />;
      case 'note':
      default:
        return <MessageSquare size={16} className="text-gray-600" />;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Communications</h3>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {communications.length > 0 ? (
            communications.map((comm, index) => (
              <div key={comm.id || index} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-gray-100 mr-3">
                      {getCommunicationIcon(comm.type)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{comm.sender}</span>
                        {comm.type === 'email' && comm.recipients && (
                          <span className="text-sm text-gray-500 ml-2">
                            → {comm.recipients.join(', ')}
                          </span>
                        )}
                      </div>
                      {comm.subject && (
                        <p className="text-sm font-medium mt-1">{comm.subject}</p>
                      )}
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                        {comm.content}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comm.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <MessageSquare size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">Aucune communication pour cette réclamation</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium mb-3">Ajouter une note</h4>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
          rows={4}
          placeholder="Entrez votre message ici..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!isEditing}
        ></textarea>
        <div className="flex justify-end mt-3">
          <button
            className={`flex items-center px-4 py-2 rounded-md ${
              isEditing
                ? 'bg-[#0C3B5E] text-white hover:bg-[#0a3252]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors`}
            onClick={handleSendMessage}
            disabled={!isEditing || sending || !newMessage.trim()}
          >
            {sending ? 'Envoi en cours...' : (
              <>
                <Send size={16} className="mr-2" />
                Envoyer
              </>
            )}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-md font-medium mb-3">Actions de communication</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center">
              <Mail size={18} className="mr-2" />
              Envoyer un email
            </button>
            <button className="p-3 bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center">
              <Phone size={18} className="mr-2" />
              Enregistrer un appel
            </button>
            <button className="p-3 bg-purple-50 text-purple-600 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center">
              <Users size={18} className="mr-2" />
              Planifier une réunion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communications;
