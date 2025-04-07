// src/components/Layout/Header.jsx
import React from 'react';
import { Row, Col, Select, Button, Typography, Space, Card, Alert } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { cars24Logo } from "../../../assets/index";

const { Option } = Select;
const { Title, Text } = Typography;

const DashboardHeader = ({  
  channel, 
  onChannelChange, 
  onLoadData, 
  data, 
  error, 
  loading,
  daysFilter,
  appStatusFilter,
  onDaysFilterChange,
  onAppStatusFilterChange,
  // Global Task Status Filter props
  taskStatusFilter,
  onTaskStatusFilterChange
}) => {
  return (
    <Card style={{ borderRadius: 0, marginBottom: 16 }}>
      {/* Main Row with Logo, Title, and Main Filters */}
      <Row justify="space-between" align="middle" style={{ width: '100%' }}>
        <Col>
          <Link to="/TMM">
            <img 
              src={cars24Logo} 
              alt="Cars24 Logo" 
              style={{ margin: '16px 0', height: '40px', cursor: 'pointer' }} 
            />
          </Link>
        </Col>
        <Col>
          <Title level={3} style={{ margin: '16px 0' }}>SLA Monitoring Dashboard</Title>
        </Col>
        <Col>
          <Space size="large">
            <Space>
              {/* Channel Select */}
              <Select
                placeholder="Select channel"
                value={channel || undefined}
                onChange={onChannelChange}
                style={{ width: 120, display: 'inline-block' }}
                allowClear
              >
                <Option value="D2C">D2C</Option>
                <Option value="C2C">C2C</Option>
                <Option value="DCF">DCF</Option>
                <Option value="BT">BT</Option>
                <Option value="LAC">LAC</Option>
              </Select>
              
              {/* Days and Application Status Filters */}
              <Space size="small">
                <Select
                  placeholder="Select Days"
                  value={daysFilter}
                  onChange={onDaysFilterChange}
                  style={{ width: 140 }}
                >
                  <Option value={7}>Last 7 days</Option>
                  <Option value={15}>Last 15 days</Option>
                  <Option value={30}>Last 30 days</Option>
                </Select>
                
                <Select
                  placeholder="Application Status"
                  value={appStatusFilter}
                  onChange={onAppStatusFilterChange}
                  style={{ width: 140 }}
                >
                  <Option value="Pending">Pending</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Approved">Approved</Option>
                </Select>
                
                <Button type="primary" onClick={onLoadData} loading={loading}>
                  Apply Filters
                </Button>
              </Space>
            </Space>

            {data && (
              <Card size="small" style={{ background: '#f0f5ff', borderColor: '#d6e4ff' }}>
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Total Average Turnaround Time:</Text>
                  <Text strong style={{ color: '#1890ff' }}>{data.averageTAT}</Text>
                </Space>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* New Row for the Global Task Status Filter */}
      <Row style={{ marginTop: 8, marginBottom: 8 }}>
        <Col>
          <Space>
            <Text strong>Task Status:</Text>
            <Select
              placeholder="Task Status"
              value={taskStatusFilter}
              onChange={onTaskStatusFilterChange}
              style={{ width: 150 }}
            >
              <Option value="all">All</Option>
              <Option value="todo">Todo</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default DashboardHeader;
