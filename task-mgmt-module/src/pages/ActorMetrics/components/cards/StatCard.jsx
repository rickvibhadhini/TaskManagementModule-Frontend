import React from 'react';
import { Card, Statistic, Badge, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

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

const StatCard = ({ title, value, prefix, suffix, valueStyle, showProgress, progressPercent, progressStatus, info }) => {
  return (
    <Card className="h-full shadow-sm hover:shadow-lg transition-shadow">
      <Statistic
        title={
          <div className="flex items-center gap-1">
            <span style={{ color: 'black', fontWeight: 'bold' }}>{title}</span>
            {info && (
              <Tooltip title={info}>
                <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer', fontSize: '14px' }} />
              </Tooltip>
            )}
          </div>
        }
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
    </Card>
  );
};

export default StatCard;
