import React, { useState, useRef } from 'react';
import { Layout, Typography, Button, Card, Space, Alert, Select, Row, Col, theme } from 'antd';
import { ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import DashboardCharts from './components/DashboardCharts';
import DashboardTable from './components/DashboardTable';
import TaskDetailModal from './components/TaskDetailModal';
import axios from 'axios';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const View3 = () => {
  const { token } = theme.useToken();
  const [selectedFunnel, setSelectedFunnel] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [channel, setChannel] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const tableRef = useRef(null);

  const funnelColors = {
    sourcing: token.colorSuccess,     
    credit: token.colorInfo,          
    conversion: token.colorWarning,   
    fulfillment: '#722ed1'            
  };

  const funnelOrder = ["sourcing", "credit", "conversion", "fulfillment"];

  const toggleView = () => {
    setShowTable(!showTable);
    if (!showTable && tableRef.current) {
      // When switching to table view, scroll to table
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const fetchData = async (channelValue) => {
    if (!channelValue) return;
  
    setLoading(true);
    setError(null);
    // Reset states when fetching new data
    setData(null);
    setSelectedFunnel('all');
    setShowTable(false);
    setSelectedTask(null);
  
    try {
      const response = await axios.get(`http://localhost:8081/SLAMonitoring/time/${channelValue}`);
      if (!response.data || !response.data.funnels || Object.keys(response.data.funnels).length === 0) {
        setError(`No data available for channel ${channelValue}`);
      } else {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data for channel ${channelValue}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getButtonColor = (funnel) => {
    if (funnel === 'all') return '#1890ff'; // Default blue for "all"
    return funnelColors[funnel] || '#1890ff';
  };

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: '16px 0' }}>SLA Monitoring Dashboard</Title>
          </Col>
          <Col>
            <Space size="large">
              <Space>
                <Select
                  placeholder="Select channel"
                  value={channel}
                  onChange={(value) => setChannel(value)}
                  style={{ width: 120, display: 'inline-block' }}
                  options={[
                    { value: 'D2C', label: 'D2C' },
                    { value: 'C2C', label: 'C2C' },
                    { value: 'DCF', label: 'DCF' },
                  ]}
                />
                <Button 
                  type="primary" 
                  onClick={() => fetchData(channel)} 
                  loading={loading}
                >
                  Load Data
                </Button>
              </Space>
              
              {data && (
                <Card size="small" style={{ background: '#f0f5ff', borderColor: '#d6e4ff' }}>
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Total Average Turnaround Time:</Text>
                    <Text strong style={{ color: '#1890ff' }}>{data.averageTAT}</Text>
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
        
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Header>
      
      <Content style={{ padding: '24px', background: '#f0f2f5', overflowY: 'auto' }}>
        {!data ? (
          <Card style={{ textAlign: 'center', marginTop: 48 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={4}>Welcome to SLA Monitoring Dashboard</Title>
              <Text type="secondary">Enter a channel in the input field above to load SLA monitoring data.</Text>
              <div style={{ padding: 32, background: '#f9f9f9', borderRadius: 8 }}>
                <BarChartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16, color: '#8c8c8c' }}>Data visualization will appear here</div>
              </div>
            </Space>
          </Card>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {!showTable ? (
              <DashboardCharts 
                data={data} 
                selectedFunnel={selectedFunnel}
                setSelectedFunnel={setSelectedFunnel}
                funnelColors={funnelColors}
                funnelOrder={funnelOrder}
                setSelectedTask={setSelectedTask}
                setShowDetailModal={setShowDetailModal}
                toggleView={toggleView}
                getButtonColor={getButtonColor}
              />
            ) : (
              <DashboardTable 
                data={data}
                selectedFunnel={selectedFunnel}
                setSelectedFunnel={setSelectedFunnel}
                funnelColors={funnelColors}
                funnelOrder={funnelOrder}
                setSelectedTask={setSelectedTask}
                setShowDetailModal={setShowDetailModal}
                toggleView={toggleView}
                getButtonColor={getButtonColor}
                tableRef={tableRef}
              />
            )}

            {/* Task Detail Modal is now a separate imported component */}
            <TaskDetailModal
              selectedTask={selectedTask}
              showDetailModal={showDetailModal}
              setShowDetailModal={setShowDetailModal}
              funnelColors={funnelColors}
            />
          </Space>
        )}
      </Content>
    </Layout>
  );
};

export default View3;