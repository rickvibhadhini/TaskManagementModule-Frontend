import React, {useState, useEffect} from 'react';
import { Layout, Typography, Select, Input, Button } from 'antd';
import { SearchOutlined, DashboardOutlined } from '@ant-design/icons';
import { cars24Logo } from "../../../../assets/index";
import { Navigate, useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

const DashboardHeader = ({ agentId, setAgentId, handleAgentIdChange, timeFrame, handleTimeFrameChange }) => {
  const navigate = useNavigate(); 
  const [tempAgentId, setTempAgentId] = useState(agentId || '');

  useEffect(() => {
    if (agentId) {
      setTempAgentId(agentId);
    }
  }, [agentId]);

  const handleClick = () => {
    navigate("/TMM");
  }

  const handleSearch = () => {
    if (tempAgentId.trim() !== '') {
      navigate(`/actorMetrics/${tempAgentId}?`);
      setAgentId(tempAgentId);
    }
  } 

  const handleSystemView = () => {
    navigate("/actorMetrics/system");
  }

  return (
    <Header className="flex items-center justify-between" style={{ backgroundColor: 'white', padding: '0 48px', width: '100%', height: '64px' }}>
      <div className="flex items-center space-x-6">
        {/* CARS24 Logo */}
        <div className="mr-6 flex items-center">
        <img src={cars24Logo} alt="Cars24 Logo" onClick = {handleClick} style={{ margin: '16px 0', height: '40px', cursor: 'pointer'}} />
        </div>
        <Title level={3} style={{ margin: 0, color: 'black' }}>Actor Metrics Dashboard</Title>
      </div>
      <div className="flex items-center space-x-4">
      <Button 
        type="default" 
        icon={<DashboardOutlined />}
        onClick={handleSystemView} 
        style={{ 
          width: 190, 
          marginRight: 8, 
          borderColor: '#1890ff', 
          color: '#1890ff',
          fontWeight: 'bold'
        }}
      >
        View System Analytics
      </Button>
        <Input 
          placeholder="Enter Actor ID" 
          value={tempAgentId} 
          onChange={(e) => setTempAgentId(e.target.value)} 
          onPressEnter={handleSearch}
          style={{ width: 120, marginRight: 8} }
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} style={{ width: 90, marginRight: 8} }>Search</Button>
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

        {/* <Button type="primary" onClick={handleSystemView} style={{ width: 120, marginRight: 8} }>System Metrics</Button> */}
      </div>
    </Header>
  );
};

export default DashboardHeader;