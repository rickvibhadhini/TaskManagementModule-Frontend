import { useState, useRef, useCallback } from 'react';

const useTaskInteractions = () => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const hoverIntentTimerRef = useRef(null);
  const currentHoveredTaskRef = useRef(null);
  const isDraggingTaskRef = useRef(false);

  const clearHoverIntent = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
  }, []);

  const handleTaskClick = useCallback((e, task, segment, instanceIndex) => {
    e.stopPropagation();
    e.preventDefault();
    clearHoverIntent();

    if (isDraggingTaskRef.current) {
      isDraggingTaskRef.current = false;
      return;
    }

    if (hoveredTask && hoveredTask.id === task.id && 
        hoveredTask.funnel === task.funnel && 
        hoveredTask.instanceIndex === instanceIndex) {
      setHoveredTask(null);
      currentHoveredTaskRef.current = null;
      return;
    }

    currentHoveredTaskRef.current = { id: task.id, funnel: task.funnel, instanceIndex };
    setHoveredTask({ ...task, currentSegment: segment, instanceIndex });
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }, [hoveredTask, clearHoverIntent]);

  const handleTaskMouseEnter = useCallback((e, task, segment, instanceIndex) => {
    if (hoveredTask) return;
    clearHoverIntent();

    hoverIntentTimerRef.current = setTimeout(() => {
      currentHoveredTaskRef.current = { id: task.id, funnel: task.funnel, instanceIndex };
      setHoveredTask({ ...task, currentSegment: segment, instanceIndex });
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }, 300);
  }, [hoveredTask, clearHoverIntent]);

  const handleTaskMouseLeave = useCallback(() => {
    if (isDraggingTaskRef.current) return;
    clearHoverIntent();

    if (hoveredTask && !document.activeElement) {
      hoverIntentTimerRef.current = setTimeout(() => {
        setHoveredTask(null);
        currentHoveredTaskRef.current = null;
      }, 100);
    }
  }, [hoveredTask, clearHoverIntent]);

  const handleTooltipClose = useCallback(() => {
    setHoveredTask(null);
    currentHoveredTaskRef.current = null;
  }, []);

  return {
    hoveredTask,
    tooltipPosition,
    handleTaskClick,
    handleTaskMouseEnter,
    handleTaskMouseLeave,
    handleTooltipClose,
    clearHoverIntent,
    isDraggingTaskRef
  };
};

export default useTaskInteractions;