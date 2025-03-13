import React, { useMemo } from 'react';
import { Card, Space, Radio, Row, Col, Divider, Tag, Button, Tooltip as AntTooltip } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  TableOutlined, 
  CheckCircleFilled, 
  WarningFilled, 
  CloseCircleFilled 
} from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const DashboardCharts = ({ 
  data, 
  selectedFunnel, 
  setSelectedFunnel, 
  funnelColors, 
  funnelOrder, 
  setSelectedTask, 
  setShowDetailModal,
  toggleView,
  getButtonColor
}) => {
  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
  
    const parts = timeStr.split(' ');
    
    return Array.from({ length: Math.floor(parts.length / 2) })
      .map((_, index) => index * 2)
      .reduce((totalMinutes, i) => {
        const value = parseFloat(parts[i]);
        const unit = (i + 1 < parts.length) ? parts[i + 1] : '';
        
        if (unit.startsWith('hrs')) return totalMinutes + (value * 60);
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
  
    return funnelOrder.map(funnel => ({
      name: funnel.charAt(0).toUpperCase() + funnel.slice(1),
      minutes: convertTimeToMinutes(data.funnels[funnel].timeTaken),
      displayTime: data.funnels[funnel].timeTaken,
      color: funnelColors[funnel]
    }));
  }, [data, funnelColors, funnelOrder]);

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
      
        let performanceLevel = "good"; 
        if (percentOfTAT >= 90) {
          performanceLevel = "critical"; 
        } else if (percentOfTAT >= 60) {
          performanceLevel = "warning"; 
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
    
      tasksByFunnel[funnel].sort((a, b) => a.taskNumber - b.taskNumber);
    });
  
    return tasksByFunnel;
  }, [data, getTATMinutes]);

  const getLineChartData = useMemo(() => {
    if (!data || !data.funnels) return [];
  
    if (selectedFunnel === 'all') {
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

  return (
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