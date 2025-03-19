
import React from 'react';

function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('list')}
          className={`${
            activeTab === 'list'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          List View
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${
            activeTab === 'dashboard'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}              //GanntChart component is renamed as Dashboard component
        > 
          GanntChart               
        </button>  
      </nav>
    </div>
  );
}

export default TabNavigation;