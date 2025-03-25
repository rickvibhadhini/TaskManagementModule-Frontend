import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Tooltip, Table } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const MetricCard = ({ title, info, taskDurations }) => {
  const [displayData, setDisplayData] = useState([]);
  const [activePercentile, setActivePercentile] = useState('P90');

  const percentiles = {
    P90: 0,
    P95: 1,
    P99: 2,
  };

  const calculatePercentile = (percentile) => {
    if (!taskDurations || Object.keys(taskDurations).length === 0) return;

    const formattedData = Object.entries(taskDurations).map(([task_name, durations]) => ({
      task_name,
      slowest_time: durations[percentile],
      fastest_time: durations[durations.length - 1],
    }));

    setDisplayData(formattedData);
  };

  const handlePercentileChange = (percentileKey) => {
    setActivePercentile(percentileKey);
    calculatePercentile(percentiles[percentileKey]);
  };

  useEffect(() => {
    calculatePercentile(percentiles.P90);
  }, [taskDurations]);

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'task_name',
      key: 'task_name',
    },
    {
      title: 'Slowest Time',
      dataIndex: 'slowest_time',
      key: 'slowest_time',
    },
    {
      title: 'Fastest Time',
      dataIndex: 'fastest_time',
      key: 'fastest_time',
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {title}
          <Tooltip title={info}>
            <InfoCircleOutlined style={{ color: 'black', cursor: 'pointer' }} />
          </Tooltip>
        </div>
      }
      className="h-full shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-start space-x-4 mb-4">
        {Object.keys(percentiles).map((key) => (
          <Button
            key={key}
            shape="round"
            type={activePercentile === key ? 'primary' : 'default'}
            onClick={() => handlePercentileChange(key)}
          >
            {key}
          </Button>
        ))}
      </div>
      <Table 
        dataSource={displayData} 
        columns={columns} 
        pagination={{ pageSize: 10 }} 
        rowKey="task_name" 
      />
    </Card>
  );
};

export default MetricCard;
