import React, { useRef, useCallback, useEffect } from 'react';
import TaskRow from './TaskRow';
import TaskTooltip from '../../TaskTooltip';

const TimelineGrid = ({
  funnels,
  processedTasks,
  timePoints,
  totalWidth,
  zoomLevel,
  collapsedFunnels,
  hoveredTask,
  tooltipPosition,
  handleTaskClick,
  handleTaskMouseEnter,
  handleTaskMouseLeave,
  handleTooltipClose,
  compactView,
  handleWheel,
  rowHeight,
  funnelHeaderHeight,
  synchronizeScroll
}) => {
  // Refs for mouse panning
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const scrollStart = useRef(null);
  const gridRef = useRef(null);
  
  // Set up scroll synchronization
  useEffect(() => {
    if (!gridRef.current) return;
    
    const handleScroll = () => synchronizeScroll('timeline');
    gridRef.current.addEventListener('scroll', handleScroll);
    
    return () => {
      if (gridRef.current) {
        gridRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [synchronizeScroll]);
  
  // Mouse interaction handlers for panning
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      
      const timelineContent = e.currentTarget;
      if (timelineContent) {
        scrollStart.current = { 
          left: timelineContent.scrollLeft,
          top: timelineContent.scrollTop 
        };
      }
      
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging.current && dragStart.current && scrollStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      const timelineContent = e.currentTarget;
      if (timelineContent) {
        timelineContent.scrollLeft = scrollStart.current.left - dx;
        timelineContent.scrollTop = scrollStart.current.top - dy;
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    }
  }, []);

  return (
    <div 
      className="flex-1 overflow-x-auto overflow-y-auto relative"
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      ref={gridRef}
    >
      <div 
        className="relative" 
        style={{ 
          width: `${totalWidth * zoomLevel}px`,
          minWidth: '100%'
        }}
      >
        {/* Vertical grid lines */}
        {timePoints.map((point, i) => (
          <div
            key={`grid-line-${i}`}
            className="absolute top-0 bottom-0 border-l border-gray-200"
            style={{
              left: `${point.position * zoomLevel}px`,
              height: '100%',
              zIndex: 1
            }}
          />
        ))}

        {/* Funnel timelines */}
        <div className="relative">
          {funnels.map((funnel, funnelIdx) => {
            const funnelTasks = processedTasks[funnel] || [];
            const isCollapsed = collapsedFunnels[funnel];

            return (
              <div key={funnelIdx} className="relative">
                {/* Funnel header placeholder */}
                <div 
                  className="border-b border-gray-200 bg-gray-50"
                  style={{ height: funnelHeaderHeight }}
                />

                {/* Task rows */}
                {!isCollapsed && funnelTasks.map((task, taskIdx) => (
                  <TaskRow 
                    key={`${task.id}-${taskIdx}`}
                    task={task}
                    funnel={funnel}
                    zoomLevel={zoomLevel}
                    compactView={compactView}
                    handleTaskClick={handleTaskClick}
                    handleTaskMouseEnter={handleTaskMouseEnter}
                    handleTaskMouseLeave={handleTaskMouseLeave}
                    rowHeight={rowHeight}
                  />
                ))}
              </div>
            );
          })}

          {/* Tooltip Component */}
          {hoveredTask && (
            <TaskTooltip
              hoveredTask={hoveredTask}
              tooltipPosition={tooltipPosition}
              onClose={handleTooltipClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineGrid;