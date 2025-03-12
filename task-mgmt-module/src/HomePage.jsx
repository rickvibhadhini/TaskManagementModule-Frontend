import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Card, Button, Badge, Row, Col, Divider, Switch, Space } from "antd";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
  const [theme, setTheme] = useState('light');
  const [activeViewId, setActiveViewId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const mockImages = {
    audit: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85",
    agentview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85",
    sla: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85"
  };

  const views = [
    { 
      id: 1, 
      name: "Activity Logs", 
      path: "/view-1", 
      image: mockImages.audit, 
      description: "Track the application movement through the different stages",
      icon: "📊",
      color: "#1890ff",
      badgeText: "Analytics"
    },
    { 
      id: 2, 
      name: "Agent Tracking", 
      path: "/view-2", 
      image: mockImages.agentview, 
      description: "Monitor the agent performance",
      icon: "👨‍💼",
      color: "#722ed1",
      badgeText: "Management"
    },
    { 
      id: 3, 
      name: "SLA Monitoring", 
      hoverName: "SLA Time Monitoring", 
      path: "/view-3", 
      image: mockImages.sla, 
      description: "Monitor the time taken for funnels/stages",
      icon: "⏱️",
      color: "#faad14",
      badgeText: "Monitoring"
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
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const particles = [];
      const particleCount = 30; 

      // Set canvas dimensions to match viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.5 + 0.5, 
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

  return (
    <Layout
      className="layout"
      style={{
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: theme === 'light' 
          ? 'linear-gradient(to bottom right, #f0f5ff, #ffffff, #f0f7ff)' 
          : 'linear-gradient(to bottom right, #141414, #1f1f1f, #141414)'
      }}
    >
      <Header
        style={{
          background: theme === 'light' 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'rgba(22, 22, 22, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.2)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text strong style={{ 
            fontSize: '18px', 
            color: theme === 'light' ? '#1890ff' : '#69c0ff' 
          }}>
            CARS24
          </Text>
          <Divider type="vertical" style={{ 
            height: '24px', 
            margin: '0 16px',
            background: theme === 'light' ? '#e5e7eb' : '#303030' 
          }} />
          <Text strong style={{ 
            fontSize: '18px', 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)' 
          }}>
            Dashboard
          </Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Text style={{ 
            fontSize: '14px',
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)'
          }}>
            Task Management Module
          </Text>
          
          <Space align="center">
            <Text style={{ marginRight: '8px' }}>
              {theme === 'light' ? '☀️' : '🌙'}
            </Text>
            <Switch 
              checked={theme === 'dark'}
              onChange={toggleTheme}
              size="small"
            />
          </Space>
        </div>
      </Header>

      <Content 
        style={{ 
          padding: '24px', 
          position: 'relative', 
          zIndex: 2,
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={2} style={{ 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            marginBottom: '8px'
          }}>
            Module Selection
          </Title>
          <Paragraph style={{ 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.65)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Select one of the following modules to access specialized monitoring and management abilities.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {views.map((view, index) => (
            <Col xs={24} md={12} lg={8} key={view.id}>
              <div
                className="card-container"
                style={{ 
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out ${0.1 + index * 0.1}s forwards`,
                  height: '100%'
                }}
                onMouseEnter={() => setActiveViewId(view.id)}
                onMouseLeave={() => setActiveViewId(null)}
              >
                <Link to={view.path} style={{ textDecoration: 'none' }}>
                  <Card 
                    hoverable
                    className="module-card"
                    style={{ 
                      overflow: 'hidden',
                      height: '100%',
                      background: theme === 'light' ? '#fff' : '#141414',
                      borderColor: theme === 'light' ? '#f0f0f0' : '#303030',
                      boxShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                    cover={
                      <div style={{ position: 'relative', height: '192px' }}>
                        <div style={{ 
                          position: 'absolute', 
                          inset: 0, 
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)',
                          zIndex: 1 
                        }} />
                        
                        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                          <Badge 
                            count={view.badgeText} 
                            style={{ 
                              backgroundColor: view.color,
                              fontSize: '12px',
                              fontWeight: 500
                            }} 
                          />
                        </div>
                        
                        <img
                          alt={view.name}
                          src={view.image}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.7s ease'
                          }}
                          className="card-image"
                        />
                        
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '16px', 
                          left: '16px', 
                          zIndex: 2 
                        }}>
                          <Text strong style={{ 
                            color: '#fff', 
                            fontSize: '20px',
                            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}>
                            {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                          </Text>
                        </div>
                      </div>
                    }
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <Title level={4} style={{ 
                          margin: '0 0 4px 0',
                          color: theme === 'light' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)'
                        }}>
                          {view.id === 3 && activeViewId === 3 ? view.hoverName : view.name}
                        </Title>
                        <Paragraph style={{ 
                          margin: 0,
                          color: theme === 'light' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.65)',
                          fontSize: '14px'
                        }}>
                          {view.description}
                        </Paragraph>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `${view.color}20`,
                        color: view.color,
                        fontSize: '20px'
                      }}>
                        {view.icon}
                      </div>
                    </div>
                    
                    <Divider style={{ 
                      margin: '16px 0',
                      borderColor: theme === 'light' ? '#f0f0f0' : '#303030'
                    }} />
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <Text style={{ 
                        fontSize: '12px',
                        color: theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)'
                      }}>
                        
                      </Text>
                      <Button 
                        type="primary"
                        style={{ 
                          background: view.color,
                          borderColor: view.color
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                </Link>
              </div>
            </Col>
          ))}
        </Row>
      </Content>

      <Footer 
        style={{ 
          background: theme === 'light' ? '#fff' : '#141414',
          borderTop: `1px solid ${theme === 'light' ? '#f0f0f0' : '#303030'}`,
          maxWidth: '100%',
          padding: '24px'
        }}
      >
        <Row gutter={[32, 24]} style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <Col xs={24} md={8}>
            <Title level={4} style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              marginBottom: '16px'
            }}>
              CARS24 CFSPL
            </Title>
            <Paragraph style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.65)',
              fontSize: '14px'
            }}>
              Transforming the way India buys and sells cars, providing technology-driven solutions for a seamless experience.
            </Paragraph>
          </Col>
          
          <Col xs={24} md={8}>
            <Title level={5} style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)',
              marginBottom: '16px'
            }}>
              
            </Title>
          </Col>
          
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space style={{ marginBottom: '16px' }}>
              <Badge 
                count="Version 2.1.4" 
                style={{ 
                  backgroundColor: theme === 'light' ? '#e6f7ff' : '#111d2c',
                  color: theme === 'light' ? '#1890ff' : '#69c0ff',
                  fontSize: '12px',
                  fontWeight: 500
                }} 
              />
              <Badge 
                count="" 
                style={{ 
                  backgroundColor: theme === 'light' ? '#f6ffed' : '#162312',
                  color: theme === 'light' ? '#52c41a' : '#73d13d',
                  fontSize: '12px',
                  fontWeight: 500
                }} 
              />
            </Space>
            <Paragraph style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)',
              fontSize: '14px'
            }}>
              ©️ 2025 CARS24 CFSPL. All rights reserved.
            </Paragraph>
          </Col>
        </Row>
      </Footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .module-card {
          transition: all 0.3s ease;
        }
        
        .module-card:hover {
          transform: translateY(-4px);
          box-shadow: ${theme === 'light' 
            ? '0 12px 24px rgba(0, 0, 0, 0.10)' 
            : '0 12px 24px rgba(0, 0, 0, 0.35)'} !important;
        }
        
        .module-card:hover .card-image {
          transform: scale(1.05);
        }
        
        /* Ensure no horizontal scrolling on any screen */
        body {
          overflow-x: hidden;
          max-width: 100vw;
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;