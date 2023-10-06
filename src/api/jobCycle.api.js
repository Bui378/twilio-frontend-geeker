import apiClient from './index';   
import mixpanel from 'mixpanel-browser';

 /**
	 * Following function is responsible to save JobLifeCycle with tag, jobId and userId information.
     * @params =  tagName (String:Required) : Fired Action.
     * @params =  jobId (String:Optional) : Job ID.
     * @params =  userId (String:Optional) : User ID.
	 * @response : jobCycleResponse (Object) : Save jobCycle response.
	 * @author : Karun (31/08/2022)
	 */
export async function create(tagName, jobId=false, userId=false,maxRetry=1) {
  try{
    let lifeCycleObj = {};
    lifeCycleObj.Tag = tagName;
    if (jobId) lifeCycleObj.JobId = jobId;
    if (userId) lifeCycleObj.UserId = userId;

    // mixpanel code//
    if(userId){
      mixpanel.identify(userId);
    }else{
      mixpanel.identify(jobId);
    }
		mixpanel.track('Job lifecycle tag : ' + tagName,{'JobId':jobId, 'UserId': userId});
		// mixpanel code//
    return apiClient
      .post('/jobsteps', lifeCycleObj)
      .then(jobCycleResponse => {
        if (jobCycleResponse) {  
            return jobCycleResponse.data;
        }  
        return Promise.reject();
      }) 
  }catch(err){
    console.log("error in JobCycle create ::::: ", err);
    setTimeout(() => {

      if (maxRetry === undefined) {
        let maxRetry = 1
      } else {
        maxRetry += 1
      }
      if (maxRetry <= 5) {
        create(tagName, jobId, userId, maxRetry);
      } 
    }, 2000);

    // mixpanel code//
    if (userId) {
      mixpanel.identify(userId);
    } else {
      mixpanel.identify(jobId);
    }
    mixpanel.track('error in JobCycle create :::::', err);
    // mixpanel code//
  }
}

/**
 * add Job Tags 
 * @params : data(Type:Object),
 * @response : update JobId in JobLifecycle table
 * @author : Sahil Sharma
 **/
 export async function update(data) {
  try{
  return apiClient
    .put('/jobsteps', data)
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
