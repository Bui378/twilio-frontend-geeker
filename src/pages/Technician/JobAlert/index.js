import React, { useEffect, useState} from 'react';
import { useParams } from 'react-router';
import Spinner from '../../../components/Spinner';
import DeclineJob from './steps/DeclineJob';
import WaitJob from './steps/WaitJob';
import NewJob from './steps/NewJob';
import {get_or_set_cookie,GAevent} from '../../../utils'
import { useJob } from '../../../context/jobContext';
import { useUser } from '../../../context/useContext';
import * as JobService from '../../../api/job.api';
import * as JobCycleApi from '../../../api/jobCycle.api';
import { JobTags } from '../../../constants/index.js';
import { useSocket } from '../../../context/socketContext';
// import { useHistory } from 'react-router-dom';
import { openNotificationWithIcon } from '../../../utils';
import mixpanel from 'mixpanel-browser';
// import { ConsoleSqlOutlined } from '@ant-design/icons';
const JobAlert = () => {
  const { jobId } = useParams();
  const [mainJobId,setMainJob] = useState(jobId)
  const [step, setStep] = useState(0);
  const { job, fetchJob,jobIds } = useJob();
  const { user } = useUser();
  const [job_arr,set_job_arr] = useState([]);
  const [webSocketId,setWebSocketId] = useState('')
  const { socket } = useSocket();
  const [mainJob,setMainJobObject] = useState();
  const [userNotifiedAboutTier, setUserNotifiedAboutTier] = useState(false);
  // const location = useLocation();
  // const appended_job = location.state.appendedJob ?location.state.appendedJob :null
  // const discarded_job = location.state.discardedJob?location.state.discardedJob :null
  // const fromSchedule = location.state.fromSchedule ? location.state.fromSchedule : null
  // const mainJobs = location.state.mainJobs ? location.state.mainJobs : []
  // const [appended_data,setAppendedData] = useState([])
  const { updateJob } = useJob();
  const [hiddenElement,setHiddenElement] = useState([])
  // const history = useHistory();
  const [key ,setKey] = useState();
  const [ isDisabled, setIsDisabled ]= useState(false);
  // const [active,setActive] = useState();
  const active = "";

  /**
   * Starts a call on technician side
   * @params = 
   * @response : it redirects the technician to meeting page ,starts a call with customer and sends the socket to change the button on client screen.
   * @author : Sahil, Nafees
  */

const handleStartCall = async()=>{
  try{
    setIsDisabled(true);
    console.log("disabled", isDisabled)
    let updatedJob = await JobService.retrieveJob(jobId)
    if(updatedJob.status !== "Declined" && updatedJob.status !== "Scheduled"){
      socket.emit('call:started',{id:jobId})
      socket.emit("meeting-started-by-technician", {jobData:updatedJob})
    }
    get_or_set_cookie(user)
    // mixpanel code//
    mixpanel.identify(user.email);
    mixpanel.track('Technician - Started Call', { JobId: jobId });
    if(!updatedJob.GA_start_call_event_called){
      //GA3 tag commented by Vinit on 24/04/2023.
      GAevent('Call Started','tech-start-call', updatedJob.id,updatedJob?.technician?.id)
      await updateJob(updatedJob.id, {GA_start_call_event_called:true});
    }
    // mixpanel code//
    let lifeCycleTag = ''
    if(job.is_transferred && job.is_transferred == true){
      lifeCycleTag = JobTags.TECHNICIAN_START_CALL_AFTER_TRANSFER;
    }else{
      lifeCycleTag = JobTags.TECHNICIAN_START_CALL;
    }
    
    let currentJob = await JobService.retrieveJob(jobId);
    if(currentJob.status !== 'Declined' && updatedJob.status !== "Scheduled"){
        if (currentJob.technician.id == user.technician.id){
          await JobCycleApi.create(lifeCycleTag, jobId);
          window.location.href =  process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
        }
        else{
          window.location.href = "/"
          openNotificationWithIcon("info","This job is already taken")
        }

    } else{
        openNotificationWithIcon('error', 'Error', `The job no longer available.`)
        setTimeout(()=>{
          window.location.href = "/"
        },3000)
      }
  }
  catch(err){
    console.log("error in handleStartCall >>>",err)
  }
}



  useEffect(()=>{
    fetchJob(jobId)
    console.log(">jobId >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ",jobId)
  },[])
  useEffect(() => {
    // console.log("job,,,,,,,,,,,",job)
    if(job && job.id && job.id == jobId){
      let mainJob = {...job}
      let softwareData = (job.subSoftware && job.subSoftware.id ? job.subSoftware : job.software)
      let price_Arr =(softwareData && softwareData.estimatedPrice ? softwareData.estimatedPrice.split("-") : [])
      const time1 = (softwareData && softwareData.estimatedWait ? parseInt(softwareData.estimatedWait.split("-")[0]) : 0)
      const time2 = (softwareData && softwareData.estimatedWait ? parseInt(softwareData.estimatedWait.split("-")[1]) : 0)

      mainJob.estimatedWaitFrom = time1
      mainJob.estimatedWaitTo = time2
      mainJob.estimatedPrice1 = "NA"
      mainJob.estimatedPrice2 = "NA"
      if(price_Arr.length > 0){
        mainJob.estimatedPrice1   = "$ " +  (time1/6)*parseInt(price_Arr[0])
        mainJob.estimatedPrice2  = "$ " + (time2/6)*parseInt(price_Arr[0])
      }
      console.log(">mainJob >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ",mainJob)
      setMainJobObject(mainJob)
      set_job_arr(prevArr =>[mainJob])

      /*let settings = SettingsApi.getSettingsList({"software":mainJob.software.id})
        settings.then((data)=>{
           let price_Arr =(data.data[0] != undefined ? data.data[0].estimatedPrice.split("-") : [])
           const time1 = (data.data[0] != undefined ? parseInt(data.data[0].estimatedWait.split("-")[0]) : 0)
          const time2 = (data.data[0] != undefined ? parseInt(data.data[0].estimatedWait.split("-")[1]) : 0)
          console.log(">>>>>>>.time  >>>>>>>>>>>>>>",time1)
          console.log(">>>>>>>time 2")
          mainJob.estimatedWaitFrom = time1
          mainJob.estimatedWaitTo = time2

          mainJob.estimatedPrice1   = "$ " +  (time1/6)*parseInt(price_Arr[0])
            mainJob.estimatedPrice2  = "$ " + (time2/6)*parseInt(price_Arr[0])
            console.log(">>>Hey i am reaching here >>>>>>>>>>")
            set_job_arr(prevArr =>[mainJob])

        })*/

    }

  },[job]);

  if (jobIds!==undefined  &&jobIds.length <0 ) return (<Spinner />);

  const handleDecline = async (jobdata)=>{
    try {
        let jobdetail = await JobService.retrieveJob(jobdata.id);
        let updatedNotifiedTechs =[];
					
				  for(const k in jobdetail.notifiedTechs){
					  let jobStatus = jobdetail.notifiedTechs[k]['jobStatus'];
					  let notifyEndAt = (jobdetail.notifiedTechs[k]['notifyEndAt'])?jobdetail.notifiedTechs[k]['notifyEndAt']:new Date();
					  console.log(">>>>>>>>>> jobdetail.notifiedTechs", jobdetail.notifiedTechs[k], jobdetail.id);
					  if(jobdetail.notifiedTechs[k]['techId'] == user.technician.id){
						  jobStatus = "tech-decline";
						  notifyEndAt = new Date();
					  }
					  updatedNotifiedTechs[k] = {
						  'techId' :  jobdetail.notifiedTechs[k]['techId'],
						  'techStatus':  jobdetail.notifiedTechs[k]['techStatus'],
						  'notifyAt' : jobdetail.notifiedTechs[k]['notifyAt'],
						  'jobStatus' : jobStatus,
						  'notifyEndAt' : notifyEndAt,
					  }
				  }

      await updateJob(jobdata.id, {$push:{tech_declined_ids:user.technician.id ,technician:""},'notifiedTechs':updatedNotifiedTechs });
      openNotificationWithIcon('success', 'Success', `Job has been declined.`)
      let lifeCycleTag = ''
      if(jobdata.is_transferred && jobdata.is_transferred == true){
        lifeCycleTag = JobTags.TECHNICIAN_DECLINED_AFTER_TRANSFER;
      }else{
        lifeCycleTag = JobTags.TECH_DECLINED_JOB;
      }
      await JobCycleApi.create(lifeCycleTag, jobdata.id);
      if(job_arr.length === 1){
        window.location.href = '/'
      }else{
        set_job_arr(job_arr.filter(item => item.id !== jobdata.id))
      }
    } catch (err) {
      console.error(err);
    }
  }


  return (
    <div className="w-85">
      {
        step === 0 && <NewJob userNotifiedAboutTier={userNotifiedAboutTier} setUserNotifiedAboutTier={setUserNotifiedAboutTier} setWebSocketId={setWebSocketId} job_arr={job_arr} key={key} mainJob={mainJob} setMainJob={setMainJob} active={active} handleStartCall={handleStartCall} setKey = {setKey} hiddenElement={hiddenElement} setHiddenElement ={setHiddenElement} handleDecline={handleDecline} set_job_arr={set_job_arr}  setStep={setStep} isDisabled={isDisabled} setIsDisabled={setIsDisabled} />

      }
      {
        step === 1 && <DeclineJob setStep={setStep} user_logged={user} />
      }
      {
        step === 2 && <WaitJob webSocketId={webSocketId}  jobId={mainJobId} setStep={setStep} handleStartCall={handleStartCall} isDisabled={isDisabled} setIsDisabled={setIsDisabled}/>
      }
    </div>
  );
};

export default JobAlert;
