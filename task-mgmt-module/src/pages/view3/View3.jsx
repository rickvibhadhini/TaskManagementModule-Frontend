import React, { useState, useMemo, useRef } from 'react';
import { 
  Layout, 
  Typography, 
  Input, 
  Button, 
  Form, 
  Card, 
  Space, 
  Table, 
  Modal, 
  Row, 
  Col, 
  Divider, 
  Radio, 
  Tag, 
  Statistic,
  Alert,
  Tooltip as AntTooltip,
  Select,
  theme
} from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  BarChartOutlined, 
  LineChartOutlined,
  TableOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  InfoCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const View3 = () => {
  const { token } = theme.useToken();
  const [selectedFunnel, setSelectedFunnel] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [channel, setChannel] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  // Scroll to table view
  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch data from backend
  const fetchData = async (channelValue) => {
    if (!channelValue) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`http://localhost:8081/SLAMonitoring/time/${channelValue}`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Convert time strings to minutes for visualization
  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
  
    const parts = timeStr.split(' ');
    let totalMinutes = 0;
  
    for (let i = 0; i < parts.length; i += 2) {
      const value = parseFloat(parts[i]);
      const unit = parts[i + 1] || '';
    
      if (unit.startsWith('hrs')) totalMinutes += value * 60;
      else if (unit.startsWith('min')) totalMinutes += value;
      else if (unit.startsWith('sec')) totalMinutes += value / 60;
    }
  
    return totalMinutes;
  };

  // Get total TAT in minutes
  const getTATMinutes = useMemo(() => {
    if (!data || !data.averageTAT) return 100; // Default value if not available
    return convertTimeToMinutes(data.averageTAT);
  }, [data]);

  // Define colors for each funnel using Ant Design colors
  const funnelColors = {
    sourcing: token.colorSuccess,     // Green
    credit: token.colorInfo,          // Blue
    conversion: token.colorWarning,   // Orange/Yellow
    fulfillment: '#722ed1'            // Purple color for fulfillment
  };

  // Define funnel order
  const funnelOrder = ["sourcing", "credit", "conversion", "fulfillment"];

  // Format the funnel data for the bar chart with specific order
  const getFunnelChartData = useMemo(() => {
    if (!data || !data.funnels) return [];
  
    return funnelOrder.map(funnel => ({
      name: funnel.charAt(0).toUpperCase() + funnel.slice(1),
      minutes: convertTimeToMinutes(data.funnels[funnel].timeTaken),
      displayTime: data.funnels[funnel].timeTaken,
      color: funnelColors[funnel]
    }));
  }, [data, funnelColors]);

  // Create task data organized by funnel
  const getTasksByFunnel = useMemo(() => {
    if (!data || !data.funnels) return {};
    
    const totalTAT = getTATMinutes;
    const tasksByFunnel = {};
  
    Object.entries(data.funnels).forEach(([funnel, funnelData]) => {
      tasksByFunnel[funnel] = [];
    
      Object.entries(funnelData.tasks).forEach(([taskId, taskData]) => {
        const taskNum = taskId.split('_')[1].replace('task', '');
        const taskNumber = parseInt(taskNum, 10);
        const minutes = convertTimeToMinutes(taskData.timeTaken);
        const percentOfTAT = (minutes / totalTAT) * 100;
      
        // Determine performance level based on percentage of TAT
        let performanceLevel = "good"; // Green - Good (below 60% of TAT)
        if (percentOfTAT >= 90) {
          performanceLevel = "critical"; // Red - Critical (>=90% of TAT)
        } else if (percentOfTAT >= 60) {
          performanceLevel = "warning"; // Yellow - Warning (60-90% of TAT)
        }
      
        tasksByFunnel[funnel].push({
          taskId,
          taskNumber,
          time: taskData.timeTaken,
          minutes,
          percentOfTAT,
          sendbacks: taskData.noOfSendbacks,
          performanceLevel
        });
      });
    
      // Sort tasks by task number within each funnel
      tasksByFunnel[funnel].sort((a, b) => a.taskNumber - b.taskNumber);
    });
  
    return tasksByFunnel;
  }, [data, getTATMinutes]);

  // Prepare line chart data based on selected funnel
  const getLineChartData = useMemo(() => {
    if (!data || !data.funnels) return [];
  
    if (selectedFunnel === 'all') {
      // For 'all', create a combined view with all funnels
      const result = [];
      Object.entries(getTasksByFunnel).forEach(([funnel, tasks]) => {
        if (Array.isArray(tasks)) {
          tasks.forEach(task => {
            result.push({
              name: `${funnel.charAt(0).toUpperCase() + funnel.slice(1)} Task ${task.taskNumber}`,
              minutes: task.minutes,
              percentOfTAT: task.percentOfTAT,
              sendbacks: task.sendbacks,
              displayTime: task.time,
              performanceLevel: task.performanceLevel,
              funnel
            });
          });
        }
      });
      return result;
    } else if (getTasksByFunnel[selectedFunnel]) {
      // For specific funnel, show only that funnel's tasks
      return getTasksByFunnel[selectedFunnel].map(task => ({
        name: `Task ${task.taskNumber}`,
        minutes: task.minutes,
        percentOfTAT: task.percentOfTAT,
        sendbacks: task.sendbacks,
        displayTime: task.time,
        performanceLevel: task.performanceLevel,
        funnel: selectedFunnel
      }));
    }
    
    return [];
  }, [getTasksByFunnel, selectedFunnel]);

  // Prepare table data
  const getTableData = useMemo(() => {
    if (!data || !data.funnels) return [];
    
    const totalTAT = getTATMinutes;
    const tableData = [];
  
    Object.entries(data.funnels).forEach(([funnel, funnelData]) => {
      Object.entries(funnelData.tasks).forEach(([taskId, taskData]) => {
        const taskNumPart = taskId.split('_')[1];
        const minutes = convertTimeToMinutes(taskData.timeTaken);
        const percentOfTAT = (minutes / totalTAT) * 100;
      
        // Determine performance level based on percentage of TAT
        let performanceLevel = "good"; // Green - Good (below 60% of TAT)
        if (percentOfTAT >= 90) {
          performanceLevel = "critical"; // Red - Critical (>=90% of TAT)
        } else if (percentOfTAT >= 60) {
          performanceLevel = "warning"; // Yellow - Warning (60-90% of TAT)
        }
      
        tableData.push({
          key: taskId,
          taskId,
          funnel,
          displayName: `${funnel.charAt(0).toUpperCase() + funnel.slice(1)} ${taskNumPart.charAt(0).toUpperCase() + taskNumPart.slice(1)}`,
          time: taskData.timeTaken,
          minutes,
          percentOfTAT,
          sendbacks: taskData.noOfSendbacks,
          performanceLevel
        });
      });
    });
  
    return tableData;
  }, [data, getTATMinutes]);

  // Filter table data based on selected funnel
  const getFilteredTableData = useMemo(() => {
    if (!getTableData || !Array.isArray(getTableData)) return [];
    
    return selectedFunnel === 'all' 
      ? getTableData 
      : getTableData.filter(item => item.funnel === selectedFunnel);
  }, [getTableData, selectedFunnel]);

  // Handle bar click to filter by funnel
  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length) {
      const funnelName = data.activePayload[0].payload.name.toLowerCase();
      setSelectedFunnel(funnelName);
    }
  };

  // Handle task click in line chart to show details
  const handleTaskClick = (data) => {
    if (data && data.activePayload && data.activePayload.length) {
      setSelectedTask(data.activePayload[0].payload);
      setShowDetailModal(true);
    }
  };

  // Custom tooltip for the bar chart
  const FunnelTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Card size="small" style={{ border: '1px solid #f0f0f0' }}>
          <Text strong>{payload[0].payload.name}</Text>
          <div>Average time: {payload[0].payload.displayTime}</div>
          <div style={{ color: '#1890ff' }}>{payload[0].value.toFixed(1)} minutes</div>
        </Card>
      );
    }
    return null;
  };

  // Custom tooltip for the line chart
  const TaskTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const statusColor = data.performanceLevel === 'critical' ? '#f5222d' : 
                          data.performanceLevel === 'warning' ? '#faad14' : '#52c41a';
      
      return (
        <Card size="small" style={{ border: '1px solid #f0f0f0' }}>
          <Text strong>{data.name}</Text>
          <div>Time: {data.displayTime}</div>
          <div>% of TAT: {data.percentOfTAT?.toFixed(1)}%</div>
          <div>Sendbacks: {data.sendbacks}</div>
          <div style={{ color: statusColor }}>
            Status: {data.performanceLevel.charAt(0).toUpperCase() + data.performanceLevel.slice(1)}
          </div>
        </Card>
      );
    }
    return null;
  };

  // Custom dot for the line chart
  const CustomizedDot = (props) => {
    const { cx, cy, payload } = props;
    
    let fillColor = "#52c41a"; // Green for good
    
    if (payload.performanceLevel === 'critical') {
      fillColor = "#f5222d"; // Red for critical
    } else if (payload.performanceLevel === 'warning') {
      fillColor = "#faad14"; // Yellow for warning
    }
  
    return (
      <svg x={cx - 8} y={cy - 8} width={16} height={16} viewBox="0 0 16 16" fill="none">
        <circle cx={8} cy={8} r={8} fill={fillColor} />
      </svg>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: '#000', // Black dot
            display: 'inline-block',
            marginRight: 8
          }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Average Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '% of TAT',
      dataIndex: 'percentOfTAT',
      key: 'percentOfTAT',
      render: (percent) => `${percent.toFixed(1)}%`,
      sorter: (a, b) => a.percentOfTAT - b.percentOfTAT,
    },
    {
      title: 'Total Sendbacks',
      dataIndex: 'sendbacks',
      key: 'sendbacks',
      render: (sendbacks) => (
        <Space>
          {sendbacks > 2 && <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
          {sendbacks}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'performanceLevel',
      key: 'performanceLevel',
      render: (status) => {
        let color = 'success';
        let icon = <CheckCircleFilled />;
        
        if (status === 'critical') {
          color = 'error';
          icon = <CloseCircleFilled />;
        } else if (status === 'warning') {
          color = 'warning';
          icon = <WarningFilled />;
        }
        
        return (
          <Tag icon={icon} color={color}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedTask({
              ...record,
              name: record.displayName,
              displayTime: record.time,
            });
            setShowDetailModal(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  // Get performance indicator
  const getStatusIcon = (level) => {
    if (level === 'critical') return <CloseCircleFilled style={{ color: '#f5222d' }} />;
    if (level === 'warning') return <WarningFilled style={{ color: '#faad14' }} />;
    return <CheckCircleFilled style={{ color: '#52c41a' }} />;
  };

  // Define chart height constant for the line chart
  const CHART_HEIGHT = 350;
  // Define a taller height for the bar chart to match the line chart + status descriptions
  const BAR_CHART_HEIGHT = 430;

  return (
    <Layout style={{ height: '100vh', width : '100vw' }}>
     <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
  <Row justify="space-between" align="middle">
    <Col>
      <Title level={3} style={{ margin: '16px 0' }}>SLA Monitoring Dashboard</Title>
    </Col>
    <Col>
      <Space size="large">
        <Form layout="inline" onFinish={() => fetchData(channel)}>
          <Form.Item>
            <Space>
              <Select
                placeholder="Select channel"
                value={channel}
                onChange={(value) => setChannel(value)}
                style={{ width: 120 }}
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
          </Form.Item>
        </Form>
        
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
            <Row gutter={[16, 16]}>
              {/* Funnel Time Chart */}
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <BarChartOutlined />
                      <span>Average Time Per Funnel</span>
                    </Space>
                  }
                  hoverable
                  style={{ marginBottom: 0, height: '100%' }}
                  bodyStyle={{ height: BAR_CHART_HEIGHT }}
                >
                  <div style={{ height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getFunnelChartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        onClick={handleBarClick}
                        style={{ cursor: 'pointer' }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<FunnelTooltip />} />
                        <Legend 
                          formatter={(value) => {
                            return <span>{value}</span>;
                          }}
                          payload={
                            funnelOrder.map(funnel => ({
                              value: funnel.charAt(0).toUpperCase() + funnel.slice(1),
                              type: 'square',
                              color: funnelColors[funnel]
                            }))
                          }
                        />
                        <Bar 
                          dataKey="minutes" 
                          name="Average Time (minutes)"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        >
                          {getFunnelChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* Task Sequence Line Graph */}
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <LineChartOutlined />
                      <span>Task Sequence Timeline</span>
                    </Space>
                  }
                  hoverable
                  extra={
                    <Radio.Group 
                      value={selectedFunnel}
                      onChange={(e) => setSelectedFunnel(e.target.value)}
                      optionType="button"
                      buttonStyle="solid"
                      size="small"
                    >
                      <Radio.Button value="all">All</Radio.Button>
                      {funnelOrder.map(funnel => (
                        <Radio.Button 
                          key={funnel} 
                          value={funnel}
                        >
                          {funnel.charAt(0).toUpperCase() + funnel.slice(1)}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  }
                  style={{ marginBottom: 0 }}
                >
                  <div style={{ height: CHART_HEIGHT }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={getLineChartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        onClick={handleTaskClick}
                        style={{ cursor: 'pointer' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis 
                          label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} 
                          domain={[0, Math.max(getTATMinutes * 1.2, ...getLineChartData.map(item => item.minutes))]}
                        />
                        <Tooltip content={<TaskTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="minutes" 
                          name="Task"
                          stroke="#1890ff" 
                          strokeWidth={2}
                          dot={<CustomizedDot />}
                          activeDot={{ r: 8 }}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Divider />
                  
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Space wrap>
                        <AntTooltip title="Less than 60% of Total TAT">
                          <Tag color="success" icon={<CheckCircleFilled />}>Good (&lt;60% of TAT)</Tag>
                        </AntTooltip>
                        <AntTooltip title="Between 60% and 90% of Total TAT">
                          <Tag color="warning" icon={<WarningFilled />}>Warning (60-90% of TAT)</Tag>
                        </AntTooltip>
                        <AntTooltip title="More than 90% of Total TAT">
                          <Tag color="error" icon={<CloseCircleFilled />}>Critical (&gt;90% of TAT)</Tag>
                        </AntTooltip>
                      </Space>
                    </Col>
                    <Col>
                      <Button 
                        type="primary" 
                        icon={<DownOutlined />} 
                        onClick={scrollToTable}
                      >
                        View Table
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Task Metrics Table */}
              <Col span={24} ref={tableRef}>
                <Card 
                  title={
                    <Space>
                      <TableOutlined />
                      <span>Task Metrics</span>
                    </Space>
                  }
                  hoverable
                  extra={
                    <Radio.Group 
                      value={selectedFunnel}
                      onChange={(e) => setSelectedFunnel(e.target.value)}
                      optionType="button"
                      buttonStyle="solid"
                      size="small"
                    >
                      <Radio.Button value="all">All</Radio.Button>
                      {funnelOrder.map(funnel => (
                        <Radio.Button 
                          key={funnel} 
                          value={funnel}
                        >
                          {funnel.charAt(0).toUpperCase() + funnel.slice(1)}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  }
                >
                  <Table 
                    columns={columns} 
                    dataSource={getFilteredTableData} 
                    pagination={{ pageSize: 10 }}
                    scroll={{ y: 'calc(100vh - 500px)' }}
                  />
                </Card>
              </Col>
            </Row>
            
            {/* Task Detail Modal */}
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
            >
              {selectedTask && (
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
                    {selectedTask.sendbacks > 2 && (
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
              )}
            </Modal>
          </Space>
        )}
      </Content>
    </Layout>
  );
};

export default View3;