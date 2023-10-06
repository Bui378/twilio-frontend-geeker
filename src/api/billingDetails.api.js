import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function createBillingDetails(data) {
	return apiClient
		.post('/billing-details', data)
		.then(response => {
			// console.log("response billing-details :::",response)
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function billingDetailsList(data) {
	
	return apiClient
		.post('/billing-details/list', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function getBillingDetails(id) {
	return apiClient
		.get(`/billing-details/${id}`,)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}
export async function getBillingDetailsByJob(jobId) {
	// console.log('jobId in api ::',jobId)
	return apiClient
		.get(`/billing-details/by-job/${jobId}`,)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function updateBillingDetails(billingId, data) {
	return apiClient
		.put(`/billing-details/${billingId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}