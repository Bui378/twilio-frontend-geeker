import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

/**
 * Function will take input of answers after technician submits the interview test and store the response in database
 * @params = data (Type:Object)
 * @response : returns response from function
 * @author : Kartik
 */
export async function createResponse(data) {
    return apiClient
        .post('/interview', data)
        .then(response => {
            if (response) {
                return response.data;
            }
            return Promise.reject();
        })

}

/**
 * Function will get the question data of particular test id
 * @params = test id
 * @response : returns response from function
 * @author : Kartik
 */
export async function getQuestionList(testId) {
    return apiClient
        .get(`/interview/${testId}`)
        .then(response => {
            if (response) {
                // console.log('response>>>>>>>>>..', response)
                return response.data;
            }
            return Promise.reject();
        })

}

/**
 * Following function will get the question data of a particular technician
 * @params = technician id
 * @response : response from api
 * @author : Vinit
 */
export async function getQuestionListForTechncian(techncianId) {
    return apiClient
        .get(`/interview/technician/${techncianId}`)
        .then(response => {
            if (response) {
                // console.log('response>>>>>>>>>..', response)
                return response.data;
            }
            return Promise.reject();
        })

}

/**
 * Following function will remove a document corresponding to the given resp_id
 * @params = id
 * @response : document removed confirmation,
 * @author : Vinit
 */
export async function remove(id) {
    return apiClient
        .get(`/interview/remove/${id}`)
        .then(response => {
            if (response) {
                // console.log('response>>>>>>>>>..', response)
                return response.data;
            }
            return Promise.reject();
        })

}

// export async function retrieveInterview(softwareId) {
//     return apiClient
//         .get(`/interview/${softwareId}`)
//         .then(response => {
//             if (response) {
//                 console.log('response>>>>>>>>>..', response)
//                 return response.data;
//             }
//             return Promise.reject();
//         })

// }