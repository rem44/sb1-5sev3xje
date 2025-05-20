// src/components/layout/Header.tsx (modifié)
import React, { useState } from 'react';
import { Search, Menu, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AlertSystem from '../alerts/AlertSystem';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implémentation de la recherche à venir
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Tableau de Bord des Réclamations';
    if (path.startsWith('/claims/new')) return 'Créer une Nouvelle Réclamation';
    if (path.startsWith('/claims/')) return 'Détails de la Réclamation';
    return 'Gestion des Réclamations';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <button
          className="text-gray-500 mr-4 lg:hidden focus:outline-none"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-[#0C3B5E]">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <input
            type="text"
            placeholder="Rechercher des réclamations..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent w-64"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>

        <AlertSystem />

        <div className="relative">
          <button
            className="flex items-center focus:outline-none"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="h-8 w-8 rounded-full bg-[#0C3B5E] flex items-center justify-center text-white">
              {user?.fullName?.charAt(0) || <User size={16} />}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
              {user?.fullName || 'Utilisateur'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</a>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>

        {location.pathname === '/' && (
          <button
            onClick={() => navigate('/claims/new')}
            className="bg-[#0C3B5E] hover:bg-[#0a3252] text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center"
          >
            <span className="mr-1">+</span> Nouvelle Réclamation
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
