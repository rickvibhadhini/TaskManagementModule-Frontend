import React, { useEffect, useState } from 'react';

function FilterPanel({ 
  filters, 
  handleFilterChange, 
  clearFilters, 
  hideNewStatus, 
  setHideNewStatus,
  funnelData
}) {
  // Extract unique funnel types from funnelData
  const [funnelTypes, setFunnelTypes] = useState([]);

  useEffect(() => {
    if (funnelData && funnelData.length > 0) {
      // Extract unique funnel names
      const uniqueFunnelTypes = [...new Set(funnelData.map(funnel => funnel.name))];
      setFunnelTypes(uniqueFunnelTypes);
    }
  }, [funnelData]);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          Clear All
        </button>
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Task ID Filter */}
        <div>
          <label htmlFor="taskId" className="block text-sm font-medium text-gray-700">
            Task ID
          </label>
          <input
            type="text"
            id="taskId"
            value={filters.taskId}
            onChange={(e) => handleFilterChange('taskId', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="HIDE_NEW">Hide NEW</option>
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      
        {/* Handled By Filter (replacing Actor ID) */}
        <div>
          <label htmlFor="actorId" className="block text-sm font-medium text-gray-700">
            Handled By
          </label>
          <input
            type="text"
            id="actorId"
            value={filters.actorId}
            onChange={(e) => handleFilterChange('actorId', e.target.value)}
            placeholder="email@example.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      
        {/* Funnel Type Filter as Dropdown */}
        <div>
          <label htmlFor="funnelType" className="block text-sm font-medium text-gray-700">
            Funnel Type
          </label>
          <select
            id="funnelType"
            value={filters.funnelType}
            onChange={(e) => handleFilterChange('funnelType', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Funnel Types</option>
            {funnelTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
      
        {/* Date Range Filter */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>
    
      {/* Custom Date Range (conditionally rendered) */}
      {filters.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;