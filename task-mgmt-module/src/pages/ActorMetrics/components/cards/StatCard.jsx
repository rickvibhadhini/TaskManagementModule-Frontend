import React from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const Progress = ({ percent, status }) => {
  const getBackgroundColor = () => {
    if (percent >= 90) return '#237804';  // Dark Green
    if (percent > 75) return '#52c41a';  // Green
    if (percent > 49) return '#fa8c16';  // Orange
    if (percent >= 25) return '#f5222d'; // Red
    return '#d9d9d9';  // Gray for values below 25
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

const StatCard = ({ title, value, prefix, suffix, valueStyle, showProgress, progressPercent, progressStatus, info }) => {
  const getTextColor = () => {
    if (progressPercent >= 90) return '#237804'; 
    if (progressPercent > 75) return '#52c41a'; 
    if (progressPercent > 49) return '#fa8c16'; 
    if (progressPercent >= 25) return '#f5222d'; 
    return 'black';
  };

  return (
    <Card className="h-full shadow-sm hover:shadow-lg transition-shadow">
      <Statistic
        title={
          <div className="flex items-center gap-1">
            <span style={{ color: 'black', fontWeight: 'bold' }}>{title}</span>
            {info && (
              <Tooltip title={info}>
                <InfoCircleOutlined style={{ color: 'black', cursor: 'pointer', fontSize: '14px' }} />
              </Tooltip>
            )}
          </div>
        }
        value={value ?? 0}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ ...valueStyle, color: getTextColor(), fontWeight: 'bold' }}
      />
      
      {showProgress && (
        <div className="mt-3 w-full">
          <Progress 
            percent={Math.min(100, Math.max(0, progressPercent ?? 0))} 
            status={progressStatus} 
          />
        </div>
      )}
    </Card>
  );
};

export default StatCard;
