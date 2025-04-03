import { useState, useCallback, useEffect } from 'react';

const useTimelineZoom = (initialZoom = 1) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  
  // Handle zoom via mouse wheel
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)));
    }
  }, []);

  // Keyboard zoom handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Zoom in with Ctrl/Cmd + Plus
      if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        setZoomLevel(prev => Math.min(5, prev + 0.1));
      }
      // Zoom out with Ctrl/Cmd + Minus
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel(prev => Math.max(0.5, prev - 0.1));
      }
      // Reset zoom with Ctrl/Cmd + 0
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { zoomLevel, setZoomLevel, handleWheel };
};

export default useTimelineZoom;