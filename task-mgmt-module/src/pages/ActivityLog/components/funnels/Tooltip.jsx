import React from 'react';

function Tooltip({ content, visible }) {
  if (!visible) return null;
  
  return (
    <div className="absolute z-10 mt-2 bg-white border border-gray-200 shadow-lg rounded-md p-3 text-xs text-gray-800 whitespace-pre-line transform -translate-y-full -left-1/2">
      {content}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-r border-b border-gray-200"></div>
    </div>
  );
}

export default Tooltip;