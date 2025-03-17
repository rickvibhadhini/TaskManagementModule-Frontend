import React from 'react';
import { Card, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ChartCard = ({ title, chartType, data, dataKeys, colors, height = 300 }) => {
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
          <Tooltip />
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
          <Tooltip />
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
    <Card title={title}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ChartCard;