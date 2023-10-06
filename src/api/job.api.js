import apiClient, {meetingApiClient} from './index';
// import { openNotificationWithIcon } from '../utils';
import { SECRET_KEY } from '../constants';

export async function getJobs(params) {
	return apiClient
		.get('/jobs', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function createJob(data) {
	return apiClient
		.post('/jobs', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

export async function retrieveJob(jobId,excludeTechNotified) {
	return apiClient
		.get(`/jobs/${jobId}?excludeTechNotified=${excludeTechNotified}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

export async function updateJob(jobId, data) {
	return apiClient
		.put(`/jobs/${jobId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}
export async function findJobByParams(data,pagination={ page: 1,pageSize:10 }){
	return apiClient
	.post('/jobs/fetchjob',data, {params: pagination})
	.then(response =>{
		if(response){
			return {jobs:response.data,totalPages:response.data.totalCount};
		}
		return Promise.reject();
	})
	
}

/**
 * Following API will fetch all the jobs according to the data provided without any pagination
 * @params : data
 * @return : All job list
 * @author : Vinit
 **/
export async function findAllJobsByParams(data){
	return apiClient
	.post('/jobs/fetchAlljobs',data)
	.then(response =>{
		if(response){
			return {jobs:response.data,totalPages:response.data.totalCount};
		}
		return Promise.reject();
	})
	
}
export async function removeJob(jobId) {
	return apiClient
		.delete(`/jobs/${jobId}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function sendJobAcceptEmail(jobId) {
	return apiClient
		.post(`/jobs/${jobId}/accept`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}



export async function sendDataSession(user_email) {
	return apiClient
		.get(`/jobs/sendInvitation/${user_email}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}


export async function getAllLiveTechnicians() {
	return apiClient
		.get(`/source/getAllLiveTechnicians`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

export async function createJobAsGuest(data, token) {

	localStorage.setItem(SECRET_KEY, token);
	sessionStorage.setItem("hideHearAboutUsModal",true);
	return apiClient
		.post('/jobs', data)
		.then(response => {
			localStorage.removeItem(SECRET_KEY);
			console.log("tetch token removed from job.api.js")
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

export async function fetchJobAsGuest(jobId, token) {

	localStorage.setItem(SECRET_KEY, token);
	return apiClient
		.get(`/jobs/${jobId}?excludeTechNotified=no`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

export async function updateJobAsGuest(jobId,data) {

	// localStorage.setItem(SECRET_KEY, token);
	return apiClient
		.put(`/jobs/${jobId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

export async function getTotalJobs(data) {

	return apiClient
		.post('/jobs/totalJobs', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

/**
 * Function will find the pending jobs 
 * @params = data (Type:Object)
 * @response : returns response from function
 * @author : kartar
 */

export async function getPendingJobs(data) {

	return apiClient
		.post('/jobs/pendingJobs', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}
export async function getInprogressJobs(data) {

	return apiClient
		.post('/jobs/totalInprogressJobs', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

export async function getTotalJobsTechnician(data) {

	return apiClient
		.post('/jobs/totalJobsTechnician', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
}
export async function getTotalJobsForTechnicianWithoutAuthenticate(data) {

	return apiClient
		.post('/jobsWithoutAuthenticate/totalWithoutAuthenticateJobsTechnician', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
}

export async function getTotalPaidJobs(data) {

	return apiClient
		.post('/jobs/totalPaidJobs', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}


export async function generateTotalCost(data){
	return apiClient
	.post("/jobs/generateTotalCost",data)
	.then(response => {
			if (response) {
				console.log('response-total-cost',response)
				return response.data;
			}
			return Promise.reject();
		})
			
}

export async function updateTimer(data){
	return apiClient
	.post("jobs/jsonHandling",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
		
}

export async function fetchTimer(data){
	console.log("data ::::::::: ",data)
	return apiClient
	.post("jobs/jsonFetcher",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
		
}

export async function checkLastJobFeedback(data){
	return apiClient
	.post("jobs/checkLastJobFeedback",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
	
}


export async function sendTextForJobSubmission(data){
	return apiClient
	.post("jobs/sendTextForJobSubmission",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
	
}


/**
 * Function will send email to  customer when technician submits long job for approval
 * @params = data (Type:Object)
 * @response : returns response from function
 * @author : Kartik
 */
export async function sendEmailForJobSubmission(data) {
	console.log("sendEmailForJobSubmission ::::::::: ", data)
	return apiClient
		.post("jobs/sendEmailForJobSubmission", data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject()
		})

}


/**
 * Function will send email to  technician if customer approves long job
 * @params = data (Type:Object)
 * @response : returns response from function
 * @author : Kartik
 */
export async function sendEmailForJobApproval(data) {
	console.log("sendEmailForJobApproval ::::::::: ", data)
	return apiClient
		.post("jobs/sendEmailForJobApproval", data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject()
		})

}


/**
 * Function will send email to  technician if customer rejects long job
 * @params = data (Type:Object)
 * @response : returns response from function
 * @author : Kartik
 */
export async function sendEmailForJobRejection(data) {
	console.log("sendEmailForJobRejection ::::::::: ", data)
	return apiClient
		.post("jobs/sendEmailForJobRejection", data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject()
		})

}


/**
 * Function will send sms to  customer if T declines the scheduled accepted job
 * @params = data (Type:Object)
 * @response : returns response from function
 * @author : Manibha
 */
export async function sendSmsForScheduledDeclinedJob(data){
	console.log("sendSmsForScheduledDeclinedJob ::::::::: ",data)
	return apiClient
	.post("jobs/sendSmsForScheduledDeclinedJob",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
	
}

/**
* Function will get total count of pending jobs of the customer
* @params = data (Type:Object)
* @response : returns response from function
* @author : Nafees
*/
export async function latestpendingJobs(data) {

	return apiClient
		.post('/jobs/latestpendingJobs', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})

}
export async function latestJobForCustomer(data) {

	return apiClient
		.post('/jobs/latestJobForCustomer', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})

}

/**
 * Stops timing for long job
 * @params : data(Type:Object)
 * @response: calls api from the meeting page and stops that timer
 * @author : Sahil
 */
 export async function longJobTimerHandler(data){
 	try{
 		let response = await meetingApiClient.post("/job/long-job-timer",data)
 		if (response.status == 200){
 			console.log("response >>>>>",response.data)
 			return response.data
 		}
 		else{
 			return {"success":false}
 		}
 	}
 	catch(err){
 		console.log("error in longJobTimerHandler :::: ",err)
 	}
 }

/**
 * cancel schedule job by customer or tech
 * @params : 
 * 		jobId(Type:String): selected Job Id,
 * 		data(Type:Object): reason, calcellationBy and current user
 * @response: calls api and decline the job by tech or customer
 * @author : Ridhima Dhir
 */
export async function cancelScheduleJob(jobId, data) {
	return apiClient
		.post(`/jobs/scheduleJobCalcellation/${jobId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}


/**
 * check schedule job availability by primary and secondry time.
 * @params : 
 * 		jobId(Type:String): selected Job Id,
 * 		data(Type:Object): reason, calcellationBy and current user
 * @response: calls api and decline the job by tech or customer
 * @author : Ridhima Dhir
 */
 export async function checkScheduleJobAvailability(jobId, data) {
	return apiClient
		.get(`/jobs/checkScheduleJobAvailability/${jobId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}

/**
 * pause timer when job is submitted by technician from job details page.
 * @params : 
 * @response: calls api and decline the job by tech or customer
 * @author : sahil sharma
 */
 export async function pauseStartLongJobTimer(data) {
	try{
		return meetingApiClient
		.post('/job/pauseLongJobTimer', data)
		.then(response => {
				return response.data;
		})
	}catch(err){
		console.log("error in Pause timer long job",err)
	}
				
}

export async function getTwilioChatUserDetails(params) {
	return apiClient
	.post(`/twilio-chat/getTwilioUserChatDetails/`,params)
		.then(response => {
			if (response) {
				console.log('response :::::::::::getTwilioChatUserDetails',response)
				return response.data;
			}
			return Promise.reject();
		})
}