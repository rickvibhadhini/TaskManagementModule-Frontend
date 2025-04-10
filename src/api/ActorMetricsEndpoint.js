import { API_BASE_URL } from '../constants'; 

export const ACTOR_METRICS_ENDPOINT = {
  actorMetrics: (actorId, filterBy) => `${API_BASE_URL}/actorMetrics/${actorId}/${filterBy}`,
};

export default ACTOR_METRICS_ENDPOINT;
