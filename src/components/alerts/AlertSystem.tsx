// src/components/alerts/AlertSystem.tsx
import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { alertService, Alert } from '../../services/alertService';
import { Link } from 'react-router-dom';

const AlertSystem: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  // Récupérer les alertes au chargement du composant
  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const fetchedAlerts = await alertService.fetchAlerts();
        setAlerts(fetchedAlerts);
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await alertService.markAsRead(id);
      setAlerts(alerts.map(alert =>
        alert.id === id ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error('Erreur lors du marquage de l\'alerte comme lue:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertService.markAllAsRead();
      setAlerts(alerts.map(alert => ({ ...alert, read: true })));
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les alertes comme lues:', error);
    }
  };

  const getAlertTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none relative"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Check size={14} className="mr-1" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : alerts.length > 0 ? (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 border-b border-gray-100 ${!alert.read ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeStyles(alert.type)}`}>
                        {alert.type === 'warning' ? 'Avertissement' :
                         alert.type === 'error' ? 'Erreur' : 'Info'}
                      </div>
                      <p className="mt-1 text-sm">
                        {alert.message}
                      </p>
                      {alert.claimId && (
                        <Link
                          to={`/claims/${alert.claimId}`}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 block"
                        >
                          Voir la réclamation {alert.claimNumber}
                        </Link>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {!alert.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(alert.id, e)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Marquer comme lu"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">Aucune notification</div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 text-center py-1"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;
