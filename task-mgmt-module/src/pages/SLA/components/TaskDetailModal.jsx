import React, { useState, useMemo } from 'react';
import { Modal, Button, Space, Card, Statistic, Typography, Tabs, Table } from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleFilled, 
  WarningFilled, 
  CloseCircleFilled 
} from '@ant-design/icons';
import { PieChart, Pie, Tooltip as RechartsTooltip, Cell } from 'recharts';

const { Text } = Typography;
const { TabPane } = Tabs; // If using antd v4; for antd v5 use <Tabs.Item>

const TaskDetailModal = ({ 
  selectedTask, 
  showDetailModal, 
  setShowDetailModal, 
  funnelColors,
  distributionData // New prop containing tatDistribution from backend
}) => {
  // activeTab: "average" or "distribution"
  const [activeTab, setActiveTab] = useState("average");
  // For distribution tab: if a pie segment is clicked, show its table
  const [selectedSegment, setSelectedSegment] = useState(null);

  const getStatusIcon = (level) => {
    if (level === 'critical') return <CloseCircleFilled style={{ color: '#f5222d' }} />;
    if (level === 'warning') return <WarningFilled style={{ color: '#faad14' }} />;
    return <CheckCircleFilled style={{ color: '#52c41a' }} />;
  };

  // Prepare pie chart data from distributionData (tatDistribution)
  const pieData = useMemo(() => {
    if (!distributionData) return [];
    return Object.entries(distributionData).map(([range, info]) => ({
      name: range,
      count: info.count,
      applicationIds: info.applicationIds,
    }));
  }, [distributionData]);

  // Colors mapping for the pie chart segments.
  // If the SLA response uses different range keys, these colors will be applied based on the key.
  const pieColors = {
    "0 min to 1 hr": "#52c41a",   // green
    "1 hr to 3 hrs": "#faad14",   // yellow
    "3 hrs to 5 hrs": "#f5222d",   // red
  };

  // Table data for the selected segment.
  const tableData = useMemo(() => {
    if (!selectedSegment || !selectedSegment.applicationIds) return [];
    return selectedSegment.applicationIds.map((appId, index) => ({
      key: index,
      applicationId: appId,
    }));
  }, [selectedSegment]);

  // Columns for the application IDs table.
  const tableColumns = [
    {
      title: 'Application ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
    },
  ];

  // When a pie segment is clicked, set that segment to show table details.
  const handlePieClick = (data, index) => {
    setSelectedSegment(data);
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
      width={600}
    >
      <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setSelectedSegment(null); }}>
        <TabPane tab="Average Details" key="average">
          {selectedTask && (
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
        </TabPane>
        <TabPane tab="Distribution Time" key="distribution">
          {/* If no segment is selected, show the pie chart */}
          {pieData.length > 0 && !selectedSegment && (
            <PieChart width={300} height={300}>
              <Pie 
                data={pieData} 
                dataKey="count" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                fill="#8884d8"
                onClick={handlePieClick}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name) => [`Count: ${value}`, name]}
              />
            </PieChart>
          )}
          {/* If a segment is selected, show a table with the application IDs */}
          {selectedSegment && (
            <div>
              <Button onClick={() => setSelectedSegment(null)} style={{ marginBottom: 16 }}>
                Back to Pie Chart
              </Button>
              <Table 
                columns={tableColumns} 
                dataSource={tableData} 
                pagination={{ 
                  pageSizeOptions: ['25', '50', '75', '100'], 
                  showSizeChanger: true, 
                  defaultPageSize: 25 
                }}
              />
            </div>
          )}
          {/* If no distribution data is available */}
          {pieData.length === 0 && (
            <p>No distribution data available.</p>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default TaskDetailModal;
