import React, {useState, useMemo, useEffect, useCallback} from 'react';
import { Input,Spin,Modal} from 'antd';
import { Row, Col, Button, OverlayTrigger} from 'react-bootstrap';
import styled from 'styled-components';
import { JobTags, INACTIVE_ACCOUNT_MESSAGE } from '../../constants';
import * as JobApi from '../../api/job.api';
import { openNotificationWithIcon, GAevent, consoleLog } from '../../utils';
import { send_email_to_customer } from '../../api/serviceProvider.api';
import mixpanel from 'mixpanel-browser';
import * as JobCycleApi from '../../api/jobCycle.api';
import { useJob } from '../../context/jobContext';
import { useSocket } from '../../context/socketContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNotifications } from '../../context/notificationContext';
import moment from 'moment';
import ScheduleModal from '../Customer/JobCreate/steps/ScheduleModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCheck, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
let selectedSchedule = {}
const EditScheduleJobFrom = (props) => {
	const { job, fetchJob } = useJob();
	const [errMsg, setErrMsg] = useState('')
	const { createNotification, fetchNotifications } = useNotifications();
	const [mySelectedEvents, setSelectedEvents] = useState(new Date());
	let defaultEvents = [{
		id: 1,
		start: new Date(job.primarySchedule),
		end: new Date(job.primarySchedule),
		title: `<i style="font-size:24px; color:#01D4D5"  class="fa">&#xf00c;</i>`,
		editable:true
	}, {
		id: 2,
		start:new Date(job.secondrySchedule),
		end:new Date(job.secondrySchedule),
		title: `<i style="font-size:24px; color:#293742"  class="fa">&#xf00c;</i>`,
		editable:true
	}];
	const tempEvent = {}
	const { socket } = useSocket();
	const [editDisableButton,setEditDisableButton] = useState(false)
	const [scheduleAccptOn, setscheduleAccptOn] = useState();
	const [tempSelection, settempSelection] = useState([]);
	const [primaryTime, setPrimaryTime] = useState();
	const [secondryTime, setSecondaryTime] = useState();
	const [myEvents, setEvents] = useState(defaultEvents);
	const [showModal, setShowModal] = useState(false)
	const [instance, setInstance] = useState(null);
	
	let scheduleDetails = {
		'primaryTimeAvailable':true,
		'primaryTimeExpiredAt':null,
		'secondaryTimeAvailable':true,
		'secondaryTimeExpiredAt':null,
		'scheduleExpired':false,
		'scheduleExpiredAt':null
	}

	/**
	 * set events on calendar if edit button clicked
	 * @author : Ridhima Dhir
	 */
	useEffect(()=>{
		defaultEvents = [{
			id: 1,
			start: new Date(job.primarySchedule),
			end: new Date(job.primarySchedule),
			title: `<i style="font-size:24px; color:#01D4D5"  class="fa">&#xf00c;</i>`,
			editable:true
		}, {
			id: 2,
			start:new Date(job.secondrySchedule),
			end:new Date(job.secondrySchedule),
			title: `<i style="font-size:24px; color:#293742"  class="fa">&#xf00c;</i>`,
			editable:true
		}];
		setEvents(defaultEvents)
		selectedSchedule = {}
		
	},[props.isEditScheduleJob])

	/**
	 * Closes schedule modal  	 
	 * @author : Vinit Verma
	 */
	const handleCancel = async() => {
		setShowModal(false)
		await handleCloseClick()
		setPrimaryTime(null)
		setSecondaryTime(null)
	}

	/**
	 * Event calendar design values
	 * @author : Ridhima Dhir
	 */
	 const view = useMemo(() => {
        return {
            schedule: {
                type: 'week',
                startDay: 0,
                endDay: 7,
                startTime: '09:00',
                endTime: '22:00'
            }
        };
    }, [])


	/**
	 * Validate primary and secondry time slot is not empty
	 * @params : isVaild(Type:Boolean) : we are using use state variables in this function
	 * @returns: true/ false 
	 * @author : Ridhima Dhir
	 */
	 const checkIsEmptyPrimarySecondryTime = (isValid) =>{
		 console.log("primaryTime ::: ",primaryTime," secondryTime :::", secondryTime)
		if (!primaryTime && !secondryTime) {
			openNotificationWithIcon('error', 'Error', 'Preffered time and Secondary time slot is required.');
			isValid = false;
		}
		if (!primaryTime && secondryTime) {
			openNotificationWithIcon('error', 'Error', 'Preffered time slot is required.');
			isValid = false;
		}
		if (primaryTime && !secondryTime) {
			openNotificationWithIcon('error', 'Error', 'Secondary time slot is required.');
			isValid = false;
		}
		return isValid 
	}

	/**
	 * Validate primary and secondry time
	 * @params : isVaild(Type:Boolean) : we are using use state variables in this function 
	 * @returns : true/ false 
	 * @author : Ridhima Dhir
	 */
	const validatePrimarySecondryTimeSlot = (isValid) =>{
		const now_time = moment().now;
		const now_time_obj = new Date()
		const secondryTimeInSeconds = new Date(secondryTime).setSeconds(0, 0);
		const primaryTimeInSeconds = new Date(primaryTime).setSeconds(0, 0);
		consoleLog("secondryTimeInSeconds ::: "+parseInt(secondryTimeInSeconds) +" primaryTimeInSeconds :::::: "+parseInt(primaryTimeInSeconds))
		consoleLog("moment >>>>>>>>>>>>>>>>>>>>>>>>> now >>>>>>>",now_time)
		consoleLog("primaryTime >>>>>>>>>>>>>>>>>>> ",moment(primaryTimeInSeconds))
		const hours = moment.duration(moment(primaryTime).diff(now_time)).asHours();
		var date1 = new Date(now_time_obj);
		var date2 = new Date(primaryTime);
		var hoursdiff = Math.floor(Math.abs(date1.getTime() - date2.getTime()) / 36e5); 
		//Primary and current time should have half hour difference
		if (hoursdiff < 0.5) {
			setErrMsg('Preffered time slot should be atleast half an hour from now.')
			// openNotificationWithIcon('error', 'Error', 'Preffered time slot should be atleast half an hour from now.');
			isValid = false;
		}
		//Primary and secondry time cannot be same
		if (secondryTimeInSeconds === primaryTimeInSeconds) {
			setErrMsg('Secondary time slot cannot be same as preffered time slot.')
			// openNotificationWithIcon('error', 'Error', 'Secondary time slot cannot be same as preffered time slot.');
			isValid = false;
		}
		//Secondry time should be greater than primary time
		if (secondryTime < primaryTime) {
			setErrMsg('Secondary time slot should be greater than preffered time slot.')
			// openNotificationWithIcon('error', 'Error', 'Secondary time slot should be greater than preffered time slot.');
			isValid = false;
		}
		consoleLog("validatePrimarySecondryTimeSlot :::::::"+isValid)
		return isValid 
	}

	/**
	 * Validate primary and secondry time  
	 * @params : we are using use state variables in this function as params
	 * @returns : true/ false 
	 * @author : Ridhima Dhir
	 */
	 const ScheduleJobValidation = async () => {
		let isValid = true
		consoleLog('primaryTime ::: '+ primaryTime);
		//Check primary and secondry time is not empty then show message and return false
		isValid = await checkIsEmptyPrimarySecondryTime(isValid)

		//Check if both time is selected by user.
		//Primary and current time should have half hour difference
		//Primary and secondry time cannot be same
		//Secondry time should be greater than primary time
		if(secondryTime && primaryTime){
			consoleLog('validatePrimarySecondryTimeSlot ::: ');
			isValid = await validatePrimarySecondryTimeSlot(isValid)
			if(isValid){
				setErrMsg("")
			}
		}
		return isValid
	}
	
	/**
	 * Edit schedule job date & time.
	 * @params : we are using use state variables in this function
	 * @returns: modal close
	 * @author : Ridhima Dhir
	 */
	const editScheduleJob = async (event) => {	
		//validate schedule Job
		const is_valid = await ScheduleJobValidation()
		if(!is_valid){
			consoleLog('Validate false primary Time ::: '+ primaryTime +' and secondry Time '+ secondryTime);
			return false
		}
		setShowModal(true)
		await removeTempSelectedCheckbox()
	};
	/**
	 * Post a schedule job
	 * @author : Vinit Verma
	 */
	const handleConfirm = async () => {
		// const is_valid = await ScheduleJobValidation()
		// if(!is_valid){
		// 	consoleLog('Validate false primary Time ::: '+ primaryTime +' and secondry Time '+ secondryTime);
		// 	return false
		// }
		// prepare schedule job data for edit
		await updateScheduleJob(job)
		setPrimaryTime(null)
		setSecondaryTime(null)
		return true
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
		console.log(job)
		scheduleJobData.primarySchedule = primaryTime;
		scheduleJobData.secondrySchedule = secondryTime;
		console.log("scheduleExpiredAt :::",primaryTime, "ser  :: ", secondryTime, secondryTime.getTime());
		scheduleJobData.scheduleDetails = {... scheduleDetails,
            scheduleExpiredAt:new Date(secondryTime.getTime() - 20 * 60000)
        };
		console.log("job.technician ::: main", job.technician)
		let oldTech = {}
		let techNumber = ''
		if(job.technician && job.technician.profile && job.technician.profile.alertPreference && job.technician.profile.alertPreference.settings && job.technician.profile.alertPreference.settings.Job['Text']['toggle']){
			techNumber =  job.technician['profile']['alertPreference']['settings']['Job']['Text']['value']
		}
		if(props.user.userType === 'customer' && job.technician){
			scheduleJobData.technician = ''
			scheduleJobData.schedule_accepted=false
			scheduleJobData.status = 'Scheduled'
			oldTech = {
				id:job.id,
				techId:job.technician['user'].id,
				firstName:job.technician['user'].firstName,
				email:job.technician['user'].email,
				timezone: job.technician['user']['timezone'],
				number:techNumber,
				by:"Customer "+props.user.firstName
			}
			console.log("oldTech ::: before", oldTech)
		}
		const jobStats = await JobApi.updateJob(job.id, scheduleJobData);
		let custNumber = ''
		if(job.customer && job.customer.phoneNumber){
			custNumber =  job.customer.phoneNumber
		}
		if(props.user.userType === 'customer'){
			console.log("oldTech ::: middle", oldTech)
			let title = "Job has been successfully updated. We are finding a technician for you. We will inform you when we find the technician."
			mixpanel.identify(props.user.email);
        	mixpanel.track('Job meeting time updated by customer',{'JobId':job.id});
			if(job.technician){
				console.log("oldTech ::: after", oldTech)
				title = "Job has been successfully updated by customer and technician removed from job. We are finding a technician for you. We will inform you when we find the technician"
				await socket.emit('updated_schedule_job_accepted_technician_email', oldTech)
				await emitSocketCreateFetchNotification( oldTech.techId, oldTech.email, jobStats, "Meeting time of your accepted job with "+job.customer.firstName+" has been changed")
				if(oldTech.number){
					await socket.emit( 'schedule_job_time_change_alert', oldTech)
				}
				mixpanel.track('Technician '+oldTech.firstName+' is removed from job.',{'JobId':job.id});
			}
			await emitSocketCreateFetchNotification( props.user.id,  props.user.email, jobStats, title)
			if(custNumber){
				await socket.emit( 'schedule_job_time_change_alert',  {id:job.id, number:custNumber, by:"Customer "+props.user.firstName})
			}
			// call send-schedule-alerts socket from backend.
			// It will find available techs and send alerts by sms/email/notification
			// emit send-schedule-alerts socket
			socket.emit('send-schedule-alerts', {
				jobId: jobStats.id,
				customerTimezone: props.user.timezone,
				jobObj: jobStats,
				primaryTime,
				secondryTime,
				phoneNumber:props.user.customer.phoneNumber,
				customerName:props.user.firstName,
				customerEmail:props.user.email,
				technicianId:false,
			});
		}
		if(props.user.userType === 'technician'){
			mixpanel.identify(props.user.email);
        	mixpanel.track('Job meeting time updated by technician',{'JobId':job.id});
			 // NOTE  : This socket is commented by Jagroop under ticket GK-171  : 28-04-2023
			// await socket.emit('schedule_job_updated_by_technician_to_customer_email', jobStats.id)
			let title = "Job Meeting has been updated by technician."
			await emitSocketCreateFetchNotification( job.customer.user.id,  job.customer.user.email, jobStats, title)
			if(custNumber){
				await socket.emit( 'schedule_job_time_change_alert',  {id:job.id, number:custNumber, by:"Technician "+props.user.firstName})
			}
			if(techNumber){
				await socket.emit( 'schedule_job_time_change_alert',  {id:job.id, number:techNumber, by:"Technician "+props.user.firstName})
			}
		}
		// props.fetchJob(job.id);
		props.socket.emit("edit-job",job.id)
		setShowModal(false)
		props.setIsEditScheduleJob(false); 
		props.setDisableEditForJobButton(false); 
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
			consoleLog('There is catch error while create/fetch notification  :::: '+ err.message)
		}
	}

	/**
	 * when click on the calendar cell
	 * @params : event: clicked cell element,
	 * ist: object
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const handleCellClick = (event,ist)=>{
		try{
			console.log("cell clicked ::: ", event, ist);
			setErrMsg('')
			let now_time_obj = new Date()
			let date = new Date(event.date)
			let keysLength = Object.keys(selectedSchedule).length
			if(myEvents.length != 0){
				deleteSelectedEvents()
			}
			if(keysLength === 0 && date > now_time_obj){
				settempSelection(tempSelection=> [...tempSelection, event.target])
				selectedSchedule['primary'] = date.getTime()
				console.log("selectedSchedule ;;:: ", tempEvent)
				setPrimaryTime(moment(date))
				event.target.classList.add("primary-border-class")
				event.target.innerHTML =`<i style="font-size:24px; color:#01D4D5"  class="fa">&#xf00c;</i>`
			}

			if(keysLength > 0 && keysLength < 2 && date.getTime() !== selectedSchedule['primary']){
				
				if(date.getTime() < selectedSchedule['primary']){
					return setErrMsg('Secondary time should be greater than primary time')
				}
				settempSelection(tempSelection=> [...tempSelection, event.target])
				console.log("selectedSchedule ;;:: ", tempEvent)
				selectedSchedule['secondry'] = date.getTime()
				setSecondaryTime(new Date(date))
				event.target.classList.add("secondry-border-class")
				event.target.innerHTML =`<i style="font-size:24px; color:#293742"  class="fa">&#xf00c;</i>`
			}

			if(keysLength === 2  && selectedSchedule['secondry'] === date.getTime()){
				delete selectedSchedule['secondry']
				event.target.classList.remove("secondry-border-class")
				event.target.innerHTML =``
				setSecondaryTime(null) 
			}
			if(keysLength === 1  && selectedSchedule['primary'] === date.getTime()){
				delete selectedSchedule['primary']
				event.target.classList.remove("primary-border-class")
				event.target.innerHTML =``
				setPrimaryTime(null)
			}
			
		}
		catch(err){
			console.log("error in handleCellClick",err)
		}
	}

	/**
	 * delete event and old value
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const handleCloseClick = async ()=>{
		console.log("handleCellCloseClick ::", tempSelection)
		await removeTempSelectedCheckbox()
		selectedSchedule = {}
		defaultEvents = [{
			id: 1,
			start: new Date(job.primarySchedule),
			end: new Date(job.primarySchedule),
			title: `<i style="font-size:24px; color:#01D4D5"  class="fa">&#xf00c;</i>`,
			editable:true
		}, {
			id: 2,
			start:new Date(job.secondrySchedule),
			end:new Date(job.secondrySchedule),
			title: `<i style="font-size:24px; color:#293742"  class="fa">&#xf00c;</i>`,
			editable:true
		}];
		setEvents(defaultEvents)
		props.setIsEditScheduleJob(false); 
		setPrimaryTime(null)
		setSecondaryTime(null)
		if(setEditDisableButton){setEditDisableButton(false)}
	}

	/**
	 * remove selected cell value so that selected value will not return 
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const removeTempSelectedCheckbox= async () =>{
		if(tempSelection){
			tempSelection.forEach(clicked => {
				console.log("clicked ::: ",clicked.lastChild)
				if(clicked.lastChild){
					clicked.classList.remove("secondry-border-class")
					clicked.classList.remove("primary-border-class")
					clicked.lastChild.remove()
				}
			});
		}
		
		settempSelection([])
	}

	/**
	 * remove meeting time if new value selecetd
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const deleteSelectedEvents = useCallback(() => {
        let eventsToUpdate = [...myEvents];
		
		for (const event of myEvents) {
			eventsToUpdate = eventsToUpdate.filter(ev => { return ev.id !== event.id });
		}
		console.log("eventsToUpdate ::", eventsToUpdate)
		setEvents(eventsToUpdate)
		
    }, [myEvents]);

	/**
	 * return selected meeting for job
	 * @returns : selected datetime of job
	 * @author : Ridhima Dhir
	 */
	const TimeDecider = (props) => {
		let selectedDate = '';
		if (props.job.schedule_accepted_on === 'primary') {
			selectedDate = new Date(props.job.primarySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
		} else {
			selectedDate = new Date(props.job.secondrySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
		}
		return selectedDate
	}
	

	// return (
	// 	<Modal
	// 		title="Apply for schedule Job"
	// 		visible={props.isEditScheduleJob}
	// 		onOk={() => {}}
	// 		onCancel={async() => {
	// 			await handleCloseClick()
	// 		} }
	// 		closable={true}
	// 		className="customCloseButton"
	// 		width={1000}
	// 		footer={[
	// 			<Button key="back" onClick={async() => { await handleCloseClick() }} className="btn app-btn app-btn-light-blue modal-footer-btn">
	// 				<span></span>Close
	// 			</Button>,
	// 			<Button
	// 				key="submit"
	// 				className={"btn app-btn job-accept-btn modal-footer-btn "+(editDisableButton ? "disabled-btn" : "")}
	// 				disabled={editDisableButton}
	// 				onClick={editScheduleJob}
	// 			  >
	// 				<span></span>
	// 				{editDisableButton 
	// 				? 
	// 					<Spin/>
	// 				:
	// 					<>Apply</>
	// 				}
	// 			</Button>,
	// 		]}
	// 		>
	// 			<Modal 
	// 				className="app-confirm-modal modal-container" 
	// 				closable={false}  
	// 				footer={null} 
	// 				visible={showModal} 
	// 			>
	// 				{ScheduleModal(selectedSchedule, handleCancel, handleConfirm)}
	// 			</Modal>
	// 			<Col md="12" className="pb-4 m-auto add-card-form-outer text-left">
	// 				<form>
	// 					<Row>
	// 						<div className="col-12">
	// 							<h4><span className="hg-text"> Please choose two time preferences </span></h4>
	// 						</div>
	// 						<div className="col-12">
	// 							<h6><b>Scheduled Primary Time : </b> {new Date(job.primarySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS) } </h6>
	// 							<h6><b>Scheduled Secondary Time : </b> {new Date(job.secondrySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS) }</h6>
	// 							{job && job.customer && job.schedule_accepted && (job.customer.user.id === props.user.id || (job.technician && job.technician.user.id === props.user.id)) && (
	// 								<h6><b>Selected Meeting Time At : </b> <TimeDecider job={job} DATE_OPTIONS={props.DATE_OPTIONS} /></h6>
	// 							)}
	// 						</div>
							
	// 						<div className="col-12">
	// 							{errMsg !== "" && 
	// 								<div>
	// 									<FontAwesomeIcon icon={faExclamationCircle} style={{color:'red'}} />
	// 									<span className='errText'>{errMsg}</span>
	// 								</div>
	// 							}
	// 						</div>
	// 						<div className="col-12">
	// 							<Eventcalendar
	// 								onInit={function (event, inst) {
	// 									console.log("event inst ::: ", event, inst)
	// 								}}
	// 								ref={setInstance}
	// 								theme="ios" 
	// 								themeVariant="light"
	// 								onCellClick = {(event,ist)=>{ handleCellClick(event,ist) }}
	// 								view = {view}
	// 								onPageChange = {(event, inst) =>{selectedSchedule = {}}}
	// 								allDayText = {''}
	// 								timeFormat="hh:mm A"
	// 								selectedEvents={mySelectedEvents} 
	// 								data={myEvents}
	// 								showControls={false}
	// 							/>
	// 						</div>
	// 					</Row>
	// 				</form>            
	// 			</Col>
	// 		</Modal>
	// );
};


 const InputWithLabel = styled.div`
	display: flex;
	flex-direction: column;
	text-align: left;
	marginRight: 30px;
	position: relative;
	&:last-child {
		marginRight: 0;
	}
	& input{
		height:50px;
		padding:10px;
		border-radius: 10px;
		margin-top: 15px;
		border : 2px solid #F3F3F3;
		margin-top:15px;
		margin-left:20px;
	}
	& .react-tel-input .form-control {
		height:50px;   
	}
`;

export default EditScheduleJobFrom;