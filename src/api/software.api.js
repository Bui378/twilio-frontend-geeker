import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export async function getSoftwareList(params) {
  return apiClient
    .get('/software', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function retrievesoftware(softwareId) {
  return apiClient
    .get(`/software/${softwareId}`)
    .then(response => {
      if (response) {
        console.log('response>>>>>>>>>..',response)
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function getTouchPointsList(params) {
  return apiClient
    .get('/touch-points', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function getSoftwareExperiencesList(params) {
  return apiClient
    .get('/software-experiences', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}


export async function getOtherSoftwareList(params) {
  return apiClient
    .get('/other-software', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}