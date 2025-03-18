import React, { useState, useRef, useEffect } from 'react';
import { Layout, Typography, Card, Space, Alert, theme } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { DashboardCharts, DashboardTable, TaskDetailModal } from './components/index';
import { SLA_ENDPOINTS } from '../../api/SlaEndpoint';
import { funnelColors, funnelOrder, getButtonColor } from './components/Constant';
import DashboardFooter from './Layout/Footer.jsx';
import DashboardHeader from './Layout/Header.jsx';
import axios from 'axios';

const { Content } = Layout;
const { Title } = Typography;

const SLA = () => {
  const { token } = theme.useToken();
  const [selectedFunnel, setSelectedFunnel] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [channel, setChannel] = useState('D2C');  // Default to "D2C"
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [timeRange, setTimeRange] = useState([null, null]);
  const tableRef = useRef(null);

  const toggleView = () => {
    setShowTable(!showTable);
    if (!showTable && tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const fetchData = async (channelValue) => {
    if (!channelValue) return;

    setLoading(true);
    setError(null);
    setData(null);
    // Don't reset selectedFunnel here to maintain filter state
    setShowTable(false);
    setSelectedTask(null);

    try {
      const response = await axios.get(SLA_ENDPOINTS.getTimeByChannel(channelValue));
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

  // Handle filter reset
  const resetFilters = () => {
    setSelectedFunnel('all');
    setTimeRange([null, null]);
  };

  // Fetch default data on mount
  useEffect(() => {
    fetchData("D2C");
  }, []);

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <DashboardHeader
        channel={channel}
        onChannelChange={(value) => {
          setChannel(value);
          fetchData(value);
        }}
        onLoadData={() => fetchData(channel)}
        data={data}
        error={error}
        loading={loading}
        selectedFunnel={selectedFunnel}
        setSelectedFunnel={setSelectedFunnel}
        funnelOrder={funnelOrder}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />
      <Content style={{ padding: '24px', background: '#f0f2f5', overflowY: 'auto' }}>
        {!data ? (
          <Card style={{ textAlign: 'center', marginTop: 48 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={4}>Welcome to SLA Monitoring Dashboard</Title>
              <Typography.Text type="secondary">
                Select a channel to load SLA monitoring data.
              </Typography.Text>
              <div style={{ padding: 32, background: '#f9f9f9', borderRadius: 8 }}>
                <BarChartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16, color: '#8c8c8c' }}>
                  Data visualization will appear here
                </div>
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
                timeRange={timeRange}
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
                timeRange={timeRange}
              />
            )}

            <TaskDetailModal
              selectedTask={selectedTask}
              showDetailModal={showDetailModal}
              setShowDetailModal={setShowDetailModal}
              funnelColors={funnelColors}
            />
          </Space>
        )}
      </Content>
      <DashboardFooter />
    </Layout>
  );
};

export default SLA;