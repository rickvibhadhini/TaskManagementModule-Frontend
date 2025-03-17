import React, { useState, useEffect } from 'react';
import { Layout, Row, Col } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  WarningOutlined,
  FieldTimeOutlined,
  RetweetOutlined,
  AuditOutlined
} from '@ant-design/icons'; 

import axios from 'axios';
import ACTOR_METRICS_ENDPOINT from '../../api/ActorMetricsEndpoint';

import {DashboardHeader, AgentInfoCard, StatCard, MetricCard, ChartCard, PendingTasksTable, DashboardFooter} from './components/index';
import { data } from 'react-router-dom';

const { Content } = Layout;

const AgentMetricsDashboard = () => {

  const [timeFrame, setTimeFrame] = useState('30');
  const [actorId, setActorId] = useState('');
  
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
    setActorId(e.target.value);
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

  const lineChartDataKeys = [
    { dataKey: 'agent', name: 'Actor Performance', activeDot: true },
    { dataKey: 'threshold', name: 'All actors', dashed: true }
  ]; 

  const barChartDataKeys = [
    { dataKey: 'agent', name: 'Actor Performance' },
    { dataKey: 'threshold', name: 'All actors' }
  ];  

  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const url = ACTOR_METRICS_ENDPOINT.actorMetrics(actorId, timeFrame);
      const response = await axios.get(url);
      setMetrics(response.data); 
      console.log(response.data);
    } catch (error) {
      message.error("Failed to fetch data from server.");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    fetchMetrics();
  }, [actorId, timeFrame]); 

  const processedTaskTimeData = metrics.average_task_time_across_applications
  ? Object.keys(metrics.average_task_time_across_applications).map(task => ({
      task: task.replace(/_/g, ' '),
      agent: (metrics.average_task_time_across_applications?.[task] || 0) / 60000,
      threshold: metrics.threshold_average_task_time?.[task] / 60000
    }))
  : [];

  const processedRetriesData = Object.keys(metrics.average_retries || {}).map(task => ({
    task: task.replace(/_/g, ' '), 
    agent: metrics.average_retries[task], 
    threshold: metrics.average_retries_threshold?.[task] || 0 
  }));

  const durationMetricItems = [
    {
      title: 'Fastest Task',
      icon: <ClockCircleOutlined className="text-green-500 text-2xl mr-2" />,
      id: metrics.fastest_and_slowest_task?.fastest_task?.task_id 
        ? metrics.fastest_and_slowest_task.fastest_task.task_id.replace(/_/g, ' ') 
        : 'N/A',
      value: metrics.fastest_and_slowest_task?.fastest_task?.duration
        ? `${(metrics.fastest_and_slowest_task.fastest_task.duration / 60000).toFixed(3)} min`
        : '0 min',
      bgColorClass: 'bg-blue-50'
    },
    {
      title: 'Slowest Task',
      icon: <FieldTimeOutlined className="text-red-500 text-2xl mr-2" />,
      id: metrics.fastest_and_slowest_task?.slowest_task?.task_id 
        ? metrics.fastest_and_slowest_task.slowest_task.task_id.replace(/_/g, ' ') 
        : 'N/A',
      value: metrics.fastest_and_slowest_task?.slowest_task?.duration
        ? `${((metrics.fastest_and_slowest_task.slowest_task.duration) / 60000).toFixed(3)} min`
        : '0 min',
      bgColorClass: 'bg-blue-50'
    }
  ];

  const retryMetricItems = [
    {
      title: 'Most Retried Task',
      icon: <RetweetOutlined className="text-red-500 text-2xl mr-2" />,
      id: metrics.most_and_least_retried_task?.most_retried_task?.task_id 
        ? metrics.most_and_least_retried_task.most_retried_task.task_id.replace(/_/g, ' ') 
        : 'N/A',
      value: (metrics.most_and_least_retried_task?.most_retried_task?.visited )-1
        ? `${metrics.most_and_least_retried_task.most_retried_task.visited} retries`
        : '0 retries',
      bgColorClass: 'bg-orange-50'
    },
    {
      title: 'Least Retried Task',
      icon: <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />,
      id: metrics.most_and_least_retried_task?.least_retried_task?.task_id 
        ? metrics.most_and_least_retried_task.least_retried_task.task_id.replace(/_/g, ' ') 
        : 'N/A',
      value: (metrics.most_and_least_retried_task?.least_retried_task?.visited )-1
        ? `${metrics.most_and_least_retried_task.least_retried_task.visited} retries`
        : '0 retries',
      bgColorClass: 'bg-orange-50'
    }
  ];

  return (
    <Layout className="min-h-screen" style={{backgroundColor: 'white'}}>
      {/* Header Component */}
      <DashboardHeader 
        agentId={actorId}
        handleAgentIdChange={handleAgentIdChange}
        timeFrame={timeFrame}
        handleTimeFrameChange={handleTimeFrameChange}
      />
      
      <Content className="p-6" style={{ backgroundColor: 'white', width: '100%', padding: '24px 48px' }}>
        {/* Agent Info Card Component */}
        <AgentInfoCard agentId={actorId} timeFrame={timeFrame} />
        
        {/* Stats Cards */}
        <div className="mb-8">
          <Row gutter={24}>
            <Col span={8}>
              <StatCard
                title="Total Tasks Completed"
                value={metrics.total_tasks_completed}
                prefix={<CheckCircleOutlined className="text-blue-500" />}
                valueStyle={{ color: '#1890ff' }}
//                 badgeText="Last updated: Today at 10:23 AM"
              />
            </Col>
            <Col span={8}>
              <StatCard
                title="Task Efficiency Score"
                value={metrics.task_efficiency_score}
                suffix="/100"
                prefix={<AuditOutlined className="text-green-500" />}
                valueStyle={{ color: getEfficiencyColor(metrics.task_efficiency_score) }}
                showProgress={true}
                progressPercent={metrics.task_efficiency_score}
                progressStatus={metrics.task_efficiency_score >= 80 ? "success" : metrics.task_efficiency_score >= 60 ? "normal" : "exception"}
              />
            </Col>
            <Col span={8}>
            <StatCard
              title="Error Rate Per Task"
              value={metrics.agent_error_rate ?? 0}
              suffix="%"
              prefix={<WarningOutlined className="text-orange-500" />}
              valueStyle={{ color: getErrorRateColor(metrics.agent_error_rate) }}
              showProgress={true}
              progressPercent={Math.max(0, Math.min(100, metrics.agent_error_rate))} // Fixed scaling
              progressStatus={
                metrics.agent_error_rate <= 3 ? "success" : 
                metrics.agent_error_rate <= 7 ? "normal" : 
                "exception"
              }
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
                data={processedTaskTimeData}
                dataKeys={lineChartDataKeys}
                colors={['#1890ff', '#ff7875']}
              />
            </Col>
            <Col span={12}>
              <ChartCard 
                title="Average Retries Per Task"
                chartType="bar"
                data={processedRetriesData}
                dataKeys={barChartDataKeys}
                colors={['#1890ff', '#ff7875']}
              />
            </Col>
          </Row>
        </div>
        

      <PendingTasksTable 
        tasks={metrics.tasks_assigned?.map((task, index) => ({
          key: index, 
          taskName: task.task_name.replace(/_/g, ' '), 
          applicationId: task.application_id,
        })) || []} 
        columns={columns}
      />


      </Content>
      
      {/* Footer Component */}
      <DashboardFooter />
    </Layout>
  );
};

export default AgentMetricsDashboard;