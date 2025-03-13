const API_BASE_URL = window._env_?.REACT_APP_API_BASE_URL || 'http://localhost:8081';


export const SLA_ENDPOINTS = {
  getTimeByChannel: (channel) => `${API_BASE_URL}/SLAMonitoring/time/${channel}`,
};

export default SLA_ENDPOINTS;