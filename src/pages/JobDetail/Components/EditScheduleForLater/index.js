import React,{useEffect,useState} from "react";
import mixpanel from 'mixpanel-browser';
import Calendar from 'react-calendar';
// import CheckBox from "../CheckBox";
import {Modal,Button,Spin} from 'antd';
// import TimeDropDown from "../TimeDropDown";
// import TimeDropDown from "../../../Customer/ProfileSetup/Components/TimeDropDown";
import CheckBox from "../CheckBox";
import TimeDropDown from "../TimeDropDown";
import * as jobApi from  '../../../../api/job.api'; 
import { useDetectClickOutside } from 'react-detect-click-outside';
import { openNotificationWithIcon,isWorkingHours } from "../../../../utils";
import { useSocket } from "../../../../context/socketContext";
import { useJob } from "../../../../context/jobContext";
import { getPrimaryTime } from "../../../../utils/index";
import { useNotifications } from "../../../../context/notificationContext";
import * as TwilioApi from '../../../../api/twilioChat.api';

const ScheduleForLater = ({isEditScheduleJob , setIsEditScheduleJob,user,setDisableEditForJobButton,submitButton,setSubmitButton}) =>{
	let defaultHour = new Date().getMinutes() >= 53 ? new Date().getHours() + 1 : new Date().getHours();
	let defaultHourValue = `${defaultHour > 12 ? defaultHour - 12 : defaultHour}`;
	let defaultMinutes = new Date().getMinutes();
	let defaultMinutesValue = defaultMinutes >= 53 || defaultMinutes < 8 ? "00" : defaultMinutes >= 8 && defaultMinutes < 23 ? "15" : defaultMinutes >= 23 && defaultMinutes < 38 ? "30" : "45";
	let defaultDurationType = defaultHour < 12 ? "AM" : "PM";

	const [editscheduleJobTime, setEditScheduleJobTime] = useState({
															date: new Date(),
															hours: defaultHourValue,
															minutes: defaultMinutesValue,
															durationType: defaultDurationType
	})

    // const [value, setValue] = useState(job?.primarySchedule? new Date(job?.primarySchedule) : new Date());
    const [value, setValue] = useState(editscheduleJobTime.date);
    const [compareValue, setCompareValue] = useState();
    const [calendarValue, setCalendarValue] = useState();
    const [showCalendar,setShowCalendar] = useState(false)
    const { socket } = useSocket();
    const { job } = useJob();
    // const [primaryTime, setPrimaryTime] = useState();
	const [secondryTime, setSecondaryTime] = useState();
    const [showModal, setShowModal] = useState(false)
    const [editDisableButton,setEditDisableButton] = useState(false)
    const { createNotification, fetchNotifications } = useNotifications();

    const handelCalender = (e)=>{
        setValue(e)
        setEditScheduleJobTime((prevState => ({...prevState, date:e  })))
    }
    const handleCancel =(e) =>{
        setIsEditScheduleJob(false)
		setSubmitButton(false)
    }


    const handleOk = async (e)=>{
       e.preventDefault()
	   console.log("inside okok")
	  
        let scheduleTimeNew = getPrimaryTime(editscheduleJobTime);
		console.log("scheduleTimeNew",scheduleTimeNew);
		const hours = scheduleTimeNew.getHours();
		const minutes = scheduleTimeNew.getMinutes();
		const durationType = hours < 12 ? "AM" : "PM";

		let formattedData = {
			date: scheduleTimeNew.toString(),
			hours: hours,
			minutes: minutes,
			durationType: durationType
		  };
		console.log("formattedData>>", formattedData)
		const isWithinWorkingHours = isWorkingHours(formattedData);
		if (!isWithinWorkingHours) {
			openNotificationWithIcon('error', 'Error', "Our techs are mostly available between 9am-9pm EST Mon-Fri. Please schedule a good time during these business hours.");
			return;
		}
		setSubmitButton(true)
		console.log(scheduleTimeNew,job.primarySchedule, "My console to check schedule job time 1", new Date(scheduleTimeNew))     
		const hourDifferenceFromNow = scheduleTimeNew - new Date().getTime()
		const timeDifferenceFromPreviousTime = new Date(scheduleTimeNew).getTime() - new Date(job.primarySchedule).getTime() 
		console.log(new Date(scheduleTimeNew).getTime(), "My console to check schedule job time 1", new Date(job.primarySchedule).getTime())
		console.log(timeDifferenceFromPreviousTime, "My console to check schedule job time 1")     
		if(hourDifferenceFromNow < 3600000){
			openNotificationWithIcon("error", "Error", "Please select time atleast 1 hour from now!")
            setSubmitButton(false)
		}else if(timeDifferenceFromPreviousTime === 0){
			openNotificationWithIcon("error", "Error", "Your job is already scheduled with this time! Please select a different date and time.")
            setSubmitButton(false)
		}else{
            // const updateScheduleTime = await jobApi.updateJob(job.id,{primarySchedule:scheduleTimeNew})
            await updateScheduleJob(job)
			await TwilioApi.updateTwilioConversation(job?.twilio_chat_service?.sid)
            socket.emit("refresh-ScheduleTime",job)
			// fetchgroupJob()
            setIsEditScheduleJob(false)
        }
    }

    const ref = useDetectClickOutside({onTriggered: () => {if(showCalendar) setShowCalendar(false)}}); 

    // useEffect(()=>{
    //     // console.log("My console scheduleJobTime from inside", scheduleJobTime)
    // },[scheduleJobTime])
    
    let todayDate = new Date();
    let todaydd = `${todayDate.getFullYear()}${todayDate.getMonth()}${todayDate.getDate()}`;

    useEffect(() => {       
        let todayCalenderValue = `${todayDate.getFullYear()}${value.getMonth()}${value.getDate()}`;
        setCompareValue(todayCalenderValue)
        setCalendarValue(`${value.toString().split(" ")[1]} ${value.toString().split(" ")[2]}`)
    }, [value])

    let  minArray = ["00","15","30","45"];

    let hourArray = [];

    for(let i=1; i<=12;i++){

        hourArray.push(String(i));
    } 

    let scheduleDetails = {
		'primaryTimeAvailable':true,
		'primaryTimeExpiredAt':null,
		'secondaryTimeAvailable':true,
		'secondaryTimeExpiredAt':null,
		'scheduleExpired':false,
		'scheduleExpiredAt':null
	}

    /**
	 * update Schedule job data as per requirement. send alert as notification, sms and email
	 * @params : userId: user_id, 
	 * 	userEmail: email id of customer/technician, 
	 * 	jobStats: job data, 
	 * 	title: message for notification
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const updateScheduleJob = async (job) => {
		const scheduleJobData = {}
		let scheduleDetails = {
			'primaryTimeAvailable':true,
			'primaryTimeExpiredAt':null,
			'secondaryTimeAvailable':false,
			'secondaryTimeExpiredAt':null,
			'scheduleExpired':false,
			'scheduleExpiredAt':null
		}
        const primaryTime = getPrimaryTime(editscheduleJobTime);
		scheduleJobData.primarySchedule = primaryTime;
		scheduleJobData.scheduleDetails = scheduleDetails
		scheduleJobData.scheduleDetails.scheduleExpiredAt = new Date(primaryTime - 1200000)
		// scheduleJobData.secondrySchedule = secondryTime;
		// scheduleJobData.scheduleDetails = {... scheduleDetails,
        //     scheduleExpiredAt:new Date(secondryTime.getTime() - 20 * 60000)
        // };
		console.log("job.technician ::: main", job.technician)
		let oldTech = {}
		let techNumber = ''
		if(job.technician && job.technician.profile && job.technician.profile.alertPreference && job.technician.profile.alertPreference.settings && job.technician.profile.alertPreference.settings.Job['Text']['toggle']){
			techNumber =  job.technician['profile']['alertPreference']['settings']['Job']['Text']['value']
		}
		if(user.userType === 'customer' && job.technician){
			scheduleJobData.technician = ''
			scheduleJobData.schedule_accepted=false
			scheduleJobData.status = 'Scheduled'
			scheduleJobData.tech_message_dashbord = false

			oldTech = {
				id:job.id,
				techId:job.technician['user'].id,
				firstName:job.technician['user'].firstName,
				email:job.technician['user'].email,
				timezone: job.technician['user']['timezone'],
				number:techNumber,
				by:"Customer "+user.firstName
			}
			console.log("oldTech ::: before", oldTech)
		}
		console.log("jobStats :::", oldTech)

		
		if(job?.post_again_reference_technician){
			scheduleJobData.chatRoomId = job.chatRoomId
		}else{
			scheduleJobData.chatRoomId = null
		}

		const jobStats = await jobApi.updateJob(job.id, scheduleJobData);
		let custNumber = ''
		if(job.customer && job.customer.phoneNumber){
			custNumber =  job.customer.phoneNumber
		}
		if(user.userType === 'customer'){
			console.log("oldTech ::: middle", oldTech)
			let title = "Job has been successfully updated. We are finding a technician for you. We will inform you when we find the technician."
			mixpanel.identify(user.email);
        	mixpanel.track('Job meeting time updated by customer',{'JobId':job.id});
			if(job.technician){
				console.log("oldTech ::: after", oldTech)
				title = "Job has been successfully updated by customer and technician removed from job. We are finding a technician for you. We will inform you when we find the technician"
				await socket.emit('updated_schedule_job_accepted_technician_email', oldTech)
				await emitSocketCreateFetchNotification( oldTech.techId, oldTech.email, jobStats, "Meeting time of your accepted job with "+job.customer.user.firstName+" has been changed")
				if(oldTech.number){
					await socket.emit( 'schedule_job_time_change_alert', oldTech)
				}
				mixpanel.track('Technician '+oldTech.firstName+' is removed from job.',{'JobId':job.id});
			}
			await emitSocketCreateFetchNotification( user.id,  user.email, jobStats, title)
			if(custNumber){
				await socket.emit( 'schedule_job_time_change_alert',  {id:job.id, number:custNumber, by:"Customer "+user.firstName})
			}
			// call send-schedule-alerts socket from backend.
			// It will find available techs and send alerts by sms/email/notification
			// emit send-schedule-alerts socket
			socket.emit('search-for-tech', {
				jobId: jobStats.id,
				customerTimezone: user.timezone,
				jobObj: jobStats,
				primaryTime,
				secondryTime,
				phoneNumber:user.customer.phoneNumber,
				customerName:user.firstName,
				customerEmail:user.email,
				technicianId:(job && job?.post_again_reference_technician ? job.post_again_reference_technician : false),
			});
		}
		if(user.userType === 'technician'){
			mixpanel.identify(user.email);
        	mixpanel.track('Job meeting time updated by technician',{'JobId':job.id});
			 // NOTE  : This socket is commented by Jagroop under ticket GK-171  : 28-04-2023
			// await socket.emit('schedule_job_updated_by_technician_to_customer_email', jobStats.id)
			let title = "Job Meeting has been updated by technician."
			await emitSocketCreateFetchNotification( job.customer.user.id,  job.customer.user.email, jobStats, title)
			if(custNumber){
				await socket.emit( 'schedule_job_time_change_alert',  {id:job.id, number:custNumber, by:"Technician "+user.firstName})
			}
			if(techNumber){
				await socket.emit( 'schedule_job_time_change_alert',  {id:job.id, number:techNumber, by:"Technician "+user.firstName})
			}
		}
		// props.fetchJob(job.id);
		socket.emit("edit-job",job.id)
		setShowModal(false)
		setIsEditScheduleJob(false); 
		setDisableEditForJobButton(false); 
		if(editDisableButton){setEditDisableButton(false)}
		
	};

	/**
	 * create / fetch notification customer notifications
	 * @params : userId: user_id, 
	 * 	userEmail: email id of customer/technician, 
	 * 	jobStats: job data, 
	 * 	title: message for notification
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	 const emitSocketCreateFetchNotification = async (userId, userEmail, jobStats, title) =>{
		try{
			console.log("send-schedule-alerts :::::::::::")
			//Notification for customer
			const notificationData = {
				user: userId,
				job: jobStats.id,
				read: false,
				actionable: false,
				title: title,
				type: 'Scheduled Job',
			};
			console.log("notificationData ::::::::", notificationData)
			await createNotification(notificationData);
			await fetchNotifications({ user: userId });
		}catch(err){
			mixpanel.identify(userEmail);
			mixpanel.track('There is catch error while create/fetch notification', { jobStats: jobStats, errMessage: err.message });
			// consoleLog('There is catch error while create/fetch notification  :::: '+ err.message)
		}
	}

    return (<React.Fragment key="schedule">
    <Modal
            className="d-flex justify-content-center align-items-center edit-schuld"
            title="Edit Scheduled Time"
            closable={false}
            visible={isEditScheduleJob} 
            maskStyle={{backgroundColor:"#DCE6EDCF"}}
            maskClosable={true}
            footer={[
				<div className="editSchedule">
                <Button className="grey-background" key="back" type="primary" style={{height:"47px"}} onClick={handleCancel}>
                  Return
                </Button>,
                <Button disabled={submitButton} key="submit" type="primary" style={{height:"47px"}} onClick={submitButton ?  ()=>{} : handleOk}>
                 {submitButton ? <Spin className="color-white" /> : "Submit"}
                </Button>,
				</div>
              ]}
            width={500}
           
        >
        
        <div className='d-flex justify-content-center'>
            <div className='flex-wrap' style={{width:"100%",maxWidth:"600px"}}>
                <div className='d-flex justify-content-start flex-wrap'>
                    <div>
                        <div>
                            <label className='date-label-div m-l'>Date:</label>
                        </div>
                        <div>
                            <div className={`${!showCalendar === false ? 'today-div-true d-flex justify-content-start align-items-center' : 'today-div d-flex justify-content-start align-items-center' }`}   onClick={()=>{setShowCalendar(!showCalendar)}}>
                                {console.log("My console to check", {compareValue, todaydd, calendarValue} )}
                                    <span className="date-value m-l ">
                                        {compareValue === todaydd ? "Today" : calendarValue}
                                    </span>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex mt-10-max-width-600 mb-30-max-width-600">
                        <div>
                            <div>
                                <label className='date-label-div '>Time:</label>
                            </div>
                            <div className="time-div d-flex justify-content-center align-items-center">
                                <TimeDropDown 
                                    dropdownValues={hourArray}
                                    name={"hour"}
                                    editscheduleJobTime={editscheduleJobTime}
                                    setEditScheduleJobTime={setEditScheduleJobTime}
                                    />
                                <span className="colon-dropdown"> :</span>
                                <TimeDropDown
                                    dropdownValues={minArray}
                                    name={"minutes"}
                                    editscheduleJobTime={editscheduleJobTime}
                                    setEditScheduleJobTime={setEditScheduleJobTime}
                                    />
                            </div>
                        </div>
                        <div className="check-box">
                            <CheckBox 
                                editscheduleJobTime={editscheduleJobTime}
                                setEditScheduleJobTime={setEditScheduleJobTime} 
                            />
                        </div>
                    </div>

                </div>  
                 
                    {showCalendar && 

                        <div className="calendar-container border-calander" ref={ref}>
                            <Calendar
                                tileDisabled={({date}) => [0, 6].includes(date.getDay())}
                                tileClassName={({date, view}) => {
                                    if (view === 'month' && ![0, 6].includes(date.getDay())) {
                                      return 'allowed-date';
                                    }
                                    return 'disabled-date';
                                  }}
                                onChange={(e)=>{handelCalender(e)}}
                                value={value}
                                maxDate={new Date(new Date().setMonth(new Date().getMonth()+2))}
                                minDate={new Date()}
                                />
                         </div>
                    }
                </div>
        </div>
        </Modal>
    </React.Fragment>)

}

export default ScheduleForLater