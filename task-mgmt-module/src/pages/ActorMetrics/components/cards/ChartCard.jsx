import React from 'react';
import { Card, Tooltip } from 'antd';
import { InfoCircleOutlined, StarFilled } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsToolTip,
  Legend,
  Cell,
  LabelList,
} from 'recharts';

const ChartCard = ({ title, chartType, data, dataKeys, colors, height = 300, info, tooltipFormatter}) => {
  // Ensure we have data and valid dataKeys
  if (!dataKeys || dataKeys.length === 0 || !data || data.length === 0) {
    return (
      <Card title={title} bodyStyle={{ height, padding: '12px' }}>
        <div className="flex justify-center items-center h-full">
          No data available
        </div>
      </Card>
    );
  }

  // Sort data in descending order based on system performance
  const sortedData = [...data].sort((a, b) => {
    const mainDataKey = dataKeys[0].dataKey;
    return b[mainDataKey] - a[mainDataKey];
  });
  
  // Calculate dynamic height based on data length to ensure proper spacing
  const barHeight = 40; // Height for each bar
  const minHeight = 300; // Minimum chart height
  const dynamicHeight = Math.max(minHeight, sortedData.length * barHeight);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-bold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${tooltipFormatter ? tooltipFormatter(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label for performance stars - only used if comparison data exists
  const renderCustomizedLabel = (props) => {
    if (!dataKeys[1]) return null;
    
    const { x, y, width, height, value, index, dataKey } = props;
    
    // Check if system performance is better than threshold
    const item = sortedData[index];
    const isBetter = item && item[dataKeys[0].dataKey] < item[dataKeys[1].dataKey];
    
    // Only show stars for system dataKey (not threshold)
    if (dataKey !== dataKeys[0].dataKey || !isBetter) return null;
    
    return (
      <g>
        <StarFilled 
          style={{ 
            fontSize: '16px', 
            fill: '#ffc107',
            stroke: '#000',
            strokeWidth: 0.5
          }} 
          x={x - 20} 
          y={y + height/2 - 8}
        />
      </g>
    );
  };

  const renderChart = () => {
    return (
      <div style={{ width: '100%', height: height, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ width: '100%', height: dynamicHeight }}>
          <BarChart
            width={600}
            height={dynamicHeight}
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="task" 
              width={75}
              tick={{ fontSize: 12 }}
              tickMargin={5}
            />
            {tooltipFormatter ? (
              <RechartsToolTip content={<CustomTooltip />} />
            ) : (
              <RechartsToolTip />
            )}
            <Legend />
            
            {/* Render all valid dataKeys */}
            {dataKeys.map((key, index) => {
              if (!key || !key.dataKey) return null;
              
              return (
                <Bar
                  key={key.dataKey}
                  dataKey={key.dataKey}
                  name={key.name}
                  fill={colors[index] || colors[0]}
                  strokeDasharray={key.dashed ? "5 5" : null}
                  barSize={20}
                >
                  {/* Custom star labels for performance indicators - only if comparative */}
                  {dataKeys.length > 1 && key.dataKey === dataKeys[0].dataKey && (
                    <LabelList
                      dataKey={key.dataKey}
                      position="insideLeft"
                      content={renderCustomizedLabel}
                    />
                  )}
                </Bar>
              );
            })}
          </BarChart>
        </div>
      </div>
    );
  };

  return (
    <Card
      title={title}
      extra={
        <div className="flex items-center">
          {info && (
            <Tooltip title={info}>
              <InfoCircleOutlined className="mr-2 text-gray-500" />
            </Tooltip>
          )}
        </div>
      }
      bodyStyle={{ height: height + 30, padding: '12px' }}
    >
      <div className="chart-container">
        {renderChart()}
      </div>
    </Card>
  );
};

export default ChartCard;