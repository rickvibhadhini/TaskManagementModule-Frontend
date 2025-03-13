import React, { useState } from 'react';
import { Layout, Row, Col } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  WarningOutlined,
  FieldTimeOutlined,
  RetweetOutlined,
  AuditOutlined
} from '@ant-design/icons';

import {DashboardHeader, AgentInfoCard, StatCard, MetricCard, ChartCard, PendingTasksTable, DashboardFooter} from './components/index';

const { Content } = Layout;

const AgentMetricsDashboard = () => {
  // State
  const [timeFrame, setTimeFrame] = useState('30');
  const [agentId, setAgentId] = useState('AGT-12345');
  
  // Mock data
  const mockTaskCompletionData = 287;
  const mockEfficiencyScore = 85;
  const mockErrorRate = 3.2;
  
  const mockFastestTask = { id: 'TSK-78943', duration: '1m 23s' };
  const mockSlowestTask = { id: 'TSK-23567', duration: '14m 32s' };
  
  const mockMostRetriedTask = { id: 'TSK-45678', retries: 6 };
  const mockLeastRetriedTask = { id: 'TSK-65432', retries: 0 };
  
  const mockTaskTimeData = [
    { task: 'Document Verification', agent: 4.2, threshold: 5.0 },
    { task: 'Customer Onboarding', agent: 7.8, threshold: 8.5 },
    { task: 'Contract Review', agent: 12.3, threshold: 10.1 },
    { task: 'Quality Check', agent: 3.1, threshold: 4.0 },
    { task: 'Payment Processing', agent: 2.5, threshold: 2.8 },
    { task: 'Complaint Resolution', agent: 9.7, threshold: 8.0 },
  ];
  
  const mockRetriesData = [
    { task: 'Document Verification', agent: 1.2, threshold: 2.0 },
    { task: 'Customer Onboarding', agent: 0.8, threshold: 1.5 },
    { task: 'Contract Review', agent: 2.3, threshold: 1.1 },
    { task: 'Quality Check', agent: 0.5, threshold: 1.0 },
    { task: 'Payment Processing', agent: 0.2, threshold: 0.8 },
    { task: 'Complaint Resolution', agent: 1.7, threshold: 1.0 },
  ];
  
  const mockPendingTasks = [
    { key: '1', taskName: 'Document Verification', applicationId: 'APP-78943' },
    { key: '2', taskName: 'Customer Onboarding', applicationId: 'APP-65432' },
    { key: '3', taskName: 'Contract Review', applicationId: 'APP-98765' },
    { key: '4', taskName: 'Quality Check', applicationId: 'APP-23456' },
    { key: '5', taskName: 'Payment Processing', applicationId: 'APP-34567' },
  ];
  
  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Application ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
    },
  ];

  const handleTimeFrameChange = (value) => {
    setTimeFrame(value);
  };

  const handleAgentIdChange = (e) => {
    setAgentId(e.target.value);
  };
  
  const getEfficiencyColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };
  
  const getErrorRateColor = (rate) => {
    if (rate <= 3) return '#52c41a';
    if (rate <= 7) return '#faad14';
    return '#f5222d';
  };

  // Task Duration Metric Items
  const durationMetricItems = [
    {
      title: 'Fastest Task',
      icon: <ClockCircleOutlined className="text-green-500 text-2xl mr-2" />,
      id: mockFastestTask.id,
      value: mockFastestTask.duration,
      bgColorClass: 'bg-blue-50'
    },
    {
      title: 'Slowest Task',
      icon: <FieldTimeOutlined className="text-red-500 text-2xl mr-2" />,
      id: mockSlowestTask.id,
      value: mockSlowestTask.duration,
      bgColorClass: 'bg-blue-50'
    }
  ];

  // Task Retry Metric Items
  const retryMetricItems = [
    {
      title: 'Most Retried Task',
      icon: <RetweetOutlined className="text-red-500 text-2xl mr-2" />,
      id: mockMostRetriedTask.id,
      value: `${mockMostRetriedTask.retries} retries`,
      bgColorClass: 'bg-orange-50'
    },
    {
      title: 'Least Retried Task',
      icon: <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />,
      id: mockLeastRetriedTask.id,
      value: `${mockLeastRetriedTask.retries} retries`,
      bgColorClass: 'bg-orange-50'
    }
  ];

  // Chart data keys
  const lineChartDataKeys = [
    { dataKey: 'agent', name: 'Agent Performance', activeDot: true },
    { dataKey: 'threshold', name: 'Team Threshold', dashed: true }
  ];

  const barChartDataKeys = [
    { dataKey: 'agent', name: 'Agent Performance' },
    { dataKey: 'threshold', name: 'Team Threshold' }
  ];

  return (
    <Layout className="min-h-screen" style={{backgroundColor: 'white'}}>
      {/* Header Component */}
      <DashboardHeader 
        agentId={agentId}
        handleAgentIdChange={handleAgentIdChange}
        timeFrame={timeFrame}
        handleTimeFrameChange={handleTimeFrameChange}
      />
      
      <Content className="p-6" style={{ backgroundColor: 'white', width: '100%', padding: '24px 48px' }}>
        {/* Agent Info Card Component */}
        <AgentInfoCard agentId={agentId} timeFrame={timeFrame} />
        
        {/* Stats Cards */}
        <div className="mb-8">
          <Row gutter={24}>
            <Col span={8}>
              <StatCard
                title="Total Tasks Completed"
                value={mockTaskCompletionData}
                prefix={<CheckCircleOutlined className="text-blue-500" />}
                valueStyle={{ color: '#1890ff' }}
                badgeText="Last updated: Today at 10:23 AM"
              />
            </Col>
            <Col span={8}>
              <StatCard
                title="Task Efficiency Score"
                value={mockEfficiencyScore}
                suffix="/100"
                prefix={<AuditOutlined className="text-green-500" />}
                valueStyle={{ color: getEfficiencyColor(mockEfficiencyScore) }}
                showProgress={true}
                progressPercent={mockEfficiencyScore}
                progressStatus={mockEfficiencyScore >= 80 ? "success" : mockEfficiencyScore >= 60 ? "normal" : "exception"}
              />
            </Col>
            <Col span={8}>
              <StatCard
                title="Error Rate Per Task"
                value={mockErrorRate}
                suffix="%"
                prefix={<WarningOutlined className="text-orange-500" />}
                valueStyle={{ color: getErrorRateColor(mockErrorRate) }}
                showProgress={true}
                progressPercent={(10 - mockErrorRate) * 10}
                progressStatus={mockErrorRate <= 3 ? "success" : mockErrorRate <= 7 ? "normal" : "exception"}
              />
            </Col>
          </Row>
        </div>
        
        {/* Metric Cards */}
        <div className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <MetricCard 
                title="Task Duration Metrics"
                items={durationMetricItems}
              />
            </Col>
            <Col span={12}>
              <MetricCard 
                title="Task Retry Metrics"
                items={retryMetricItems}
              />
            </Col>
          </Row>
        </div>
        
        {/* Chart Cards */}
        <div className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <ChartCard 
                title="Average Task Time (minutes)"
                chartType="line"
                data={mockTaskTimeData}
                dataKeys={lineChartDataKeys}
                colors={['#1890ff', '#ff7875']}
              />
            </Col>
            <Col span={12}>
              <ChartCard 
                title="Average Retries Per Task"
                chartType="bar"
                data={mockRetriesData}
                dataKeys={barChartDataKeys}
                colors={['#1890ff', '#ff7875']}
              />
            </Col>
          </Row>
        </div>
        
        {/* Pending Tasks Table */}
        <PendingTasksTable 
          tasks={mockPendingTasks}
          columns={columns}
        />
      </Content>
      
      {/* Footer Component */}
      <DashboardFooter />
    </Layout>
  );
};

export default AgentMetricsDashboard;