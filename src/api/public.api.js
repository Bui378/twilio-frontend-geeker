import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';


/**
 * Following API will fetch customer count on the basis of params
 * @params : params (Type: Object)
 * @return : data (Type: Object)
 * @author : Vinit
 **/
export async function getTotalCustomerCount(params) {
	return apiClient
		.get('/public', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}