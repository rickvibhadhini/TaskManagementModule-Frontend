import React from 'react';
import { Card, Button, Table, Badge } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const PendingTasksTable = ({ tasks, columns }) => {
  return (
    <Card 
      title="Pending Tasks" 
      extra={
        <div>
          <Badge count={tasks.length} style={{ backgroundColor: '#faad14', marginRight: '8px' }} />
          {/* <Button type="primary" icon={<ReloadOutlined />}>Refresh</Button> */}
        </div>
      }
    >
      <Table 
        columns={columns} 
        dataSource={tasks} 
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
};

export default PendingTasksTable;