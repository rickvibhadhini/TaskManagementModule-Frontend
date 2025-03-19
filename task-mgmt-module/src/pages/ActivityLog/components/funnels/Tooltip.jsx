import React from 'react';

const Tooltip = ({ content, visible }) => {
  return (
    <div className={`absolute bg-white border border-gray-300 rounded shadow-lg p-2 ${visible ? 'block' : 'hidden'}`}>
      {content}
    </div>
  );
};

export default Tooltip;