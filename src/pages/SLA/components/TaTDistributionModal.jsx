import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Table } from 'antd';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

const TatDistributionModal = ({ visible, tatDistribution, onClose }) => {
  const [activeTab, setActiveTab] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const navigate = useNavigate();

  useEffect(() => {
    if (tatDistribution) {
      const buckets = Object.keys(tatDistribution);
      if (buckets.length > 0) {
        setActiveTab(buckets[0]);
      }
    }
  }, [tatDistribution]);

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
      render: (text) => text || 'Pending'
    },
  ];

  // Prepare the dataSource for the selected bucket.
  const dataSource =
    activeTab && tatDistribution && tatDistribution[activeTab]
      ? tatDistribution[activeTab].applicationIds.map((appId) => ({
          key: appId,
          applicationId: appId,
          status: tatDistribution[activeTab].applicationStatusMap[appId] || '',
        }))
      : [];

  return (
    <Modal
      title="TAT Distribution Details"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
  {tatDistribution &&
    Object.keys(tatDistribution).map((bucket) => {
      const totalApps = tatDistribution[bucket].applicationIds.length; // Get total applications
      return (
        <TabPane 
          tab={
            <span>
              {bucket} <strong>({totalApps} applications)</strong>
            </span>
          } 
          key={bucket}
        >
          <Table
            columns={columns}
            dataSource={tatDistribution[bucket].applicationIds.map((appId) => ({
              key: appId,
              applicationId: appId,
              status: tatDistribution[bucket].applicationStatusMap[appId] || '',
            }))}
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['25', '50', '75', '100'],
            }}
          />
        </TabPane>
      );
    })}
</Tabs>

    </Modal>
  );
};

export default TatDistributionModal;