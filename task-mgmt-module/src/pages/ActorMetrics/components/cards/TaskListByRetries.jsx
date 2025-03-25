import React, { useState } from "react";
import { Card, Typography, Tooltip, Divider, Button, Input } from "antd";
import { InfoCircleOutlined, RetweetOutlined, DownOutlined, UpOutlined, SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TaskRetriesByCount = ({ tasksByRetries, info }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStates, setExpandedStates] = useState({});

  const toggleExpand = (count) => {
    setExpandedStates((prev) => ({
      ...prev,
      [count]: !prev[count],
    }));
  };

  const groupedTasks = {};
  
  if (tasksByRetries && Array.isArray(tasksByRetries)) {
    tasksByRetries.forEach(task => {
      const count = task.visited;
      if (!groupedTasks[count]) {
        groupedTasks[count] = [];
      }
      if (!groupedTasks[count].some(t => t.task_id === task.task_id)) {
        groupedTasks[count].push(task);
      }
    });
  }

  const sortedCounts = Object.keys(groupedTasks)
    .map(Number)
    .sort((a, b) => b - a);

  const filteredTasks = {};
  sortedCounts.forEach(count => {
    filteredTasks[count] = groupedTasks[count].filter(task =>
      task.task_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Card
      className="h-auto shadow-sm hover:shadow-lg transition-shadow"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="flex items-center mt-2">
            <RetweetOutlined className="text-blue-500 mr-2" />
            <Title level={5} className="m-0">Tasks Grouped by Retry Count</Title>
          </div>
          <Tooltip title={info}>
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </div>
      }
    >
      <Input
        placeholder="Search tasks..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <div>
        {sortedCounts.length > 0 ? (
          sortedCounts.map((count, index) => {
            const expanded = expandedStates[count] || false;
            const tasks = filteredTasks[count];
            if (tasks.length === 0) return null;

            const visibleTasks = expanded ? tasks : tasks.slice(0, 4);

            return (
              <div key={count} className="mb-4">
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                      count === 0 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    } text-xl font-bold mr-4`}
                  >
                    {count}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium text-gray-700 mb-1">
                      {count === 0 ? "No retries" : count === 1 ? "1 retry" : `${count} retries`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visibleTasks.map((task) => (
                        <span
                          key={task.task_id}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {task.task_id.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                    {tasks.length > 4 && (
                      <Button
                        type="link"
                        onClick={() => toggleExpand(count)}
                        className="mt-2"
                      >
                        {expanded ? "Show less" : "Show more"} {expanded ? <UpOutlined /> : <DownOutlined />}
                      </Button>
                    )}
                  </div>
                </div>
                {index < sortedCounts.length - 1 && <Divider className="my-4" />}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">No retry data available</div>
        )}
      </div>
    </Card>
  );
};

export default TaskRetriesByCount;
