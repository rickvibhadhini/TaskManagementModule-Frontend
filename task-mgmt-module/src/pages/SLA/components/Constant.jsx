export const funnelColors = {
  sourcing: '#52c41a', 
  credit: '#1890ff',      
  risk: '#eb2f96',        
  conversion: '#faad14',  
  rto: '#13c2c2',         
  fulfillment: '#722ed1',
  disbursal: '#f5222d'     
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
