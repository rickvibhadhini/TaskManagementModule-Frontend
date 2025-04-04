// API service for making backend calls

export const fetchTasksByApplicationId = async (applicationId) => {
    try {
      const response = await fetch(`http://localhost:8081/applicationLog/graph/${applicationId}`, {
        method: 'GET',  // Specify the HTTP method (GET in this case)
        credentials: 'include', // This is equivalent to withCredentials in Axios
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch task data');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching task data:', error);
      throw error;
    }
  };