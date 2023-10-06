import apiClient from './index';   
// import { SESSION_EXPIRE_URL } from '../constants';

/**
 * To create promo for customer
 * @params : data(Type:Object),
 * @author : Sahil Sharma
 **/
export async function create(data) {
    console.log('Data>>>>>',data)
  return apiClient
    .post('/promos', data)
    .then(response => {
      console.log('Response')
      if (response) {
        return response.data;
        // return Promise.resolve(response.data);
      }
      return Promise.reject();
    })  
}

/**
 * To fetch  promodata 
 * @params : {"technician_id","redeemed"}
 * @response : promodata
 * @author : Sahil Sharma
 **/
export async function retrievePromoData(data) {
  console.log(data, '>>>data');
  return apiClient
    .post('/promos/getPromoDataByParams', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

/**
 * To fetch  promocodes list of customer
 * @params : customer_id,
 * @response : promocodes available for users
 * @author : Sahil Sharma
 **/
export async function retrieveCustomerPromoCodes(data) {
  console.log(data, '>>>data');
  return apiClient
    .post('/promos/getCustomerPromoCodes', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

/**
 * To fetch  couponcode details
 * @params : coupon id,
 * @response : Coupon details object
 * @author : Sahil Sharma
 **/
export async function fetchCoupon(data){
  return apiClient
  .post('/promos/fetch-coupon', data)
  .then(response => {
    console.log('Response')
    if (response) {
      return response.data;
    }
    return Promise.reject();
  })  
}

/**
 * To validate couponcode 
 * @params : coupon id,
 * @response : object
 * @author : Sahil Sharma
 **/

export async function validateCoupon(data){
  return apiClient
  .post('/promos/validate-coupon', data)
  .then(response => {
    console.log('Response')
    if (response) {
      return response.data;
    }
    return Promise.reject();
  })  
}





