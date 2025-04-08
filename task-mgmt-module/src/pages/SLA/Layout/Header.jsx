// src/components/Layout/Header.jsx
import React from 'react';
import { Layout, Typography, Button, Card, Space, Alert, Select, Row, Col } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { cars24Logo } from "../../../assets/index";

const { Header } = Layout;
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
  onAppStatusFilterChange
}) => {
  return (
    <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
      <Row justify="space-between" align="middle">
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
              <Select
                placeholder="Select channel"
                value={channel || undefined}
                onChange={onChannelChange}
                style={{ width: 120, display: 'inline-block' }}
                options={[
                  { value: 'ALL', label: 'ALL' },
                  { value: 'D2C', label: 'D2C' },
                  { value: 'C2C', label: 'C2C' },
                  { value: 'DCF', label: 'DCF' },
                  { value: 'BT', label: 'BT' },
                  { value: 'LAC', label: 'LAC' },
                ]}
                allowClear
              />
              
              {/* New Days and Application Status filters */}
              <Space size="small">
                <Select
                  placeholder="Select Days"
                  value={daysFilter}
                  onChange={onDaysFilterChange}
                  style={{ width: 140 }}
                  options={[
                    { value: 7, label: 'Last 7 days' },
                    { value: 15, label: 'Last 15 days' },
                    { value: 30, label: 'Last 30 days' },
                  ]}
                />
                
                <Select
                  placeholder="Application Status"
                  value={appStatusFilter}
                  onChange={onAppStatusFilterChange}
                  style={{ width: 140 }}
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Rejected', label: 'Rejected' },
                    { value: 'Approved', label: 'Approved' },
                  ]}
                />
              </Space>
              
              <Button type="primary" onClick={onLoadData} loading={loading}>
                Apply Filters
              </Button>
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
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Header>
  );
};

export default DashboardHeader;
