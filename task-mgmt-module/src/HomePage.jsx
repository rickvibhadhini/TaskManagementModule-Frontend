import React, { useState, useEffect } from "react";
import { Layout, Typography, Row, Col, Divider, Switch, Space, Badge } from "antd";
import { ThemeProvider, useTheme } from "./ThemeContext";
import ModuleCard from "./ModuleCard";
import { ActivityLogPic, AgentPic, SlaPic } from "./assets/index";
const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;


const GlobalStyles = () => {
  const { themeValues } = useTheme();
  
  return (
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
        box-shadow: ${themeValues.theme === 'light' 
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
  );
};


const HomePageContent = () => {
  const { theme, toggleTheme, themeValues } = useTheme();
  const [loaded, setLoaded] = useState(false);



  const views = [
    { 
      id: 1, 
      name: "Activity Logs", 
      path: "/view-1", 
      image: ActivityLogPic, 
      description: "Track the application movement through the different stages",
      icon: "📊",
      color: "#1890ff",
      badgeText: "Analytics"
    },
    { 
      id: 2, 
      name: "Agent Tracking", 
      path: "/view-2", 
      image: AgentPic, 
      description: "Monitor the agent performance",
      icon: "👨‍💼",
      color: "#722ed1",
      badgeText: "Management"
    },
    { 
      id: 3, 
      name: "SLA Monitoring", 
      hoverName: "SLA Time Monitoring", 
      path: "/SLA", 
      image: SlaPic, 
      description: "Monitor the time taken for funnels/stages",
      icon: "⏱️",
      color: "#faad14",
      badgeText: "Monitoring"
    }
  ];

  useEffect(() => {
    setLoaded(true);
  }, []);
  
  return (
    <Layout
      className="layout"
      style={{
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: themeValues.background
      }}
    >
      <Header
        style={{
          background: themeValues.headerBackground,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: themeValues.headerShadow,
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
            color: themeValues.accentColor
          }}>
            CARS24
          </Text>
          <Divider type="vertical" style={{ 
            height: '24px', 
            margin: '0 16px',
            background: themeValues.dividerColor
          }} />
          <Text strong style={{ 
            fontSize: '18px', 
            color: themeValues.primaryText
          }}>
            Dashboard
          </Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Text style={{ 
            fontSize: '14px',
            color: themeValues.tertiaryText
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
            color: themeValues.primaryText,
            marginBottom: '8px'
          }}>
            Module Selection
          </Title>
          <Paragraph style={{ 
            color: themeValues.secondaryText,
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Select one of the following modules to access specialized monitoring and management abilities.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {views.map((view, index) => (
            <ModuleCard key={view.id} view={view} index={index} />
          ))}
        </Row>
      </Content>

      <Footer 
        style={{ 
          background: themeValues.cardBackground,
          borderTop: `1px solid ${themeValues.dividerColor}`,
          maxWidth: '100%',
          padding: '24px'
        }}
      >
        <Row gutter={[32, 24]} style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <Col xs={24} md={8}>
            <Title level={4} style={{ 
              color: themeValues.primaryText,
              marginBottom: '16px'
            }}>
              CARS24 CFSPL
            </Title>
            <Paragraph style={{ 
              color: themeValues.secondaryText,
              fontSize: '14px'
            }}>
              Transforming the way India buys and sells cars, providing technology-driven solutions for a seamless experience.
            </Paragraph>
          </Col>
          
          <Col xs={24} md={8}>
            <Title level={5} style={{ 
              color: themeValues.primaryText,
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
              color: themeValues.tertiaryText,
              fontSize: '14px'
            }}>
              ©️ 2025 CARS24 CFSPL. All rights reserved.
            </Paragraph>
          </Col>
        </Row>
      </Footer>
      <GlobalStyles />
    </Layout>
  );
};


const HomePage = () => {
  return (
    <ThemeProvider>
      <HomePageContent />
    </ThemeProvider>
  );
};

export default HomePage;