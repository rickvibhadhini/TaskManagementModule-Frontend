import {React, useState} from 'react';
import { Card, Button, Table, Badge, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const {Option} = Select;

const PendingTasksTable = ({ tasks, columns }) => {

  return (
    <Card 
      title="Pending Tasks" 
      extra={
        <div>
          <Badge count={tasks.length} style={{ backgroundColor: '#faad14', marginRight: '8px' }} />
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