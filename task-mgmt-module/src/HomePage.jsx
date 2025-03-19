import React, { useState, useEffect } from "react";
import { Layout, Typography, Row, Col, Divider, Badge, Space } from "antd";
import ModuleCard from "./ModuleCard";
import { ActivityLogPic, AgentPic, SlaPic } from "./assets/index";
import { cars24Logo } from "./assets/index";
import { AlignCenter } from "lucide-react";
const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const GlobalStyles = () => {
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
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.10) !important;
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

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);

  // Light theme values
  const themeValues = {
    background: 'linear-gradient(to bottom right, #f0f5ff, #ffffff, #f0f7ff)',
    headerBackground: 'rgba(255, 255, 255, 0.95)',
    headerShadow: '0 2px 8px rgba(0,0,0,0.06)',
    primaryText: 'rgba(0, 0, 0, 0.85)',
    secondaryText: 'rgba(0, 0, 0, 0.65)',
    tertiaryText: 'rgba(0, 0, 0, 0.45)',
    accentColor: '#1890ff',
    dividerColor: '#f0f0f0',
    cardBackground: '#fff',
    cardBorder: '#f0f0f0',
    cardShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    particleColor: 'rgba(24, 144, 255, 0.12)',
  };

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
      name: "Actor Tracking", 
      path: "/actorMetrics", 
      image: AgentPic, 
      description: "Monitor the actor performance",
      icon: "👨‍💼",
      color: "#1890ff",
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
      color: "#1890ff",
      badgeText: "Monitoring"
    }
  ];

  useEffect(() => {
    setLoaded(true);
    
   
    let canvas = document.getElementById('particles-canvas');
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'particles-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 30; 

   
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 0.5, 
        color: themeValues.particleColor,
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
    
    const animationId = requestAnimationFrame(animate);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (canvas) canvas.remove();
    };
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
    maxWidth: '100%'
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
   
    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
      <img
        src={cars24Logo}
        alt="Cars24 Logo"
        style={{ margin: '16px 0', height: '40px', cursor: 'pointer' }}
      />
      <Divider
        type="vertical"
        style={{
          height: '24px',
          margin: '0 16px',
          background: themeValues.dividerColor
        }}
      />
    </div>
    
    
    <div style={{ flex: 1, textAlign: 'center', marginRight: '90px' }}>
      <Text
        strong
        style={{
          fontSize: '28px',
          color: themeValues.primaryText
        }}
      >
        Task Management Module
      </Text>
    </div>
    
    
    <div style={{ flex: '0 0 auto' }}>
    
    </div>
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
            
          </Title>
          <Paragraph style={{ 
            color: themeValues.secondaryText,
            maxWidth: '700px',
            margin: '0 auto'
          }}>

          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {views.map((view, index) => (
            <ModuleCard key={view.id} view={view} index={index} themeValues={themeValues} />
          ))}
        </Row>
      </Content>

 <Footer 
  style={{ 
    background: themeValues.cardBackground,
    borderTop: `1px solid ${themeValues.dividerColor}`,
    padding: '12px',
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 10
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
       Better drives, better lives
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
          count="" 
          style={{ 
            backgroundColor: '#f6ffed',
            color: '#52c41a',
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

export default HomePage;