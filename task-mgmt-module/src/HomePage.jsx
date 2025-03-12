import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [theme, setTheme] = useState('light');
  const [activeViewId, setActiveViewId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Higher quality images for a more professional look
  const mockImages = {
    audit: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    agentview: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    sla: "https://images.unsplash.com/photo-1470790376778-a9fbc86d70e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  };

  const views = [
    { 
      id: 1, 
      name: "Activity Logs", 
      path: "/view-1", 
      image: mockImages.audit, 
      description: "Track the application movement through the diffrent stages",
      icon: "📊"
    },
    { 
      id: 2, 
      name: "Agent Tracking", 
      path: "/view-2", 
      image: mockImages.agentview, 
      description: "Monitor the agent performance",
      icon: "👥"
    },
    { 
      id: 3, 
      name: "SLA Monitoring", 
      hoverName: "SLA Time Monitoring", 
      path: "/view-3", 
      image: mockImages.sla, 
      description: "Monitor the time taken for funnels/stages",
      icon: "⏱️"
    }
  ];

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
      canvas.style.height = '100';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const particles = [];
      const particleCount = 30; // More particles for richer visual effect

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.5 + 0.5, // Slightly larger particles
          color: theme === 'light' ? 'rgba(24, 144, 255, 0.12)' : 'rgba(209, 213, 219, 0.08)',
          speedX: Math.random() * 0.25 - 0.125,
          speedY: Math.random() * 0.25 - 0.125
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

  // This is how the code would look in a real project with Ant Design properly imported
  return (
    <div className={`w-screen h-screen ${theme === 'light' ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'}`}>
      {/* Header */}
      <header 
        style={{ 
          background: theme === 'light' 
            ? 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95))' 
            : 'linear-gradient(to right, rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.95))',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.2)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: '68px'
        }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className={`text-xl font-semibold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
            CARS24
          </div>
          <div 
            className="mx-4"
            style={{ 
              height: '24px', 
              width: '1px', 
              background: theme === 'light' ? '#e5e7eb' : '#374151'
            }}
          ></div>
          <div className={`text-xl font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
            Dashboard
          </div>
          
          {/* Breadcrumbs */}
          <div className="ml-8 hidden md:flex items-center">
            <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Home</span>
            <svg className="mx-2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <span className={theme === 'light' ? 'text-gray-700 font-medium' : 'text-gray-200 font-medium'}></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-5">
          <span 
            className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}
            style={{ fontSize: '14px' }}
          >
            Task Management Module
          </span>
          
          {/* Theme Toggle */}
          <button 
            className={`flex items-center justify-center rounded-full w-10 h-6 ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={toggleTheme}
          >
            <div 
              className={`w-5 h-5 rounded-full transform duration-200 flex items-center justify-center ${theme === 'dark' ? 'translate-x-2 bg-white text-blue-500' : 'translate-x--2 bg-white text-amber-500'}`}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </header>

      {/* Page Content - Full Screen */}
      <main className="p-4 md:p-6 relative z-2 w-full">
        <div className="w-full max-w-none">
          {/* Dashboard Header */}
          <div className="mb-10 px-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 
                  className={theme === 'light' ? 'text-gray-900' : 'text-white'}
                  style={{ 
                    fontSize: '30px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}
                >
                  
                </h1>
                <p 
                  className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}
                  style={{ maxWidth: '700px' }}
                >
                 
                </p>
              </div>
            </div>
            
            {/* Module Section Subheader */}
            <div className="text-center mb-8">
              <h2 
                className={theme === 'light' ? 'text-gray-800' : 'text-gray-100'}
                style={{ 
                  fontSize: '24px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}
              >
                Module Selection
              </h2>
              <p 
                className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}
                style={{ maxWidth: '700px', margin: '0 auto' }}
              >
                Select one of the following modules to access specialized monitoring and management abilities.
              </p>
            </div>
          </div>

          {/* Cards Grid - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2">
            {views.map((view, index) => (
              <div 
                key={view.id}
                className="h-full"
                style={{ 
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out ${0.1 + index * 0.1}s forwards`
                }}
                onMouseEnter={() => setActiveViewId(view.id)}
                onMouseLeave={() => setActiveViewId(null)}
              >
                <a href={view.path} className="block h-full no-underline">
                  <div 
                    className={`rounded-xl overflow-hidden h-full transition-all duration-300 ${theme === 'light' ? 'bg-white border border-gray-100' : 'bg-gray-800 border border-gray-700'}`}
                    style={{ 
                      boxShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div className="relative h-48">
                      {/* Image Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 z-20">
                        <span 
                          className={`py-1 px-2 rounded-full text-xs font-medium ${view.id === 1 ? 'bg-blue-500 text-white' : view.id === 2 ? 'bg-purple-500 text-white' : 'bg-amber-500 text-white'}`}
                        >
                          {view.id === 1 ? 'Analytics' : view.id === 2 ? 'Management' : 'Monitoring'}
                        </span>
                      </div>
                      
                      <img
                        src={view.image}
                        alt={view.name}
                        className="w-full h-full object-cover transition-transform duration-700"
                      />
                      
                      <div className="absolute bottom-4 left-4 z-20">
                        <span 
                          className="text-white font-bold"
                          style={{ fontSize: '20px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                        >
                          {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 
                            className={theme === 'light' ? 'text-gray-900' : 'text-white'}
                            style={{ 
                              fontSize: '18px',
                              fontWeight: 600,
                              marginBottom: '4px'
                            }}
                          >
                            {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                          </h3>
                          <p 
                            className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}
                            style={{ fontSize: '14px' }}
                          >
                            {view.description}
                          </p>
                        </div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${view.id === 1 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : view.id === 2 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'}`}>
                          <span className="text-xl">{view.icon}</span>
                        </div>
                      </div>
                      
                      <div 
                        className="h-px w-full my-4"
                        style={{ background: theme === 'light' ? '#f3f4f6' : '#374151' }}  
                      ></div>
                      
                      <div className="flex items-center justify-between">
                        <span 
                          className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}
                          style={{ fontSize: '12px' }}
                        >
                          
                        </span>
                        <button 
                          className={`py-2 px-4 rounded-lg font-medium text-sm ${view.id === 1 ? 'bg-blue-600 hover:bg-blue-700 text-white' : view.id === 2 ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                        >
                          Access
                        </button>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 border-t ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'}`}>
        <div className="w-full px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                CARS24 CFSPL
              </div>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                Transforming the way India buys and sells cars, providing technology-driven solutions for a seamless experience.
              </p>
            </div>
            
            <div>
              <div className={`text-sm font-semibold mb-4 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                
              </div>
              <div className="grid grid-cols-2 gap-2">

              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-200'}`}>
                  Version 2.1.4
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-900 text-green-200'}`}>
                  
                </span>
              </div>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                © 2025 CARS24 CFSPL. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        a:hover img {
          transform: scale(1.05);
        }
        
        a:hover > div {
          transform: translateY(-4px);
          box-shadow: ${theme === 'light' 
            ? '0 12px 24px rgba(0, 0, 0, 0.10)' 
            : '0 12px 24px rgba(0, 0, 0, 0.35)'};
        
      `}</style>
    </div>
  );
};

export default HomePage;
