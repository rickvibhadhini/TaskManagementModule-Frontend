import React from 'react';

const ZoomControl = ({ zoomLevel }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
      <div className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>
      <div className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200 text-gray-400">
        Ctrl+Wheel to zoom
      </div>
    </div>
  );
};

export default ZoomControl;