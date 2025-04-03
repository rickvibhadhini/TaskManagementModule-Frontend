import { useCallback, useEffect } from 'react';

const useTimelineScroll = ({
  headerRef,
  timelineRef,
  discreteTimelineData,
  zoomLevel,
  setConnectionKey,
  initialScrollAppliedRef
}) => {
  // Synchronize header and timeline scrolling
  const synchronizeScroll = useCallback((source, force = false) => {
    if (!headerRef.current || !timelineRef.current) return;
    
    const headerContent = headerRef.current.querySelector('.flex-1');
    const timelineContent = timelineRef.current.querySelector('.flex-1');
    
    if (!headerContent || !timelineContent) return;
    
    requestAnimationFrame(() => {
      if (source === 'header' || force) {
        timelineContent.scrollLeft = headerContent.scrollLeft;
      }
      
      if (source === 'timeline' || force) {
        headerContent.scrollLeft = timelineContent.scrollLeft;
      }
    });
  }, [headerRef, timelineRef]);

  // Set up scroll event listeners
  useEffect(() => {
    const headerContent = headerRef.current?.querySelector('.flex-1');
    const timelineContent = timelineRef.current?.querySelector('.flex-1');
    
    if (!headerContent || !timelineContent) return;
    
    const handleHeaderScroll = () => synchronizeScroll('header');
    const handleTimelineScroll = () => synchronizeScroll('timeline');
    
    headerContent.addEventListener('scroll', handleHeaderScroll);
    timelineContent.addEventListener('scroll', handleTimelineScroll);
    
    return () => {
      headerContent.removeEventListener('scroll', handleHeaderScroll);
      timelineContent.removeEventListener('scroll', handleTimelineScroll);
    };
  }, [headerRef, timelineRef, synchronizeScroll]);

  // Scroll to latest task
  const scrollToLatestTask = useCallback(() => {
    const timelineContent = timelineRef.current?.querySelector('.flex-1');
    const headerContent = headerRef.current?.querySelector('.flex-1');
    
    if (!timelineContent || !discreteTimelineData.processedTasks) return;
    
    // Find the latest task segment based on end time
    let latestSegment = null;
    let latestTask = null;
    let latestInstanceIndex = 0;
    let latestSegmentIndex = 0;
    let latestFunnel = '';
    
    // Iterate through all funnels and tasks to find the latest segment
    Object.entries(discreteTimelineData.processedTasks).forEach(([funnel, tasks]) => {
      tasks.forEach(task => {
        task.instances.forEach((instance, instanceIdx) => {
          instance.forEach((segment, segmentIdx) => {
            if (!latestSegment || segment.endTime > latestSegment.endTime) {
              latestSegment = segment;
              latestTask = task;
              latestInstanceIndex = instanceIdx;
              latestSegmentIndex = segmentIdx;
              latestFunnel = funnel;
            }
          });
        });
      });
    });
    
    if (latestSegment) {
      // Find the DOM element of the latest segment
      const segmentSelector = `.task-row-${latestFunnel}-${latestTask.id} .instance-${latestInstanceIndex}-segment-${latestSegmentIndex}`;
      const latestSegmentEl = timelineContent.querySelector(segmentSelector);
      
      if (latestSegmentEl) {
        // Calculate scroll positions
        // Scroll horizontally to show the latest segment (with some margin)
        const horizontalOffset = latestSegment.endPosition * zoomLevel + 100;
        const maxScroll = timelineContent.scrollWidth - timelineContent.clientWidth;
        timelineContent.scrollLeft = Math.min(horizontalOffset, maxScroll);
        
        // Scroll vertically to center the latest task
        const taskRow = timelineContent.querySelector(`.task-row-${latestFunnel}-${latestTask.id}`);
        if (taskRow) {
          const taskRect = taskRow.getBoundingClientRect();
          const topOffset = taskRow.offsetTop - (timelineContent.clientHeight / 2) + (taskRect.height / 2);
          timelineContent.scrollTop = Math.max(0, topOffset);
        }
        
        // Synchronize header
        if (headerContent) {
          headerContent.scrollLeft = timelineContent.scrollLeft;
        }
      } else {
        timelineContent.scrollLeft = timelineContent.scrollWidth;
      }
    } else {
      timelineContent.scrollLeft = timelineContent.scrollWidth;
    }
    
    initialScrollAppliedRef.current = true;
    
    // Redraw connections after scrolling
    setTimeout(() => {
      setConnectionKey(prev => prev + 1);
    }, 100);
  }, [discreteTimelineData, zoomLevel, headerRef, timelineRef, setConnectionKey, initialScrollAppliedRef, synchronizeScroll]);

  return { synchronizeScroll, scrollToLatestTask };
};

export default useTimelineScroll;