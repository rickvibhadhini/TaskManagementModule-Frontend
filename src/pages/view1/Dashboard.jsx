import React, { useState ,useEffect} from 'react';
import GanttChart from './components/graph/GanttChart';
import { fetchTasksByApplicationId } from './services/Ganntapi';
import mockTaskData from './mockData/mockGanttChartData';

function Dashboard({ applicationId }) {
  //const [applicationId, setApplicationId] = useState('');
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // useEffect(()=>{
  //   setTaskData(mockTaskData);
  // })

  
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/applicationLog/graph/${applicationId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTaskData(data.data);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };

    fetchTaskData();
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