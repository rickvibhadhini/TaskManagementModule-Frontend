import React, { useState } from 'react';
import { Modal, Table, Radio, Badge, Typography, Space, Button } from 'antd';
import { CheckCircleFilled, WarningFilled, CloseCircleFilled } from '@ant-design/icons';

const { Title } = Typography;

const TaskDistributionTable = ({ visible, onClose, data, performanceLevel, taskName }) => {
  const [pageSize, setPageSize] = useState(25);
  
  const getStatusIcon = (level) => {
    if (level === 'critical') return <CloseCircleFilled style={{ color: '#f5222d' }} />;
    if (level === 'warning') return <WarningFilled style={{ color: '#faad14' }} />;
    return <CheckCircleFilled style={{ color: '#52c41a' }} />;
  };

  const getStatusColor = (level) => {
    if (level === 'critical') return '#f5222d';
    if (level === 'warning') return '#faad14';
    return '#52c41a';
  };

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
      render: (text) => (
        <Space>
          <Badge color={getStatusColor(performanceLevel)} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => text || 'Pending'
    }
  ];

  // Transform data for table display
  const tableData = data?.applicationIds.map((appId) => ({
    key: appId,
    applicationId: appId,
    status: data.applicationStatusMap[appId] || 'Pending'
  })) || [];

  return (
    <Modal
      title={
        <Space>
          {getStatusIcon(performanceLevel)}
          <Title level={4} style={{ margin: 0 }}>
            {performanceLevel.charAt(0).toUpperCase() + performanceLevel.slice(1)} Applications for {taskName}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Radio.Group 
          key="pagination" 
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
          style={{ float: 'left' }}
        >
          <Radio.Button value={25}>25 / page</Radio.Button>
          <Radio.Button value={50}>50 / page</Radio.Button>
          <Radio.Button value={75}>75 / page</Radio.Button>
          <Radio.Button value={100}>100 / page</Radio.Button>
        </Radio.Group>,
        <Space key="buttons">
          <span>Total Applications: {tableData.length}</span>
          <Button key="close" type="primary" onClick={onClose}>
            Close
          </Button>
        </Space>
      ]}
    >
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{ 
          pageSize: pageSize,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} applications`
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default TaskDistributionTable;