import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import audit from "./assets/AuditLogView.jpeg";
import agentview from "./assets/AgentView.jpeg";
import sla from "./assets/SLAView.jpeg";

const views = [
  { 
    id: 1, 
    name: "Activity Logs", 
    path: "/view-1", 
    image: audit, 
    description: "View and track all task movement across various stages.",
    icon: "📈"
  },
  { 
    id: 2, 
    name: "Agent Tracking", 
    path: "/view-2", 
    image: agentview, 
    description: "Monitor agent performance and allocation metrics.",
    icon: "👤"
  },
  { 
    id: 3, 
    name: "SLA Monitoring", 
    hoverName: "SLA Time Monitoring", 
    path: "/view-3", 
    image: sla, 
    description: "Track service level agreements and response time metrics.",
    icon: "⏱️"
  }
];

const HomePage = () => {
  const [theme, setTheme] = useState('light');
  const [activeViewId, setActiveViewId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    return () => {
      const canvas = document.getElementById('particles-canvas');
      if (canvas) canvas.remove();
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      const canvas = document.createElement('canvas');
      canvas.id = 'particles-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const particles = [];
      const particleCount = 20;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          color: theme === 'light' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(209, 213, 219, 0.1)',
          speedX: Math.random() * 0.3 - 0.15,
          speedY: Math.random() * 0.3 - 0.15
        });
      }

      const animate = () => {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
        });
      };
      
      animate();
      
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [loaded, theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`w-screen h-screen overflow-hidden ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100' 
        : 'bg-gray-900'
    }`}>
      {/* Theme toggle */}
      <motion.button 
        className={`fixed top-6 right-6 p-2 rounded-md z-20 shadow-md ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-gray-100'}`}
        onClick={toggleTheme}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {theme === 'light' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </motion.button>

      <div className="w-full h-full flex flex-col">
        {/* Top Navigation Bar */}
        <motion.header 
          className={`w-full px-6 py-4 ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-800 shadow-gray-900/30'}`}
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`font-semibold text-xl ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                CARS24
              </motion.div>
              <div className={`h-5 border-r ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'}`}></div>
              <motion.div 
                className={`text-xl font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                 Dashboard
              </motion.div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <motion.span 
                className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Task Management Module
              </motion.span>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className={`flex-1 p-6 md:p-8 overflow-hidden ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100' 
            : 'bg-gray-900'
        }`}>
          <div className="container mx-auto">
            {/* Section Title */}
            <motion.div 
              className="mb-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className={`text-3xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Module Selection
              </h1>
              <p className={`max-w-2xl mx-auto text-center ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                Select one of the following modules to access specialized monitoring and management abilities.
              </p>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {views.map((view, index) => (
                <motion.div 
                  key={view.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  className="h-full"
                >
                  <Link 
                    to={view.path}
                    className="block h-full"
                    onMouseEnter={() => setActiveViewId(view.id)}
                    onMouseLeave={() => setActiveViewId(null)}
                  >
                    <motion.div 
                      className={`group relative h-full rounded-lg overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} shadow-md transition-shadow duration-300 hover:shadow-lg`}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Card Image */}
                      <div className="relative h-48 overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"
                          initial={{ opacity: 0.4 }}
                          whileHover={{ opacity: 0.7 }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.img
                          src={view.image}
                          alt={view.name}
                          className="w-full h-full object-cover transition-transform duration-700"
                          whileHover={{ scale: 1.04 }}
                        />
                        <div className="absolute bottom-3 left-4 z-20">
                          <h3 className="text-white text-lg font-medium">
                            {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className={`text-xl font-semibold mb-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                              {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                            </h3>
                            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                              {view.description}
                            </p>
                          </div>
                          <span className="text-2xl">{view.icon}</span>
                        </div>
                        
                        <div className={`pt-3 mt-4 border-t ${theme === 'light' ? 'border-gray-100' : 'border-gray-700'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                              Module {view.id}
                            </span>
                            <motion.div
                              className={`px-4 py-2 text-sm font-medium ${theme === 'light' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-900/30 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'} rounded-md transition-colors duration-300`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Access
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer 
          className={`w-full py-4 px-6 ${theme === 'light' ? 'bg-white border-t border-gray-200' : 'bg-gray-800 border-t border-gray-700'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              © 2025 CARS24 CFSPL. All rights reserved.
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <span className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-blue-50 text-blue-500' : 'bg-blue-900/30 text-blue-400'}`}>
                Version 2.1.4
              </span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default HomePage;