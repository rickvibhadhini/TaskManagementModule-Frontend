import React from 'react';
import { Card, Tooltip } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const Progress = ({ percent, status }) => {
  const getBackgroundColor = () => {
    if (status === 'success') return '#52c41a';
    if (status === 'normal') return '#1890ff';
    return '#f5222d';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className="h-2 rounded-full transition-all duration-300" 
        style={{ 
          width: `${Math.min(100, Math.max(0, percent))}%`,
          backgroundColor: getBackgroundColor(),
        }}
      ></div>
    </div>
  );
};

const SystemStatCard = ({ title, value, prefix, suffix, valueStyle, showProgress, progressPercent, progressStatus, info }) => {
  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow p-2" style={{ minHeight: '80px' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {info && (
            <Tooltip title={info}>
              <InfoCircleOutlined style={{ color: 'black', cursor: 'pointer', fontSize: '14px' }} />
            </Tooltip>
          )}
          <span style={{ color: 'black', fontWeight: 'bold' }}>{title}:</span>
          <span style={{ color: 'black', fontSize: '24px', fontWeight: 'bold' }}>
            {value ?? 0}
          </span>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
        </div>
      </div>

      {showProgress && (
        <div className="mt-2 w-full">
          <Progress 
            percent={Math.min(100, Math.max(0, progressPercent ?? 0))} 
            status={progressStatus} 
          />
        </div>
      )}
    </Card>
  );
};

export default SystemStatCard;
