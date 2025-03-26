
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Empty, message } from 'antd';

import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  WarningOutlined,
  FieldTimeOutlined,
  RetweetOutlined,
  AuditOutlined
} from '@ant-design/icons'; 

import axios from 'axios';
import SYSTEM_METRICS_ENDPOINT from '../../api/SystemMetricsEndpoint';

import {DashboardHeader, AgentInfoCard, StatCard, MetricCard, ChartCard, PendingTasksTable, DashboardFooter, TaskListByRetries, SystemStatCard} from './components/index';
import { data } from 'react-router-dom';
import SystemHeader from './components/layout/SystemHeader';

const { Content } = Layout;

const SystemMetricsDashboard = () => {

  const [timeFrame, setTimeFrame] = useState('30');
  const [funnel, setFunnel] = useState('');
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

  const handleFunnelChange = (value) => {
    setFunnel(value);
  };
  
  
  const getEfficiencyColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  const taskTimeDataKeys = [
    { dataKey: 'system', name: 'System Performance', activeDot: true },
  ]; 

  const retryDataKeys = [
    { dataKey: 'system', name: 'System Performance' },
  ];  

  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);


  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setErrorMessage(null); 
      setMetrics({}); 

      if (!funnel.trim()) {
        setMetrics({});
        setErrorMessage(null);
        setLoading(false);
        return;
      }
  
      const url = SYSTEM_METRICS_ENDPOINT.systemMetrics(funnel, timeFrame);
      const response = await axios.get(url);
      console.log("Response",response.data); 
      if (response.data.Error) {
        setErrorMessage(response.data.Error);
        setMetrics({});
      } else {
        setErrorMessage(null);
        setMetrics(response.data); 
        setAgentType(funnel);
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
  }, [funnel, timeFrame]); 

  const processedTaskTimeData = metrics.average_task_time_across_applications
  ? Object.keys(metrics.average_task_time_across_applications).map(task => ({
      task: task.replace(/_/g, ' '),
      system: (metrics.average_task_time_across_applications?.[task] || 0) / 60000
    }))
  : [];

  const processedRetriesData = Object.keys(metrics.average_retries || {}).map(task => ({
    task: task.replace(/_/g, ' '), 
    system: metrics.average_retries[task]
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
      <SystemHeader 
        funnel={funnel}
        setFunnel={setFunnel}
        handleFunnelChange={handleFunnelChange}
        timeFrame={timeFrame}
        handleTimeFrameChange={handleTimeFrameChange} 
      />
      
      <Content className="p-6 flex-grow" style={{ backgroundColor: '#f0f5ff', width: '100%', padding: '24px 48px' }}>
        
        {!funnel.trim() ? (
            <div className="flex justify-center items-center min-h-[600px] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Empty
                description={
                  <span className="text-lg text-gray-500">
                    Select the funnel to view system's metrics.
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
        <Row gutter={16} className="mb-0">
          <Col span={8}>
            <AgentInfoCard label={"Funnel"} value={funnel} />
          </Col>
          <Col span={8}>
          <SystemStatCard
            title="Total Tasks Completed"
            value={metrics.total_tasks_completed}
            prefix={<CheckCircleOutlined className="text-blue-500" />}
            valueStyle={{ color: '#1890ff' }}
            // badgeText="Tasks completed by the agent"
            info="Total number of tasks the actor has completed successfully."
          />
        </Col>
        <Col span={8}>
            <AgentInfoCard label={"ExecutionType"} value={"AUTOMATED"} />
          </Col>
          {/* <Col span={11}>
            <AgentInfoCard label={"E-mail"} value={metrics.handled_by} />
          </Col> */}
          {/* <Col span={7}>
            <AgentInfoCard label={"Actor Type"} value={metrics.actor_type} />
          </Col> */}
        </Row>
        {/* Stats Cards */}
        <div className="mb-8">
            <Row gutter={24}>
        
      {/* <Col span={12}>
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
      </Col> */}
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
              formatTime={formatTime}
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
                colors={['#1890ff']} 
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
                colors={['#1890ff']}
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

export default SystemMetricsDashboard;
