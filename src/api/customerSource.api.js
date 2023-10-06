import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';


export async function createCustomerSource(data) {
  return apiClient
    .post('/source', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })

}


export async function isCustomerExist(data){
  console.log("Data :::::::",data)
  return apiClient
  .post('/source/check-if-customer-exist',data)
  .then(response=>{
    if(response){
      return response.data;
    }

    return Promise.reject()
  })
}


