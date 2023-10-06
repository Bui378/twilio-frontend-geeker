import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function getDescriptionProblems(params) {
  return apiClient
    .get('/description-problems', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function createDescriptionProblem(data) {
  return apiClient
    .post('/description-problems', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}
