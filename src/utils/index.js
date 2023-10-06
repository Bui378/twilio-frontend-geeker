import moment from 'moment';
import { notification } from 'antd';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { Button } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import ReactGA from "react-ga";
import { GOOGLE_ANALYTICS_PROPERTY_ID,LAUNCHDARKLY_JOBSUMMARY_ESTIMATES_VISIBILITY,STRIPE_KEY,STRIPE_TEST_KEY} from '../constants';
import { JobTags } from '../constants/index.js';
import * as JobCycleApi from '../api/jobCycle.api';
import * as CustomerApi from '../api/customers.api';
import * as JobApi from '../api/job.api';
import * as UserApi from '../api/users.api'
import * as WebSocket from '../api/webSocket.api'
import { loadStripe } from '@stripe/stripe-js';
import {JOB_STATUS} from '../constants/index';
// import { Redirect } from 'react-router';
import { useEffect, useRef } from 'react';
import LDClient from 'launchdarkly-js-client-sdk'
import { sendToGTM } from '@elgorditosalsero/react-gtm-hook';
import sha256 from 'crypto-js/sha256';
export const getFullName = (item) => {
  const { firstName, lastName } = item;

  if (item) return `${firstName} ${lastName}`;

  return '';
};

export function formatDateTime(date) {
  return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
}

/**
 * Check if user is live or not
 * @params = user (Type:Object)
 * @response : return true if user is live else returns false
 * @author : Sahil
 */

export const isLiveUser = async(user)=>{
  let userType = 'live'
  try{
    if (user.userType == 'technician'){
        userType = user?.technician?.technicianType
    }
    else{
        userType = user?.customer?.customerType
    }
    if (userType == 'live'){
      return true
    }
    else{
      return false
    }
  }
  catch(err){
    return true
    console.log("error in checkForTestOrLiveUser ::::",err)
  }
}

/**
 * Check if Guestuser is live or not
 * @params = user (Type:Object)
 * @response : return true if user is live else returns false
 * @author : kartar
 */

export const isGuestLiveUser = (user)=>{
  let userType = 'live'
  try{
    if (user.userType == 'technician'){
        userType = user?.technician?.technicianType
    }
    else{
        userType = user?.customer?.customerType
    }
    if (userType == 'live'){
      return true
    }
    else{
      return false
    }
  }
  catch(err){
    return true
    console.log("error in checkForTestOrLiveUser ::::",err)
  }
}


export const getStripeObject = async (user)=>{
  let stripePromise;
  try{
    let liveUser = await isLiveUser(user)
    if(liveUser){
      console.log("live STRIPE_KEY",STRIPE_KEY)
      stripePromise = loadStripe(STRIPE_KEY)
    }else{
      console.log("test STRIPE_TEST_KEY",STRIPE_TEST_KEY)
      stripePromise = loadStripe(STRIPE_TEST_KEY)
    }
  }catch(err){
    console.log("error in getStripeObject ::::",err)
  }
  return stripePromise
}

/**
 * It sets the variable which opens the referal window
 * @params : {void}
 * @response : {void}
 * @author :Sahil
 * */
export const handleRefModal = ()=>{
    window.refdCode = 'open'
    setTimeout(()=>{
      window.refdCode = 'false'
    },2000)
  }


/**
 * Get Browser Cookie
 * @params = cname (Type:string)
 * @response : return specific cookie value
 * @author : Sahil
 */
export const getCookie = (cname) => {
  const name = cname + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}











  /**
   * Starts a call on technician side
   * @params = jobId(Type:Integer) , socket(Type:Object)
   * @response : it redirects the technician to meeting page ,starts a call with customer and sends the socket to change the button on client screen.
   * @author : Sahil
  */

export const handleStartCall = async(e,jobId,socket)=>{
  try{
    console.log('e,jobId,socket ::: ',e,jobId,socket)
    if(e && e.currentTarget && e.currentTarget.disabled){
      e.currentTarget.disabled=true;
    }
    let updatedJob = await JobApi.retrieveJob(jobId)
    console.log('updatedJob in handleStartCall ',updatedJob)
    socket.emit("meeting-started-by-technician", {jobData:updatedJob})
    console.log('handleStartCall after meeting-started-by-technician socket hit')
    if(!updatedJob.GA_start_call_event_called){
      console.log('handleStartCall inside if of ga code update')
      //GA3 tag commented by Vinit on 24/04/2023.
      GAevent('Call Started','tech-start-call', updatedJob.id ,updatedJob?.technician?.id)
      await JobApi.updateJob(updatedJob.id,{GA_start_call_event_called:true})
      console.log('handleStartCall after GA event update in job table')
    }
    
    await JobCycleApi.create(JobTags.TECHNICIAN_START_CALL, jobId, false);
    console.log('handleStartCall after job cycle update')
    socket.emit('call:started',{id:jobId})
    console.log('handleStartCall after call:started socket hit and going to finally in meet page')
    window.location.href =  process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
  }
  catch(err){
    console.log("error in handleStartCall >>>",err)
  }
}


  /**
   * Sets a cookie if it is empty
   * @params = user (Type:Object)
   * @response : if cookie is not set it will set the cookie
   * @author : Sahil
  */

export const get_or_set_cookie = (user)=>{
  try{
    console.log(">>hello jobs")
    let cookieSet = getCookie('user_id')
    if (cookieSet != '') return;
    if (cookieSet == ''){
      Cookies.set('user_id', user.id ,{"path":'/',"domain":process.env.REACT_APP_COOKIE_DOMAIN})
      return;
    }
  }
  catch(err){
    console.log("error in get_or_set_cookie>>>>",err)
  }
}

export function getFormattedTime(time) {
  const min = Math.floor(time / 60);
  const sec = time % 60;
  return moment(`${min}:${sec}`, 'mm:ss').format('mm:ss');
}

export const openNotificationWithIcon = (type, header, message) => {
  notification[type]({
    message: header,
    description: message,
  });
  notification.config({
    duration: 10,
  })
};

export const getIdFromJobId = (jobId) => jobId.split('job_')[1];

export const roleStatus = {
  OWNER: "owner",
  ADMIN: "admin",
  USER:"user"
}


export const convertTimeFormat = (seconds)=>{
    let minutes = parseInt(seconds/60)
    let sec = seconds%60
    if (sec <10){
      sec = "0"+sec
    }
    if(minutes <10){
      minutes = "0"+minutes
    }
    return `${minutes} : ${sec}`
  }




export const showMeetingNotification = ()=>{
  notification.destroy()
  clearInterval(window.alreadyFilledInterval)
  window.localStorage.setItem("notificationSent",true)
  notification.info({
    duration:7.5,
    message : `Your paid minutes are starting now`

  })
}



export const lastMinuteTimerPoper = (
  secondsRm = 60,
  updateTimingsForFreeCustomer,
  endMeeting,
  handleEndOnPopup

  )=>{
  clearInterval(window.clearIntervalTimer)
  window.localStorage.setItem("extraMin",true)
  let key = "updateAble"
  let lastSecondsRemain = secondsRm
  const btn = (
        <>
            <Button type="primary" className="acceptCharges btn " size="small" onClick={()=>{updateTimingsForFreeCustomer(key)}}>
              Continue meeting with charges
            </Button>
            <Button variant="danger" className="mt-2" size="small" onClick={()=>{handleEndOnPopup(key)}}>
              End Meeting
          </Button>
        </>
     );
  let lastTimeRemain = convertTimeFormat(lastSecondsRemain)
  notification.info({
    key,
    duration:null,
    btn,
    message:"Last Minute Remaning",
    description :`Your meeting is going to end in ${lastTimeRemain}`
  })
  window.lastMinuteInterval = setInterval(()=>{
    lastSecondsRemain = lastSecondsRemain -1
    lastTimeRemain = convertTimeFormat(lastSecondsRemain)
    window.localStorage.setItem("secs",lastSecondsRemain)
    if(lastSecondsRemain > 0){
      notification.info({
      key,
      btn,
      duration:null,
      message : "Last Minute Remaning",
      description : `Your meeting is going to end in ${lastTimeRemain}`
    })
    }

    if(lastSecondsRemain === 0){
    notification.destroy()
    endMeeting()
    clearInterval(window.lastMinuteInterval)
  }

      },1000)
  console.log("lastSecondsRemain :::::::::",lastSecondsRemain)

}


export const cardFullFillTimer = (
  clientMinutes,
  secondsRm = 120,
  updateTimingsForFreeCustomer,
  endMeeting,
  handleEndOnPopup
  )=>{
    let key = 'updateAble'
    let secondsRemain = secondsRm
    let timeRemain = convertTimeFormat(secondsRemain)
    let warningTimerCalledAlready = false
    const btn = (
        <>
            <Button type="primary" className="acceptCharges btn " size="small" onClick={()=>{updateTimingsForFreeCustomer(key)}}>
              Continue meeting with charges
            </Button>
            <Button variant="danger" className="mt-2" size="small" onClick={()=>{handleEndOnPopup(key)}}>
              End Meeting
          </Button>
        </>
     );
    notification.info({
      key,
      duration : null,
      btn,
      message :`Oh no! Your Free ${clientMinutes} minute session is almost over. Would you like to continue?`,
      description : `Your meeting is going to end in ${timeRemain}`
    })

    window.cardTimerUpdater = setInterval(()=>{
      console.log("this part this wrking 1")
      secondsRemain = secondsRemain -1
      window.localStorage.setItem("secs",secondsRemain)
      timeRemain = convertTimeFormat(secondsRemain)
      if(secondsRemain > 0){
        notification.info({
          key,
          btn,
          duration : null,
          message :`Oh no! Your Free ${clientMinutes} minute session is almost over. Would you like to continue?`,
          description : `Your meeting is going to end in ${timeRemain}`
        })
      }
    },1000)
    window.clearIntervalTimer = setInterval(()=>{
      if(secondsRemain === 0){
        console.log("this again working")
        clearInterval(window.cardTimerUpdater)
        if(!warningTimerCalledAlready){
          warningTimerCalledAlready = true
          lastMinuteTimerPoper(60,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup)
        }
        // notification.destroy()
      }
      for(var k in window.cardTimerUpdater){
        console.log("the array intervals :::::::::",window.cardTimerUpdater[k])
      }


    },1000)
}

/**
 * this function is a common function for accepting the job for technician
 * param : user (Type:Object)
 * param : jobId (Type:String)
 * param : location (Type:Object)
 * response : Boolean (Type :Object)
 * author : Sahil
 **/
export const checkJobValidations = async(user,jobId,location)=>{
  try{
    const res = await JobApi.retrieveJob(jobId);
    if (res.status !== 'Declined' && (res.technician == undefined || res.technician == '') && (!res.declinedByCustomer.includes(user.technician.id))) {
            const webSocket = await WebSocket.create({
              hitFromTechnicianSide: true, user: user.id, job: res.id, socketType: 'new-appointment-request', userType: 'technician',
            });
            const data_to_send = {
              jobId,
              mainJob: res,
              customer: (res && res.customer) ? res.customer.id : '',
              technicianName : (user && user?.technician) ? user.firstName + " " + user.lastName : "Technician",
              technician: (user && user?.technician) ? user?.technician.id : '',
              userIds:
                          location.state && location.state.userIds
                            ? location.state.userIds.filter(item => item !== user.id)
                            : [],
              web_socket_id: webSocket.websocket_details.id,
            };
            //GA3 tag commented by Vinit on 24/04/2023.
            GAevent('Technician Accepted', 'tech_job_accepted', res?.technician?.id, res.id)
            mixpanel.identify(user.email);
            mixpanel.track('Technician - Job accepted by technician.', { 'JobId': res.id, 'technicianName':data_to_send.technicianName});
            console.log('Technician accepted by utils index',data_to_send.technicianName);
            WebSocket.technician_accepted_customer(data_to_send);

            return true
          }
    else{
      return false
    }

    }
    catch(err){
      mixpanel.identify(user.email);
      mixpanel.track('Error : Technician - Job accepted by technician.', { 'JobId': jobId});
    console.log("error in checkJobValidations::::",err)
  }

}



export const cardAlreadyFilledTimer = (seconds = 120)=>{
  let secRm = seconds
  let key = "updateAlreadyFilledTimer"
  let timeRemain  = convertTimeFormat(secRm)
  notification.info({
    key,
    duration : null,
    message :`Your free minutes are expiring `,
    description:timeRemain
  })

  window.alreadyFilledInterval = setInterval(()=>{
    if(secRm > 0){
      secRm = secRm - 1
      timeRemain = convertTimeFormat(secRm)
      window.localStorage.setItem("notificationSent",false)
      window.localStorage.setItem("secs",secRm)
      notification.info({
        key,
        duration : null,
        message :`Your free minutes are expiring `,
        description:timeRemain
      })
    }


    if(secRm === 0){
      showMeetingNotification()
    }
  },1000)


}


export const chargeMeetingInfoPopup = (waitForMinSec,audio,socket,jobId)=>{
  try{
    window.theTimeout = setTimeout(()=>{
                console.log("set timeout call in updateJobtime")
                socket.emit("notification-to-technician",{"jobId":jobId})
                audio.play()
                notification.info({
                  duration:4.5,
                  className:"popUpNotification",
                  message: `Oh no! Your Free 6-minute session is over. `,
                    description: `From Now on you you will be charged`
                })
            },waitForMinSec)
  }
  catch(err){
    console.log("error in chargeMeetingInfoPopup ::::: ",err)
  }
}

export const clearAllTimeOuts = ()=>{
    if(window.notesSaveLoader){
      clearTimeout(window.notesSaveLoader)
    }
    if(window.setDisableCall){
      clearTimeout(window.setDisableCall)
    }
    if(window.pauseTimer){
      clearTimeout(window.pauseTimer)
    }
    if(window.startTimer){
      clearTimeout(window.startTimer)
    }
    if(window.intialJitsi){
      clearTimeout(window.intialJitsi)
    }
    if(window.recordingTimeOut){
      clearTimeout(window.recordingTimeOut)
    }
    if(window.jitsiTimeout){
      clearTimeout(window.jitsiTimeout)
    }
    if(window.meeting_pause){
      clearTimeout(window.meeting_pause)
    }
    if(window.tiRefTimeout){
      clearTimeout(window.tiRefTimeout)
    }
    if(window.timerButtonTimeout){
      clearTimeout(window.timerButtonTimeout)
    }
    if(window.retryJitsiTimeout){
      clearTimeout(window.retryJitsiTimeout)
    }
    if(window.showLoaderTimeout){
      clearTimeout(window.showLoaderTimeout)
    }
    if(window.fetchNotificationTimeOut){
      clearTimeout(window.fetchNotificationTimeOut)
    }
    if(window.startRecordingTimeOut){
      clearTimeout(window.startRecordingTimeOut)
    }
    if(window.intialJitsiTimeOut){
      clearTimeout(window.intialJitsiTimeOut)
    }

    if(window.stopPauseTimer){
      clearTimeout(window.stopPauseTimer)
    }

    if(window.participantInfo){
      clearTimeout(window.participantInfo)
    }

    if(window.confirmNotesSubmit){
      clearTimeout(window.confirmNotesSubmit)
    }

    if(window.alertMessageTimeOut){
      clearTimeout(window.alertMessageTimeOut)
    }

    if(window.noteSaveLoaderTimeOut){
      clearTimeout(window.noteSaveLoaderTimeOut)
    }

    if(window.notesDeclineTimer){
      clearTimeout(window.notesDeclineTimer)
    }

    if(window.disabledCallTechnician){
      clearTimeout(window.disabledCallTechnician)
    }

  }

/**
 * custom event for google analytics with customer id as user identification
 * @params = category (Type:String), action (Type:String), label (Type:String), customer_id(Type:String)
 * @author : Neha Sharma
*/
//GA3 tag commented by Vinit on 24/04/2023.
export const GAevent = (category, action, label, customer_id) => {
  try{
    console.log("react initislize", GOOGLE_ANALYTICS_PROPERTY_ID, customer_id, ReactGA);
    ReactGA.initialize(GOOGLE_ANALYTICS_PROPERTY_ID,{ debug: true,
      titleCase: false,
      gaOptions: {
        userId: customer_id
      }
    });
    ReactGA.event({
      category: category,
      action: action,
      label: label,
      value:1
    });
  } catch (err) {
    console.error("Google Analytics try catch error >>>>>>>>>>",err);
  }
}

/**
 * custom event for google analytics with job id as job identification
 * @params = category (Type:String), action (Type:String), customer_id(Type:String), job_id(Type:String), value (Type:Number)
 * @author : Kartik
*/
export const GArevenueEvent = (category, action, customer_id, job_id, value) => {
  try {
    console.log("react initislize", GOOGLE_ANALYTICS_PROPERTY_ID, job_id, ReactGA)
    console.log("GArevenueEvent called >>>>>", category, action, customer_id, job_id, value)
    ReactGA.initialize(GOOGLE_ANALYTICS_PROPERTY_ID, {
      debug: true,
      titleCase: false,
      gaOptions: {
        userId: customer_id
      }
    });
    ReactGA.event({
      category: category,
      action: action,
      label: job_id,
      value: value
    });
  } catch (err) {
    mixpanel.identify(customer_id);
    mixpanel.track('Error while adding Event in google analytics', { 'JobId': job_id });
    //console.error("Google Analytics try catch error >>>>>>>>>>",err);
  }
}

/**
 * push user data to GTM dataLayer
 * @params = eventName (Type:String), user (Type:object), appUrl (Type:String)
 * @author : Igor Kolosov
 */

export const PushUserDataToGtm = (eventName, user, appUrl, value = null) => {
  try {
    if (user) {
      const phoneStrippedPlus = user?.customer?.phoneNumber?.replace(/\+/g, '');
      const gtmDataObj = {
        event: eventName,
        environment: appUrl,
        value,
        customerDataHashed: {
          id: sha256(user?.customer?.id || user?.id).toString() || 'guest_user',
          firstName: sha256(user?.firstName).toString() || 'guest_user',
          lastName: sha256(user?.lastName).toString() || 'guest_user',
          email: sha256(user?.email).toString() || 'guest_user',
          phone: sha256(phoneStrippedPlus).toString() || 'guest_user',
        }
      };
      // there is some race condition here with sendDataToGTM, so we have to initialize dataLayer first
      window.dataLayer = window.dataLayer || [];
      sendToGTM({dataLayerName: 'dataLayer', data: gtmDataObj});
    }
  } catch (err) {
    console.error(`Data for ${eventName} can't be pushed to frontend GTM dataLayer >>>>>>>>>>`,err);
  }
}

/**
 * send customer to meeting
 * @params = item (Type:object), message (Type:String)
 * @author : Neha Sharma
*/
export const sendCustomerToMeeting = (item, user, message)=>{
  try{
    get_or_set_cookie(user)
    // mixpanel code//
    mixpanel.identify(user.email);
    mixpanel.track(message, {'JobId':item.id});
    // mixpanel code//
    window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${item.id}`
  } catch (err) {
  }
}
/**
 * this function is a common function for primary time
 * param : scheduleJobTime (Type:Object)
 * response : date (Type :date Object)
 * author : kartar singh
  */
export const getPrimaryTime = (scheduleJobTime) =>{
    let  selectedScheduleJobTime ;

    if(scheduleJobTime.durationType ==="AM"){
      if(scheduleJobTime.hours  === "12"){
        selectedScheduleJobTime =  new Date(scheduleJobTime.date.setHours(0))
      }else{
        selectedScheduleJobTime =  new Date(scheduleJobTime.date.setHours(scheduleJobTime.hours))
        }
    }

    if(scheduleJobTime.durationType ==="PM"){
      if(scheduleJobTime.hours  === "12"){
        selectedScheduleJobTime = new Date(scheduleJobTime.date.setHours(12))
        }else{
          selectedScheduleJobTime =new Date(scheduleJobTime.date.setHours(Number(scheduleJobTime.hours) +12) )
        }
    }
    selectedScheduleJobTime = new Date(selectedScheduleJobTime).setMinutes(scheduleJobTime.minutes)
    let finalTime = new Date(selectedScheduleJobTime)
    return finalTime
  }

/**
   * Console log the data for debuging
   * @params = message (Type:string)
   * @response : print log in browser
   * @author : Ridhima Dhir
  */
  export const consoleLog = (message)=>{
    console.log(message)
  }

/**
 * this function use to decide the queries
 * @params : value(Type:String)
 * @params : user (Type:Object)
 * @params : softwareArray(Type:Array)
 * @response : query (Type:Object)
 * @author : Sahil
 **/
export const queryDecider = (value,user,softwareArray= false,techMainSoftwares=[],techSubSoftwares=[],mainSoftwareWithoutState=[],subSoftwareWithoutState=[])=>{

    let query = {}
    if(user?.userType === "technician"){
      let newSoftArray = []
      if (!softwareArray){
        newSoftArray =  techMainSoftwares.concat(techSubSoftwares)
      }
      else{
        newSoftArray = softwareArray
      }
       let withoutStateVariable = mainSoftwareWithoutState.concat(subSoftwareWithoutState);
      query['software'] = { "$in": (newSoftArray.length > 0 ?  newSoftArray : withoutStateVariable) }

    }
    if(user?.userType === "customer"){
      query['customer'] = user?.customer?.id
    }
    if(value === "Active Jobs"){

      query['$or'] =[{ status: {$in:["Scheduled","Waiting","Inprogress","Accepted","long-job", "Pending","Draft"]} }]
    }
    if(value === "Pending Jobs"){
      query['status'] = "Pending"
      console.log("fetchActiveJobs")
    }
    if(value === "Completed Jobs"){

      query['$or'] =[ { status: {$in:["ScheduledExpired","Expired","Completed","Declined"]} }]
      console.log("Completed Jobs")
    }
    if(value === "Completed Jobs Tech"){
      console.log("Checking user Data", user)
      let newSoftArray =  techMainSoftwares.concat(techSubSoftwares)
      let withoutStateVariable = mainSoftwareWithoutState.concat(subSoftwareWithoutState);
      // query['software'] = { "$in": (newSoftArray.length > 0 ?  newSoftArray : withoutStateVariable) }
      // query['technician'] = user?.technician?.id
      // query['status'] = "Completed"
      query["$or"] = [
        {'tech_declined_ids':{"$in":[user?.technician?.id]}},
        {'declinedByCustomer':{"$in":[user?.technician?.id]}},
        {'technician':user?.technician?.id},
        /*{'$and':[
          {'software':{ "$in": (newSoftArray.length > 0 ?  newSoftArray : withoutStateVariable) }},
          {'status':{"$in":["Completed","Declined","Pending","Waiting"]}},
        ]}*/
      ]
      query["$and"] = [
        {'software':{ "$in": (newSoftArray.length > 0 ?  newSoftArray : withoutStateVariable) }},
        {'status':{"$in":["Completed","Declined","Pending","Waiting"]}},
      ]
      console.log("Completed tech jobs",query)
    }
    if(value === "Declined Jobs Tech"){
      query["$or"] = [{'tech_declined_ids':{"$in":[user?.technician?.id]}},{'declinedByCustomer':{"$in":[user?.technician?.id]}}]
      console.log("Declined Jobs Tech")
    }
    if(value === "Proposals"){
       query["$or"] = [{"$and":[{"status":"Accepted"},{"technician":user?.technician?.id}]},{"status":{$in:["Waiting"]}},
       {"$or":[{"$and":[{"status":{"$in":['Scheduled']}},{"schedule_accepted_by_technician":user?.id}]},{
        "$and":[{"status":{"$in":['Scheduled']}},{"schedule_accepted":false}]
       }

       ]},
       {"$or":[{"$and":[{"status":"Inprogress"},{"technician":user?.technician?.id}]}
       ]},
       

        {"$or":[{"$and":[{"status":"long-job"},{"technician":user.technician.id}]},
       ]},
      //  {"$and":[{"notifiedTechs":{'$elemMatch':{'techId':user.technician.id}}},{"status":"Pending"}]}
       ]


    }

    console.log("queryDecider query :: ",query)
    return query

   }
   /**
	 * Following function is use to check pending jobs and Decline the Latest Pending Job regarding the  status provided
	 * @author : Kartar Singh
	 **/
export const checkPendingStatus = async (user) => {
  let response = {}
  try {
    if (user && user?.customer) {
      let pendingJobs = await JobApi.latestpendingJobs({ "customer": user.customer.id })
      console.log('total pending jobs>>>>>', pendingJobs)

      if (pendingJobs.total_pending_jobs > 0) {
        if(pendingJobs.last_pending_job.status === JOB_STATUS.PENDING || pendingJobs.last_pending_job.status === JOB_STATUS.WAITING ){
          response['success'] = true
          response['name'] = pendingJobs.last_pending_job.software.name
        }
        if(pendingJobs.last_pending_job.status === JOB_STATUS.SCHEDULED && pendingJobs.last_pending_job.schedule_accepted)
        response['schedule_accepted'] = pendingJobs.last_pending_job.schedule_accepted
        response['success'] = true
        response['name'] = pendingJobs.last_pending_job.software.name
      }
      else {
        response['sucess'] = false
      }
    }
  } catch (e) {
    response['sucess'] = false
    console.log('error in checkPendingStatus', e)
  }
  return response;
};

export const authorizeCard = async (user,job) =>{
  try{
    localStorage.removeItem('authorizationInfo');
    // const totalJobsCount =  await JobApi.getTotalJobs(({ customer: user?.customer.id ? user.customer.id : user.customer }));
    if (!job.cardPreAuthorization) {
        const preAuthorization = await CustomerApi.cardPreAuthorization({ 'stripe_id': user.customer.stripe_id, 'liveUser':(user.customer.customerType && user.customer.customerType === 'live' ? true : false) })
        console.log("preAuthorization",preAuthorization)
        if (preAuthorization.status === "Successful") {
            return true
        }else{
            return false
        }
    }
  }catch(err){
    console.log('error in authorizeCard', err)
    return false
  }
}

/**
   * Redirect to setting page
   * @author : Karan
   */
const redirectUpdateCard = () =>{
  window.location.href =  '/customer/card-detail-page'
}

/**
   * Function will open the modal for alert card authrization failed and add new card for meeting
   * @params = ''
   * @response : redirect setting page for add new card
   * @author : Karan
   */

export const openNotificationWithHtml = (message) => {
  // const initialSeconds = seconds ? seconds * 1000 : intialWarningTimeVal
  const key = 'updateCard'
  const btn = (
    <>
      <div key={key} className="timer-area-popup">
          <Button type="primary" className="acceptCharges btn " size="sm" onClick={() => redirectUpdateCard()}>
					Add New Card
				</Button>
      </div>
      <br />
    </>
  )

  notification.info({
    key,
    duration: 5000,
    btn,
    message: message,
    description: '',
  })
}

export function useResizeObserver(callback){
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      try{
      const { width, height } = entries[0].contentRect;
      callback({ width, height });
      }catch(e){
        console.error(e);
      }

    });
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [ref, callback]);

  return ref;
}

export const isWorkingHours = (scheduleJobTime) => {
  const selectedTime = scheduleJobTime; // get the selected time from the state
  const durationType = selectedTime.durationType;
  const hours = parseInt(selectedTime.hours);
  const minutes = parseInt(selectedTime.minutes);

  // convert hours to 24-hour format
  const hours24 = durationType === "AM" ? hours % 12 : (hours % 12) + 12;

  const workingHoursStart = 9 // start of working hours (9am)
  const workingHoursEnd = 21 // end of working hours (9pm)

  const selectedDate = new Date();
  selectedDate.setHours(hours24, minutes);

  // convert the selected time to New York timezone
  const selectedDateInNewYork = new Date(selectedDate.toLocaleString("en-US", { timeZone: "America/New_York" }));

  if (selectedDateInNewYork.getHours() < workingHoursStart || selectedDateInNewYork.getHours() >= workingHoursEnd) {
    return false;
  }
  return true;
}

/**
 *
 * @param {*} customer
 * @returns boolean
 * @description : This function will check if customer or it's owner  have subscription minutes
 * @author : Jagroop
 */
export const checkCustomerHaveSubscriptionMinutes = async (customer) => {
  try {
    const customerSubScription = customer?.subscription
    const usedAllSubScriptionTime = customer?.subscription?.time_used == customer?.subscription?.total_seconds
    if (customerSubScription && usedAllSubScriptionTime) {
      return true;
    }
    const haveOwnerId = customer?.user?.ownerId
        // When there is no subscription at that time we are sending true because we want to hold amount at that time as well
        if(!customerSubScription && !haveOwnerId){
          return true;
        }
    if (haveOwnerId) {
      const ownerCustomerResponse = await UserApi.getUserById(haveOwnerId)
      const isOwnerHaveSubscription = ownerCustomerResponse?.customer?.subscription && ownerCustomerResponse?.customer?.subscription?.invoice_id
      // This condition will check if customer's owner have subscription even when subscription minutes are utilized
      const usedAllSubScriptionTime =
        ownerCustomerResponse?.customer?.subscription?.time_used == ownerCustomerResponse?.customer?.subscription?.total_seconds
      // This condition will check customer's owner have subsciption and have subscription minutes
      if (isOwnerHaveSubscription && usedAllSubScriptionTime) {
        return true;
      }
      // If Customer owner have subscription and subscription is not utilized all then at that time then we will not preauthorize
      if(isOwnerHaveSubscription && !usedAllSubScriptionTime){
        return false;
      }
    }
    // This condition will check if customer don't have subscription and user is child then we have to hold amount from it
    if(!customerSubScription && haveOwnerId){
        return true;
    }
    return false
  } catch (error) {
    console.log("error while checkig customer or it's owner have subscription", error)
    return false
  }
}

  /**
		* createOrGetUserChat create data for further use
		* @params : user(Type:Object),
		* @response : Returns user and create
		* @author : Kartar Singh
	**/
// export const createOrGetUserChat = async (particiants, jobId, software, job) => {
//   let data = {
//     "id": jobId,
//     "jobId": job.chatRoomId ? job.chatRoomId : Math.floor(Math.random() * 50000),
//     "particiants": particiants,
//     "subject": `${software}(${jobId})`,
//   }
//   return data
// }


/**
 *
 * @param {*} jobId
 * @param {*} user
 * @param {*} flagKey
 * @returns boolean
 * @description : This is the general function that will return flag response based on flagKey;
 * @author   : Jagroop
 */
export const getLaunchDarklyFlagResponse = async (jobId, user, flagKey) => {
  try {
    const JobId = jobId;
    const email = user?.email;
    const name = user?.firstName + " " + user?.lastName;
    const newUser = {
      kind: 'customer',
      key: JobId,
      name: name,
      email: email,
    };

    console.log('User Detail for Launchdarkly: ', newUser);
    const ldclient = await LDClient.initialize(process.env.REACT_APP_LAUNCHDARKLY_KEY, newUser);
    return new Promise((resolve) => {
      ldclient.on('ready', () => {
        const flagKeyResponse = ldclient.variation(flagKey, false);
				console.log("Launchdarkly jaas8x8InegrationFlag",{flagKeyResponse})
        resolve(flagKeyResponse);
      });
    });
  } catch (error) {
    console.log("Launchdarkly error while Accessing the flagKey", error);
    return false;
  }
};


/**
 * @description :  This function will decide to show Estimations [Estimated Wait Time, Most Jobs Like yours Takes between, Most Jobs Like Your's Costs between] or not.
 * @author  : Jagroop
 */
export const decideEstimatesToShowUsingLD = (user, jobId) => {
 return  getLaunchDarklyFlagResponse(jobId, user, LAUNCHDARKLY_JOBSUMMARY_ESTIMATES_VISIBILITY)
    .then((flagResponse) => {
      console.log("Flag Response for decideEstimatesToShowUsingLD", flagResponse);
      return flagResponse;
    })
    .catch((error) => {
      console.log("Error in decideEstimatesToShowUsingLD", error);
      return false
    });
};


/**
 * @param {*} date
 * @description : This function will provide us time in chat on the basis of minutes,hour, day.
 * @author : Jagroop
 */
export const formatDateOfTwilioMessage = (date) => {
  // Current date
  var currentDate = new Date();
  // Given date
  var givenDate = new Date(date);
  // Calculate the time difference in milliseconds
  var timeDiff = currentDate - givenDate;

  // Convert milliseconds to different units
  var secondsDiff = Math.floor(timeDiff / 1000);
  var minutesDiff = Math.floor(secondsDiff / 60);
  var hoursDiff = Math.floor(minutesDiff / 60);
  // console.log("formatDateOfTwilioMessage",{minutesDiff,hoursDiff,date})
  if(minutesDiff <1){
    return "just now"
  }
  if (minutesDiff < 60) {
    return (minutesDiff + " min ago")
  }
  if (hoursDiff < 24) {
    return (hoursDiff + `${hoursDiff > 2 ? "hours ago" : "hour ago"}`);
  }
  if (hoursDiff >= 24) {
    const formattedDate = moment(date).format('MMMM Do YY, h:mm a');
    return formattedDate;
  }
}

//Convert seconds into proper HH:MM format time
export function convertTime(sec) {
  var hours = Math.floor(sec/3600);
  (hours >= 1) ? sec = sec - (hours*3600) : hours = '00';
  var min = Math.floor(sec/60);
  (min >= 1) ? sec = sec - (min*60) : min = '00';
  (sec < 1) ? sec='00' : void 0;

  (min.toString().length == 1) ? min = '0'+min : void 0;
  (sec.toString().length == 1) ? sec = '0'+sec : void 0;

  if(hours >= 1 && hours <= 9){
    hours = '0'+hours
  }
// This will check if seconds are of nan type if so then replace it with 00
if (sec.toString() == "NaN") {
  sec = '00'
}
console.log("checking the resultant value of hh:mm:ss",hours+':'+min+':'+sec)

  return hours+':'+min+':'+sec;
}


export const haveUnreadMessagesForPendingJob = (jobId) => {
  try {
    let jobChatDetail = window.localStorage.getItem('pendingJobHaveChat');
    jobChatDetail = JSON.parse(jobChatDetail)
    if (jobChatDetail && jobChatDetail.jobId && jobChatDetail.jobId == jobId) {
      return true
    }
    return false

  } catch (error) {
    return false;
  }
}