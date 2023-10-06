import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';
import { SECRET_KEY } from '../constants';

export async function getUsers(params) {
  return apiClient
    .get('/users', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function createUser(data) {
  return apiClient
    .post('/users', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function updateUser(data) {
  return apiClient
    .post(`/users/${data.userId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}
export async function updateUserBusinessDetails(data) {
  return apiClient
    .post(`/users/updateUserBusinessDetails/${data.userId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function getUsers1(params) {
  return apiClient
    .get('/users/res', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function getUserByParam(data) {
  return apiClient
    .post('/users/get_user_by_param', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

/**
 * Following API will fetch user as guest
 * @params : data (Type: Object), token (Type: String)
 * @return : data (Type: Object)
 * @author : Vinit
 **/

export async function getUserByParamAsGuest(data, token) {
  localStorage.setItem(SECRET_KEY, token);
  return apiClient
    .post('/users/get_user_by_param', data)
    .then(response => {
      localStorage.removeItem(SECRET_KEY);
			console.log("tetch token removed from user.api.js")
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function updateUserByParam(data){
  console.log("updateUserByParam >>>>>>>>>>>> ",data)
  return apiClient
  .post('/users/updateUserByParam',data)
  .then(response =>{
    if(response){
      return response.data;
    }
  })
}
export async function deleteUserByParam(data){
  console.log("deleteUserByParam>>>>>>. ",data)
  return apiClient
  .post('/users/deleteUserByParam',data)
  .then(response =>{
    if(response){
      console.log("deleteUserByParam >>>>>>>>>>>> ",response);
      return response.data;
    }
  })
}
export async function getUserById(id) {
	return apiClient.get(`/users/retrieve/${id}`).then((response) => {
		if (response) {
			return response.data;
		}
		return Promise.reject()
	})
}

export async function getTechnicianUpdatedPic(id) {
	return apiClient.get(`/users/retrievePic/${id}`).then((response) => {
    if (response) {
			return response.data;
		}
		return Promise.reject()
	})
}

export async function getTotalUserOfOrg(ownerId) {
	return apiClient.get(`/users/getOrgUsers/${ownerId}`).then((response) => {
		if (response) {
			return response.data;
		}
		return Promise.reject()
	})
}