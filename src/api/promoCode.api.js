import apiClient from './index';   

export async function retrievePromoData(coupon) {
  coupon = encodeURIComponent(coupon)
  return apiClient
    .get(`/promocode/promocode-list/${coupon}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function updatePromoData(id, data ){
  return apiClient
    .patch(`/promocode/${id}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })  
}
