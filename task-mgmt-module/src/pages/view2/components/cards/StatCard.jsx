import React from 'react';
import { Card, Statistic, Badge } from 'antd';
import { AuditOutlined } from '@ant-design/icons';

const Progress = ({ percent, status }) => {
  const getBackgroundColor = () => {
    if (status === 'success') return '#52c41a';
    if (status === 'normal') return '#1890ff';
    return '#f5222d';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div 
        className="h-2.5 rounded-full transition-all duration-300" 
        style={{ 
          width: `${Math.min(100, Math.max(0, percent))}%`,
          backgroundColor: getBackgroundColor(),
        }}
      ></div>
    </div>
  );
};

const StatCard = ({ title, value, prefix, suffix, valueStyle, showProgress, progressPercent, progressStatus, badgeText }) => {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <Statistic
        title={title}
        value={value ?? 0}
        prefix={prefix}
        suffix={suffix}
        valueStyle={valueStyle}
      />
      
      {showProgress && (
        <div className="mt-3 w-full">
          <Progress 
            percent={Math.min(100, Math.max(0, progressPercent ?? 0))}
            status={progressStatus} 
          />
        </div>
      )}

      {badgeText && (
        <div className="mt-2">
          <Badge status="processing" text={badgeText} />
        </div>
      )}
    </Card>
  );
};

export default StatCard;
