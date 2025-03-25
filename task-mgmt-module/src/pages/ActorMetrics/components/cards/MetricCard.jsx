import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Tooltip, Table, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const MetricCard = ({ title, info, taskDurations }) => {
  const [displayData, setDisplayData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activePercentile, setActivePercentile] = useState('P90');
  const [searchText, setSearchText] = useState('');

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
    setFilteredData(formattedData);
  };

  const handlePercentileChange = (percentileKey) => {
    setActivePercentile(percentileKey);
    calculatePercentile(percentiles[percentileKey]);
  };

  useEffect(() => {
    calculatePercentile(percentiles.P90);
  }, [taskDurations]);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = displayData.filter((item) =>
      item.task_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

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
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
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
        <Search
          placeholder="Search tasks..."
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
      </div>
      <Table 
        dataSource={filteredData} 
        columns={columns} 
        pagination={{ pageSize: 6 }} 
        rowKey="task_name" 
      />
    </Card>
  );
};

export default MetricCard;
