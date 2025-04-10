import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {DashboardFooter } from '../ActorMetrics/components';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { cars24Logo } from '../../assets';
import { Layout, Form, Input, Button, Typography, Spin, Alert, Divider} from 'antd';

const {Content, Header} = Layout;
const{Title, Text} = Typography;

const themeValues = {
  background: 'linear-gradient(to bottom right, #f0f5ff, #ffffff, #f0f7ff)',
  headerBackground: 'rgba(255, 255, 255, 0.95)',
  headerShadow: '0 2px 8px rgba(0,0,0,0.06)',
  primaryText: 'rgba(0, 0, 0, 0.85)',
  secondaryText: 'rgba(0, 0, 0, 0.65)',
  tertiaryText: 'rgba(0, 0, 0, 0.45)',
  accentColor: '#1890ff',
  dividerColor: '#f0f0f0',
  cardBackground: '#fff',
  cardBorder: '#f0f0f0',
  cardShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  particleColor: 'rgba(24, 144, 255, 0.12)',
};

function Login({ setIsAuthenticated }) {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);
   
    try {
      const response = await axios.post('http://localhost:8081/api/login', values, {
        withCredentials: true // Important for cookies
      });
     
      if (response.data.success) {
        setIsAuthenticated(true);
        navigate('/TMM');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: themeValues.headerBackground,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: themeValues.headerShadow,
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: '68px',
          maxWidth: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
            <img
              src={cars24Logo}
              alt="Cars24 Logo"
              style={{ margin: '16px 0', height: '40px', cursor: 'pointer' }}
            />
            <Divider
              type="vertical"
              style={{
                height: '24px',
                margin: '0 16px',
                background: themeValues.dividerColor
              }}
            />
          </div>
          
          
          <div style={{ flex: 1, textAlign: 'center', marginRight: '90px' }}>
            <Text
              strong
              style={{
                fontSize: '28px',
                color: themeValues.primaryText
              }}
            >
              Task Management Module
            </Text>
          </div>
          
          
          <div style={{ flex: '0 0 auto' }}>
          
          </div>
        </div>
      </Header>
      
      <Content style={{ backgroundColor: '#f0f5ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '32px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
          width: '400px',
          maxWidth: '90%'
        }}>
          
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
            Login
          </Title>
          
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: '24px' }}
            />
          )}
          
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Email" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Password" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ width: '100%', height: '40px' }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
      
      <DashboardFooter />
    </Layout>
  );
}

export default Login;