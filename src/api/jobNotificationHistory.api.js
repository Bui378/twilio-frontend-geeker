import apiClient from './index';

/**
 * Function will fetch all the record of notified techs for a job whose job_id is provided.
 * @params = data (Type:Object)
 * @response : returns all the notified techs for the given job.
 * @author : Vinit
 */

export async function getJobNotificationHistory(jobId) {
	return apiClient
		.get(`/jobNotificationHistory/${jobId}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}