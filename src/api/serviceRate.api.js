import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function getServiceRates(params) {
  return apiClient
    .get('/service-rate', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function createServiceRate(data) {
  return apiClient
    .post('/service-rate', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}
