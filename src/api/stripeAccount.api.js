import apiClient from './index';   
/**
 * To create stripe account
 * @params : data(Type:Object),
 * @response : add data in JobLifecycle table
 * @author : Sahil Sharma
 **/
export async function createStripeAccount(data) {
  try{
  return apiClient
    .post('/stripeAccount/create', data)
    .then(response => {
      if (response) {  
          return response.data;
      }  
      return Promise.reject();
    }) 
  }catch(err){
    console.log(err);
  } 
}

/**
 * To fetch EarningDetails By Paycycle
 * @params : data(Type:Object),
 * @response : add data in JobLifecycle table
 * @author : Sahil Sharma
 **/
export async function getEarningDetailsByPaycycle(userId,techId) {
  try{
  return apiClient
    .get(`/stripeAccount/pacycles/${userId}/${techId}`)
    .then(response => {
      if (response) {  
          return response.data;
      }  
      return Promise.reject();
    }) 
  }catch(err){
    console.log(err);
  } 
}

/**
 * To Generate Link For  Stripe Account Onboarding
 * @params : data(Type:String),
 * @response : get Detail Submission Status
 * @author : Sahil Sharma
 **/
export async function generateLink(data) {
  try{
  return apiClient
    .post('/stripeAccount/generate-account-link',data)
    .then(response => {
      if (response) {  
          return response.data;
      }  
      return Promise.reject();
    }) 
  }catch(err){
    console.log(err);
  } 
}

/**
 * To get Detail Submission Status
 * @params : data(Type:String),
 * @response : get Detail Submission Status
 * @author : Sahil Sharma
 **/
export async function getAccountDetailSubmission(data) {
  try{
  return apiClient
    .post('/stripeAccount/account-status',data)
    .then(response => {
      if (response) {  
          return response.data;
      }  
      return Promise.reject();
    }) 
  }catch(err){
    console.log(err);
  } 
}


/**
 * To get login link
 * @params : data(Type:String),
 * @response : get Detail Submission Status
 * @author : Sahil Sharma
 **/
 export async function getAccountloginLink(data) {
  try{
  return apiClient
    .post('/stripeAccount/stripe-loginLink',data)
    .then(response => {
      if (response) {  
          return response.data;
      }  
      return Promise.reject();
    }) 
  }catch(err){
    console.log(err);
  } 
}

/**
 * To get coupon info
 * @params : couponId (Type: String),
 * @response : Coupon object
 * @author : Vinit Verma
 **/
 export async function getCouponInfo(id) {
  try{
    console.log("My conosle for id", id)
  return apiClient
    .post('/stripeAccount/coupon-info',{id})
    .then(response => {
      if (response) {  
          return response.data;
      }  
      return Promise.reject();
    }) 
  }catch(err){
    console.log(err);
  } 
}


