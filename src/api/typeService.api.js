import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function getTypeServices(params) {
  return apiClient
    .get('/type-service', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}

export async function createTypeService(data) {
  return apiClient
    .post('/type-service', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}

export async function sendJitsiInvitation(data) {
  return apiClient
    .post('/services/invite-to-jitsi', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}

export async function ReferpeopleThroughEmail(data) {
  return apiClient
    .post('/services/refer-people', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}

export async function klaviyoTrack(data) {
  return apiClient
    .post('/services/klaviyo-track', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });

}
