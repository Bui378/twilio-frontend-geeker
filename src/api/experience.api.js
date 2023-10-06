import apiClient from './index';
import { SESSION_EXPIRE_URL } from '../constants';

export async function getExperiences(params) {
  return apiClient
    .get('/experiences', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function createExperience(data) {
  return apiClient
    .post('/experiences', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function retrieveExperience(experienceId) {
  return apiClient
    .get(`/experiences/${experienceId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function updateExperience(experienceId, data) {
  return apiClient
    .put(`/experiences/${experienceId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function removeExperience(experienceId) {
  return apiClient
    .delete(`/experiences/${experienceId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function updateSoftware(data) {
  return apiClient
    .post('/experiences/updateSoftware', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}
