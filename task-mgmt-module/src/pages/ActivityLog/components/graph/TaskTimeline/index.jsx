import React, { useState, useRef } from 'react';
import TimelineHeader from './components/TimelineHeader';
import TaskSidebar from './components/TaskSidebar';
import TimelineGrid from './components/TimelineGrid';
import ZoomControl from './components/ZoomControl';
import ConnectionRenderer from './components/ConnectionRenderer';
import useTimelineData from './hooks/useTimelineData';
import useTimelineScroll from './hooks/useTimelineScroll';
import useTimelineZoom from './hooks/useTimelineZoom';
import useTaskInteractions from './hooks/useTaskInteractions';

const TaskTimeline = ({ funnels, tasksByFunnel, compactView }) => {
  // State
  const [collapsedFunnels, setCollapsedFunnels] = useState({});
  const [connectionKey, setConnectionKey] = useState(0);
  
  // Refs
  const timelineRef = useRef(null);
  const headerRef = useRef(null);
  const initialScrollAppliedRef = useRef(false);

  // Constants
  const ROW_HEIGHT = compactView ? 26 : 40;
  const HEADER_HEIGHT = 60;
  const FUNNEL_HEADER_HEIGHT = 40;
  const TIMELINE_PADDING = 40;

  // Custom hooks
  const { discreteTimelineData } = useTimelineData(tasksByFunnel, TIMELINE_PADDING);
  
  const { 
    zoomLevel, 
    handleWheel 
  } = useTimelineZoom();
  
  const { 
    synchronizeScroll,
    scrollToLatestTask
  } = useTimelineScroll({
    headerRef,
    timelineRef,
    discreteTimelineData,
    zoomLevel,
    setConnectionKey,
    initialScrollAppliedRef
  });
  
  const { 
    hoveredTask, 
    tooltipPosition, 
    handleTaskClick, 
    handleTaskMouseEnter, 
    handleTaskMouseLeave, 
    handleTooltipClose
  } = useTaskInteractions();

  // Toggle funnel collapse
  const toggleFunnel = (funnel) => {
    setCollapsedFunnels(prev => ({
      ...prev,
      [funnel]: !prev[funnel]
    }));
    
    // Redraw connections after toggle
    setTimeout(() => {
      setConnectionKey(prev => prev + 1);
    }, 200);
  };

  // Update connections on changes
  React.useLayoutEffect(() => {
    // Trigger redraw of connections
    const timer = setTimeout(() => {
      setConnectionKey(prev => prev + 1);
    }, 200);

    return () => clearTimeout(timer);
  }, [zoomLevel, collapsedFunnels]);

  // Apply initial scroll to latest task
  React.useEffect(() => {
    if (!initialScrollAppliedRef.current && discreteTimelineData.totalWidth > 0) {
      scrollToLatestTask();
    }
  }, [discreteTimelineData.totalWidth, scrollToLatestTask]);

  return (
    <div className="flex flex-col" style={{ borderTop: '1px solid #e5e7eb' }}>
      <ZoomControl zoomLevel={zoomLevel} />

      <TimelineHeader 
        headerRef={headerRef}
        timePoints={discreteTimelineData.timePoints}
        totalWidth={discreteTimelineData.totalWidth}
        zoomLevel={zoomLevel}
        headerHeight={HEADER_HEIGHT}
        synchronizeScroll={synchronizeScroll}
      />

      <div className="flex flex-1" ref={timelineRef} style={{ minHeight: '0' }}>
        <TaskSidebar 
          funnels={funnels}
          processedTasks={discreteTimelineData.processedTasks}
          collapsedFunnels={collapsedFunnels}
          toggleFunnel={toggleFunnel}
          handleTaskClick={handleTaskClick}
          handleTaskMouseEnter={handleTaskMouseEnter}
          handleTaskMouseLeave={handleTaskMouseLeave}
          rowHeight={ROW_HEIGHT}
          funnelHeaderHeight={FUNNEL_HEADER_HEIGHT}
        />

        <TimelineGrid 
          funnels={funnels}
          processedTasks={discreteTimelineData.processedTasks}
          timePoints={discreteTimelineData.timePoints}
          totalWidth={discreteTimelineData.totalWidth}
          zoomLevel={zoomLevel}
          collapsedFunnels={collapsedFunnels}
          hoveredTask={hoveredTask}
          tooltipPosition={tooltipPosition}
          handleTaskClick={handleTaskClick}
          handleTaskMouseEnter={handleTaskMouseEnter}
          handleTaskMouseLeave={handleTaskMouseLeave}
          handleTooltipClose={handleTooltipClose}
          compactView={compactView}
          handleWheel={handleWheel}
          rowHeight={ROW_HEIGHT}
          funnelHeaderHeight={FUNNEL_HEADER_HEIGHT}
          synchronizeScroll={synchronizeScroll}
        />
      </div>

      <ConnectionRenderer 
        timelineRef={timelineRef}
        processedTasks={discreteTimelineData.processedTasks}
        collapsedFunnels={collapsedFunnels}
        zoomLevel={zoomLevel}
        connectionKey={connectionKey}
      />
    </div>
  );
};

export default TaskTimeline;