import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';


export async function create(data) {
	// body...
	return apiClient
	.post("/web-socket",data)
	.then(response => {
		if (response)
		{
			return response.data
		}
		 return Promise.reject();
	})
	
}



export async function updateSocket(webSocketId, data) {
	return apiClient
		.put(`/web-socket/${webSocketId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}



export async function technicianDeclined(data) {
	return apiClient
		.post("/web-socket/technician-declined", data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function technician_accepted_customer(data) {
	return apiClient
	.post("/web-socket/technician-accepted",data)
	.then(response => {
		if(response){
			return response.data
		}
		return Promise.reject()
	})
	
}



export async function customer_start_call(data) {
	return apiClient
	.post("/web-socket/customer-start-call",data)
	.then(response => {
		if(response){
			return response.data
		}
		return Promise.reject()
	})
	
}


export async function technician_polling(data){
	return apiClient
	.post("/web-socket/technician-polling",data)
	.then(response => {
		if(response){
			return response.data
		}
		return Promise.reject()
	})
	
}