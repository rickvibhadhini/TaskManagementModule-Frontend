import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Tooltip, Table, Input } from 'antd';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const MetricCard = ({ title, info, taskDurations, formatTime }) => {
  const [displayData, setDisplayData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!taskDurations || Object.keys(taskDurations).length === 0) return;

    // Process the data for the table
    // Each task duration array contains [P90, P95, P99, P50, fastest, slowest]
    const formattedData = Object.entries(taskDurations)
      .filter(([_, durations]) => durations.some(d => d > 0)) // Filter out tasks with all zeros
      .map(([task_name, durations]) => ({
        key: task_name,
        task_name: task_name.replace(/_/g, ' '), // Format task name
        fastest: formatTime(Number(durations[0])/60000), // P95 is slowest
        slowest: formatTime(Number(durations[1])/60000), // P90 is fastest in your data
        p50: formatTime(Number(durations[2])/60000),     // P50
        p90: formatTime(Number(durations[3])/60000),     // P90
        p95: formatTime(Number(durations[4])/60000),     // P95
        p99: formatTime(Number(durations[5])/60000),     // P99
        // Store raw values for sorting
        raw_fastest: Number(durations[0]),
        raw_slowest: Number(durations[1]),
        raw_p50: Number(durations[2]),
        raw_p90: Number(durations[3]),
        raw_p95: Number(durations[4]),
        raw_p99: Number(durations[5])
      }))
      .sort((a, b) => b.raw_p95 - a.raw_p95);  // Sort by slowest time descending

    setDisplayData(formattedData);
    setFilteredData(formattedData);
  }, [taskDurations, formatTime]);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = displayData.filter((item) =>
      item.task_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const formatTimeValue = (time, rawTime) => {
    if (rawTime === 0) return '-';
    return time;
  };

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'task_name',
      key: 'task_name',
    },
    {
      title: 'Fastest',
      dataIndex: 'fastest',
      key: 'fastest',
    },
    {
      title: 'Slowest',
      dataIndex: 'slowest',
      key: 'slowest',
    },
    {
      title: 'P50',
      dataIndex: 'p50',
      key: 'p50',
      sorter: (a, b) => a.raw_p50 - b.raw_p50,
      render: (text, record) => formatTimeValue(text, record.raw_p50),
    },
    {
      title: 'P90',
      dataIndex: 'p90',
      key: 'p90',
      sorter: (a, b) => a.raw_p90 - b.raw_p90,
      render: (text, record) => formatTimeValue(text, record.raw_p90),
    },
    {
      title: 'P95',
      dataIndex: 'p95',
      key: 'p95',
      sorter: (a, b) => a.raw_p95 - b.raw_p95,
      render: (text, record) => formatTimeValue(text, record.raw_p95),
    },
    {
      title: 'P99',
      dataIndex: 'p99',
      key: 'p99',
      sorter: (a, b) => a.raw_p99 - b.raw_p99,
      render: (text, record) => formatTimeValue(text, record.raw_p99),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className='text-xl'>
          {title}
          <Tooltip title={info}>
            <InfoCircleOutlined style={{ color: 'black', cursor: 'pointer' }} />
          </Tooltip>
        </div>
      }
      className="h-full shadow-sm hover:shadow-lg transition-shadow"
      extra={
        <Search
          placeholder="Search tasks..."
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
          allowClear
          prefix={<SearchOutlined />}
        />
      }
    >
      <Table 
        dataSource={filteredData} 
        columns={columns} 
        pagination={{ pageSize: 8 }} 
        rowKey="key" 
        size='middle'
        scroll={{x:'max-content'}}
      />
    </Card>
  );
};

export default MetricCard;
