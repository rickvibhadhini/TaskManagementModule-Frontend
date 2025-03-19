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

  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  const filteredTasks = statusFilter === 'ALL' 
    ? tasks 
    : tasks.filter(task => task.status === statusFilter);

    const updatedColumns = columns.map((col) => 
      col.dataIndex === 'status'
        ? { 
            ...col, 
            render: (status) => (
              <Tag color={statusColors[status] || 'default'}>
                {status}
              </Tag>
            ),
          }
        : col
    );

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Pending Tasks</span>
          <Tooltip title={info}>
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </div>
      }
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Select 
            defaultValue="ALL" 
            style={{ width: 140 }} 
            onChange={handleFilterChange}
          >
            {/* <Option value="ALL">All Statuses</Option>
            <Option value="NEW">NEW</Option>
            <Option value="TODO">TODO</Option>
            <Option value="IN_PROGRESS">IN_PROGRESS</Option>
            <Option value="FAILED">FAILED</Option> */}
            {Object.keys(statusColors).map((status) => (
              <Option key={status} value={status}>
                <Tag color={statusColors[status]}>{status}</Tag>
              </Option>
            ))}
          </Select>
          <Badge count={filteredTasks.length} style={{ backgroundColor: '#faad14' }} />
        </div>
      }
    >
      <Table
        columns={updatedColumns}
        dataSource={filteredTasks}
        pagination={{ pageSize: 5 }}
        rowKey="id"
      />
    </Card>
  );
};

export default PendingTasksTable;
