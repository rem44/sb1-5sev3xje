import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimsContext';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import { ClaimStatus } from '../types/claim';
import { 
  ArrowLeft, 
  Printer, 
  FileDown, 
  Edit,
  Info,
  Package,
  Camera,
  CheckSquare,
  MessageSquare,
  Banknote,
  Calendar
} from 'lucide-react';

interface InfoFieldProps {
  label: string;
  value: string;
  editable: boolean;
  icon?: React.ReactNode;
  type?: string;
  onChange?: (value: string) => void;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, editable, icon, type = "text", onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      
      {editable ? (
        <input 
          type={type}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
          defaultValue={value}
          onChange={e => onChange?.(e.target.value)}
        />
      ) : (
        <div className="flex items-center">
          <p className="text-gray-900">{value}</p>
          {icon && <span className="ml-1">{icon}</span>}
        </div>
      )}
    </div>
  );
};

const ClaimDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClaim, updateClaim } = useClaims();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  
  const claim = getClaim(id as string);
  
  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Claim not found</h2>
        <p className="text-gray-500 mb-4">The claim you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#0C3B5E] text-white px-4 py-2 rounded-md hover:bg-[#0a3252] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: ClaimStatus) => {
    updateClaim(claim.id, { 
      status: newStatus,
      lastUpdated: new Date()
    });
  };

  const handleInstallationDateChange = (date: string) => {
    if (claim) {
      updateClaim(claim.id, {
        installationDate: new Date(date)
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button 
            onClick={() => navigate('/')}
            className="mr-3 text-gray-500 hover:text-[#0C3B5E] transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center">
              {claim.claimNumber}
              <StatusBadge status={claim.status} />
            </h1>
            <p className="text-gray-500">{claim.clientName} • Created {format(new Date(claim.creationDate), 'MMM d, yyyy')}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center">
            <Printer size={16} className="mr-1" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center">
            <FileDown size={16} className="mr-1" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0C3B5E] hover:bg-[#0a3252]'} text-white px-3 py-2 rounded transition-colors flex items-center`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit size={16} className="mr-1" />
            <span className="hidden sm:inline">{isEditing ? 'Save' : 'Edit'}</span>
          </button>
        </div>
      </div>
      
      {/* Status action bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
            <div className="mt-1">
              <StatusBadge status={claim.status} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {claim.status !== ClaimStatus.New && (
              <StatusButton 
                status={ClaimStatus.New} 
                currentStatus={claim.status} 
                onClick={() => handleStatusChange(ClaimStatus.New)}
              />
            )}
            {claim.status !== ClaimStatus.Screening && (
              <StatusButton 
                status={ClaimStatus.Screening} 
                currentStatus={claim.status} 
                onClick={() => handleStatusChange(ClaimStatus.Screening)}
              />
            )}
            {claim.status !== ClaimStatus.Analyzing && (
              <StatusButton 
                status={ClaimStatus.Analyzing} 
                currentStatus={claim.status} 
                onClick={() => handleStatusChange(ClaimStatus.Analyzing)}
              />
            )}
            {claim.status !== ClaimStatus.Negotiation && (
              <StatusButton 
                status={ClaimStatus.Negotiation} 
                currentStatus={claim.status} 
                onClick={() => handleStatusChange(ClaimStatus.Negotiation)}
              />
            )}
            {claim.status !== ClaimStatus.Accepted && (
              <StatusButton 
                status={ClaimStatus.Accepted} 
                currentStatus={claim.status} 
                onClick={() => handleStatusChange(ClaimStatus.Accepted)}
              />
            )}
            {claim.status !== ClaimStatus.Closed && (
              <StatusButton 
                status={ClaimStatus.Closed} 
                currentStatus={claim.status} 
                onClick={() => handleStatusChange(ClaimStatus.Closed)}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow-sm border-b">
        <div className="flex overflow-x-auto">
          <TabButton 
            icon={<Info size={16} />}
            label="General" 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
          />
          <TabButton 
            icon={<Package size={16} />}
            label="Products" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <TabButton 
            icon={<Camera size={16} />}
            label="Documents" 
            active={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')} 
            badge={claim.documents.length}
          />
          <TabButton 
            icon={<CheckSquare size={16} />}
            label="Checklists" 
            active={activeTab === 'checklists'} 
            onClick={() => setActiveTab('checklists')} 
          />
          <TabButton 
            icon={<MessageSquare size={16} />}
            label="Communications" 
            active={activeTab === 'communications'} 
            onClick={() => setActiveTab('communications')} 
          />
          <TabButton 
            icon={<Banknote size={16} />}
            label="Resolution" 
            active={activeTab === 'resolution'} 
            onClick={() => setActiveTab('resolution')} 
          />
        </div>
      </div>
      
      {/* Tab content */}
      <div className="bg-white rounded-b-lg shadow-sm p-6 mb-6">
        {activeTab === 'general' && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-medium mb-6">General Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Claim Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoField label="Claim Number" value={claim.claimNumber} editable={isEditing} />
                    <InfoField 
                      label="Creation Date" 
                      value={format(new Date(claim.creationDate), 'MMM d, yyyy')} 
                      editable={false} 
                      icon={<Calendar size={14} className="text-gray-400" />}
                    />
                    <InfoField label="Status" value={claim.status} editable={false} />
                    <InfoField label="Department" value={claim.department} editable={isEditing} />
                    <InfoField label="Cause" value={claim.identifiedCause || 'Not specified'} editable={isEditing} />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Installed Product
                      </label>
                      <div className="flex items-center mt-2">
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="installed-toggle" 
                            checked={claim.installed} 
                            onChange={(e) => updateClaim(claim.id, { installed: e.target.checked })}
                            className="absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer checked:right-0 checked:border-[#0C3B5E] transition-all duration-200"
                            disabled={!isEditing}
                          />
                          <label 
                            htmlFor="installed-toggle" 
                            className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                          ></label>
                        </div>
                        <label htmlFor="installed-toggle" className="text-sm text-gray-700 cursor-pointer">
                          {claim.installed ? 'Yes' : 'No'}
                        </label>
                      </div>
                    </div>
                    {claim.installed && (
                      <InfoField 
                        label="Installation Date" 
                        value={claim.installationDate ? format(new Date(claim.installationDate), 'yyyy-MM-dd') : ''} 
                        editable={isEditing}
                        type="date"
                        onChange={handleInstallationDateChange}
                      />
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Client Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoField label="Client Name" value={claim.clientName} editable={isEditing} />
                    <InfoField label="Client ID" value={claim.clientId} editable={false} />
                    <InfoField label="Invoice Reference" value={claim.invoiceLink || 'Not linked'} editable={isEditing} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Financial Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Solution Amount</p>
                        <p className="text-xl font-semibold">${claim.solutionAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Claimed Amount</p>
                        <p className="text-xl font-semibold text-red-600">${claim.claimedAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Savings</p>
                        <p className={`text-lg font-bold ${claim.savedAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(claim.savedAmount).toLocaleString()}
                          <span className="text-xs ml-1">{claim.savedAmount >= 0 ? '(saved)' : '(additional cost)'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Description</h3>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                      rows={5}
                      defaultValue={claim.description}
                    ></textarea>
                  ) : (
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{claim.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Claimed Products</h3>
              {isEditing && (
                <button className="bg-[#0C3B5E] text-white px-3 py-1 rounded-md text-sm">
                  + Add Product
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Style / Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claimed Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/SY
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    {isEditing && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claim.products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full p-1 border border-gray-300 rounded" 
                            defaultValue={product.description} 
                          />
                        ) : (
                          product.description
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.style} / {product.color}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="w-20 p-1 border border-gray-300 rounded" 
                            defaultValue={product.claimedQuantity} 
                          />
                        ) : (
                          product.claimedQuantity
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ${product.pricePerSY.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${product.totalPrice.toLocaleString()}
                      </td>
                      {isEditing && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900">
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={isEditing ? 5 : 4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      Total
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                      ${claim.products.reduce((sum, product) => sum + product.totalPrice, 0).toLocaleString()}
                    </td>
                    {isEditing && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Documents and Photos</h3>
              {isEditing && (
                <button className="bg-[#0C3B5E] text-white px-3 py-1 rounded-md text-sm">
                  + Upload Files
                </button>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-3">Photos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {claim.documents.filter(doc => doc.type === 'image').map((image) => (
                  <div 
                    key={image.id} 
                    className="relative group overflow-hidden rounded-lg shadow-sm border border-gray-200"
                  >
                    <img 
                      src={image.url} 
                      alt={image.name} 
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm truncate">
                      {image.name}
                    </div>
                    {isEditing && (
                      <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <div className="flex items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <div className="text-center p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">Add photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-3">Files</h4>
              <div className="bg-gray-50 rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {claim.documents.filter(doc => doc.type !== 'image').map((doc) => (
                    <li key={doc.id} className="p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 text-blue-700 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.category} • Uploaded {format(new Date(doc.uploadDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          {isEditing && (
                            <button className="text-red-500 hover:text-red-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                  
                  {isEditing && (
                    <li className="p-4">
                      <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-500">Upload document</p>
                          <p className="text-xs text-gray-400">PDF, DOC, XLS or similar</p>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'checklists' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Analysis & Checklists</h3>
              <select 
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                disabled={!isEditing}
              >
                <option value="">Select Analysis Type</option>
                <option value="manufacturing">Manufacturing Defect</option>
                <option value="installation">Installation Issue</option>
                <option value="appearance">Appearance/Performance</option>
                <option value="shipping">Shipping Damage</option>
              </select>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">Manufacturing Defect Analysis</h4>
                <div className="space-y-3">
                  <ChecklistItem 
                    label="Backing separation present" 
                    checked={true} 
                    editable={isEditing} 
                  />
                  <ChecklistItem 
                    label="Material meets specification standards" 
                    checked={false} 
                    editable={isEditing} 
                  />
                  <ChecklistItem 
                    label="Pattern/color consistent with standards" 
                    checked={true} 
                    editable={isEditing} 
                  />
                  <ChecklistItem 
                    label="Dimensions within tolerance" 
                    checked={true} 
                    editable={isEditing} 
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                      rows={3}
                      placeholder="Enter analysis notes..."
                    ></textarea>
                  ) : (
                    <p className="p-3 bg-white rounded border border-gray-200 text-gray-700 text-sm">
                      Inspection revealed inconsistent backing adhesion in multiple samples. 
                      Lab tests confirm adhesive did not meet minimum strength requirements in affected batch.
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-3">Technical Measurements</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Measurement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pass
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <MeasurementRow 
                      name="Adhesive strength" 
                      expected="≥ 5.0 lbs/in" 
                      actual="3.2 lbs/in" 
                      pass={false} 
                      editable={isEditing} 
                    />
                    <MeasurementRow 
                      name="Backing thickness" 
                      expected={`0.125" ± 0.01"`} 
                      actual={`0.122"`} 
                      pass={true} 
                      editable={isEditing} 
                    />
                    <MeasurementRow 
                      name="Dimensional stability" 
                      expected="< 0.2% change" 
                      actual="0.15% change" 
                      pass={true} 
                      editable={isEditing} 
                    />
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium mb-3">Technical Conclusion</h4>
                {isEditing ? (
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                    rows={4}
                    defaultValue="Based on our analysis, we confirm a manufacturing defect in the adhesive application process. Batch #KL-238 shows significantly reduced backing adhesion strength below our minimum standards, which explains the customer's report of backing separation. This is a confirmed manufacturing defect."
                  ></textarea>
                ) : (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-700">
                      Based on our analysis, we confirm a manufacturing defect in the adhesive application process. 
                
                      Batch #KL-238 shows significantly reduced backing adhesion strength below our minimum standards,
                      which explains the customer's report of backing separation. This is a confirmed manufacturing defect.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab !== 'general' && activeTab !== 'products' && activeTab !== 'documents' && activeTab !== 'checklists' && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500 mb-2">This section is under development</h3>
              <p className="text-gray-400">The {activeTab} tab content is coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatusButtonProps {
  status: ClaimStatus;
  currentStatus: ClaimStatus;
  onClick: () => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({ status, currentStatus, onClick }) => {
  const getButtonStyle = () => {
    // Simple logic to determine if this status would be a forward or backward movement
    const statuses = Object.values(ClaimStatus);
    const currentIndex = statuses.indexOf(currentStatus);
    const newIndex = statuses.indexOf(status);
    
    if (newIndex > currentIndex) {
      return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };
  
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-md border ${getButtonStyle()} transition-colors`}
    >
      Move to {status}
    </button>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick, badge }) => {
  return (
    <button
      className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active 
          ? 'border-[#0C3B5E] text-[#0C3B5E]' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
          {badge}
        </span>
      )}
    </button>
  );
};

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  editable: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, checked, editable }) => {
  return (
    <div className="flex items-center">
      <input 
        type="checkbox" 
        className="h-4 w-4 text-[#0C3B5E] focus:ring-[#0C3B5E] border-gray-300 rounded"
        checked={checked}
        readOnly={!editable}
      />
      <label className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

interface MeasurementRowProps {
  name: string;
  expected: string;
  actual: string;
  pass: boolean;
  editable: boolean;
}

const MeasurementRow: React.FC<MeasurementRowProps> = ({ name, expected, actual, pass, editable }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {expected}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {editable ? (
          <input 
            type="text" 
            className="w-full p-1 border border-gray-300 rounded" 
            defaultValue={actual}
          />
        ) : (
          actual
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editable ? (
          <input 
            type="checkbox" 
            className="h-4 w-4 text-[#0C3B5E] focus:ring-[#0C3B5E] border-gray-300 rounded"
            checked={pass}
          />
        ) : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {pass ? 'Pass' : 'Fail'}
          </span>
        )}
      </td>
    </tr>
  );
};

export default ClaimDetails;