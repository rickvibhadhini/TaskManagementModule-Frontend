import React, { useState, useMemo } from 'react';
import { Modal, Button, Space, Card, Statistic, Typography, Radio } from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleFilled, 
  WarningFilled, 
  CloseCircleFilled 
} from '@ant-design/icons';

const { Text } = Typography;

const TaskDetailModal = ({ selectedTask, showDetailModal, setShowDetailModal, funnelColors, funnelTasks }) => {
  // Toggle between average-based details and distribution-based details.
  const [viewMode, setViewMode] = useState("average");

  const getStatusIcon = (level) => {
    if (level === 'critical') return <CloseCircleFilled style={{ color: '#f5222d' }} />;
    if (level === 'warning') return <WarningFilled style={{ color: '#faad14' }} />;
    return <CheckCircleFilled style={{ color: '#52c41a' }} />;
  };

  // Compute distribution stats from funnelTasks.
  const distributionStats = useMemo(() => {
    if (!funnelTasks || funnelTasks.length === 0) return null;
    const groups = { good: { count: 0, totalMinutes: 0 }, warning: { count: 0, totalMinutes: 0 }, critical: { count: 0, totalMinutes: 0 } };
    funnelTasks.forEach(task => {
      const level = task.performanceLevel;
      if (groups[level]) {
        groups[level].count += 1;
        groups[level].totalMinutes += task.minutes;
      }
    });
    Object.keys(groups).forEach(key => {
      groups[key].averageTime = groups[key].count > 0 ? (groups[key].totalMinutes / groups[key].count) : 0;
    });
    return groups;
  }, [funnelTasks]);

  return (
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
      <Radio.Group 
        value={viewMode} 
        onChange={(e) => setViewMode(e.target.value)} 
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="average">Average Details</Radio.Button>
        <Radio.Button value="distribution">Distribution Details</Radio.Button>
      </Radio.Group>
      
      {viewMode === "average" && selectedTask && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card size="small" bodyStyle={{ textAlign: 'center' }}>
            <Statistic 
              title="Average Time" 
              value={selectedTask.time} 
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
      )}

      {viewMode === "distribution" && (
        <>
          {distributionStats ? (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card size="small" title="Good (<60% of TAT)" bodyStyle={{ textAlign: 'center' }}>
                <Statistic title="Count" value={distributionStats.good.count} />
                <Statistic 
                  title="Avg Time" 
                  value={`${distributionStats.good.averageTime.toFixed(1)} minutes`} 
                />
              </Card>
              <Card size="small" title="Warning (60-90% of TAT)" bodyStyle={{ textAlign: 'center' }}>
                <Statistic title="Count" value={distributionStats.warning.count} />
                <Statistic 
                  title="Avg Time" 
                  value={`${distributionStats.warning.averageTime.toFixed(1)} minutes`} 
                />
              </Card>
              <Card size="small" title="Critical (>90% of TAT)" bodyStyle={{ textAlign: 'center' }}>
                <Statistic title="Count" value={distributionStats.critical.count} />
                <Statistic 
                  title="Avg Time" 
                  value={`${distributionStats.critical.averageTime.toFixed(1)} minutes`} 
                />
              </Card>
            </Space>
          ) : (
            <Text>No distribution data available.</Text>
          )}
        </>
      )}
    </Modal>
  );
};

export default TaskDetailModal;
