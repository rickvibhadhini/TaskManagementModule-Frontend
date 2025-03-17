import React from 'react';
import { Layout, Typography, Select, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { cars24Logo } from "../../../../assets/index";
import { Navigate, useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

const DashboardHeader = ({ agentId, handleAgentIdChange, timeFrame, handleTimeFrameChange }) => {

  const navigate = useNavigate(); 

  const handleClick = () => {
    navigate("/");
  }

  return (
    <Header className="flex items-center justify-between" style={{ backgroundColor: 'white', padding: '0 48px', width: '100%', height: '64px' }}>
      <div className="flex items-center space-x-6">
        {/* CARS24 Logo */}
        <div className="mr-6 flex items-center">
        <img src={cars24Logo} onClick={handleClick} alt="Cars24 Logo" width="120" height="auto"/>
        </div>
        <Title level={3} style={{ margin: 0, color: 'black' }}>Agent Metrics Dashboard</Title>
      </div>
      <div className="flex items-center space-x-4">
        <Input 
          placeholder="Enter Agent ID" 
          value={agentId} 
          onChange={handleAgentIdChange} 
          addonAfter={<Button type="primary" icon={<SearchOutlined />}>Search</Button>} 
          style={{ width: 300 }}
        />
        <Select 
          defaultValue={timeFrame} 
          style={{ width: 180 }} 
          onChange={handleTimeFrameChange}
        >
          <Option value="7">Last 7 Days</Option>
          <Option value="14">Last 14 Days</Option>
          <Option value="30">Last 30 Days</Option>
        </Select>
      </div>
    </Header>
  );
};

export default DashboardHeader;