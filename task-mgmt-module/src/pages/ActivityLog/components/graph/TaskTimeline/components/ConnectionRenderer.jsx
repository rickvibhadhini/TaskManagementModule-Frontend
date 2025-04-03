import React, { useLayoutEffect } from 'react';

const ConnectionRenderer = ({ 
  timelineRef, 
  processedTasks, 
  collapsedFunnels, 
  zoomLevel, 
  connectionKey 
}) => {
  // Helper function to get segment position
  const getSegmentPosition = (segment) => {
    return {
      left: segment.startPosition,
      width: segment.endPosition - segment.startPosition
    };
  };

  // Draw instance connections within a task row
  const drawInstanceConnections = () => {
    // First remove existing instance connection lines
    const existingLines = document.querySelectorAll('.instance-connection-line');
    existingLines.forEach(line => line.remove());

    if (!timelineRef.current) return;
    const timeline = timelineRef.current.querySelector('.flex-1');
    if (!timeline) return;
    
    const timelineRect = timeline.getBoundingClientRect();

    // Process each funnel
    Object.entries(processedTasks).forEach(([funnel, tasks]) => {
      if (collapsedFunnels[funnel]) return;
      
      // Process each task in the funnel
      tasks.forEach(task => {
        // Skip if task has only one instance
        if (!task.hasCycles || task.instances.length <= 1) return;
        
        // Connect instances within the same task
        for (let i = 0; i < task.instances.length - 1; i++) {
          const currentInstance = task.instances[i];
          const nextInstance = task.instances[i + 1];
          
          // Get last segment of current instance and first segment of next instance
          const lastSegment = currentInstance[currentInstance.length - 1];
          const firstSegment = nextInstance[0];
          
          // Get the task element from DOM
          const taskEl = document.querySelector(`.task-row-${funnel}-${task.id}`);
          if (!taskEl) continue;
          
          // Calculate positions
          const taskRect = taskEl.getBoundingClientRect();
          const taskMidY = taskRect.top + taskRect.height / 2 - timelineRect.top + timeline.scrollTop;
          
          const currentPos = getSegmentPosition(lastSegment);
          const nextPos = getSegmentPosition(firstSegment);
          
          const startX = (currentPos.left + currentPos.width) * zoomLevel;
          const endX = nextPos.left * zoomLevel;
          
          // Create connection line
          const line = document.createElement('div');
          line.className = 'instance-connection-line';
          line.style.position = 'absolute';
          line.style.left = `${startX}px`;
          line.style.top = `${taskMidY}px`;
          line.style.width = `${endX - startX}px`;
          line.style.height = '2px';
          line.style.borderTop = '2px dashed rgba(107, 114, 128, 0.8)';
          line.style.zIndex = '5';
          
          timeline.appendChild(line);
        }
      });
    });
  };

  // Draw connections between sendback tasks and their targets
  const drawTaskConnections = () => {
    // First remove any existing connection lines
    const existingLines = document.querySelectorAll('.sendback-connection-line, .sendback-connection-arrow');
    existingLines.forEach(line => line.remove());

    if (!timelineRef.current) return;
    
    // Find all sendback tasks
    const sendbackTasks = [];
    Object.entries(processedTasks).forEach(([funnel, tasks]) => {
      if (collapsedFunnels[funnel]) return;
      
      tasks.forEach(task => {
        if (task.originalTaskId === 'sendback' && task.targetTaskId) {
          // Find the first segment of the first instance
          if (task.instances && task.instances.length > 0 && task.instances[0].length > 0) {
            sendbackTasks.push({
              ...task,
              segment: task.instances[0][0],
              funnel
            });
          }
        }
      });
    });

    if (sendbackTasks.length === 0) return;

    // Get timeline container for positioning
    const timeline = timelineRef.current.querySelector('.flex-1');
    if (!timeline) return;
    
    const timelineRect = timeline.getBoundingClientRect();

    // Create connections for each sendback task
    sendbackTasks.forEach(sendbackTask => {
      // Find the target task
      const targetFunnel = Object.entries(processedTasks).find(([_, tasks]) => {
        return tasks.some(task => task.id === sendbackTask.targetTaskId);
      });
      
      if (!targetFunnel) return;
      
      const targetTask = targetFunnel[1].find(task => task.id === sendbackTask.targetTaskId);
      if (!targetTask) return;

      // Try to get task elements from DOM
      const sendbackEl = document.querySelector(`.task-row-${sendbackTask.funnel}-${sendbackTask.id} .instance-0-segment-0`);
      const targetEl = document.querySelector(`.task-row-${targetFunnel[0]}-${targetTask.id} .instance-0-segment-0`);

      if (!sendbackEl || !targetEl) return;

      // Get positions
      const sendbackRect = sendbackEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Calculate positions for the line
      const lineX = sendbackRect.right - timelineRect.left + timeline.scrollLeft;
      const sendbackY = sendbackRect.top - timelineRect.top + timeline.scrollTop + (sendbackRect.height / 2);
      const targetY = targetRect.top - timelineRect.top + timeline.scrollTop + (targetRect.height / 2);
      const lineHeight = Math.abs(targetY - sendbackY);
      const topY = Math.min(sendbackY, targetY);

      // Create the connection line
      const line = document.createElement('div');
      line.className = 'sendback-connection-line';
      line.style.position = 'absolute';
      line.style.left = `${lineX}px`;
      line.style.top = `${topY}px`;
      line.style.width = '2px';
      line.style.height = `${lineHeight}px`;
      line.style.borderLeft = '2px dashed #f97316'; // Orange dashed line
      line.style.zIndex = '5';

      // Create arrow
      const arrow = document.createElement('div');
      arrow.className = 'sendback-connection-arrow';
      arrow.style.position = 'absolute';
      arrow.style.left = `${lineX - 4}px`;
      
      if (sendbackY < targetY) {
        arrow.style.top = `${targetY - 5}px`;
        arrow.style.borderTop = '6px solid #f97316';
        arrow.style.borderBottom = 'none';
      } else {
        arrow.style.top = `${targetY - 1}px`;
        arrow.style.borderBottom = '6px solid #f97316';
        arrow.style.borderTop = 'none';
      }
      
      arrow.style.width = '0';
      arrow.style.height = '0';
      arrow.style.borderLeft = '5px solid transparent';
      arrow.style.borderRight = '5px solid transparent';
      arrow.style.zIndex = '5';

      // Add elements to the timeline
      timeline.appendChild(line);
      timeline.appendChild(arrow);
    });
  };

  // Update connections when needed
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      drawTaskConnections();
      drawInstanceConnections();
    }, 200); // Ensure DOM is ready

    return () => clearTimeout(timer);
  }, [connectionKey, zoomLevel, collapsedFunnels]);

  // This is a behavior-only component (no rendering)
  return null;
};

export default ConnectionRenderer;