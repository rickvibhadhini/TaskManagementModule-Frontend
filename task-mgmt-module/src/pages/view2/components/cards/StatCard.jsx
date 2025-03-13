import React from 'react';
import { Card, Statistic, Badge } from 'antd';

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

const StatCard = ({ title, value, prefix, suffix, valueStyle, showProgress, progressPercent, progressStatus, badgeText }) => {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={valueStyle}
      />
      {showProgress && (
        <div className="mt-2">
          <Progress 
            percent={progressPercent} 
            status={progressStatus} 
            showInfo={false}
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