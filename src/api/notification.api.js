import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';


export async function create(data) {
  // body...
  return apiClient
  .post("/notification",data)
  .then(response => {
    if (response)
    {
      return response.data
    }
     return Promise.reject();
  })
 
}

export async function list(data){
  return apiClient
  .get("/notification",data)
  .then(response => {
    if(response){
      return response.data
    }
    return Promise.reject()
  })
  
}

export async function findNotificationByParams(data){

  return apiClient
  .post("/notification/notify",data)
  .then(response => {
    if(response){
      return response.data
    }
    return Promise.reject()
  })
  
}

export async function updateReadStatus(data){

  return apiClient
  .post("/notification/updateStatus",data)
  .then(response => {
    if(response){
      return response.data
    }
    return Promise.reject()
  })
  
}


export async function updateByParams(data){

  return apiClient
  .post("/notification/update",data)
  .then(response => {
    if(response){
      return response.data
    }
    return Promise.reject()
  })
 
}


