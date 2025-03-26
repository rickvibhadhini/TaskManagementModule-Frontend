import React, { useState } from 'react';
import { Card, Table, Badge, Tooltip, Select, Tag } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const statusColors = {
  ALL: 'default',
  NEW: 'blue',
  TODO: 'orange',
  IN_PROGRESS: 'green',
  FAILED: 'red'
};

const PendingTasksTable = ({ tasks, columns, info }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState(5);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value); 
  };

  const filteredTasks =
    statusFilter === 'ALL'
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  const updatedColumns = columns.map((col) =>
    col.dataIndex === 'status'
      ? {
          ...col,
          render: (status) => (
            <Tag color={statusColors[status] || 'default'}>{status}</Tag>
          ),
        }
      : col
  );

  return (
    <Card
      title={
        <div className="text-xl" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Pending Tasks</span>
          <Tooltip title={info}>
            <InfoCircleOutlined style={{ color: 'black', cursor: 'pointer' }} />
          </Tooltip>
        </div>
      }
      extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Select defaultValue="ALL" style={{ width: 140 }} onChange={handleFilterChange}>
            {Object.keys(statusColors).map((status) => (
              <Option key={status} value={status}>
                <Tag color={statusColors[status]}>{status}</Tag>
              </Option>
            ))}
          </Select>
          <Badge count={filteredTasks.length} style={{ backgroundColor: '#faad14' }} />

          <Select value={pageSize} style={{ width: 100 }} onChange={handlePageSizeChange}>
            <Option value={5}>5 / page</Option>
            <Option value={10}>10 / page</Option>
            <Option value={20}>20 / page</Option>
          </Select>
        </div>
      }
    >
      <Table
        columns={updatedColumns}
        dataSource={filteredTasks}
        pagination={{ pageSize: pageSize }} 
        rowKey="id"
      />
    </Card>
  );
};

export default PendingTasksTable;
