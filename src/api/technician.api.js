import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function getTechnicians(params) {
  console.log(params, '>>>>>>');
  return apiClient

    .get('/technicians', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function createTechnician(data) {
  return apiClient
    .post('/technicians', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function retrieveTechnicianBysomeParams(data) {
  console.log(data, '>>>data');
  return apiClient
    .post('/technicians/getTechByParams', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function retrieveTechnician(technicianId) {
  return apiClient
    .get(`/technicians/${technicianId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function updateTechnician(technicianId, data) {
  return apiClient
    .put(`/technicians/${technicianId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function updateTechnicianWithParams(technicianId, data) {
  return apiClient
    .put(`/technicians/params/${technicianId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function removeTechnician(technicianId) {
  return apiClient
    .delete(`/technicians/${technicianId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

/**
 * @params : technicianId: Type(String), data: Type(Object)
 * @response : api that updates technician object with result as pass or fail for each software after submission of test
 * @author :Kartik
 **/
export async function updateTechnicianResult(technicianId, data) {
  return apiClient.put(`/technicians/updateResult/${technicianId}`, data)
    .then(res => {
      if (res) {
        return res.data;
      }
      return Promise.reject();
    })

}

export async function updateTechnicianAvatar(technicianId, data) {
  console.log('avatar data', data, technicianId);
  return apiClient.put(`/technicians/updateavatar/${technicianId}`, data)
    .then(res => {
      console.log('res', res);
      if (res) {
        return res.data;
      }
      return Promise.reject();
    })
    
}
export async function updateAccountInfo(technicianId, data) {
  return apiClient
    .post(`/technicians/${technicianId}/update-account`, data, {
      'content-type': 'multipart/form-data',
    })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function getTechnicianRating(params) {
  return apiClient
    .get(`/technicians/rating/${params.technician}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}



/**
 * @params : data: Type(Object)
 * @response : api that sends response to backend to get online technicians
 * @author :Sahil
 **/

export async function getOnlineTechnicians(data) {
  console.log("data<<",data)
  return apiClient
  .post("/technicians/onlineTechs",data)
  .then(response => {
      if (response) {
        console.log("response >>>>>>",response)
        return response.data;
      }
      return Promise.reject();
    })
}

/**
 * @params : data: Type(Object)
 * @response : api that sends response to backend to get online technicians
 * @author :Kartar Singh
 **/

export async function getOnlineTechnicianById(id) {
  console.log("data<<",id)
  return apiClient
  .get(`/technicians/onlineTechByid/${id}`)
  .then(response => {
      if (response) {
        console.log("response >>>>>>",response)
        return response.data;
      }
      return Promise.reject();
    })
}

/**
 * @params : data: Type(Object)
 * @response : api that get tech details by user id
 * @author :Kartar Singh
 **/

export async function getTechnicianDetailesByUserId(id) {
  console.log("data<<",id)
  return apiClient
  .get(`/technicians/getTechByUserid/${id}`)
  .then(response => {
      if (response) {
        console.log("response >>>>>>",response)
        return response.data;
      }
      return Promise.reject();
    })
}
// /**
//  * @params :id 
//  * @response : api that get total number of customer that given rating to technician
//  * @author :Mritunjay
//  **/
// export async function totalCustomerForRating(id) {
//   return apiClient
//     .get(`/technicians/totalCustomerRating/${id}`)
//     .then(response => {
//       if (response) {
//         return response.data;
//       }
//       return Promise.reject();
//     })
    
// }
