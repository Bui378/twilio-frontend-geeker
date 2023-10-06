import React, {useState} from 'react';
import {Spin,Modal} from 'antd';
import {Button} from 'react-bootstrap';
import styled from 'styled-components';
import { JobTags } from '../../constants/index.js';
import * as JobApi from '../../api/job.api';
import { openNotificationWithIcon,GAevent } from '../../utils';
import { send_email_to_customer } from '../../api/serviceProvider.api';
import mixpanel from 'mixpanel-browser';
import * as JobCycleApi from '../../api/jobCycle.api';
import { useSocket } from '../../context/socketContext';
import { useNotifications } from 'context/notificationContext.jsx';
import ConfirmationModel from 'pages/Technician/JobAlert/steps/Components/ConfirmationModel.js';


const ApplyScheduleJobFrom = (props) => {
	const { socket } = useSocket();
	const [disableButton,setDisableButton] = useState(false)
	const [scheduleAccptOn, setscheduleAccptOn] = useState("primary");
	const {fetchNotifications} = useNotifications()
	/**
	 * Apply for schedule job by slecting time.
	 * @params : we are using use state variables in this function
	 * @returns: modal close
	 * @author : Ridhima Dhir
	 */
	const applyScheduleJob = async (event) => {	
		// event.preventDefault()
		setDisableButton(true)
		console.log("scheduleAccptOn :::::::::",event, scheduleAccptOn);
		// if(!scheduleAccptOn){
		// 	console.log("scheduleAccptOn2 :::::::::",event, scheduleAccptOn);
		// 	openNotificationWithIcon('error', 'Error', 'Please select primary or secondary time for meeting.');
		// 	return false;
		// }
		console.log("scheduleAccptOn3 :::::::::",event, scheduleAccptOn);
		const checkScheduleJobStatus = await JobApi.checkScheduleJobAvailability(props.job.id)
		console.log("checkScheduleJobStatu4s :::::::", checkScheduleJobStatus)
		if(!checkScheduleJobStatus['scheduleDetails']['primaryTimeAvailable'] ){
			openNotificationWithIcon('error', 'Error', 'Primary time is expired.');
			setDisableButton(false)
			return false;
		}
		// if(!checkScheduleJobStatus['scheduleDetails']['secondaryTimeAvailable'] && scheduleAccptOn == "secondry"){
		// 	openNotificationWithIcon('error', 'Error', 'Secondary time is over. Job has been expired.');
		// 	window.location.reload();	
		// }
		console.log("checkScheduleJobStatus :::", checkScheduleJobStatus);
		//Check last job feedback given or not. Show feedback modal if job feedback is not provided by tech
		const check_feedback = await JobApi.checkLastJobFeedback({'technician':props.user.technician.id});
		console.log('check_feedback>>>>>>>',check_feedback)
		if(check_feedback.job_id != undefined){
			console.log('after check_feedback>>>>>>>',check_feedback)
			props.setShowFeedbackModal(true)
			props.setFeedbackJobId(check_feedback.job_id)
		}

		//if need hair expert for that job or need two tier job
		// show popup and reload the current location
		let isTwoTierJobAndExpertTech = await props.checkIfTwoTierJobAndExpertTech(props.user.technician, props.job)
		if(isTwoTierJobAndExpertTech == false){
			setDisableButton(false)
			openNotificationWithIcon('error', 'Error', 'This job is only for experts.Please contact admin to make you one.');
			window.location.reload();					
		}

		console.log("isTwoTierJobAndExpertTech && check_feedback.job_id",isTwoTierJobAndExpertTech , check_feedback.job_id)
		//if hair expert is not reuired and last completed job feedback is given by tech. Then tech can apply for job.
		//show confirmation modal: if ok clicked then update job detail 
		if(isTwoTierJobAndExpertTech && check_feedback.job_id == undefined){
			console.log("Are you sure you want to accept this job?" );
			// Modal.confirm({
			// 	title: 'Are you sure you want to accept this job?',
			// 	okText: 'Yes',
			// 	cancelText: 'No',
			// 	className: 'app-confirm-modal',
			// 	async onOk() {
					props.setDisableApplyForJobButton(true)
					props.setDisableDeclineBtn(true)
					await applyForScheduleJob()
				// }
			// });
		}
		props.setIsApplyScheduleJob(false);
	};

	const applyForScheduleJob = async () => {
		// get job details
		const res = await JobApi.retrieveJob(props.job.id);

		// check technician field have value or not
		// if tech field don't have value then assign job to slected job 
		if (res.technician === null || !res.technician) {
			// check user object have value and user is technician
			if (props.user && props.user.technician) {
				//update technican field of job
				await JobApi.updateJob(props.job.id, {
					technician: props.user.technician.id, schedule_accepted_by_technician: props.user.id, schedule_accepted_on: scheduleAccptOn, schedule_accepted: true,acceptedJobTime: new Date(),
				});
				await fetchNotifications({"user":props.user.id})
				send_email_to_customer(props.job.id);
		      
				// props.fetchSingleJob()
			
			}

			// mixpanel code//
			mixpanel.identify(props.user.email);
			mixpanel.track('Technician - Job applied from job details page successfully', { 'JobId': props.job.id });
			// mixpanel code//

			// create new job cycle with tag TECH_ACCEPT_SCHEDULE_JOB
			await JobCycleApi.create(JobTags.TECH_ACCEPT_SCHEDULE_JOB, props.job.id)
			openNotificationWithIcon('success', 'Success', 'We received your application and you’ll be hearing from us shortly.');
			//GA3 tag commented by Vinit on 24/04/2023.
			GAevent('Technician Accepted', 'tech_job_accepted', props.user?.technician?.id, props?.job?.id)
			socket.emit('scheduled-job-accepted-by-technician', {
				job: res, techEmail: props.user.email, timezone: props.user.timezone, techDetails: props.user.technician, techName: props.user.firstName, scheduleAccptOnVar: scheduleAccptOn,techName:props.user.firstName
			});
			if (props.fromEmail) {
				window.location.href = `/job-details?jobID=${props.job.id}&type=noapply`;
			}
			props.fetchJob(props.job.id);
			props.setTechtype('noapply');
		} else {
			// mixpanel code//
			mixpanel.identify(props.user.email);
			mixpanel.track('Technician - Job applied from job details page not successfully', { 'JobId': props.job.id });
			// mixpanel code//
			openNotificationWithIcon('success', 'Success', 'Sorry!. The job has been taken.');
			if (props.fromEmail) {
				window.location.href = `/job-details?jobID=${props.job.id}&type=noapply`;
			}
			props.fetchJob(props.job.id);
			props.setTechtype('noapply');
		}
	};
    // This code is commented by Jagroop in order to remove disable 1 min popup under GK-349
	// return (
	// 		<ConfirmationModel acceptClicked={disableButton} acceptJobEvent={"acceptJobEvent"} open={props.isApplyScheduleJob} setOpen={props.setIsApplyScheduleJob} handleAccept={applyScheduleJob} />
	// )

	return (


		<Modal
			// title="Apply for schedule Job"
			visible={props.isApplyScheduleJob}
			onOk={() => {}}
			onCancel={() => {props.setIsApplyScheduleJob(false); props.setDisableApplyForJobButton(false); if(disableButton){setDisableButton(false)}} }
			closable={true}
			className="customCloseButton"
			footer={[
				<Button key="back" onClick={() => {
					props.setIsApplyScheduleJob(false); if(disableButton){setDisableButton(false)}
				}} className="btn app-btn app-btn-light-blue modal-footer-btn">
					<span></span>No
				</Button>,
				<Button
					key="submit"
					className={"btn app-btn job-accept-btn modal-footer-btn "+(disableButton ? "disabled-btn" : "")}
					disabled={disableButton}
					onClick={applyScheduleJob}
				  >
					<span></span>
					{disableButton 
					? 
						<Spin/>
					:
						<>Yes</>
					}
				</Button>,
			]}
			>
				<div>
					<span className='bold-span'>Are you sure you want to accept this job?</span>
				</div>
				{/* <Col md="12" className="card-validation-message mb-5">
					Please select time for the meeting
				</Col> */}
				{/* <Col md="12" className="pb-4 m-auto add-card-form-outer text-left">
					<form>
						<Row>
							<h6>Please select time for the meeting</h6>
							<div className="col-12">
								<div className="form-check">
									<input 
										className="form-check-input" 
										onChange={()=>{
											setscheduleAccptOn("primary")
										}} 
										type="radio" 
										name="scheduleBtn" 
										id="primaryTime"  />
									<label className='form-check-label' htmlFor="primaryTime">
										<span className={!props.job.scheduleDetails.primaryTimeAvailable? 'strike-through':""} >
										<b>Primary Time : </b>
										{' '}
										{new Date(props.job.primarySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS)}
										{' '}
										</span>
										{props.job && !props.job.scheduleDetails.primaryTimeAvailable && (
											<>
												<b><span className="label-not-available">: Not Available </span></b>
											</>
										)}
									</label>
								</div>
								<div className="form-check">
									{props.job && props.job.scheduleDetails.secondaryTimeAvailable && (
										<>
										<input className="form-check-input" 
											onChange={()=>{
												setscheduleAccptOn("secondry")
											}} 
											type="radio" 
											name="scheduleBtn"
											id="secondryTime" 

											
										/>
										</>
									)}
									<label className="form-check-label" htmlFor="secondryTime">
										{' '}
										<b>Secondary Time {props.job && !props.job.scheduleDetails.secondaryTimeAvailable && (
												<>
													<span className="label-not-available">: Not Available </span>	
												</>
											)}:</b>
										{' '}
										{new Date(props.job.secondrySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS)}
										{' '}
										{props.job && !props.job.scheduleDetails.secondaryTimeAvailable && (
											<>
												Not Available	
											</>
										)}
									</label>
								</div>
							</div>
						</Row>
					</form>            
				</Col> */}
			</Modal>
	);
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

export default ApplyScheduleJobFrom;