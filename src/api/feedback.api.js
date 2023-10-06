import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function createFeedback(data) {
  return apiClient
    .post('/feedback', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}


export async function getFeedback(feedbackId) {
  return apiClient
    .get(`/feedback/${feedbackId}`,)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function updateFeedback(feedbackId, data) {
  return apiClient
    .put(`/feedback/${feedbackId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}
export async function getFeedbackForParticularJob(data){
  return apiClient
  .post(`/feedback/checkForFeedback`,data)
  .then(response =>{
    if(response){
      return response.data
    }
    return Promise.reject()
  })
}

export async function getFeedbackForParticularJobforCustomer(data){
  return apiClient
  .post(`/feedback/checkForFeedbackCustomer`,data)
  .then(response =>{
    if(response){
      return response.data
    }
    return Promise.reject()
  })
}
