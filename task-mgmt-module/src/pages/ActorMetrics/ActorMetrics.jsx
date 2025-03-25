
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Empty} from 'antd';
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

import {DashboardHeader, AgentInfoCard, StatCard, MetricCard, ChartCard, PendingTasksTable, DashboardFooter, TaskListByRetries} from './components/index';
import { data } from 'react-router-dom';

const { Content } = Layout;

const AgentMetricsDashboard = () => {

  const [timeFrame, setTimeFrame] = useState('30');
  const [actorId, setActorId] = useState('');
  const [agentType, setAgentType] = useState(''); 

  // const formatDuration = (ms) => {
  //   if (ms < 60000) {
  //     return `${(ms / 1000).toFixed(2)} sec`;
  //   } else if (ms < 3600000) {
  //     return `${(ms / 60000).toFixed(2)} min`;
  //   } else {
  //     return `${(ms / 3600000).toFixed(2)} hr`;
  //   }
  // };

  const formatTime = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'string' && value.includes('d')) {
      return value;
    }
    const totalMinutes = value;
    const minutesPerDay = 24 * 60;
    
    const days = Math.floor(totalMinutes / minutesPerDay);
    const remainingMinutesAfterDays = totalMinutes % minutesPerDay;
    
    const hrs = Math.floor(remainingMinutesAfterDays / 60);
    const minutes = Math.floor(remainingMinutesAfterDays % 60);
    const seconds = Math.round((totalMinutes % 1) * 60);

    let formattedTime = '';
    if (days > 0) {
      formattedTime += `${days}d `;
    }
    if (hrs > 0 || days > 0) {
      formattedTime += `${hrs}h `;
    }
    formattedTime += `${minutes}m `;
    formattedTime += `${seconds}s`;
    
    return formattedTime;
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
    // setError(null);
    // setNoDataFound(false);
  };
  
  const getEfficiencyColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  const taskTimeDataKeys = [
    { dataKey: 'agent', name: 'Actor Performance'},
    { dataKey: 'threshold', name: 'Avg Actor Performance'}
  ]; 

  const retryDataKeys = [
    { dataKey: 'agent', name: 'Actor Performance' },
    { dataKey: 'threshold', name: 'Avg Actor Performance' }
  ];  

  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);


  const fetchMetrics = async () => {
    try {
      
      setLoading(true);
      setErrorMessage(null); // Ensure previous error is cleared
      setMetrics({}); // Reset previous data

      if (!actorId.trim()) {
        setMetrics({});
        setErrorMessage(null);
        setLoading(false);
        return;
      }
  
      const url = ACTOR_METRICS_ENDPOINT.actorMetrics(actorId, timeFrame);
      const response = await axios.get(url);
  
      if (response.data.Error) {
        setErrorMessage(response.data.Error);
        setMetrics({});
      } else {
        setErrorMessage(null);
        setMetrics(response.data); 
        setAgentType(response.data.actor_type);
      }
  
      console.log(response.data);
    } catch (error) {
      message.error("Failed to fetch data from server.");
      console.error("API Error:", error);
      setErrorMessage("Server error. Please try again later.");
      setMetrics({});
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
      threshold: (metrics.threshold_average_task_time?.[task] || 0) / 60000
    }))
  : [];

  const processedRetriesData = Object.keys(metrics.average_retries || {}).map(task => ({
    task: task.replace(/_/g, ' '), 
    agent: metrics.average_retries[task], 
    threshold: metrics.average_retries_threshold?.[task] 
      ? Number(metrics.average_retries_threshold[task].toFixed(2)) 
      : 0 
  }));

  const durationMetricItems = [
    {
      title: 'Fastest Task',
      icon: <ClockCircleOutlined className="text-green-500 text-2xl mr-2" />,
      id: metrics.fastest_and_slowest_task?.fastest_task?.task_id 
        ? metrics.fastest_and_slowest_task.fastest_task.task_id.replace(/_/g, ' ') 
        : 'N/A',
      value: metrics.fastest_and_slowest_task?.fastest_task?.duration
        ? formatTime((metrics.fastest_and_slowest_task.fastest_task.duration / 60000))
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
        ? formatTime((metrics.fastest_and_slowest_task.slowest_task.duration)/60000)
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
      value: (metrics.most_and_least_retried_task?.most_retried_task?.visited )
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
      value: (metrics.most_and_least_retried_task?.least_retried_task?.visited )
        ? `${metrics.most_and_least_retried_task.least_retried_task.visited} retries`
        : '0 retries',
      bgColorClass: 'bg-orange-50'
    }
  ];

  return (
    <Layout className="min-h-screen flex flex-col" style={{backgroundColor: 'white'}}>
      {/* Header Component */}
      <DashboardHeader 
        agentId={actorId}
        setAgentId={setActorId}
        handleAgentIdChange={handleAgentIdChange}
        timeFrame={timeFrame}
        handleTimeFrameChange={handleTimeFrameChange}
      />
      
      <Content className="p-6 flex-grow" style={{ backgroundColor: '#f0f5ff', width: '100%', padding: '24px 48px' }}>
        
        {!actorId.trim() ? (
            <div className="flex justify-center items-center min-h-[600px] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Empty
                description={
                  <span className="text-lg text-gray-500">
                    Enter the actor ID to see details
                  </span>
                }
              />
            </div>
          ) : (
            <>
            {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <WarningOutlined className="mr-2" />
          {errorMessage}
        </div>
      )}

        {/* Agent Info Card Component */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <AgentInfoCard label={"Actor ID"} value={actorId} />
          </Col>
          <Col span={11}>
            <AgentInfoCard label={"E-mail"} value={metrics.handled_by} />
          </Col>
          <Col span={7}>
            <AgentInfoCard label={"Actor Type"} value={metrics.actor_type} />
          </Col>
        </Row>
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
            info="Total number of tasks the actor has completed successfully."
          />
        </Col>
      <Col span={12}>
        <StatCard
          title="Task Efficiency Score"
          value={metrics.task_efficiency_score !== undefined 
            ? Number(metrics.task_efficiency_score.toFixed(2)) 
            : '0'}
          
          suffix="%"
          prefix={<AuditOutlined className="text-green-500" />}
          valueStyle={{ color: getEfficiencyColor(metrics.task_efficiency_score !== undefined 
            ? Number(metrics.task_efficiency_score.toFixed(2)) 
            : '0') }}
          showProgress={true}
          progressPercent={metrics.task_efficiency_score !== undefined 
            ? Number(metrics.task_efficiency_score.toFixed(2)) 
            : '0'}
          progressStatus={
            metrics.task_efficiency_score >= 80
              ? "success"
              : metrics.task_efficiency_score >= 60
              ? "normal"
              : "exception"
          }
          // badgeText="Efficiency of agent"
          info="An efficiency score measuring the actor's task performance against other actors of the same funnel."
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
              taskDurations={metrics.task_duration || {}}
              info={"Task duration metrics for the fastest and slowest tasks by an actor."}
            />

            </Col>
            {/* <Col span={12}>
              <MetricCard 
                title="Task Retry Metrics"
                items={retryMetricItems}
                info={"Task retry metrics for the most and least retried tasks by an actor."}
              />
            </Col> */}
            <Col span={12}>
            <TaskListByRetries tasksByRetries={metrics.tasks_sorted_by_retries}
            info="Tasks grouped by retry count"
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
                chartType="bar"
                data={processedTaskTimeData}
                dataKeys={taskTimeDataKeys}
                colors={['#1890ff', '#ff7875']} 
                info={"Bar graph of actor's average task time across applications, with funnel average as threshold."}
                tooltipFormatter={formatTime}
                height={350}
              />
            </Col>
            <Col span={12}>
              <ChartCard 
                title="Average Retries Per Task"
                chartType="bar"
                data={processedRetriesData}
                dataKeys={retryDataKeys}
                colors={['#1890ff', '#ff7875']}
                info={"Bar graph of actor's average retries across applications, with funnel average as threshold."}
                tooltipFormatter={(value) => Number(value).toFixed(2)}
                height={350}
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
        info="Tasks allocated to the actor (NEW, TODO, IN_PROGRESS, FAILED)."
      />
      </>
      )}

      </Content>
      
      {/* Footer Component */}
      <DashboardFooter />
    </Layout>
  );
};

export default AgentMetricsDashboard;
