import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function getCustomers(params) {
	return apiClient
		.get('/customers', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function createCustomer(data) {
	return apiClient
		.post('/customers', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function retrieveCustomer(customerId) {
	return apiClient
		.get(`/customers/${customerId}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function retrieveCustomerByParams(data) {
	return apiClient
		.post('/customers/retrieveCustomerByParams', data)
		.then(response => {
			if (response) {
				// console.log('response>>>>>>>>>..',response)
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function updateCustomer(customerId, data) {
	return apiClient
		.put(`/customers/${customerId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function removeCustomer(customerId) {
	return apiClient
		.delete(`/customers/${customerId}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function createCustomerStripe(data) {
	return apiClient
		.post('/customers/add-customer-to-stripe', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function addCardToCustomerStripe(data) {
	return apiClient
		.post('/customers/add-card-to-customer', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function getStripeCustomerCardsInfo(data) {
	return apiClient
		.post('/customers/get-stripe-customer-cards', data)
		.then(response => {
			if (response) {
				return response;
			}
			return Promise.reject();
		})
		
}



export async function chargeCustomer(data) {
	return apiClient
		.post('/customers/charge-customer', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function retrieveCharge(data) {
	return apiClient
		.post('/customers/retrieve-charge', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function updateDefaultCard(data) {
	return apiClient
		.post('/customers/update-default-card', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function removeCard(data) {
	return apiClient
		.post('/customers/remove-customer-card', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function getCustomerSubscription(data) {

	return apiClient
		.post('/customers/getCustomerSubscription', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function meetingEndEmails(data) {
	return apiClient
		.post('/customers/meeting-closed-emails', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function checkIfOrganisationHasSubscription(data) {
	return apiClient
		.post('/customers/check-organisation-subscription', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function checkCardValidation(data) {
	return apiClient
		.post('/customers/check-card-validation', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}



export async function takeChargeFromCustomer(data){
	console.log("takeChargeFromCustomer ::::::::: ",data)
	return apiClient
	.post("customers/take-charge-from-customer",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
	
}



/**
 * Api to handle Discount from referal
 * @params : data(Type:Object)
 * @response : if have referal discount then update the referal table
 * @author : Manibha
 **/
export async function handleReferralDiscount(data){
	console.log("handleReferralDiscount ::::::::: ",data)
	return apiClient
	.post("customers/handle-referal-discount",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
	
}


/**
 * Api to handle pre authorization of $100 before any job.
 * @params : data(Type:Object)
 * @response : result(Type:Object)
 * @author : Kartik
 **/
 export async function cardPreAuthorization(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/card-pre-authorization', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})

}


/**
 * Api to hold charge of $100 before any job.
 * @params : data(Type:Object)
 * @response : result(Type:Object)
 * @author : Jagroop, Nafees
 **/
let isRequesting = false;
export async function holdChargeFromCustomer(data) {
  if (isRequesting) {
    console.log('API request is already in progress. Will handle after completion.');
	isRequesting = false;
    return Promise.reject('API request is already in progress. Will handle after completion.');
  }

  isRequesting = true;
  return apiClient
    .post('/customers/hold-charge-from-customer', data)
    .then(response => {
      isRequesting = false;
      return response.data;
    })
    .catch(error => {
      console.error('API request failed:', error);
      isRequesting = false;
      return Promise.reject(error);
    });
}



/**
 * Api to deduct or refund holded money.
 * @params : data(Type:Object)
 * @response : result(Type:Object)
 * @author : Jagroop
 **/
export async function deductOrRefundHoldMoney(data) {
	console.log('deductOrRefundHoldMoney function API data:',data)
	return apiClient
		.post('/customers/deduct-or-refund-holded-money', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})

}