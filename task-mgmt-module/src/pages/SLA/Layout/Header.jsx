import React from 'react';
import { Layout, Typography, Button, Card, Space, Alert, Select, Row, Col, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { cars24Logo } from "../../../assets/index";

const { Header } = Layout;
const { Title, Text } = Typography;

const DashboardHeader = ({ channel, onChannelChange, onLoadData, data, error, loading }) => {
  return (
    <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Tooltip title="Back to Dashboard">
            <Link to="/">
              <img 
                src={cars24Logo} 
                alt="Cars24 Logo" 
                style={{ 
                  margin: '16px 0', 
                  height: '40px',
                  cursor: 'pointer' 
                }} 
              />
            </Link>
          </Tooltip>
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
                  { value: 'D2C', label: 'D2C' },
                  { value: 'C2C', label: 'C2C' },
                  { value: 'DCF', label: 'DCF' },
                ]}
                allowClear
              />
              <Button type="primary" onClick={onLoadData} loading={loading}>
                Load Data
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