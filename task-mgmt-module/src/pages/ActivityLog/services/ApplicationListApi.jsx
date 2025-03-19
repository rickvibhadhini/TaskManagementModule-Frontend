
import axios from 'axios';
import { transformApiData } from '../utils/apiTransformers';

export const fetchFunnelData = async (applicationId) => {
  const url = `http://localhost:8081/applicationLog/${applicationId}`;
  const response = await axios.get(url);
  return transformApiData(response.data.data);
};