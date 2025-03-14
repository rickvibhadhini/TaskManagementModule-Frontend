export const funnelColors = {
  sourcing: '#52c41a', 
  credit: '#1890ff',      
  risk: '#eb2f96',        // New
  conversion: '#faad14',  
  rto: '#13c2c2',         // New
  fulfillment: '#722ed1',
  disbursal: '#f5222d'     // New
};

export const funnelOrder = [
  "sourcing", 
  "credit", 
  "risk", 
  "conversion", 
  "rto", 
  "fulfillment", 
  "disbursal"
];

export const getButtonColor = (funnel) => {
  if (funnel === 'all') return '#1890ff';
  return funnelColors[funnel] || '#1890ff';
};
