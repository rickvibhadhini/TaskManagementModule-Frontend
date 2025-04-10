import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css"; 

import { useState, useEffect } from "react";

import ActivityLog from "./pages/ActivityLog/ActivityLog"; 
import ActorMetrics from "./pages/ActorMetrics/ActorMetrics";
import SLA from "./pages/SLA/SLA";
import HomePage from "./HomePage";
import SystemMetrics from "./pages/ActorMetrics/SystemMetrics";
import Login from "./pages/Authentication/Login"; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []); // This will run once when the component mounts

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/TMM" element={isAuthenticated ? <HomePage isAuthenticated={isAuthenticated}/> : <Navigate to="/" />} />
        <Route path="/activityLog" element={isAuthenticated ? <ActivityLog /> : <Navigate to="/" />} />
        <Route path="/actorMetrics" element={isAuthenticated ? <ActorMetrics /> : <Navigate to="/" />} />
        <Route path="/actorMetrics/:actorId" element={isAuthenticated ? <ActorMetrics /> : <Navigate to="/" />} />
        <Route path="/actorMetrics/system" element={isAuthenticated ? <SystemMetrics /> : <Navigate to="/" />} />
        <Route path="/SLA" element={isAuthenticated ? <SLA /> : <Navigate to="/" />} />
        
        {/* Public route, accessible even if not authenticated */}
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Default route - redirect to home page if authenticated, or login page if not */}
        <Route path="/" element={isAuthenticated ? <HomePage isAuthenticated={isAuthenticated}/> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
