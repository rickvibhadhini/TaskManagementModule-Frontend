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
  const [agentType, setAgentType] = useState(''); 

  const formatDuration = (ms) => {
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)} sec`;
    } else if (ms < 3600000) {
      return `${(ms / 60000).toFixed(2)} min`;
    } else {
      return `${(ms / 3600000).toFixed(2)} hr`;
    }
  };
  
  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
    },
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    }
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

  const lineChartDataKeys = [
    { dataKey: 'agent', name: 'Actor Performance', activeDot: true },
    { dataKey: 'threshold', name: 'Avg Actor Performance', dashed: true }
  ]; 

  const barChartDataKeys = [
    { dataKey: 'agent', name: 'Actor Performance' },
    { dataKey: 'threshold', name: 'Avg Actor Performance' }
  ];  

  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const url = ACTOR_METRICS_ENDPOINT.actorMetrics(actorId, timeFrame);
      const response = await axios.get(url);
      setMetrics(response.data); 
      setAgentType(response.data.actor_type);
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
      agent: (metrics.average_task_time_across_applications?.[task] || 0),
      threshold: (metrics.threshold_average_task_time?.[task] || 0)
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
        ? formatDuration(metrics.fastest_and_slowest_task.fastest_task.duration)
        : '0 sec',
      bgColorClass: 'bg-blue-50'
    },
    {
      title: 'Slowest Task',
      icon: <FieldTimeOutlined className="text-red-500 text-2xl mr-2" />,
      id: metrics.fastest_and_slowest_task?.slowest_task?.task_id 
        ? metrics.fastest_and_slowest_task.slowest_task.task_id.replace(/_/g, ' ') 
        : 'N/A',
      value: metrics.fastest_and_slowest_task?.slowest_task?.duration
        ? formatDuration(metrics.fastest_and_slowest_task.slowest_task.duration)
        : '0 sec',
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
        <AgentInfoCard agentId={actorId} agentType={agentType} timeFrame={timeFrame} />
        
        {/* Stats Cards */}
        <div className="mb-8">
            <Row gutter={24}>
      <Col span={12}>
        <StatCard
          title="Total Tasks Completed"
          value={metrics.total_tasks_completed}
          prefix={<CheckCircleOutlined className="text-blue-500" />}
          valueStyle={{ color: '#1890ff' }}
          // badgeText="Tasks completed by the agent"
          info="Total number of tasks the agent has completed successfully"
        />
      </Col>
      <Col span={12}>
        <StatCard
          title="Task Efficiency Score"
          value={metrics.task_efficiency_score}
          suffix="%"
          prefix={<AuditOutlined className="text-green-500" />}
          valueStyle={{ color: getEfficiencyColor(metrics.task_efficiency_score) }}
          showProgress={true}
          progressPercent={metrics.task_efficiency_score}
          progressStatus={
            metrics.task_efficiency_score >= 80
              ? "success"
              : metrics.task_efficiency_score >= 60
              ? "normal"
              : "exception"
          }
          // badgeText="Efficiency of agent"
          info="Efficiency score of the agent based on task performance"
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
              info={"Task duration metrics for the fastest and slowest tasks by the agent"}
            />

            </Col>
            <Col span={12}>
              <MetricCard 
                title="Task Retry Metrics"
                items={retryMetricItems}
                info={"Task retry metrics for the most and least retried tasks by the agent"}
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
                info={"Average task time across all applications"}
              />
            </Col>
            <Col span={12}>
              <ChartCard 
                title="Average Retries Per Task"
                chartType="bar"
                data={processedRetriesData}
                dataKeys={barChartDataKeys}
                colors={['#1890ff', '#ff7875']}
                info={"Average retries per task across all applications"}
              />
            </Col>
          </Row>
        </div>
        

      <PendingTasksTable 
        tasks={metrics.tasks_assigned?.map((task, index) => ({
          key: index, 
          applicationId: task.application_id,
          taskName: task.task_name.replace(/_/g, ' '), 
          status: task.status,
        })) || []} 
        columns={columns}
        info="Tasks assigned to the agent (NEW, TODO, IN_PROGRESS, FAILED)"
      />


      </Content>
      
      {/* Footer Component */}
      <DashboardFooter />
    </Layout>
  );
};

export default AgentMetricsDashboard;