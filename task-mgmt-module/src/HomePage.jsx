import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// In a real project, you would import Ant Design components like this:
// import { Layout, Card, Button, Typography, Divider, Badge, Tag, Switch } from 'antd';
// For this playground, we'll simulate the imports are working

const HomePage = () => {
  const [theme, setTheme] = useState('light');
  const [activeViewId, setActiveViewId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Mock images for the playground
  const mockImages = {
    audit: "https://placehold.co/600x400/e6f7ff/0050b3?text=Activity+Logs",
    agentview: "https://placehold.co/600x400/f6ffed/52c41a?text=Agent+Tracking",
    sla: "https://placehold.co/600x400/fff2e8/fa541c?text=SLA+Monitoring"
  };

  const views = [
    { 
      id: 1, 
      name: "Activity Logs", 
      path: "/view-1", 
      image: mockImages.audit, 
      description: "View and track all task movement across various stages.",
      icon: "📈"
    },
    { 
      id: 2, 
      name: "Agent Tracking", 
      path: "/view-2", 
      image: mockImages.agentview, 
      description: "Monitor agent performance and allocation metrics.",
      icon: "👤"
    },
    { 
      id: 3, 
      name: "SLA Monitoring", 
      hoverName: "SLA Time Monitoring", 
      path: "/view-3", 
      image: mockImages.sla, 
      description: "Track service level agreements and response time metrics.",
      icon: "⏱️"
    }
  ];

  // For demonstration purposes, we'll use these components
  // In a real project, these would be imported from 'antd'
  const { Layout, Card, Button, Typography, Divider, Badge, Tag, Switch } = window.antd || {};
  const { Header, Content, Footer } = Layout || {};
  const { Title, Text, Paragraph } = Typography || {};

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
          color: theme === 'light' ? 'rgba(24, 144, 255, 0.15)' : 'rgba(209, 213, 219, 0.1)',
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

  // This is how the code would look in a real project with Ant Design properly imported
  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50' : 'bg-gray-900'}`}>
      {/* Simulating Ant Design components for the playground */}
      <div className="min-h-screen" style={{ background: 'transparent' }}>
        {/* Header */}
        <header 
          style={{ 
            background: theme === 'light' ? '#fff' : '#141414',
            boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.2)',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px'
          }}
        >
          <div className="flex items-center">
            <div className={`text-xl font-semibold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
              CARS24
            </div>
            <div 
              className="ant-divider ant-divider-vertical" 
              style={{ 
                height: '20px', 
                margin: '0 16px',
                borderLeft: theme === 'light' ? '1px solid #f0f0f0' : '1px solid #303030'
              }}
            ></div>
            <div className={`text-xl font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              Dashboard
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span 
              className="ant-typography ant-typography-secondary" 
              style={{ marginRight: '16px', color: theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)' }}
            >
              Task Management Module
            </span>
            <button 
              className={`ant-switch ${theme === 'dark' ? 'ant-switch-checked' : ''}`} 
              onClick={toggleTheme}
              style={{
                backgroundColor: theme === 'dark' ? '#1890ff' : 'rgba(0, 0, 0, 0.25)',
                minWidth: '44px',
                height: '22px',
                borderRadius: '100px'
              }}
            >
              <span className="ant-switch-inner" style={{ color: '#fff' }}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 md:p-8">
          <div className="container mx-auto">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 
                className="ant-typography" 
                style={{ 
                  color: theme === 'light' ? '#1f1f1f' : '#fff', 
                  marginBottom: '8px',
                  fontSize: '30px',
                  fontWeight: 600
                }}
              >
                Module Selection
              </h2>
              <p 
                className="ant-typography" 
                style={{ 
                  maxWidth: '700px', 
                  margin: '0 auto',
                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.65)'
                }}
              >
                Select one of the following modules to access specialized monitoring and management abilities.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
                      className="ant-card ant-card-hoverable" 
                      style={{ 
                        height: '100%',
                        background: theme === 'light' ? '#fff' : '#141414',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: theme === 'light' ? '1px solid #f0f0f0' : '1px solid #303030',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="relative h-48">
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"
                          style={{ transition: 'opacity 0.3s ease' }}
                        />
                        <img
                          src={view.image}
                          alt={view.name}
                          className="w-full h-full object-cover"
                          style={{ transition: 'transform 0.7s ease' }}
                        />
                        <div className="absolute bottom-3 left-4 z-20">
                          <span 
                            className="ant-typography ant-typography-strong" 
                            style={{ color: '#fff', fontSize: '18px' }}
                          >
                            {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                          </span>
                        </div>
                      </div>
                      <div style={{ padding: 0 }}>
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 
                                className="ant-typography" 
                                style={{ 
                                  marginBottom: '8px',
                                  color: theme === 'light' ? '#1f1f1f' : '#fff',
                                  fontSize: '20px',
                                  fontWeight: 600
                                }}
                              >
                                {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                              </h4>
                              <p 
                                className="ant-typography" 
                                style={{ 
                                  fontSize: '14px',
                                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.65)',
                                  marginBottom: '0'
                                }}
                              >
                                {view.description}
                              </p>
                            </div>
                            <span className="text-2xl">{view.icon}</span>
                          </div>
                          
                          <div 
                            className="ant-divider" 
                            style={{ 
                              margin: '16px 0',
                              borderTop: theme === 'light' ? '1px solid #f0f0f0' : '1px solid #303030'
                            }}
                          ></div>
                          
                          <div className="flex items-center justify-between">
                            <span className="ant-badge">
                              <span 
                                className="ant-badge-count" 
                                style={{ 
                                  backgroundColor: 'transparent',
                                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)',
                                  boxShadow: 'none',
                                  fontSize: '12px',
                                  padding: '0'
                                }}
                              >
                                Module {view.id}
                              </span>
                            </span>
                            <button 
                              className="ant-btn ant-btn-primary" 
                              style={{ 
                                background: theme === 'light' ? '#1890ff' : '#177ddc',
                                borderColor: theme === 'light' ? '#1890ff' : '#177ddc',
                                borderRadius: '4px',
                                color: '#fff',
                                padding: '4px 15px',
                                height: '32px',
                                fontSize: '14px'
                              }}
                            >
                              Access
                            </button>
                          </div>
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
        <footer 
          style={{ 
            background: theme === 'light' ? '#fff' : '#141414',
            borderTop: theme === 'light' ? '1px solid #f0f0f0' : '1px solid #303030',
            padding: '16px 24px'
          }}
        >
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <span 
              className="ant-typography ant-typography-secondary" 
              style={{ 
                fontSize: '14px',
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)'
              }}
            >
              © 2025 CARS24 CFSPL. All rights reserved.
            </span>
            <div className="mt-4 md:mt-0">
              <span 
                className="ant-tag ant-tag-blue" 
                style={{ 
                  fontSize: '12px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  color: theme === 'light' ? '#1890ff' : '#177ddc',
                  backgroundColor: theme === 'light' ? '#e6f7ff' : 'rgba(24, 144, 255, 0.1)',
                  borderColor: theme === 'light' ? '#91d5ff' : '#177ddc'
                }}
              >
                Version 2.1.4
              </span>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .ant-card-hoverable:hover img {
          transform: scale(1.04);
        }
        
        .ant-card-hoverable:hover {
          transform: translateY(-5px);
          box-shadow: ${theme === 'light' 
            ? '0 10px 20px rgba(0, 0, 0, 0.1)' 
            : '0 10px 20px rgba(0, 0, 0, 0.3)'};
        }
      `}</style>
    </div>
  );
};

export default HomePage;