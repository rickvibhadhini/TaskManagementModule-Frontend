import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Space, Card, Statistic, Typography, Tabs, Empty } from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleFilled, 
  WarningFilled, 
  CloseCircleFilled,
  PieChartOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import TaskDistributionTable from './TaskDistributionTable';

const { Text } = Typography;
const { TabPane } = Tabs;

// Helper to normalize strings: remove whitespace and underscores, then lowercase.
const normalizeString = (str) => (str || "").replace(/[\s_]/g, '').toLowerCase();

const TaskDetailModal = ({ selectedTask, showDetailModal, setShowDetailModal, funnelColors, data }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [showDistributionTable, setShowDistributionTable] = useState(false);

  // Log the entire incoming props for debugging
  useEffect(() => {
    console.log("TaskDetailModal props:", { 
      selectedTask, 
      showDetailModal, 
      funnelColors, 
      data: data ? "exists" : "missing",
      dataKeys: data ? Object.keys(data) : []
    });
  }, [selectedTask, showDetailModal, funnelColors, data]);

  // Debug logging to verify keys (visible in the browser console)
  useEffect(() => {
    if (!data) {
      console.error("Data prop is missing or null");
      return;
    }
    
    if (!data.taskDistributions) {
      console.error("data.taskDistributions is missing or null");
      console.log("Available data keys:", Object.keys(data));
      return;
    }
    
    if (selectedTask) {
      const normTask = normalizeString(selectedTask.taskId || selectedTask.name);
      const available = Object.keys(data.taskDistributions).map(key => normalizeString(key));
      console.log("Normalized Selected Task:", normTask);
      console.log("Available Distribution Keys:", available);
      console.log("Raw task distributions keys:", Object.keys(data.taskDistributions));
    }
  }, [data, selectedTask]);

  const getStatusIcon = (level) => {
    if (level === 'critical') return <CloseCircleFilled style={{ color: '#f5222d' }} />;
    if (level === 'warning') return <WarningFilled style={{ color: '#faad14' }} />;
    return <CheckCircleFilled style={{ color: '#52c41a' }} />;
  };

  // Find matching distribution data using normalized keys.
  const taskDistributionData = useMemo(() => {
    // Early return with detailed logging if data is missing
    if (!selectedTask) {
      console.warn("No selected task");
      return null;
    }
    
    if (!data) {
      console.warn("Data prop is missing");
      return null;
    }
    
    if (!data.taskDistributions) {
      console.warn("taskDistributions is missing from data");
      return null;
    }
    
    // Try both taskId and name for matching
    const taskId = selectedTask.taskId || "";
    const taskName = selectedTask.name || "";
    
    const normTaskId = normalizeString(taskId);
    const normTaskName = normalizeString(taskName);
    
    // Log for debugging
    console.log("Looking for match with:", {
      taskId, 
      taskName, 
      normTaskId, 
      normTaskName
    });
    
    // Direct match check
    if (data.taskDistributions[taskId]) {
      console.log("Found direct match with taskId:", taskId);
      return data.taskDistributions[taskId];
    }
    
    if (data.taskDistributions[taskName]) {
      console.log("Found direct match with taskName:", taskName);
      return data.taskDistributions[taskName];
    }
    
    // First, try for an exact match with either taskId or name
    for (const key in data.taskDistributions) {
      const normKey = normalizeString(key);
      if (normKey === normTaskId || normKey === normTaskName) {
        console.log("Found exact match with key:", key);
        return data.taskDistributions[key];
      }
    }
    
    // Next, try if any key includes the taskId or name
    for (const key in data.taskDistributions) {
      const normKey = normalizeString(key);
      if (normTaskId && normKey.includes(normTaskId)) {
        console.log("Found partial match with taskId in key:", key);
        return data.taskDistributions[key];
      }
      if (normTaskName && normKey.includes(normTaskName)) {
        console.log("Found partial match with name in key:", key);
        return data.taskDistributions[key];
      }
    }
    
    // Final fallback: if we can't find a match, use a well-known task that exists
    // This is just for debugging - remove in production
    const fallbackKey = Object.keys(data.taskDistributions)[0];
    if (fallbackKey) {
      console.warn("No direct match found. Using fallback key for debugging:", fallbackKey);
      return data.taskDistributions[fallbackKey];
    }
    
    // If still not found, log a warning and return null
    console.warn("No matching task distribution found for taskId:", taskId, "or name:", taskName);
    return null;
  }, [selectedTask, data]);

  // Process distribution data into three buckets based on backend categorization.
  const distributionBuckets = useMemo(() => {
    if (!taskDistributionData) {
      console.warn("No task distribution data available");
      return null;
    }
    
    console.log("Processing distribution data:", taskDistributionData);
    
    const buckets = {
      critical: { count: 0, applicationIds: [], applicationStatusMap: {}, timeRange: "" },
      warning: { count: 0, applicationIds: [], applicationStatusMap: {}, timeRange: "" },
      good: { count: 0, applicationIds: [], applicationStatusMap: {}, timeRange: "" }
    };

    // Assuming the backend already provides data in three categories:
    // First entry in taskDistributionData = good
    // Second entry = warning
    // Third entry = critical
    const entries = Object.entries(taskDistributionData);
    
    // Map the entries to their respective buckets based on order
    if (entries.length >= 1) {
      const [timeRange, rangeData] = entries[0]; // First bucket = good
      buckets.good.count = typeof rangeData.count === 'number' ? rangeData.count : 0;
      buckets.good.timeRange = timeRange;
      if (Array.isArray(rangeData.applicationIds)) {
        buckets.good.applicationIds = rangeData.applicationIds;
      }
      if (rangeData.applicationStatusMap && typeof rangeData.applicationStatusMap === 'object') {
        buckets.good.applicationStatusMap = rangeData.applicationStatusMap;
      }
    }
    
    if (entries.length >= 2) {
      const [timeRange, rangeData] = entries[1]; // Second bucket = warning
      buckets.warning.count = typeof rangeData.count === 'number' ? rangeData.count : 0;
      buckets.warning.timeRange = timeRange;
      if (Array.isArray(rangeData.applicationIds)) {
        buckets.warning.applicationIds = rangeData.applicationIds;
      }
      if (rangeData.applicationStatusMap && typeof rangeData.applicationStatusMap === 'object') {
        buckets.warning.applicationStatusMap = rangeData.applicationStatusMap;
      }
    }
    
    if (entries.length >= 3) {
      const [timeRange, rangeData] = entries[2]; // Third bucket = critical
      buckets.critical.count = typeof rangeData.count === 'number' ? rangeData.count : 0;
      buckets.critical.timeRange = timeRange;
      if (Array.isArray(rangeData.applicationIds)) {
        buckets.critical.applicationIds = rangeData.applicationIds;
      }
      if (rangeData.applicationStatusMap && typeof rangeData.applicationStatusMap === 'object') {
        buckets.critical.applicationStatusMap = rangeData.applicationStatusMap;
      }
    }
    
    console.log("Processed distribution buckets:", buckets);
    return buckets;
  }, [taskDistributionData]);

  // Prepare pie chart data with updated labels.
  const pieChartData = useMemo(() => {
    if (!distributionBuckets) {
      console.warn("No distribution buckets available");
      return [];
    }
    
    console.log("Creating pie chart data from buckets:", distributionBuckets);
    
    let arr = [
      { 
        name: 'Most Time Taken Task', 
        value: distributionBuckets.critical.count, 
        color: '#f5222d', 
        performanceLevel: 'critical',
        timeRange: distributionBuckets.critical.timeRange
      },
      { 
        name: 'Average Time Taken Task', 
        value: distributionBuckets.warning.count, 
        color: '#faad14', 
        performanceLevel: 'warning',
        timeRange: distributionBuckets.warning.timeRange
      },
      { 
        name: 'Least Time Taken Task', 
        value: distributionBuckets.good.count, 
        color: '#52c41a', 
        performanceLevel: 'good',
        timeRange: distributionBuckets.good.timeRange
      }
    ].filter(item => item.value > 0);
    
    // Check if we have any data points
    if (arr.length === 0) {
      console.warn("No data points for pie chart");
      return [];
    }
    
    // We no longer force a single segment to yellow - we keep its original color
    
    console.log("Final pie chart data:", arr);
    return arr;
  }, [distributionBuckets]);

  const handlePieClick = (entry) => {
    if (!entry || !entry.performanceLevel) return;
    const bucketName = entry.performanceLevel;
    console.log("Pie segment clicked:", bucketName);
    setSelectedBucket(bucketName);
    setShowDistributionTable(true);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Card size="small">
          <div style={{ padding: '10px' }}>
            <div style={{ color: payload[0].payload.color, fontWeight: 'bold' }}>
              {payload[0].name}: {payload[0].value}
            </div>
            <div>Time Range: {payload[0].payload.timeRange}</div>
            <div>Click to view applications</div>
          </div>
        </Card>
      );
    }
    return null;
  };

  const renderDistributionTab = () => {
    // Check if we have valid data
    const hasData = distributionBuckets && 
                   pieChartData && 
                   pieChartData.length > 0 && 
                   pieChartData.some(item => item.value > 0);
    
    if (!hasData) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <p>No distribution data available for this task</p>
              <Text type="secondary">
                {!data ? "Data is missing" : 
                 !data.taskDistributions ? "Task distributions data is missing" : 
                 !taskDistributionData ? "No matching task distribution found" : 
                 "No data points to display"}
              </Text>
            </div>
          }
        />
      );
    }
    
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Task Performance Distribution" size="small">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePieClick}
                  cursor="pointer"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary">
              <InfoCircleOutlined /> Click on a segment to view application details
            </Text>
          </div>
        </Card>
      </Space>
    );
  };

  return (
    <>
      <Modal
        title={selectedTask?.name || "Task Details"}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        ]}
        centered
        width={600}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: 'details',
              label: 'Task Details',
              icon: <InfoCircleOutlined />,
              children: selectedTask && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card size="small" bodyStyle={{ textAlign: 'center' }}>
                    <Statistic 
                      title="Average Time" 
                      value={selectedTask.displayTime} 
                      prefix={<ClockCircleOutlined />} 
                    />
                  </Card>
                  <Card size="small" bodyStyle={{ textAlign: 'center' }}>
                    <Statistic 
                      title="% of Total TAT" 
                      value={selectedTask.percentOfTAT?.toFixed(1)} 
                      suffix="%" 
                      precision={1}
                      valueStyle={{ 
                        color: selectedTask.performanceLevel === 'critical' ? '#f5222d' : 
                              selectedTask.performanceLevel === 'warning' ? '#faad14' : '#52c41a'
                      }}
                    />
                  </Card>
                  <Card size="small" bodyStyle={{ textAlign: 'center' }}>
                    <Statistic 
                      title="Sendbacks" 
                      value={selectedTask.sendbacks} 
                      prefix={selectedTask.sendbacks > 2 ? <ExclamationCircleOutlined style={{ color: '#faad14' }} /> : null}
                      valueStyle={selectedTask.sendbacks > 2 ? { color: '#faad14' } : undefined}
                    />
                    {selectedTask.sendbacks > 3 && (
                      <Text type="warning">High number of sendbacks</Text>
                    )}
                  </Card>
                  <Card size="small" bodyStyle={{ textAlign: 'center' }}>
                    <Statistic 
                      title="Status" 
                      value={selectedTask.performanceLevel.charAt(0).toUpperCase() + selectedTask.performanceLevel.slice(1)} 
                      prefix={getStatusIcon(selectedTask.performanceLevel)}
                      valueStyle={{ 
                        color: selectedTask.performanceLevel === 'critical' ? '#f5222d' : 
                              selectedTask.performanceLevel === 'warning' ? '#faad14' : '#52c41a'
                      }}
                    />
                  </Card>
                  <Card size="small" bodyStyle={{ textAlign: 'center' }}>
                    <Statistic 
                      title="Funnel" 
                      value={selectedTask.funnel.charAt(0).toUpperCase() + selectedTask.funnel.slice(1)} 
                      prefix={
                        <div style={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          backgroundColor: funnelColors[selectedTask.funnel] || '#000',
                          display: 'inline-block',
                          marginRight: 8
                        }} />
                      }
                    />
                  </Card>
                </Space>
              )
            },
            {
              key: 'distribution',
              label: 'Task Distribution',
              icon: <PieChartOutlined />,
              children: renderDistributionTab()
            }
          ]}
        />
      </Modal>

      {showDistributionTable && distributionBuckets && selectedBucket && (
        <TaskDistributionTable
          visible={showDistributionTable}
          onClose={() => setShowDistributionTable(false)}
          data={distributionBuckets[selectedBucket.toLowerCase()]}
          performanceLevel={selectedBucket.toLowerCase()}
          taskName={selectedTask?.name || selectedTask?.taskId}
        />
      )}
    </>
  );
};

export default TaskDetailModal;