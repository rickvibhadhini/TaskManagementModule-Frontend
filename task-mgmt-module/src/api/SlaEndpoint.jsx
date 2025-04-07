// src/api/SlaEndpoint.js
const API_BASE_URL = window._env_?.REACT_APP_API_BASE_URL || 'http://localhost:8081';

export const SLA_ENDPOINTS = {
  // New endpoint format: /SLAMonitoring/time/{channel}/{days}/{status}/{taskStatusFilter}
  getTimeByChannel: (channel, days, appStatusFilter) =>
    `${API_BASE_URL}/SLAMonitoring/time/${channel}/${days}/${appStatusFilter}/${taskStatusFilter}`,
};

export default SLA_ENDPOINTS;
