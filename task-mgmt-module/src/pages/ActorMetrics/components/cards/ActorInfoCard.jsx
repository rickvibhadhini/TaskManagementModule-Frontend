import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const AgentInfoCard = ({ agentId, agentType, timeFrame }) => {
  return (
    <div className="mb-4">
      <Card>
        <div className="flex items-center justify-between">
          <Title level={4} style={{ margin: 0 }}>Actor ID: {agentId}</Title>
          <Title level={4} style={{ margin: 0 }}>Actor Type: {agentType}</Title>
          <Text type="secondary">Showing data for last {timeFrame} days</Text>
        </div>
      </Card>
    </div>
  );
};

export default AgentInfoCard;