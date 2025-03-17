
import React from 'react';

function Header({ 
  inputApplicationId, 
  setInputApplicationId, 
  handleApplicationIdSubmit, 
  applicationId, 
  handleRefresh, 
  toggleFilters, 
  showFilters 
}) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-6 text-gray-900 sm:truncate">
              Loan Application Tracking
            </h1>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <form onSubmit={handleApplicationIdSubmit} className="flex">
              <input
                type="text"
                value={inputApplicationId}
                onChange={(e) => setInputApplicationId(e.target.value)}
                placeholder="Enter Application ID"
                className="rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Load
              </button>
            </form>
            
            {applicationId && (
              <>
                <button
                  onClick={handleRefresh}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refresh
                </button>
                <button
                  onClick={toggleFilters}
                  className={`ml-3 inline-flex items-center px-4 py-2 border ${
                    showFilters 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-300 bg-white text-gray-700'
                  } rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;