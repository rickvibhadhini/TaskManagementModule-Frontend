import React, { useState ,useEffect} from 'react';
import GanttChart from './components/graph/GanttChart';
import {  fetchTasksByApplicationId } from './services/Ganntapi';



function Dashboard({ applicationId }) {
  //const [applicationId, setApplicationId] = useState('');
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      try {
        const data = await fetchTasksByApplicationId(applicationId);
        setTaskData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching task data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (applicationId) {
      fetchTaskData();
    }
  }, [applicationId]);


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