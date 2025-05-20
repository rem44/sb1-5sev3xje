import React, { useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { format } from 'date-fns';
import { Eye, ArrowUpDown, Filter } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { claims, calculateTotals } = useClaims();
  const [sortField, setSortField] = useState<string>('creationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    cause: '',
    installed: '',
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredClaims = claims.filter(claim => {
    return (
      (filters.status === '' || claim.status === filters.status) &&
      (filters.department === '' || claim.department === filters.department) &&
      (filters.cause === '' || claim.identifiedCause === filters.cause) &&
      (filters.installed === '' || 
        (filters.installed === 'yes' ? claim.installed : !claim.installed))
    );
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'creationDate':
        comparison = new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
        break;
      case 'claimNumber':
        comparison = a.claimNumber.localeCompare(b.claimNumber);
        break;
      case 'clientName':
        comparison = a.clientName.localeCompare(b.clientName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'department':
        comparison = a.department.localeCompare(b.department);
        break;
      case 'solutionAmount':
        comparison = a.solutionAmount - b.solutionAmount;
        break;
      case 'claimedAmount':
        comparison = a.claimedAmount - b.claimedAmount;
        break;
      case 'savedAmount':
        comparison = a.savedAmount - b.savedAmount;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const uniqueDepartments = Array.from(new Set(claims.map(claim => claim.department)));
  const uniqueCauses = Array.from(new Set(claims.map(claim => claim.identifiedCause).filter(Boolean)));
  
  const { totalSolution, totalClaimed, totalSaved } = calculateTotals();

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Active Claims" 
          value={claims.filter(c => c.status !== 'Closed').length.toString()} 
          icon="📋" 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Solution Amount" 
          value={`$${totalSolution.toLocaleString()}`} 
          icon="💰" 
          color="bg-green-50 text-green-600"
        />
        <StatCard 
          title="Claimed Amount" 
          value={`$${totalClaimed.toLocaleString()}`} 
          icon="💸" 
          color="bg-red-50 text-red-600"
        />
        <StatCard 
          title="Total Saved" 
          value={`$${totalSaved.toLocaleString()}`} 
          icon="💎" 
          color={totalSaved >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}
        />
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <Filter size={16} className="mr-2 text-gray-500" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              {Object.values(claims.map(c => c.status)).map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cause</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.cause}
              onChange={(e) => setFilters({...filters, cause: e.target.value})}
            >
              <option value="">All Causes</option>
              {uniqueCauses.map((cause, index) => (
                <option key={index} value={cause}>{cause}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Installed</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.installed}
              onChange={(e) => setFilters({...filters, installed: e.target.value})}
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  title="Claim"
                  field="claimNumber"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Date"
                  field="creationDate"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Status"
                  field="status"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Department"
                  field="department"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cause
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <SortableHeader
                  title="Solution $"
                  field="solutionAmount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  title="Claimed $"
                  field="claimedAmount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  title="Saved $"
                  field="savedAmount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClaims.map((claim, index) => (
                <tr 
                  key={claim.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {claim.claimNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {claim.clientName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(claim.creationDate), 'dd-MMM-yy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.identifiedCause || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.installed ? 
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Yes</span> : 
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">No</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.invoiceLink ? 
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye size={16} />
                      </button> : 
                      '—'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${claim.solutionAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                    ${claim.claimedAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`
                      px-2 py-1 rounded text-sm font-medium
                      ${claim.savedAmount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    `}>
                      ${Math.abs(claim.savedAmount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/claims/${claim.id}`}
                      className="text-[#0C3B5E] hover:text-blue-900 transition-colors duration-200"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={7} className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Total ({sortedClaims.length} claims)
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  ${sortedClaims.reduce((sum, claim) => sum + claim.solutionAmount, 0).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-red-600">
                  ${sortedClaims.reduce((sum, claim) => sum + claim.claimedAmount, 0).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium">
                  <span className={`
                    px-2 py-1 rounded
                    ${totalSaved >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    ${Math.abs(sortedClaims.reduce((sum, claim) => sum + claim.savedAmount, 0)).toLocaleString()}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-full`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface SortableHeaderProps {
  title: string;
  field: string;
  currentSort: string;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  title, 
  field, 
  currentSort, 
  direction, 
  onSort,
  className = "text-left" 
}) => {
  return (
    <th 
      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{title}</span>
        <ArrowUpDown 
          size={14} 
          className={`${currentSort === field ? 'text-[#0C3B5E]' : 'text-gray-400'}`} 
        />
      </div>
    </th>
  );
};

export default Dashboard;