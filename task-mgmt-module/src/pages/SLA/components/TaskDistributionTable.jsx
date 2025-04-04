import React, { useState } from 'react';
import { Modal, Table, Radio, Typography, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const TaskDistributionTable = ({ visible, onClose, data, taskName }) => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(25);

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
      render: (text) => (
        <span
          style={{ cursor: 'pointer', color: '#1890ff', textDecoration: 'underline' }}
          onClick={() => navigate('/activityLog', { state: { appId: text, taskId: text } })}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: text === 'COMPLETED' ? 'green' : text === 'NEW' ? 'blue' : 'red' }}>
          {text}
        </span>
      ),
    }
  ];

  // Transform data for table display
  const tableData = data?.applicationIds.map((appId) => ({
    key: appId,
    applicationId: appId,
    status: data.applicationStatusMap[appId] || 'Pending'
  })) || [];

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
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default TaskDistributionTable;
