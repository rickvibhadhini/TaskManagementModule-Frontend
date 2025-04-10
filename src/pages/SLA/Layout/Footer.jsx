import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const DashboardFooter = () => {
  return (
    <Footer style={{ 
      textAlign: 'center', 
      backgroundColor: 'white',
      padding: '10px 50px', 
      height: '60px',       
      lineHeight: '20px'    
    }}>
      CARS24 SLA Monitoring Dashboard ©2025
    </Footer>
  );
};

export default DashboardFooter;