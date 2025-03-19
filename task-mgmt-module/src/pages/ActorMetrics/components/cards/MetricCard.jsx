import React from 'react';
import { Card, Typography, Button, Tooltip } from 'antd';
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MetricItem = ({ title, icon, id, value, bgColorClass }) => (
  <div className={`flex-1 border p-4 rounded-lg ${bgColorClass}`}>
    <Title level={5}>{title}</Title>
    <div className="flex items-center">
      {icon}
      <div>
        <Text strong>{id}</Text>
        <br />
        <Text>{value}</Text>
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, items, info}) => {
  return (
    <Card 
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {title}
          <Tooltip title={info}>
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </div>
    } 
      // extra={<Button type="text" icon={<ReloadOutlined />} />}
      className="h-full shadow-sm hover:shadow-md transition-shadow"
      
    >
      <div className="flex flex-col space-y-6">
        <div className="flex space-x-6">
          {items.map((item, index) => (
            <MetricItem 
              key={index}
              title={item.title}
              icon={item.icon}
              id={item.id}
              value={item.value}
              bgColorClass={item.bgColorClass}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;