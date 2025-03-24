import React, {useState} from 'react';
import { Layout, Typography, Select, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { cars24Logo } from "../../../../assets/index";
import { Navigate, useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

const SystemHeader = ({ funnel, setFunnel, handleFunnelChange, timeFrame, handleTimeFrameChange }) => {
    const navigate = useNavigate(); 
  
    const handleClick = () => {
      navigate("/");
    };

    const handleActorView = () => {
        navigate("/actorMetrics");
    }
  
    return (
      <Header className="flex items-center justify-between" style={{ backgroundColor: 'white', padding: '0 48px', width: '100%', height: '64px' }}>
        <div className="flex items-center space-x-6">
          {/* CARS24 Logo */}
          <div className="mr-6 flex items-center">
            <img src={cars24Logo} alt="Cars24 Logo" onClick={handleClick} style={{ margin: '16px 0', height: '40px', cursor: 'pointer'}} />
          </div>
          <Title level={3} style={{ margin: 0, color: 'black' }}>System Metrics Dashboard</Title>
        </div>
        <div className="flex items-center space-x-4">

        <Select 
            placeholder="SYSTEM_METRICS" 
            style={{ width: 120, marginRight : 8}} 
            onChange={handleFunnelChange}
          >
            <Option value="SOURCING">SOURCING</Option>
            <Option value="CREDIT">CREDIT</Option>
            <Option value="CONVERSION">CONVERSION</Option>
            <Option value="RTO">RTO</Option>
            <Option value="RISK">RISK</Option>
            <Option value="DISBURSAL">DISBURSAL</Option>
          </Select>
  
          <Select 
              defaultValue={timeFrame} 
              style={{ width: 120, marginRight: 8 }} 
              onChange={handleTimeFrameChange}
          >
              <Option value="7">Last 7 Days</Option>
              <Option value="14">Last 14 Days</Option>
              <Option value="30">Last 30 Days</Option>
              <Option value="90">Last 90 Days</Option>
          </Select>

          <Button type="primary" onClick={handleActorView} style={{ width: 120, marginRight: 8} }>Actor Metrics</Button>
        </div>
      </Header>
    );
  };
  

export default SystemHeader;