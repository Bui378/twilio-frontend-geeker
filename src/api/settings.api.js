import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';


export async function getSettingsList(data) {
    return apiClient
      .post('/settings/getSettings',data )
      .then(response => {
        if (response) {
          return response.data;
        }
        return Promise.reject();
      })
    
  }


  export async function createSettings(data) {
    return apiClient
      .post('/settings',data)
      .then(response => {
        if (response) {
          return response.data;
        }
        return Promise.reject();
      })
     
  }