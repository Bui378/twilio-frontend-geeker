import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';


export async function getRequestServices(params) {
  return apiClient
    .get('/request-service', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function createRequestService(data) {
  return apiClient
    .post('/request-service', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function assignUserToRequestService(id, data) {
  return apiClient
    .post(`/request-service/${id}/assign`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}
