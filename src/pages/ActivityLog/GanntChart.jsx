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
    <GanttChart data={taskData} />
  );
}

export default Dashboard;