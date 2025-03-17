import React, { useState ,useEffect} from 'react';
import GanttChart from './components/graph/GanttChart';
import { fetchTasksByApplicationId } from './services/Ganntapi';
import mockTaskData from './mockData/mockGanttChartData';

function Dashboard() {
  const [applicationId, setApplicationId] = useState('');
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  //mock data
  useEffect(() => {
    setTaskData(mockTaskData); 
  }, []);
  


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Task Workflow Dashboard</h1>
        
          <GanttChart data={taskData} />
        
      </div>
    </div>
  );
}

export default Dashboard;