import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log('Searching for:', searchQuery);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Claims Dashboard';
    if (path.startsWith('/claims/new')) return 'Create New Claim';
    if (path.startsWith('/claims/')) return 'Claim Details';
    return 'Claims Management';
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
            placeholder="Search claims..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent w-64"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>
        
        <div className="relative">
          <button 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </button>
        </div>
        
        {location.pathname === '/' && (
          <button 
            onClick={() => navigate('/claims/new')}
            className="bg-[#0C3B5E] hover:bg-[#0a3252] text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center"
          >
            <span className="mr-1">+</span> New Claim
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;