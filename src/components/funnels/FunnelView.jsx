
import React from 'react';
import FunnelCard from './FunnelCard';

function FunnelView({ funnelData, expandedFunnels, toggleFunnel }) {
  return (
    <div className="space-y-4">
      {funnelData.map(funnel => (
        <FunnelCard 
          key={funnel.id}
          funnel={funnel}
          isExpanded={expandedFunnels[funnel.id]}
          onToggle={() => toggleFunnel(funnel.id)}
        />
      ))}
    </div>
  );
}

export default FunnelView;