
import React, { useState, useEffect } from 'react';


function App() {
  const [applicationId, setApplicationId] = React.useState("1234");
  const [activityLogs, setActivityLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [showVisualization, setShowVisualization] = React.useState(false);

  // Function to fetch activity logs based on application ID
  const fetchActivityLogs = (id) => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      if (id.trim() === "") {
        setError("Please enter a valid Application ID");
        setActivityLogs([]);
        setShowVisualization(false);
      } else {
        // For demo purposes, we'll use sample data
        const sampleLogs = [
          // Sourcing phase
          { id: 1, phase: "Sourcing", task: "Task 3", startTime: new Date("2023-01-01T02:47:00"), duration: 3, color: "#4A9BFF" },
          { id: 2, phase: "Sourcing", task: "Task 1", startTime: new Date("2023-01-01T12:21:00"), duration: 1, color: "#4A9BFF" },
          { id: 3, phase: "Sourcing", task: "Task 2", startTime: new Date("2023-01-01T03:00:00"), duration: 2, color: "#4A9BFF" },
          
          // Credit phase
          { id: 4, phase: "Credit", task: "Task 1", startTime: new Date("2023-01-01T05:30:00"), duration: 7, color: "#4CAF50" },
          { id: 5, phase: "Credit", task: "Task 2", startTime: new Date("2023-01-01T12:33:00"), duration: 2, color: "#4CAF50" },
          
          // Conversion phase
          { id: 6, phase: "Conversion", task: "Task 1", startTime: new Date("2023-01-01T01:30:00"), duration: 2, color: "#FFC107" },
          { id: 7, phase: "Conversion", task: "Task 2", startTime: new Date("2023-01-01T07:00:00"), duration: 3, color: "#FFC107" },
          
          // Fulfillment phase
          { id: 8, phase: "Fulfillment", task: "Task 1", startTime: new Date("2023-01-01T10:00:00"), duration: 1, color: "#9C27B0" },
          { id: 9, phase: "Fulfillment", task: "Task 2", startTime: new Date("2023-01-01T10:00:00"), duration: 1, color: "#9C27B0" },
          
          // Risk phase
          { id: 10, phase: "Risk", task: "Task 2", startTime: new Date("2023-01-01T01:30:00"), duration: 3, color: "#FF7043" },
          { id: 11, phase: "Risk", task: "Task 1", startTime: new Date("2023-01-01T12:30:00"), duration: 3, color: "#FF7043" },
          
          // Disbursal phase
          { id: 12, phase: "Disbursal", task: "Task 1", startTime: new Date("2023-01-01T05:30:00"), duration: 3, color: "#29B6F6" }
        ];
        
        // Calculate endTime for each task
        sampleLogs.forEach(log => {
          const endTime = new Date(log.startTime);
          endTime.setHours(endTime.getHours() + log.duration);
          log.endTime = endTime;
        });
        
        setActivityLogs(sampleLogs);
        setShowVisualization(true);
      }
      setLoading(false);
    }, 1000);
  };

  // Feedback paths - removed all text
  const feedbackPaths = [
    { from: "Credit", to: "Sourcing", yPercent: 18 },
    { from: "Conversion", to: "Credit", yPercent: 25 }
  ];

  // Funnel names (x-axis) in the correct order
  const phaseNames = ["Sourcing", "Credit", "Conversion", "Fulfillment", "Risk", "Disbursal"];

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchActivityLogs(applicationId);
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Get min and max timestamps for y-axis scale
  const getTimeRange = () => {
    if (activityLogs.length === 0) {
      return { 
        minTime: new Date("2023-01-01T00:00:00"), 
        maxTime: new Date("2023-01-01T15:00:00") 
      };
    }
    
    const allTimes = activityLogs.flatMap(log => [log.startTime, log.endTime]);
    const minTime = new Date(Math.min(...allTimes.map(t => t.getTime())));
    const maxTime = new Date(Math.max(...allTimes.map(t => t.getTime())));
    
    // Round to nearest hour for cleaner display
    minTime.setMinutes(0, 0, 0);
    if (maxTime.getMinutes() > 0) {
      maxTime.setHours(maxTime.getHours() + 1);
      maxTime.setMinutes(0, 0, 0);
    }
    
    return { minTime, maxTime };
  };

  const { minTime, maxTime } = getTimeRange();
  const totalTimeRangeMs = maxTime - minTime;

  // Generate truly uniform time ticks for y-axis (fixed spacing)
  const generateUniformTimeTicks = () => {
    const ticks = [];
    const totalHours = (maxTime - minTime) / (1000 * 60 * 60);
    
    // Always create exactly 7 evenly spaced ticks
    const tickCount = 6;
    
    for (let i = 0; i <= tickCount; i++) {
      const tickTime = new Date(minTime.getTime() + (i / tickCount) * totalTimeRangeMs);
      ticks.push(tickTime);
    }
    
    return ticks;
  };

  const timeTicks = generateUniformTimeTicks();

  // Get all tasks for a specific phase and organize them to avoid overlaps
  const getPhaseTaskPositions = (phase) => {
    const tasks = activityLogs.filter(log => log.phase === phase);
    // Sort by start time
    tasks.sort((a, b) => a.startTime - b.startTime);
    return tasks;
  };

  // Calculate time percentage for positioning - fixed for absolute positioning
  const getTimePosition = (time) => {
    return ((time - minTime) / totalTimeRangeMs) * 100;
  };

  // Get pixel position for a given time (for absolute positioning)
  const getTimePixelPosition = (time, totalHeight) => {
    const percentage = getTimePosition(time);
    return (percentage / 100) * totalHeight;
  };

  // Initial fetch when component mounts
  React.useEffect(() => {
    if (applicationId) {
      fetchActivityLogs(applicationId);
    }
  }, []);

  return (
    <div className="mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Application Process Flow</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-5">
        <h2 className="text-lg font-semibold mb-3">Enter Application ID to View Process Flow</h2>
        <form onSubmit={handleSubmit} className="mb-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Enter Application ID"
              className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Loading..." : "Visualize"}
            </button>
          </div>
        </form>
        <p className="text-sm text-gray-500">Enter an application ID to see its complete process flow visualization</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : showVisualization ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Process Flow for Application ID: <span className="text-blue-600">{applicationId}</span></h2>
            <div className="bg-pink-500 text-white px-3 py-1 rounded text-sm">Application ID: {applicationId}</div>
          </div>
          
          {/* Improved layout with legend next to visualization header */}
          <div className="flex justify-end mb-2">
            <div className="p-2 bg-white border border-gray-200 rounded inline-flex items-center space-x-6">
              <div className="text-sm font-bold">Legend:</div>
              <div className="flex items-center">
                <div className="w-6 h-0 border-t-2 border-blue-500 mr-2"></div>
                <span className="text-sm">Normal Flow</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-0 border-t-2 border-red-500 border-dashed mr-2"></div>
                <span className="text-sm">Sendback</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-pink-500 mr-2"></div>
                <span className="text-sm">Application ID</span>
              </div>
            </div>
          </div>
          
          {/* Chart container with fixed sizing */}
          <div className="relative border border-gray-200 rounded" style={{ height: "550px" }}>
            {/* Fixed chart structure */}
            <div className="flex h-full">
              {/* Y-axis (left side) - fixed width */}
              <div className="relative w-20 h-full border-r border-gray-300 bg-gray-50 z-10">
                {timeTicks.map((time, i) => (
                  <div 
                    key={i} 
                    className="absolute right-0 text-xs text-gray-600 pr-2"
                    style={{
                      top: `${getTimePosition(time)}%`,
                      transform: 'translateY(-50%)',
                      width: '100%',
                      textAlign: 'right'
                    }}
                  >
                    {formatTime(time)}
                  </div>
                ))}
              </div>
              
              {/* Chart body - scrollable */}
              <div className="relative flex-grow h-full">
                {/* Bottom phase names - fixed position */}
                <div className="absolute bottom-0 left-0 right-0 flex border-t border-gray-300 bg-gray-50 z-10">
                  {phaseNames.map((phase, index) => (
                    <div 
                      key={index} 
                      className="text-center flex-grow"
                      style={{ width: `${100 / phaseNames.length}%` }}
                    >
                      <div className="text-sm font-medium text-gray-700 py-2">{phase}</div>
                    </div>
                  ))}
                </div>
                
                {/* Scrollable chart content */}
                <div className="absolute top-0 bottom-30px left-0 right-0 overflow-y-auto" style={{ height: "calc(100% - 30px)" }}>
                  <div className="relative" style={{ height: "1000px", minWidth: "100%" }}>
                    {/* Horizontal time grid lines */}
                    {timeTicks.map((time, i) => (
                      <div 
                        key={i}
                        className="absolute left-0 right-0 border-t border-gray-200"
                        style={{ top: `${getTimePosition(time)}%` }}
                      ></div>
                    ))}
                    
                    {/* Vertical phase grid lines */}
                    {phaseNames.map((_, index) => (
                      <div 
                        key={index}
                        className="absolute top-0 bottom-0 border-l border-gray-200"
                        style={{ 
                          left: `${(index / phaseNames.length) * 100}%`,
                          width: `${100 / phaseNames.length}%`
                        }}
                      ></div>
                    ))}
                    
                    {/* Task blocks */}
                    {phaseNames.map((phase, phaseIndex) => {
                      const phaseTasks = getPhaseTaskPositions(phase);
                      const phaseWidth = 100 / phaseNames.length;
                      const taskWidth = 80; // in pixels
                      
                      return phaseTasks.map((task, taskIndex) => {
                        const startPercent = getTimePosition(task.startTime);
                        const endPercent = getTimePosition(task.endTime);
                        const height = endPercent - startPercent;
                        
                        // Position in the center of each phase column
                        const xPercent = (phaseIndex / phaseNames.length) * 100 + (phaseWidth / 2);
                        
                        const colorMap = {
                          "Sourcing": "#4A9BFF",
                          "Credit": "#4CAF50",
                          "Conversion": "#FFC107",
                          "Fulfillment": "#9C27B0",
                          "Risk": "#FF7043",
                          "Disbursal": "#29B6F6"
                        };
                        
                        return (
                          <div 
                            key={`${phase}-${task.id}`}
                            className="absolute rounded flex items-center justify-center text-white text-sm font-medium"
                            style={{
                              left: `calc(${xPercent}% - ${taskWidth/2}px)`,
                              top: `${startPercent}%`,
                              width: `${taskWidth}px`,
                              height: `${Math.max(height, 5)}%`,
                              backgroundColor: colorMap[phase],
                              minHeight: '24px',
                              zIndex: 5
                            }}
                          >
                            {task.task} ({task.duration}h)
                          </div>
                        );
                      });
                    })}
                    
                    {/* Flow lines with positioned sendbacks */}
                    <svg className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
                      {/* Feedback paths */}
                      {feedbackPaths.map((path, index) => {
                        const fromIndex = phaseNames.indexOf(path.from);
                        const toIndex = phaseNames.indexOf(path.to);
                        const phaseWidth = 100 / phaseNames.length;
                        
                        const fromX = (fromIndex / phaseNames.length) * 100 + (phaseWidth / 2);
                        const toX = (toIndex / phaseNames.length) * 100 + (phaseWidth / 2);
                        const yPosition = path.yPercent;
                        
                        return (
                          <g key={index}>
                            <path 
                              d={`M ${fromX}% ${yPosition}% C ${(fromX + toX) / 2}% ${yPosition - 5}%, ${(fromX + toX) / 2}% ${yPosition - 5}%, ${toX}% ${yPosition}%`}
                              stroke="#e74c3c"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray="5,5"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-500 text-center">
            Time period: Jan 1 {formatTime(minTime)} - Jan 1 {formatTime(maxTime)}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-600">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="text-lg">Enter an Application ID above to view its process flow visualization</p>
        </div>
      )}
    </div>
  );
}
export default App;