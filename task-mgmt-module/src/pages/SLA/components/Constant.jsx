export const funnelColors = {
    sourcing: '#52c41a', 
    credit: '#1890ff',      
    conversion: '#faad14',  
    fulfillment: '#722ed1', 
  };

export  const funnelOrder = ["sourcing", "credit", "conversion", "fulfillment"];

export  const getButtonColor = (funnel) => {
    if (funnel === 'all') return '#1890ff';
    return funnelColors[funnel] || '#1890ff';
  };

