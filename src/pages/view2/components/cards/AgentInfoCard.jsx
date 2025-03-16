import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const AgentInfoCard = ({ agentId, timeFrame }) => {
  return (
    <div className="mb-4">
      <Card>
        <div className="flex items-center justify-between">
          <Title level={4} style={{ margin: 0 }}>Agent ID: {agentId}</Title>
          <Text type="secondary">Showing data for last {timeFrame} days</Text>
        </div>
      </Card>
    </div>
  );
};

export default AgentInfoCard;