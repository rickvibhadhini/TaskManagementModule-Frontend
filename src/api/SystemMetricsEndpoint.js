import { API_BASE_URL } from '../constants'; 

export const SYSTEM_METRICS_ENDPOINT = {
  systemMetrics: (funnel, filterBy) => `${API_BASE_URL}/actorMetrics/system/${funnel}/${filterBy}`,
};

export default SYSTEM_METRICS_ENDPOINT;
