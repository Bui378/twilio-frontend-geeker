import {ambassdorApiClient} from './index'
import {updateUser} from './users.api'
import { AMBASSODOR_CAMPAGIN_TOKEN,AMBASSODOR_SEGMENT_ID} from '../constants';
/**
 * Create Ambassdor User Api and updates user if referal found
 * @params : details(Type:Object)
 * @return : returns a object with message and success variable
 * @author : Sahil
 **/
export async function createAmbassodorUser(details){
	try{
		let uniqueId  = details.customer.id
		console.log("uniqueId ::::::",uniqueId)
		let traits = {}
		let options = {}
		traits['email'] = details.email
		options['segments'] =AMBASSODOR_SEGMENT_ID
		options['emailNewAmbassador'] = true
		options['campaigns'] = AMBASSODOR_CAMPAGIN_TOKEN
		let response = await window.mbsy?.identify(uniqueId,traits,options)
		let responseForAmbassodrUser = await window.mbsy?.getReferrerInfo(async function(referrerData) {
			if(referrerData.campaign != null){
				let trackResponse = await window.mbsy?.track(referrerData)
				// await updateUser({userId:details.id,referalData:referrerData})
				console.log("responiveNess :::::: ",response)
			}
		})		
		return {"success":true,"message":"Successfully added to ambassodor"}
	}
	catch(err){
		console.log("Error in createAmbassodorUser :::: ",err)
		return {"success":false,"message":"unable to add in ambassodor"}
	}
}

/** 
 * Call Record Event for Ambassador
 * @params : user(Type:Object)
 * @return : json response
 * @author : Sahil
 **/
 export async function eventUserApi(data){
 	try{
 		let res = ambassdorApiClient
 		.post('/json/event/record/',data)
 		.then(response =>{
 			if(response){
 				console.log(">>>>response found >>>>>")
 				return true
 			}
 			return Promise.reject();
 		})
 	}
 	catch(err){
 		console.log("error in eventUserApi :::: ",err)
 	}
 }

 
/** 
 * Get Ambassador user from Api
 * @params : params(Type:Object)
 * @return : json response consist of user details
 * @author : Sahil
 **/

 export async function getAmbassador(params){
 	try{
 		let response = await ambassdorApiClient.get("/json/ambassador/get/?email="+params.email)
 		console.log("response :::::::::",response)
 		if (response.status == 200){
 			let userId = params.userId
 			let referrerData = {}
 			let ambassdorData = response.data.response.data.ambassador
 			let campagins =ambassdorData.campaign_links
 			let campagin_object = campagins.find((ele)=>{return ele.campaign_uid == AMBASSODOR_CAMPAGIN_TOKEN})
 			if (campagin_object){
 				let referrerData = {
 					"url":campagin_object.url,
 					"campaign":campagin_object.campaign_uid
 				}
 				await updateUser({userId:userId,referalData:referrerData})
 			}
 			

 			return response.data.response.data
 		}
 		else{
 			return false
 		}
 	}
 	catch(err){
 		console.log("error in getAmbassador :::: ",err)
 	}
 }