
import axios from 'axios';
import { transformApiData } from '../utils/apiTransformers';

export const fetchFunnelData = async (applicationId) => {
  const url = `http://localhost:8080/applicationLog/${applicationId}`;
  const response = await axios.get(url);
  return transformApiData(response.data.data);
};