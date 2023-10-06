import apiClient from './index';

export async function getusedCouponsByCustomerId(customerId) {
    console.log("Api called ro get used coupon by customer id", customerId)
	return apiClient
		.get(`/applied-coupon/${customerId}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
}