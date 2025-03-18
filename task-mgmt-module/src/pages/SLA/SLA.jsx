import React, { useState, useRef, useMemo } from 'react';
import { Layout, Typography, Card, Space, Alert } from 'antd';
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
  const [selectedFunnel, setSelectedFunnel] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [channel, setChannel] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
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
    setSelectedFunnel('all');
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

  // Helper: conversion function for time strings (e.g. "1 hrs 30 min")
  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    return Array.from({ length: Math.floor(parts.length / 2) })
      .map((_, index) => index * 2)
      .reduce((totalMinutes, i) => {
        const value = parseFloat(parts[i]);
        const unit = parts[i + 1] || '';
        if (unit.startsWith('day')) return totalMinutes + (value * 1440);
        else if (unit.startsWith('hrs')) return totalMinutes + (value * 60);
        else if (unit.startsWith('min')) return totalMinutes + value;
        else if (unit.startsWith('sec')) return totalMinutes + (value / 60);
        else return totalMinutes;
      }, 0);
  };

  // Compute all tasks for the selected task's funnel for distribution statistics.
  const funnelTasks = useMemo(() => {
    if (!selectedTask || !data || !data.funnels[selectedTask.funnel]) return [];
    const funnelData = data.funnels[selectedTask.funnel];
    const tasksObj = funnelData.tasks || {};
    const totalTAT = convertTimeToMinutes(data.averageTAT);
    const tasksArray = Object.entries(tasksObj).map(([taskId, taskData]) => {
      const minutes = convertTimeToMinutes(taskData.timeTaken);
      const percentOfTAT = totalTAT ? (minutes / totalTAT) * 100 : 0;
      let performanceLevel = "good";
      if (percentOfTAT >= 90) performanceLevel = "critical";
      else if (percentOfTAT >= 60) performanceLevel = "warning";
      return {
         taskId,
         displayName: taskId,
         time: taskData.timeTaken,
         minutes,
         percentOfTAT,
         sendbacks: taskData.noOfSendbacks,
         performanceLevel,
         funnel: selectedTask.funnel
      };
    });
    return tasksArray;
  }, [selectedTask, data]);

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <DashboardHeader
        channel={channel}
        onChannelChange={(value) => setChannel(value)}
        onLoadData={() => fetchData(channel)}
        data={data}
        error={error}
        loading={loading}
      />
      <Content style={{ padding: '24px', background: '#f0f2f5', overflowY: 'auto' }}>
        {!data ? (
          <Card style={{ textAlign: 'center', marginTop: 48 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={4}>Welcome to SLA Monitoring Dashboard</Title>
              <Typography.Text type="secondary">
                Enter a channel in the input field above to load SLA monitoring data.
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

            <TaskDetailModal
              selectedTask={selectedTask}
              showDetailModal={showDetailModal}
              setShowDetailModal={setShowDetailModal}
              funnelColors={funnelColors}
              funnelTasks={funnelTasks}
            />
          </Space>
        )}
      </Content>
      <DashboardFooter />
    </Layout>
  );
};

export default SLA;
