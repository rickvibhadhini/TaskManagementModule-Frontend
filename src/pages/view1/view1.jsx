import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/common/Header';
import FilterPanel from './components/filters/FilterPanel';
import Dashboard from './Dashboard';
import TabNavigation from './components/common/TabNavigation';
import FunnelView from './components/funnels/FunnelView';
import { transformApiData } from './utils/apiTransformers';
import mocklogdata from './mockData/mocklogdata';
import { fetchFunnelData } from './services/ApplicationListApi';
//import AnalyticsView from './components/AnalyticsView';

function View1() {
  const [expandedFunnels, setExpandedFunnels] = useState({});
  const [applicationId, setApplicationId] = useState('');
  const [inputApplicationId, setInputApplicationId] = useState('');
  const [funnelData, setFunnelData] = useState([]);
  const [filteredFunnelData, setFilteredFunnelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); 
  const [hideNewStatus, setHideNewStatus] = useState(true); 
  const [pollingInterval, setPollingInterval] = useState(null);

  const [filters, setFilters] = useState({
    taskId: '',
    status: 'HIDE_NEW', 
    updatedDate: '',
    actorId: '',
    funnelType: '',
    dateRange: '',
    startDate: '',
    endDate: '',
    sortBy: 'updatedAt',
    sortOrder: 'asc' 
  });
  const [showFilters, setShowFilters] = useState(false);
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };
  
  const startPolling = () => {
    stopPolling(); 
    fetchFunnelData(); 
    console.log("Polling started at:", new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      console.log("Polling triggered at:", new Date().toLocaleTimeString());
      fetchFunnelData();
    }, 10000); // Poll every 10 seconds
  
    setPollingInterval(interval);
  };

  useEffect(() => {
    if (applicationId) {
      startPolling();  
    } else {
      stopPolling(); 
    }

    return () => stopPolling(); 
  }, [applicationId]);

  useEffect(() => {
    if (applicationId) {
      fetchFunnelData();
    }
  }, [applicationId]);

  // Apply filters whenever filters or funnelData changes
  useEffect(() => {
    applyFilters();
  }, [filters, funnelData, hideNewStatus]);

  const fetchFunnelData = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:8080/applicationLog/${applicationId}`;
      const response = await axios.get(url);
      const transformedData = transformApiData(response.data.data);                            // replaced for mock data
    
      setFunnelData(transformedData);
    
      // Initialize expanded state for all funnels
      const initialExpandedState = Object.fromEntries(
        transformedData.map(funnel => [funnel.id, false]) // Default collapsed
      );
      setExpandedFunnels(initialExpandedState);
    
      setError(null);
    } catch (err) {
      console.error('Error fetching funnel data:', err);
      setError('Failed to load activity data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Start with all funnel data - preserve original order
    let result = [...funnelData];
  
    // Filter by funnel type if specified
    if (filters.funnelType) {
      result = result.filter(funnel => 
        funnel.name === filters.funnelType
      );
    }
  
    // Apply date range filters if specified
    if (filters.dateRange) {
      const now = new Date();
      let startDate;
    
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last7days':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'last30days':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'custom':
          if (filters.startDate) {
            startDate = new Date(filters.startDate);
          }
          break;
        default:
          startDate = null;
      }
    
      let endDate = null;
      if (filters.dateRange === 'custom' && filters.endDate) {
        endDate = new Date(filters.endDate);
        // Set to end of day
        endDate.setHours(23, 59, 59, 999);
      }
    
      // Apply date range filter to tasks
      if (startDate || endDate) {
        result = result.map(funnel => {
          const filteredTasks = funnel.tasks.filter(task => {
            if (!task.statusHistory || task.statusHistory.length === 0) return false;
          
            // Check the dates in status history
            return task.statusHistory.some(status => {
              const statusDate = new Date(status.updatedAt);
            
              if (startDate && statusDate < startDate) {
                return false;
              }
            
              if (endDate && statusDate > endDate) {
                return false;
              }
            
              return true;
            });
          });
        
          return {
            ...funnel,
            tasks: filteredTasks
          };
        });
      }
    }
  
    // Apply status filter to hide NEW tasks if hideNewStatus is true or if status filter is HIDE_NEW
    if (hideNewStatus || filters.status === 'HIDE_NEW') {
      result = result.map(funnel => {
        const filteredTasks = funnel.tasks.filter(task => task.currentStatus !== 'NEW');
      
        return {
          ...funnel,
          tasks: filteredTasks
        };
      });
    }
    // Apply specific status filter if it's not HIDE_NEW
    else if (filters.status && filters.status !== 'HIDE_NEW') {
      result = result.map(funnel => {
        const filteredTasks = funnel.tasks.filter(task => task.currentStatus === filters.status);
      
        return {
          ...funnel,
          tasks: filteredTasks
        };
      });
    }
  
    // If we have any other active filters
    if (filters.taskId || filters.actorId) {
      // Map through each funnel
      result = result.map(funnel => {
        // Filter the tasks based on criteria
        const filteredTasks = funnel.tasks.filter(task => {
          // Task ID filter
          if (filters.taskId && !task.id.toLowerCase().includes(filters.taskId.toLowerCase())) {
            return false;
          }
        
          // Handled By filter (was Actor ID)
          if (filters.actorId && !task.handledBy.toString().toLowerCase().includes(filters.actorId.toLowerCase())) {
            return false;
          }
        
          return true;
        });
      
        // Return a new funnel object with filtered tasks
        return {
          ...funnel,
          tasks: filteredTasks
        };
      });
    }
  
    // Update progress for all funnels based on filtered tasks
    result = result.map(funnel => {
      const completedTasks = funnel.tasks.filter(task => task.currentStatus === 'COMPLETED').length;
      return {
        ...funnel,
        progress: `${completedTasks}/${funnel.tasks.length}`,
        status: completedTasks === funnel.tasks.length && funnel.tasks.length > 0 ? 'completed' : 'in-progress'
      };
    });
  
    // Remove empty funnels (those with no tasks after filtering)
    result = result.filter(funnel => funnel.tasks.length > 0);
  
    setFilteredFunnelData(result);
  };

  const toggleFunnel = (funnelId) => {
    setExpandedFunnels(prev => ({
      ...prev,
      [funnelId]: !prev[funnelId]
    }));
  };

  const handleApplicationIdSubmit = (e) => {
    e.preventDefault();
    if (inputApplicationId.trim()) {
      setApplicationId(inputApplicationId);
    }
  };

  const handleRefresh = () => {
    if (applicationId) {
      fetchFunnelData();
    }
  };

  const handleFilterChange = (name, value) => {
    if (name === 'status') {
      // If status is being changed, update hideNewStatus accordingly
      setHideNewStatus(value === 'HIDE_NEW');
    }
  
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setHideNewStatus(true); // Reset to hide NEW status
    setFilters({
      taskId: '',
      status: 'HIDE_NEW', // Reset to hide NEW status
      updatedDate: '',
      actorId: '',
      funnelType: '',
      dateRange: '',
      startDate: '',
      endDate: '',
      sortBy: 'updatedAt',
      sortOrder: 'asc' // Reset to ascending (oldest first) to match backend order
    });
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Get the data to display (filtered or original)
  const displayData = filteredFunnelData.length > 0 || Object.values(filters).some(f => f !== '' && f !== 'updatedAt' && f !== 'asc' && f !== 'HIDE_NEW') || hideNewStatus
    ? filteredFunnelData 
    : funnelData;

  // Render the active tab content
  const renderTabContent = () => {
    if (!applicationId) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          Please enter an application ID to view data.
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-gray-500 mt-4">Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm shadow-sm hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (activeTab === 'list') {
      return (
        <FunnelView 
          funnelData={displayData}
          expandedFunnels={expandedFunnels}
          toggleFunnel={toggleFunnel}
        />
      );
    } else {
      return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        inputApplicationId={inputApplicationId}
        setInputApplicationId={setInputApplicationId}
        handleApplicationIdSubmit={handleApplicationIdSubmit}
        applicationId={applicationId}
        handleRefresh={handleRefresh}
        toggleFilters={toggleFilters}
        showFilters={showFilters}
      />
      

      <main className="max-w-7xl mx-auto px-4 py-4">
        {applicationId && (
          <div className="mb-3 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-sm font-medium">
            Application ID: {applicationId}
          </div>
        )}
      
        {applicationId && (
          <TabNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}
      
        {showFilters && applicationId && activeTab === 'list' && (
          <FilterPanel 
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            hideNewStatus={hideNewStatus}
            setHideNewStatus={setHideNewStatus}
            funnelData={funnelData} // Pass funnelData to FilterPanel
          />
        )}
      
        {renderTabContent()}
      </main>
    </div>
  );
}

export default View1;