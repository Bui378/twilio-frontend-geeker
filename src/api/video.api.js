import apiClient from './index';   
// import { SESSION_EXPIRE_URL } from '../constants';

// import mixpanel from 'mixpanel-browser';

// export async function EmailLogin(data){
//     console.log()
// }

export async function getVideos(params) {
  return apiClient
    .get('/videos', { params })
    .then(response => {
      if (response) {
        console.log("response  getVideos:: videos.api",response)
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function create(data={"title":"hello","videoUrl":"on","status":"Active"}) {
  return apiClient
    .post('/videos', data)
    .then(response => {
      if (response) {
        response.then((res)=>{
          Promise.resolve(res.data)
        })
        // return Promise.resolve(response.data);
      }
      return Promise.reject();
    })
   
}



