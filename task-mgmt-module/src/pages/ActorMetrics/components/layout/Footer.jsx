import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const DashboardFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', backgroundColor: 'white' }}>
      CARS24 Actor Metrics Dashboard ©2025
    </Footer>
  );
};

export default DashboardFooter;