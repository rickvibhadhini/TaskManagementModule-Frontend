import React, { useMemo } from 'react';
import { Card, Space, Radio, Row, Col, Divider, Tag, Button, Tooltip as AntTooltip } from 'antd';
import { Typography } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  TableOutlined, 
  CheckCircleFilled, 
  WarningFilled, 
  CloseCircleFilled,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const DashboardCharts = ({ 
  data, 
  selectedFunnel, 
  setSelectedFunnel, 
  funnelColors, 
  funnelOrder, 
  setSelectedTask, 
  setShowDetailModal,
  toggleView,
  getButtonColor,
  timeRange
}) => {
 
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

  const getTATMinutes = useMemo(() => {
    if (!data || !data.averageTAT) return 100; 
    return convertTimeToMinutes(data.averageTAT);
  }, [data]);

  const getFunnelChartData = useMemo(() => {
    if (!data || !data.funnels) return [];
    return funnelOrder.map(funnel => {
      const funnelData = data.funnels[funnel];
      return {
        name: funnel.charAt(0).toUpperCase() + funnel.slice(1),
        minutes: funnelData ? convertTimeToMinutes(funnelData.timeTaken) : 0,
        displayTime: funnelData ? funnelData.timeTaken : '',
        color: funnelColors[funnel]
      };
    });
  }, [data, funnelColors, funnelOrder]);

  const getTasksByFunnel = useMemo(() => {
    if (!data || !data.funnels) return {};
    const totalTAT = getTATMinutes;
    const tasksByFunnel = {};
    Object.entries(data.funnels).forEach(([funnel, funnelData]) => {
      if (!funnelOrder.includes(funnel)) return;
      tasksByFunnel[funnel] = [];
      if (!funnelData || !funnelData.tasks) return;
      Object.entries(funnelData.tasks).forEach(([taskId, taskData]) => {
        const minutes = convertTimeToMinutes(taskData.timeTaken);
        const percentOfTAT = (minutes / totalTAT) * 100;
        let performanceLevel = "good"; 
        if (percentOfTAT >= 90) {
          performanceLevel = "critical"; 
        } else if (percentOfTAT >= 60) {
          performanceLevel = "warning"; 
        }
        tasksByFunnel[funnel].push({
          taskId,
          time: taskData.timeTaken,
          minutes,
          percentOfTAT,
          sendbacks: taskData.noOfSendbacks,
          performanceLevel
        });
      });
      
      tasksByFunnel[funnel].sort((a, b) => a.taskId.localeCompare(b.taskId));
    });
    return tasksByFunnel;
  }, [data, getTATMinutes, funnelOrder]);

  const getLineChartData = useMemo(() => {
    if (!data || !data.funnels) return [];
    let result = [];
    
    if (selectedFunnel === 'all') {
      Object.entries(getTasksByFunnel).forEach(([funnel, tasks]) => {
        if (Array.isArray(tasks)) {
          tasks.forEach(task => {
            result.push({
              name: task.taskId,
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
    } else if (getTasksByFunnel[selectedFunnel]) {
      result = getTasksByFunnel[selectedFunnel].map(task => ({
        name: task.taskId,
        minutes: task.minutes,
        percentOfTAT: task.percentOfTAT,
        sendbacks: task.sendbacks,
        displayTime: task.time,
        performanceLevel: task.performanceLevel,
        funnel: selectedFunnel
      }));
    }
    
    // Apply time range filter if set
    if (timeRange && (timeRange[0] !== null || timeRange[1] !== null)) {
      result = result.filter(item => {
        if (timeRange[0] !== null && item.minutes < timeRange[0]) {
          return false;
        }
        if (timeRange[1] !== null && item.minutes > timeRange[1]) {
          return false;
        }
        return true;
      });
    }
    
    return result;
  }, [getTasksByFunnel, selectedFunnel, timeRange]);

  
  const tickInterval = useMemo(() => {
    return getLineChartData.length > 10 ? Math.ceil(getLineChartData.length / 10) : 0;
  }, [getLineChartData]);

  
  const maxTaskMinutes = useMemo(() => {
    if (getLineChartData.length > 0) {
      return Math.max(...getLineChartData.map(item => item.minutes));
    }
    return 100;
  }, [getLineChartData]);

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length) {
      const funnelName = data.activePayload[0].payload.name.toLowerCase();
      setSelectedFunnel(funnelName);
    }
  };

  const handleTaskClick = (data) => {
    if (data && data.activePayload && data.activePayload.length) {
      setSelectedTask(data.activePayload[0].payload);
      setShowDetailModal(true);
    }
  };

  const FunnelTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Card size="small" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 'bold' }}>{payload[0].payload.name}</div>
          <div>Average time: {payload[0].payload.displayTime}</div>
          <div style={{ color: '#1890ff' }}>{payload[0].value.toFixed(1)} minutes</div>
        </Card>
      );
    }
    return null;
  };

  const TaskTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const statusColor = data.performanceLevel === 'critical' ? '#f5222d' : 
                          data.performanceLevel === 'warning' ? '#faad14' : '#52c41a';
      return (
        <Card size="small" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 'bold' }}>{data.name}</div>
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

  const CustomizedDot = (props) => {
    const { cx, cy, payload } = props;
    let fillColor = "#52c41a";
    if (payload.performanceLevel === 'critical') {
      fillColor = "#f5222d";
    } else if (payload.performanceLevel === 'warning') {
      fillColor = "#faad14";
    }
    return (
      <svg x={cx - 8} y={cy - 8} width={16} height={16} viewBox="0 0 16 16" fill="none">
        <circle cx={8} cy={8} r={8} fill={fillColor} />
      </svg>
    );
  };

  const CHART_HEIGHT = 350;
  const BAR_CHART_HEIGHT = 430;

  // Get task count after filtering
  const taskCount = getLineChartData.length;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        {timeRange && (timeRange[0] !== null || timeRange[1] !== null) && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space>
              <strong>Active Filters:</strong>
              {timeRange[0] !== null && <Tag color="blue">Min Time: {timeRange[0]} minutes</Tag>}
              {timeRange[1] !== null && <Tag color="blue">Max Time: {timeRange[1]} minutes</Tag>}
              <Tag color="green">Showing {taskCount} tasks</Tag>
            </Space>
          </Card>
        )}
      </Col>
      
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <BarChartOutlined />
              <span>Average Time Per Funnel</span>
              <AntTooltip title="This chart shows the average processing time for each funnel stage. Click on a bar to filter the timeline by that funnel.">
                <Button type="text" size="small" icon={<InfoCircleOutlined />} />
              </AntTooltip>
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
                  formatter={(value) => <span>{value}</span>}
                  payload={funnelOrder.map(funnel => ({
                    value: funnel.charAt(0).toUpperCase() + funnel.slice(1),
                    type: 'square',
                    color: funnelColors[funnel]
                  }))}
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

            <div style={{ 
              textAlign: 'center', 
              paddingTop: '8px', 
              fontWeight: 'bold',
              color: '#1890ff',
              fontSize: '14px'
            }}>
              Funnels
      </div>

          </div>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <LineChartOutlined />
              <span>Task Timeline </span>
              <AntTooltip title="This chart shows the time taken for each task in sequence. Click on any data point to view detailed task information. The color of each point represents its performance status.">
                <Button type="text" size="small" icon={<InfoCircleOutlined />} />
              </AntTooltip>
            
            </Space>
            
          }
          hoverable
          extra={
            <Radio.Group
              value={selectedFunnel}
              onChange={(e) => setSelectedFunnel(e.target.value)}
              optionType="button"
              buttonStyle="outline"
              size="small"
            >
              <Radio.Button
                value="all"
                style={{
                  backgroundColor: selectedFunnel === 'all' ? '#1890ff' : undefined,
                  borderColor: selectedFunnel === 'all' ? '#1890ff' : undefined,
                  color: selectedFunnel === 'all' ? '#ffffff' : undefined
                }}
              >
                All
              </Radio.Button>
              {funnelOrder.map(funnel => (
                <Radio.Button
                  key={funnel}
                  value={funnel}
                  style={{
                    backgroundColor: selectedFunnel === funnel ? funnelColors[funnel] : undefined,
                    borderColor: selectedFunnel === funnel ? funnelColors[funnel] : undefined,
                    color: selectedFunnel === funnel ? '#ffffff' : undefined
                  }}
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
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={tickInterval}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  domain={[0, maxTaskMinutes]}
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
                icon={<TableOutlined />}
                onClick={toggleView}
                style={{
                  backgroundColor: getButtonColor(selectedFunnel),
                  borderColor: getButtonColor(selectedFunnel)
                }}
              >
                View Table
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCharts;