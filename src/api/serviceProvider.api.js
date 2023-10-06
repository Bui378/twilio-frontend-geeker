import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function getServiceProviders(params) {
  return apiClient
    .get('/service-providers', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function createServiceProvider(data) {
  return apiClient
    .post('/service-providers', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}


export async function callParticipant(jobId,phone_number) {
  return apiClient
    .post(`/service-providers/${jobId}/${phone_number}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}


export async function endConferenceCall(data) {
  return apiClient
    .post(`/service-providers/end_call`,data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}


export async function send_email_to_customer(jobId) {
  return apiClient
    .get(`/service-providers/send_email_to_customer/${jobId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}


export async function getTechEarnings(data){

    return apiClient 
    .post("feedback/tech-earnings",data)
    .then((result)=>{
      return result.data
    })
}
