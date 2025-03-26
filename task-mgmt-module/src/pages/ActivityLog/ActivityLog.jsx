import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios';
import Header from './components/Layout/Header';
import FilterPanel from './components/filters/FilterPanel';
import Dashboard from './Dashboard';
import TabNavigation from './components/Layout/TabNavigation';
import FunnelView from './components/funnels/FunnelView';
import { transformApiData } from './utils/apiTransformers';
//import mocklogdata from './mockData/mocklogdata';
import { fetchFunnelData as fetchFunnelDataFromApi } from './services/ApplicationListApi';

function ActivityLog() {
  const location = useLocation();
  const navigate = useNavigate(); // Added for navigation to agent metrics
  const [expandedFunnels, setExpandedFunnels] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});  // For tracking expanded tasks
  const [applicationId, setApplicationId] = useState('');
  const [inputApplicationId, setInputApplicationId] = useState('');
  const [funnelData, setFunnelData] = useState([]);
  const [filteredFunnelData, setFilteredFunnelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); 
  const [hideNewStatus, setHideNewStatus] = useState(true); 
  const [pollingInterval, setPollingInterval] = useState(null);
  const [sendbackMap, setSendbackMap] = useState({});

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

  // When navigating from TaskDistributionTable, check for passed Application ID
  useEffect(() => {
    if (location.state && location.state.appId) {
      setApplicationId(location.state.appId);
      setInputApplicationId(location.state.appId);
    }
  }, [location.state]);

  // Function to navigate to a specific task within a funnel
  const navigateToTask = (funnelId, taskId) => {
    // Expand the funnel and the task then scroll to it
    setExpandedFunnels(prev => ({ ...prev, [funnelId]: true }));
    setExpandedTasks(prev => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      const funnelElement = document.getElementById(`funnel-${funnelId}`);
      if (funnelElement) {
        funnelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Function to navigate to the agent metrics dashboard
  // Function to navigate to the agent metrics dashboard
const navigateToActorDashboard = (actorId) => {
  if (actorId && actorId !== 'N/A') {
    navigate(`/actorMetrics?actorId=${actorId}`);
  }
};

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
    }, 10000 * 6 * 5); // Poll every 5 min
  
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

  // Create sendbackMap whenever funnelData changes
  useEffect(() => {
    const newSendbackMap = {};
    const sendbackFunnels = funnelData.filter(funnel => funnel.id.startsWith('sendback-'));
    sendbackFunnels.forEach(funnel => {
      const requestIdMatch = funnel.name.match(/Sendbacks for (.+)$/);
      const requestId = requestIdMatch ? requestIdMatch[1] : funnel.id;
      funnel.tasks.forEach(task => {
        if (task.targetTaskId) {
          if (!newSendbackMap[task.targetTaskId]) {
            newSendbackMap[task.targetTaskId] = {};
          }
          if (!newSendbackMap[task.targetTaskId][requestId]) {
            newSendbackMap[task.targetTaskId][requestId] = {
              sourceLoanStage: task.sourceLoanStage,
              sourceSubModule: task.sourceSubModule,
              updatedAt: task.statusHistory?.[0]?.updatedAt || task.createdAt,
              requestId: requestId
            };
          }
        }
      });
    });
    setSendbackMap(newSendbackMap);
  }, [funnelData]);

  const fetchFunnelData = async () => {
    setLoading(true);
    try {
      const transformedData = await fetchFunnelDataFromApi(applicationId);
      const initialExpandedState = Object.fromEntries(
        transformedData.map(funnel => [funnel.id, false])
      );
      setExpandedFunnels(initialExpandedState);
      setFunnelData(transformedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      setError('Failed to fetch application data');
      setFunnelData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...funnelData];
    if (filters.funnelType) {
      result = result.filter(funnel => funnel.name === filters.funnelType);
    }
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
        endDate.setHours(23, 59, 59, 999);
      }
      if (startDate || endDate) {
        result = result.map(funnel => {
          const filteredTasks = funnel.tasks.filter(task => {
            if (!task.statusHistory || task.statusHistory.length === 0) return false;
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
          return { ...funnel, tasks: filteredTasks };
        });
      }
    }
    if (hideNewStatus || filters.status === 'HIDE_NEW') {
      result = result.map(funnel => {
        const filteredTasks = funnel.tasks.filter(task => task.currentStatus !== 'NEW');
        return { ...funnel, tasks: filteredTasks };
      });
    } else if (filters.status && filters.status !== 'HIDE_NEW') {
      result = result.map(funnel => {
        const filteredTasks = funnel.tasks.filter(task => task.currentStatus === filters.status);
        return { ...funnel, tasks: filteredTasks };
      });
    }
    if (filters.taskId || filters.actorId) {
      result = result.map(funnel => {
        const filteredTasks = funnel.tasks.filter(task => {
          if (filters.taskId && !task.id.toLowerCase().includes(filters.taskId.toLowerCase())) {
            return false;
          }
          if (filters.actorId && !task.handledBy.toString().toLowerCase().includes(filters.actorId.toLowerCase())) {
            return false;
          }
          return true;
        });
        return { ...funnel, tasks: filteredTasks };
      });
    }
    result = result.map(funnel => {
      const completedTasks = funnel.tasks.filter(task => task.currentStatus === 'COMPLETED').length;
      return {
        ...funnel,
        progress: `${completedTasks}/${funnel.tasks.length}`,
        status: completedTasks === funnel.tasks.length && funnel.tasks.length > 0 ? 'completed' : 'in-progress'
      };
    });
    result = result.filter(funnel => funnel.tasks.length > 0);
    setFilteredFunnelData(result);
  };

  const toggleFunnel = (funnelId) => {
    setExpandedFunnels(prev => ({ ...prev, [funnelId]: !prev[funnelId] }));
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
      setHideNewStatus(value === 'HIDE_NEW');
    }
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setHideNewStatus(true);
    setFilters({
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
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const displayData = filteredFunnelData.length > 0 || Object.values(filters).some(f => f !== '' && f !== 'updatedAt' && f !== 'asc' && f !== 'HIDE_NEW') || hideNewStatus
    ? filteredFunnelData 
    : funnelData;

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
          sendbackMap={sendbackMap}
          navigateToTask={navigateToTask}
          expandedTasks={expandedTasks}
          setExpandedTasks={setExpandedTasks}
          navigateToActorDashboard={navigateToActorDashboard}
        />
      );
    } else {
      return <Dashboard applicationId={applicationId}/>;
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
            funnelData={funnelData}
          />
        )}
        {renderTabContent()}
      </main>
    </div>
  );
}

export default ActivityLog;