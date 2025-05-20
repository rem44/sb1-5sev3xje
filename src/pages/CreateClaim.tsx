import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimsContext';
import { ClaimStatus, Claim } from '../types/claim';
import { 
  ArrowLeft, 
  ChevronRight,
  ChevronLeft,
  Save,
  Upload,
  FileText,
  Calendar
} from 'lucide-react';

const CreateClaim: React.FC = () => {
  const navigate = useNavigate();
  const { addClaim } = useClaims();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: General Information
    claimNumber: `CLM-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).substring(1)}`,
    clientName: '',
    clientId: '',
    department: 'Customer Service',
    installed: false,
    invoiceLink: '',
    description: '',
    
    // Step 2: Products
    products: [],
    solutionAmount: 0,
    claimedAmount: 0,
    
    // Step 3: Documentation
    documents: [],
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };
  
  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.clientName) errors.clientName = 'Client name is required';
      if (!formData.clientId) errors.clientId = 'Client ID is required';
      if (!formData.department) errors.department = 'Department is required';
    }
    
    if (step === 2) {
      if (!formData.products || formData.products.length === 0) {
        errors.products = 'At least one product must be added';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Create the claim object
      const newClaim: Claim = {
        id: Math.random().toString(36).substr(2, 9),
        claimNumber: formData.claimNumber,
        clientName: formData.clientName,
        clientId: formData.clientId,
        creationDate: new Date(),
        status: ClaimStatus.New,
        department: formData.department,
        installed: formData.installed,
        invoiceLink: formData.invoiceLink,
        description: formData.description,
        solutionAmount: 0,
        claimedAmount: formData.claimedAmount || 0,
        savedAmount: -(formData.claimedAmount || 0),
        products: formData.products,
        documents: formData.documents,
        lastUpdated: new Date()
      };
      
      addClaim(newClaim);
      navigate(`/claims/${newClaim.id}`);
    }
  };
  
  const saveDraft = () => {
    // Logic to save draft would go here
    console.log('Saving draft:', formData);
    // Show a success message
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/')}
          className="mr-3 text-gray-500 hover:text-[#0C3B5E] transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Create New Claim</h1>
          <p className="text-gray-500">Complete all required information to submit a new claim</p>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-full flex items-center">
            <StepIndicator 
              number={1} 
              title="General Information" 
              active={currentStep === 1} 
              completed={currentStep > 1} 
            />
            <div className="flex-1 h-1 bg-gray-200">
              <div 
                className={`h-1 ${currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`}
              ></div>
            </div>
            <StepIndicator 
              number={2} 
              title="Products" 
              active={currentStep === 2} 
              completed={currentStep > 2} 
            />
            <div className="flex-1 h-1 bg-gray-200">
              <div 
                className={`h-1 ${currentStep > 2 ? 'bg-green-500' : 'bg-gray-200'}`}
              ></div>
            </div>
            <StepIndicator 
              number={3} 
              title="Documentation" 
              active={currentStep === 3} 
              completed={currentStep > 3} 
            />
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-medium mb-6">General Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claim Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.claimNumber} 
                  onChange={(e) => handleChange('claimNumber', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated claim number</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creation Date
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={new Date().toLocaleDateString()}
                    className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent bg-gray-50"
                    disabled
                  />
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>
              
              <div className={validationErrors.clientName ? 'has-error' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.clientName} 
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  className={`w-full p-2 border ${validationErrors.clientName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent`}
                  placeholder="Enter client name"
                />
                {validationErrors.clientName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.clientName}</p>
                )}
              </div>
              
              <div className={validationErrors.clientId ? 'has-error' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.clientId} 
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  className={`w-full p-2 border ${validationErrors.clientId ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent`}
                  placeholder="Enter client ID"
                />
                {validationErrors.clientId && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.clientId}</p>
                )}
              </div>
              
              <div className={validationErrors.department ? 'has-error' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.department} 
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`w-full p-2 border ${validationErrors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent`}
                >
                  <option value="Customer Service">Customer Service</option>
                  <option value="Technical">Technical</option>
                  <option value="Production">Production</option>
                  <option value="Quality Control">Quality Control</option>
                </select>
                {validationErrors.department && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Installed Product
                </label>
                <div className="flex items-center mt-2">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="installed-toggle" 
                      checked={formData.installed} 
                      onChange={(e) => handleChange('installed', e.target.checked)}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer checked:right-0 checked:border-[#0C3B5E] transition-all duration-200"
                    />
                    <label 
                      htmlFor="installed-toggle" 
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                  <label htmlFor="installed-toggle" className="text-sm text-gray-700 cursor-pointer">
                    {formData.installed ? 'Yes' : 'No'}
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Reference
                </label>
                <input 
                  type="text" 
                  value={formData.invoiceLink} 
                  onChange={(e) => handleChange('invoiceLink', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                  placeholder="Enter invoice number"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                  rows={4}
                  placeholder="Describe the claim in detail"
                ></textarea>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-medium mb-6">Products Information</h2>
            
            {validationErrors.products && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 border border-red-200">
                <p>{validationErrors.products}</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-md font-medium mb-3">Invoice Products</h3>
              <p className="text-sm text-gray-500 mb-3">
                Select products from invoice {formData.invoiceLink || '(No invoice linked)'}
              </p>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="h-4 w-4 text-[#0C3B5E] focus:ring-[#0C3B5E] border-gray-300 rounded" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Style/Color
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/SY
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-100 cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input type="checkbox" className="h-4 w-4 text-[#0C3B5E] focus:ring-[#0C3B5E] border-gray-300 rounded" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      Venture Modular Carpet - Linear Pattern
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      VM-Linear / Charcoal Grey
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      200
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      $45.00
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      $9,000.00
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100 cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input type="checkbox" className="h-4 w-4 text-[#0C3B5E] focus:ring-[#0C3B5E] border-gray-300 rounded" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      Installation Labor
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      Service / N/A
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      1
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      $3,500.00
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      $3,500.00
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div className="mt-4 flex justify-end">
                <button className="bg-[#0C3B5E] text-white px-3 py-1 rounded-md text-sm">
                  Add Selected Products
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium mb-4">Claimed Products</h3>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 mb-4 md:mb-0 md:mr-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Product Details</h4>
                    <div className="bg-gray-50 p-3 rounded-lg h-full">
                      <p className="font-medium">Venture Modular Carpet - Linear Pattern</p>
                      <p className="text-sm text-gray-500">Style: VM-Linear / Color: Charcoal Grey</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Carpet Tile</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">24" x 24"</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quantity Conversion</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Cartons (CTN)
                        </label>
                        <input 
                          type="number" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                          defaultValue="34"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Square Yards (SY)
                        </label>
                        <input 
                          type="number" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                          defaultValue="203.32"
                        />
                        <p className="text-xs text-gray-400 mt-1">1 CTN = 5.98 SY</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Quantity
                    </label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent bg-gray-50"
                      defaultValue="200"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Claimed Quantity
                    </label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
                      defaultValue="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        $
                      </span>
                      <input 
                        type="number" 
                        className="w-full p-2 pl-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent bg-gray-50"
                        defaultValue="45.00"
                        disabled
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                  <div>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Remove Product
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Claimed</p>
                    <p className="text-xl font-semibold">$9,000.00</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Products Claimed</p>
                  <p className="text-sm text-gray-500">1 item</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500">Total Claimed Amount</p>
                  <p className="text-xl font-semibold">$9,000.00</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-medium mb-6">Documentation</h2>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">Photos</h3>
                <span className="text-sm text-gray-500">0 photos uploaded</span>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="max-w-sm mx-auto">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Upload Photos</h4>
                  <p className="mt-1 text-xs text-gray-500">
                    Drag and drop photos here, or click to browse from your device
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    JPG, PNG or GIF • Max 10MB per file
                  </p>
                  <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E]">
                    Upload Photos
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">Documents</h3>
                <span className="text-sm text-gray-500">0 documents uploaded</span>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="max-w-sm mx-auto">
                  <FileText className="h-12 w-12 mx-auto text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Upload Documents</h4>
                  <p className="mt-1 text-xs text-gray-500">
                    Add invoices, reports, or other relevant files
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    PDF, DOC, XLS • Max 20MB per file
                  </p>
                  <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E]">
                    Upload Documents
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-md font-medium mb-4">Claim Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Client Information</h4>
                  <p className="font-medium">{formData.clientName || 'No client specified'}</p>
                  <p className="text-sm text-gray-500">ID: {formData.clientId || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mt-1">Department: {formData.department}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Claim Details</h4>
                  <p className="font-medium">{formData.claimNumber}</p>
                  <p className="text-sm text-gray-500">Created: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.installed ? 'Product Installed' : 'Product Not Installed'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Claim Value</h4>
                <div className="flex justify-between items-center">
                  <span>Total Claimed Amount</span>
                  <span className="text-xl font-bold text-red-600">$9,000.00</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">Important Note</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Once submitted, the claim will be initially marked as "New" and assigned to the appropriate department for screening.
                      You'll be able to upload additional documents or provide more information as needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <div>
          {currentStep > 1 && (
            <button 
              onClick={goToPreviousStep}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={saveDraft}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            <Save size={16} className="mr-1" />
            Save Draft
          </button>
          
          {currentStep < 3 ? (
            <button 
              onClick={goToNextStep}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-[#0C3B5E] text-white hover:bg-[#0a3252] focus:outline-none"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-green-600 text-white hover:bg-green-700 focus:outline-none"
            >
              Submit Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface StepIndicatorProps {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ number, title, active, completed }) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`
          flex items-center justify-center w-8 h-8 rounded-full 
          ${completed ? 'bg-green-500 text-white' : active ? 'bg-[#0C3B5E] text-white' : 'bg-gray-200 text-gray-500'}
          transition-colors duration-200
        `}
      >
        {completed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span 
        className={`
          mt-1 text-xs
          ${active ? 'text-[#0C3B5E] font-medium' : completed ? 'text-green-600' : 'text-gray-500'}
        `}
      >
        {title}
      </span>
    </div>
  );
};

export default CreateClaim;