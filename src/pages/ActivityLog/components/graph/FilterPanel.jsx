import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const FilterPanel = ({ allStatuses, funnels, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedFunnels, setSelectedFunnels] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isExpanded, setIsExpanded] = useState(true);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    onFilterChange({ search: value });
  };

  // Handle funnel selection
  const handleFunnelChange = (funnel) => {
    const newSelectedFunnels = selectedFunnels.includes(funnel)
      ? selectedFunnels.filter(f => f !== funnel)
      : [...selectedFunnels, funnel];
    
    setSelectedFunnels(newSelectedFunnels);
    onFilterChange({ funnels: newSelectedFunnels });
  };

  // Handle status selection
  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  // Handle date range
  const handleDateChange = (type, e) => {
    const value = e.target.value ? new Date(e.target.value) : null;
    const newDateRange = { ...dateRange, [type]: value };
    setDateRange(newDateRange);
    
    // Only update filter if both dates are set
    if (newDateRange.start && newDateRange.end) {
      onFilterChange({ dateRange: newDateRange });
    } else if (!newDateRange.start && !newDateRange.end) {
      onFilterChange({ dateRange: null });
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedFunnels([]);
    setDateRange({ start: null, end: null });
    onFilterChange({
      search: '',
      status: '',
      funnels: [],
      dateRange: null
    });
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium">Filters and Search</h3>
        <svg 
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Tasks</label>
              <input
                type="text"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter task ID or keyword..."
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                {allStatuses.map((status, idx) => (
                  <option key={idx} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="datetime-local"
                  className="block w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.start ? format(dateRange.start, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => handleDateChange('start', e)}
                />
                <input
                  type="datetime-local"
                  className="block w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.end ? format(dateRange.end, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => handleDateChange('end', e)}
                />
              </div>
            </div>
          </div>
          
          {/* Funnel selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Funnels</label>
            <div className="flex flex-wrap gap-2">
              {funnels.map((funnel, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedFunnels.includes(funnel)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFunnelChange(funnel)}
                >
                  {funnel}
                </button>
              ))}
            </div>
          </div>
          
          {/* Clear filters button */}
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;