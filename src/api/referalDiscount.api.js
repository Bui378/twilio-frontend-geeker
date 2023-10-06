import apiClient ,{meetingApiClient} from './index';   
/**
 * add referal Discount 
 * @params : data(Type:Object),
 * @response : add data in referal table
 * @author : Sahil
 **/
export async function addReferalDiscount(data){
	try{
		return apiClient
		.post('/referalDiscount',data)
		.then(response=>{
			if(response){
				return response
			}
		})
		return Promise.reject();
	}
	catch(err){
		console.log("error in addReferalDiscount :::::: ",err)
	}
}

/**
 * get referal table details 
 * @params : params(Type:Object),
 * @response : get referal data Object
 * @author : Sahil
 **/


export async function getReferalByParams(params){
	try{
		return apiClient
		.get('/referalDiscount',{params})
		.then(response => {
			return response
		})
		return Promise.reject();
	}
	catch(err){
		console.log("error in getReferalByParams :::: ",err)
	}
}


/**
 * update referal table details 
 * @params : data(Type:Object),
 * @response : update data in referal table
 * @author : Sahil
 **/

export async function updateReferalByParams(data){
	try{
		return apiClient
		.post("/referalDiscount/update",data)
	}
	catch(err){
		console.log("error in updateReferalByParams ::::: ",err)
	}
}


/**
 * refund the payment if technician do not cut payment
 * @params : data(Type:Object),
 * @response : refund the amount in referal table
 * @author : Sahil
 **/

export async function refundUserAmount(data){
	try{
		return apiClient
		.post("/referalDiscount/refund",data)
	}
	catch(err){
		console.log("error in updateReferalByParams ::::: ",err)
	}
}


/**
 * Get Discount List
 * @params : params(Type:Object)
 * @response : Get list of discounts in table
 * @author Sahil
 **/

 export async function getReferalDiscountHistory(params){
 	try{
 		return apiClient
 		.get("/referalDiscount/discount-history",{params})
 		.then(response=>{
 			return response.data;
 		})
 	}
 	catch(err){
 		console.log("error in getReferalDiscountHistory :::::: ",err)
 	}
 }

/**
 * Get Total Referal Amount
 * @params : data(Type:Object)
 * @response : Calls the api which gets the total referal amount
 * @author  Sahil
 */
export async function getTotalReferalAmount(data){
	try{
		return apiClient
		.post("/referalDiscount//total-referal",data)
		.then(response =>{
			return response.data
		})
	}
	catch(err){
		console.log("Error in getTotalReferalAmount ::: ",err)
	}
}

/**
 * Update referal rewards for user
 * @params : data(Type:Object)
 * @response : Calls the api in meeting backend page 
 * @author : Sahil
 **/
export async function updateReferalDiscount(data){
	try{
		return meetingApiClient
		.post("/discounts/check-for-rewards",data)
		.then(response =>{
			return response.data
		})
	}
	catch(err){
		console.log("error in updateReferalDiscount ::::::::",err)
	}
}
