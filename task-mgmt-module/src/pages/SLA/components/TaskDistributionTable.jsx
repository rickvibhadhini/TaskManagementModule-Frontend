import React from 'react';
import { Modal, Table, Typography, Space, Button } from 'antd';
import { CheckCircleFilled, WarningFilled, CloseCircleFilled } from '@ant-design/icons';

const { Title } = Typography;

const TaskDistributionTable = ({ visible, onClose, data, performanceLevel, taskName }) => {
  // The columns remain unchanged (just removing the icon logic from the title).
  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
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

  // Title is now always "Applications for {taskName}" with no icons or performance-level text.
  const modalTitle = (
    <Title level={4} style={{ margin: 0 }}>
      Applications for {taskName}
    </Title>
  );

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
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
        pagination={false}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default TaskDistributionTable;
