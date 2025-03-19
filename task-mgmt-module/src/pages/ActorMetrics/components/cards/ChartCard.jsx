import React from 'react';
import { Card, Button, Tooltip } from 'antd';
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsToolTip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ChartCard = ({ title, chartType, data, dataKeys, colors, height = 300, info, tooltipFormatter}) => {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${label}`}</p>
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

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="task" interval={0} angle={-45} textAnchor="end"/>
          <YAxis />
          {tooltipFormatter ? (
            <RechartsToolTip content={<CustomTooltip />} />
          ) : (
            <RechartsToolTip />
          )}
          <Legend align="center" verticalAlign="top" />
          {dataKeys.map((key, index) => (
            <Line 
              key={key.dataKey}
              type="monotone" 
              dataKey={key.dataKey} 
              name={key.name} 
              stroke={colors[index] || '#1890ff'} 
              strokeDasharray={key.dashed ? "5 5" : undefined}
              activeDot={key.activeDot ? { r: 8 } : undefined}
            />
          ))}
        </LineChart>
      );
    }
    
    if (chartType === 'bar') {
      return (
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="task" interval={0} angle={-45} textAnchor="end"/>
          <YAxis />
          <RechartsToolTip />
          <Legend  align="center" verticalAlign="top" />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key.dataKey}
              dataKey={key.dataKey} 
              name={key.name} 
              fill={colors[index] || '#1890ff'} 
            />
          ))}
        </BarChart>
      );
    }
    
    return null;
  };

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
    >
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ChartCard;