export const funnelColors = {
  sourcing: '#b30000', 
  credit: '#7c1158',      
  risk: '#4421af',        
  conversion: '#0d88e6', 
  rto: '#00b7c7',         
  fulfillment: '#5ad45a',
  disbursal: '#8be04e'     
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
