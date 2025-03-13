import React from 'react';
import { Modal, Button, Space, Card, Statistic, Typography } from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleFilled, 
  WarningFilled, 
  CloseCircleFilled 
} from '@ant-design/icons';

const { Text } = Typography;

const TaskDetailModal = ({ selectedTask, showDetailModal, setShowDetailModal, funnelColors }) => {
  const getStatusIcon = (level) => {
    if (level === 'critical') return <CloseCircleFilled style={{ color: '#f5222d' }} />;
    if (level === 'warning') return <WarningFilled style={{ color: '#faad14' }} />;
    return <CheckCircleFilled style={{ color: '#52c41a' }} />;
  };

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
    </Modal>
  );
};

export default TaskDetailModal;