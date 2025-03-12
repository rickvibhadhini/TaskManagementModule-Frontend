import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Select, 
  Input, 
  Button, 
  Table, 
  Statistic, 
  Divider,
  Row,
  Col,
  Badge
} from 'antd';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  WarningOutlined,
  SearchOutlined,
  ReloadOutlined,
  FieldTimeOutlined,
  RetweetOutlined,
  AuditOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const AgentMetricsDashboard = () => {
  // Mock states
  const [timeFrame, setTimeFrame] = useState('30');
  const [agentId, setAgentId] = useState('AGT-12345');
  
  // Mock data
  const mockTaskCompletionData = 287;
  const mockEfficiencyScore = 85;
  const mockErrorRate = 3.2;
  
  const mockFastestTask = { id: 'TSK-78943', duration: '1m 23s' };
  const mockSlowestTask = { id: 'TSK-23567', duration: '14m 32s' };
  
  const mockMostRetriedTask = { id: 'TSK-45678', retries: 6 };
  const mockLeastRetriedTask = { id: 'TSK-65432', retries: 0 };
  
  const mockTaskTimeData = [
    { task: 'Document Verification', agent: 4.2, threshold: 5.0 },
    { task: 'Customer Onboarding', agent: 7.8, threshold: 8.5 },
    { task: 'Contract Review', agent: 12.3, threshold: 10.1 },
    { task: 'Quality Check', agent: 3.1, threshold: 4.0 },
    { task: 'Payment Processing', agent: 2.5, threshold: 2.8 },
    { task: 'Complaint Resolution', agent: 9.7, threshold: 8.0 },
  ];
  
  const mockRetriesData = [
    { task: 'Document Verification', agent: 1.2, threshold: 2.0 },
    { task: 'Customer Onboarding', agent: 0.8, threshold: 1.5 },
    { task: 'Contract Review', agent: 2.3, threshold: 1.1 },
    { task: 'Quality Check', agent: 0.5, threshold: 1.0 },
    { task: 'Payment Processing', agent: 0.2, threshold: 0.8 },
    { task: 'Complaint Resolution', agent: 1.7, threshold: 1.0 },
  ];
  
  const mockPendingTasks = [
    { key: '1', taskName: 'Document Verification', applicationId: 'APP-78943' },
    { key: '2', taskName: 'Customer Onboarding', applicationId: 'APP-65432' },
    { key: '3', taskName: 'Contract Review', applicationId: 'APP-98765' },
    { key: '4', taskName: 'Quality Check', applicationId: 'APP-23456' },
    { key: '5', taskName: 'Payment Processing', applicationId: 'APP-34567' },
  ];
  
  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Application ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="link" icon={<SearchOutlined />}>View Details</Button>,
    },
  ];

  const handleTimeFrameChange = (value) => {
    setTimeFrame(value);
  };

  const handleAgentIdChange = (e) => {
    setAgentId(e.target.value);
  };
  
  const getEfficiencyColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };
  
  const getErrorRateColor = (rate) => {
    if (rate <= 3) return '#52c41a';
    if (rate <= 7) return '#faad14';
    return '#f5222d';
  };

  return (
    <Layout className="min-h-screen style={{backgroundColor: 'white'}}">
      <Header className="flex items-center justify-between" style={{ backgroundColor: '#001529', padding: '0 48px', width: '100%', height: '64px' }}>
        <div className="flex items-center space-x-6">
          {/* CARS24 Logo */}
          <div className="mr-6 flex items-center">
            <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="140" height="40" fill="#FB4E29" />
              <path d="M20.4 28C17.36 28 14.88 27.04 12.96 25.12C11.04 23.2 10.08 20.72 10.08 17.68C10.08 14.64 11.04 12.16 12.96 10.24C14.88 8.32 17.36 7.36 20.4 7.36C22.88 7.36 25.04 8.08 26.88 9.52C28.74 10.94 29.92 12.86 30.4 15.28H25.52C25.2 14.16 24.58 13.3 23.68 12.7C22.78 12.1 21.68 11.8 20.4 11.8C18.56 11.8 17.02 12.38 15.76 13.54C14.52 14.7 13.9 16.06 13.9 17.62C13.9 19.18 14.52 20.56 15.76 21.74C17.02 22.9 18.56 23.48 20.4 23.48C21.68 23.48 22.76 23.16 23.66 22.54C24.58 21.9 25.2 21.02 25.52 19.9H30.4C29.92 22.32 28.74 24.26 26.88 25.7C25.04 27.14 22.88 27.88 20.4 27.88V28Z" fill="white" />
              <path d="M36.11 27.76H32.47V7.6H42.13C43.93 7.6 45.37 8.12 46.47 9.16C47.57 10.2 48.13 11.52 48.13 13.14C48.13 14.76 47.57 16.08 46.47 17.12C45.37 18.16 43.93 18.68 42.13 18.68H36.11V27.76ZM36.11 15.08H41.67C42.39 15.08 42.93 14.86 43.31 14.44C43.69 14 43.89 13.42 43.89 12.7C43.89 11.98 43.69 11.4 43.31 10.96C42.93 10.52 42.39 10.32 41.67 10.32H36.11V15.08Z" fill="white" />
              <path d="M60.7 7.6H64.42V27.76H60.36V13.54L55.04 21.98H54.48L49.16 13.54V27.76H45.1V7.6H48.82L54.76 17L60.7 7.6Z" fill="white" />
              <path d="M67.48 7.6H79.58V11.02H71.28V15.5H78.46V18.92H71.28V24.34H79.58V27.76H67.48V7.6Z" fill="white" />
              <path d="M95.8 7.6C97.64 7.6 99.18 8.18 100.42 9.34C101.66 10.5 102.28 11.82 102.28 13.3C102.28 14.78 101.66 16.12 100.42 17.28C99.18 18.44 97.64 19.02 95.8 19.02H89.98V27.76H86.22V7.6H95.8ZM95.8 15.6C96.52 15.6 97.1 15.38 97.52 14.96C97.94 14.52 98.16 13.96 98.16 13.3C98.16 12.64 97.94 12.1 97.52 11.66C97.1 11.22 96.52 11 95.8 11H89.98V15.6H95.8Z" fill="white" />
            </svg>
          </div>
          <Title level={3} style={{ margin: 0, color: 'white' }}>Agent Metrics Dashboard</Title>
        </div>
        <div className="flex items-center space-x-4">
          <Input 
            placeholder="Enter Agent ID" 
            value={agentId} 
            onChange={handleAgentIdChange} 
            addonAfter={<Button type="primary" icon={<SearchOutlined />}>Search</Button>} 
            style={{ width: 300 }}
          />
          <Select 
            defaultValue="30" 
            style={{ width: 180 }} 
            onChange={handleTimeFrameChange}
          >
            <Option value="7">Last 7 Days</Option>
            <Option value="14">Last 14 Days</Option>
            <Option value="30">Last 30 Days</Option>
          </Select>
        </div>
      </Header>
      
      <Content className="p-6" style={{ backgroundColor: 'white', width: '100%', padding: '24px 48px' }}>
        <div className="mb-4">
          <Card>
            <div className="flex items-center justify-between">
              <Title level={4} style={{ margin: 0 }}>Agent ID: {agentId}</Title>
              <Text type="secondary">Showing data for last {timeFrame} days</Text>
            </div>
          </Card>
        </div>
        
        <div className="mb-8">
          <Row gutter={24}>
            <Col span={8}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Total Tasks Completed"
                  value={mockTaskCompletionData}
                  prefix={<CheckCircleOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="mt-2">
                  <Badge status="processing" text={`Last updated: Today at 10:23 AM`} />
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Task Efficiency Score"
                  value={mockEfficiencyScore}
                  suffix="/100"
                  prefix={<AuditOutlined className="text-green-500" />}
                  valueStyle={{ color: getEfficiencyColor(mockEfficiencyScore) }}
                />
                <div className="mt-2">
                  <Progress 
                    percent={mockEfficiencyScore} 
                    status={mockEfficiencyScore >= 80 ? "success" : mockEfficiencyScore >= 60 ? "normal" : "exception"} 
                    showInfo={false}
                  />
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Error Rate Per Task"
                  value={mockErrorRate}
                  suffix="%"
                  prefix={<WarningOutlined className="text-orange-500" />}
                  valueStyle={{ color: getErrorRateColor(mockErrorRate) }}
                />
                <div className="mt-2">
                  <Progress 
                    percent={(10 - mockErrorRate) * 10} 
                    status={mockErrorRate <= 3 ? "success" : mockErrorRate <= 7 ? "normal" : "exception"} 
                    showInfo={false}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        <div className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Card 
                title="Task Duration Metrics" 
                extra={<Button type="text" icon={<ReloadOutlined />} />}
                className="h-full shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col space-y-6">
                  <div className="flex space-x-6">
                    <div className="flex-1 border p-4 rounded-lg bg-blue-50">
                      <Title level={5}>Fastest Task</Title>
                      <div className="flex items-center">
                        <ClockCircleOutlined className="text-green-500 text-2xl mr-2" />
                        <div>
                          <Text strong>{mockFastestTask.id}</Text>
                          <br />
                          <Text>{mockFastestTask.duration}</Text>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 border p-4 rounded-lg bg-blue-50">
                      <Title level={5}>Slowest Task</Title>
                      <div className="flex items-center">
                        <FieldTimeOutlined className="text-red-500 text-2xl mr-2" />
                        <div>
                          <Text strong>{mockSlowestTask.id}</Text>
                          <br />
                          <Text>{mockSlowestTask.duration}</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card 
                title="Task Retry Metrics" 
                extra={<Button type="text" icon={<ReloadOutlined />} />}
                className="h-full shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col space-y-6">
                  <div className="flex space-x-6">
                    <div className="flex-1 border p-4 rounded-lg bg-orange-50">
                      <Title level={5}>Most Retried Task</Title>
                      <div className="flex items-center">
                        <RetweetOutlined className="text-red-500 text-2xl mr-2" />
                        <div>
                          <Text strong>{mockMostRetriedTask.id}</Text>
                          <br />
                          <Text>{mockMostRetriedTask.retries} retries</Text>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 border p-4 rounded-lg bg-orange-50">
                      <Title level={5}>Least Retried Task</Title>
                      <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />
                        <div>
                          <Text strong>{mockLeastRetriedTask.id}</Text>
                          <br />
                          <Text>{mockLeastRetriedTask.retries} retries</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        <div className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Average Task Time (minutes)" extra={<Button type="text" icon={<ReloadOutlined />} />}>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockTaskTimeData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="task" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="agent" stroke="#1890ff" name="Agent Performance" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="threshold" stroke="#ff7875" name="Team Threshold" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Average Retries Per Task" extra={<Button type="text" icon={<ReloadOutlined />} />}>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockRetriesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="task" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="agent" name="Agent Performance" fill="#1890ff" />
                      <Bar dataKey="threshold" name="Team Threshold" fill="#ff7875" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        <div>
          <Card 
            title="Pending Tasks" 
            extra={
              <div>
                <Badge count={mockPendingTasks.length} style={{ backgroundColor: '#faad14', marginRight: '8px' }} />
                <Button type="primary" icon={<ReloadOutlined />}>Refresh</Button>
              </div>
            }
          >
            <Table 
              columns={columns} 
              dataSource={mockPendingTasks} 
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', backgroundColor: 'white' }}>
        CARS24 Agent Metrics Dashboard ©2025
      </Footer>
    </Layout>
  );
};

// Helper component to avoid error with missing Progress component
const Progress = ({ percent, status, showInfo }) => {
  const getBackgroundColor = () => {
    if (status === 'success') return '#52c41a';
    if (status === 'normal') return '#1890ff';
    return '#f5222d';
  };
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="h-2.5 rounded-full" 
        style={{ 
          width: `${percent}%`, 
          backgroundColor: getBackgroundColor()
        }}
      ></div>
    </div>
  );
};

export default AgentMetricsDashboard;