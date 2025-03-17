import React, { useMemo, useRef } from 'react';
import { Card, Space, Radio, Table, Tag, Button } from 'antd';
import { TableOutlined, LineChartOutlined, ExclamationCircleOutlined, CheckCircleFilled, WarningFilled, CloseCircleFilled } from '@ant-design/icons';

const DashboardTable = ({ 
  data, 
  selectedFunnel, 
  setSelectedFunnel, 
  funnelColors, 
  funnelOrder, 
  setSelectedTask, 
  setShowDetailModal,
  toggleView,
  getButtonColor
}) => {
  const tableRef = useRef(null);

  // Conversion function handles days, hrs, min, sec.
  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    let totalMinutes = 0;
    for (let i = 0; i < parts.length; i += 2) {
      const value = parseFloat(parts[i]);
      const unit = parts[i + 1] || '';
      if (unit.startsWith('day')) totalMinutes += value * 1440;
      else if (unit.startsWith('hrs')) totalMinutes += value * 60;
      else if (unit.startsWith('min')) totalMinutes += value;
      else if (unit.startsWith('sec')) totalMinutes += value / 60;
    }
    return totalMinutes;
  };

  const getTATMinutes = useMemo(() => {
    if (!data || !data.averageTAT) return 100; 
    return convertTimeToMinutes(data.averageTAT);
  }, [data]);

  // Only process funnels included in funnelOrder.
  const getTableData = useMemo(() => {
    if (!data || !data.funnels) return [];
    const totalTAT = getTATMinutes;
    const tableData = [];
    Object.entries(data.funnels).forEach(([funnel, funnelData]) => {
      if (!funnelOrder.includes(funnel)) return;
      if (!funnelData) return;
      const tasks = funnelData.tasks || {};
      Object.entries(tasks).forEach(([taskId, taskData]) => {
        const minutes = convertTimeToMinutes(taskData.timeTaken);
        const percentOfTAT = (minutes / totalTAT) * 100;
        let performanceLevel = "good"; 
        if (percentOfTAT >= 90) {
          performanceLevel = "critical";
        } else if (percentOfTAT >= 60) {
          performanceLevel = "warning"; 
        }
        tableData.push({
          key: taskId,
          taskId,
          funnel,
          displayName: taskId,
          time: taskData.timeTaken,
          minutes,
          percentOfTAT,
          sendbacks: taskData.noOfSendbacks,
          performanceLevel
        });
      });
    });
    return tableData;
  }, [data, getTATMinutes, funnelOrder]);

  const getFilteredTableData = useMemo(() => {
    if (!getTableData || !Array.isArray(getTableData)) return [];
    return selectedFunnel === 'all' 
      ? getTableData 
      : getTableData.filter(item => item.funnel === selectedFunnel);
  }, [getTableData, selectedFunnel]);

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: funnelColors[record.funnel] || '#000', 
            display: 'inline-block',
            marginRight: 8
          }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Average Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '% of TAT',
      dataIndex: 'percentOfTAT',
      key: 'percentOfTAT',
      render: (percent) => `${percent.toFixed(1)}%`,
      sorter: (a, b) => a.percentOfTAT - b.percentOfTAT,
    },
    {
      title: 'Total Sendbacks',
      dataIndex: 'sendbacks',
      key: 'sendbacks',
      render: (sendbacks) => (
        <Space>
          {sendbacks > 2 && <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
          {sendbacks}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'performanceLevel',
      key: 'performanceLevel',
      render: (status) => {
        let color = 'success';
        let icon = <CheckCircleFilled />;
        if (status === 'critical') {
          color = 'error';
          icon = <CloseCircleFilled />;
        } else if (status === 'warning') {
          color = 'warning';
          icon = <WarningFilled />;
        }
        return (
          <Tag icon={icon} color={color}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedTask({
              ...record,
              name: record.displayName,
              displayTime: record.time,
            });
            setShowDetailModal(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div ref={tableRef}>
      <Card 
        title={
          <Space>
            <TableOutlined />
            <span>Task Metrics</span>
          </Space>
        }
        hoverable
        extra={
          <Space>
            <Radio.Group 
              value={selectedFunnel}
              onChange={(e) => setSelectedFunnel(e.target.value)}
              optionType="button"
              buttonStyle="outline"
              size="small"
            >
              <Radio.Button 
                value="all" 
                style={{ 
                  backgroundColor: selectedFunnel === 'all' ? '#1890ff' : undefined,
                  borderColor: selectedFunnel === 'all' ? '#1890ff' : undefined,
                  color: selectedFunnel === 'all' ? '#ffffff' : undefined
                }}
              >
                All
              </Radio.Button>
              {funnelOrder.map(funnel => (
                <Radio.Button 
                  key={funnel} 
                  value={funnel}
                  style={{ 
                    backgroundColor: selectedFunnel === funnel ? funnelColors[funnel] : undefined,
                    borderColor: selectedFunnel === funnel ? funnelColors[funnel] : undefined,
                    color: selectedFunnel === funnel ? '#ffffff' : undefined
                  }}
                >
                  {funnel.charAt(0).toUpperCase() + funnel.slice(1)}
                </Radio.Button>
              ))}
            </Radio.Group>
            
            <Button 
              type="primary" 
              icon={<LineChartOutlined />} 
              onClick={toggleView}
              style={{ 
                backgroundColor: getButtonColor(selectedFunnel),
                borderColor: getButtonColor(selectedFunnel)
              }}
            >
              View Charts
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={getFilteredTableData} 
          pagination={{ pageSize: 10 }}
          scroll={{ y: 'calc(100vh - 300px)' }}
        />
      </Card>
    </div>
  );
};

export default DashboardTable;
