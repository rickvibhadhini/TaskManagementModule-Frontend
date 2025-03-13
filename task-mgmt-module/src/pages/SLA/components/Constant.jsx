export const funnelColors = {
    sourcing: '#52c41a',    // Green (Success)
    credit: '#1890ff',      // Blue (Info)
    conversion: '#faad14',  // Orange (Warning)
    fulfillment: '#722ed1', // Purple
  };

export  const funnelOrder = ["sourcing", "credit", "conversion", "fulfillment"];

export  const getButtonColor = (funnel) => {
    if (funnel === 'all') return '#1890ff'; // Default blue for "all"
    return funnelColors[funnel] || '#1890ff';
  };

