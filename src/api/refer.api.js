import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function createRefer(data) {
  return apiClient
    .post('/referRouter', data)
    .then(response => {
      if (response) {
        console.log("response is ok",response)
        return response.data;
      }
      else{
        console.log("promise rejected")
         return Promise.reject();
      }
     
    })
   
}


export async function checkReferEmail(data) {
  return apiClient
    .post('/referRouter/check-email', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}