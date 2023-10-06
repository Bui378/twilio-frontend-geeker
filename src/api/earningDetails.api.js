import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function createEarningDetails(data) {
  return apiClient
    .post('/earning-details', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function earningDetailsList(data){
  return apiClient
    .post('/earning-details/list', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function getEarningDetails(id) {
  return apiClient
    .get(`/earning-details/${id}`,)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}


export async function getEarningDetailsByJob(jobId) {
  // console.log('jobId in api ::',jobId)
  return apiClient
    .get(`/earning-details/by-job/${jobId}`,)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

/**
 * This api updates the earning detail on the given id param with the given data object.
 * @params : id (Type:String), data (Type:Object)
 * @response: returns updated earning detail
 * @author : Manibha
 **/
export async function updateEarningDetails(id,data) {
  return apiClient
    .put(`/earning-details/${id}`,data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })   
}
