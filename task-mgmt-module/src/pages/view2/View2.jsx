import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend, ResponsiveContainer } from "recharts";

const View2 = () => {
  const [agentId, setAgentId] = useState("201");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!agentId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8081/actorMetrics/${agentId}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();

        // Convert task_time_across_applications object into an array
        const timePerTask = Object.entries(result.task_time_across_applications || {}).map(([task, time]) => ({
          task,
          time: time / 60000, // Convert milliseconds to minutes
        }));

        // Convert task_frequency object into an array
        const taskFrequency = Object.entries(result.task_frequency || {}).map(([task, count]) => ({
          task,
          count,
        }));

        // Convert average_duration object into an array
        const avgDurationData = Object.entries(result.average_duration || {}).map(([appId, duration]) => ({
          application_id: appId,
          duration: duration / 60000, // Convert milliseconds to minutes
        }));

        setData({
          ...result,
          task_time_across_applications: timePerTask,
          task_frequency: taskFrequency,
          average_duration: avgDurationData, // Store formatted data
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agentId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="relative flex items-center justify-between mb-8">
          <div className="text-xl font-bold text-blue-600 border-2 border-blue-600 py-2 px-4 rounded">CARS24</div>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Agent Performance Metrics
          </h1>
        </header>

        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <label htmlFor="agent-id" className="font-semibold mr-4">Enter Agent ID:</label>
            <input
              type="text"
              id="agent-id"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="py-3 px-4 border-2 border-gray-200 rounded-lg w-64 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {loading && <p className="text-center text-blue-600">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tasks Completed */}
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <h2 className="text-lg font-semibold text-blue-600">No. of tasks completed</h2>
              <p className="text-6xl font-bold text-blue-600">{data.total_tasks_completed}</p>
            </div>

            {/* Task Frequency - Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-blue-600">Task Frequency</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.task_frequency}>
                  <XAxis dataKey="task" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Time for Tasks Across Applications - Line Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-blue-600">Time for Tasks Across Applications</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.task_time_across_applications}>
                  <XAxis dataKey="task" />
                  <YAxis domain={[0, 'auto']} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="time" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Average Duration per Application - Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-blue-600">Average Duration per Application</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.average_duration} barSize={40}>
                  <XAxis 
                    dataKey="application_id" 
                    padding={{ left: 30, right: 30 }} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 'auto']} 
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="duration" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>

            </div>

            {/* Task History Table */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-blue-600 mb-4">Task History</h2>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="p-3 text-left">Task Name</th>
                      <th className="p-3 text-left">Application ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tasks_assigned.map((task, index) => (
                      <tr key={index} className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="p-3">{task.task_name}</td>
                        <td className="p-3">{task.application_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default View2;
