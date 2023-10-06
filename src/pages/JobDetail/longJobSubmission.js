import React, {useState, useEffect} from 'react';
import {Modal} from 'antd';
import {Button, Row, Col, InputGroup, FormControl, Alert} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEdit, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import { openNotificationWithIcon , isLiveUser} from '../../utils';
import mixpanel from 'mixpanel-browser';
import { useSocket } from '../../context/socketContext';
import * as JobApi from '../../api/job.api';
import { useNotifications } from '../../context/notificationContext';
import * as CustomerApi from '../../api/customers.api';
import * as JobCycleApi from '../../api/jobCycle.api';
import { JobTags } from '../../constants/index.js';
import { useJob } from '../../context/jobContext';
let extra_additional_hour_obj
let liveUser = true;
const LongJobSubmission = (props) => {
	const [totalJobTime, setTotalJobTime] = useState('00:00:00')
	const [totalJobCost, setTotalJobCost] = useState(0)
	const [totalJobCostUpdated, setTotalJobCostUpdated] = useState(0)
	const [totalPerSixMinTime, setTotalPerSixMinTime] = useState(0)
	const [showUpdateCostBlock, setShowUpdateCostBlock] = useState(false)
	const [showSuccessAlert, setShowSuccessAlert] = useState(false)
	const [hoursValue, setHoursValue] = useState(1)
	const {createNotification} = useNotifications();
	const { socket } = useSocket();

	useEffect(()=>{
		(async () => {
			if(props.job){
				/* Get total job time */
				setTotalJobTime(props.totalJobTimeToPass);
			
				/* Get total job cost */
				generateJobTotalCost(props.totalSecondsToPass)
			}
		
			if(props.job && props.job.is_long_job && props.job.long_job_with_minutes === "no" && props.job.hour_history.length>0){
				extra_additional_hour_obj = props.job.hour_history.find((e)=> e.extra_hours_submission === 'pending')
				console.log("extra_additional_hour_obj",extra_additional_hour_obj)
				if(extra_additional_hour_obj){
					props.setHoursWillNotAdd(true)
				}
			}
		
	    })();
		console.log('check this', props)
	},[props.job])

	useEffect(()=>{
		(async () => {
          if(props.job){
           liveUser = await isLiveUser(props.job)
		  }
		})();
	},[props.job]);

	/**
	 * Function will return the total job cost
	 * @params = totalSeconds (Type: Number)
	 * @response : Will return the total job cost
	 * @author : Karan
	 */
	const generateJobTotalCost=(totalSeconds)=>{
		if(props.job.software && totalSeconds > 0){
			let totalCost = 0;
			let totalMinutes = Math.ceil(totalSeconds / 60)
			let perSixMinTime = Math.ceil(totalMinutes / 6)
			totalCost = perSixMinTime * props.job.software.rate
			setTotalPerSixMinTime(perSixMinTime)
			setTotalJobCost(totalCost)
			setTotalJobCostUpdated(totalCost)
		}
	}

	/**
	 * Function will update the total job cost
	 * @params = e (Type: inputElement)
	 * @response : Will update the total job cost
	 * @author : Karan
	 */
	const updateTotalJobCost=(e)=> {
		setTotalJobCostUpdated(e.target.value)
		setShowSuccessAlert(false)
	}

	/**
	 * Function will update actual cost with updated cost
	 * @params = NA
	 * @response : Will update the actual cost
	 * @author : Karan
	 */
	const submitUpdatedCost=()=>{
		setTotalJobCost(totalJobCostUpdated)
		setShowSuccessAlert(true)
	}

	/**
	 * Function will run on value change of fill hour input. It checks the validation of input.
	 * @params =  target event
	 * @response : no response
	 * @author : Manibha, Vinit
	 */

	 const changeHourValue = (event) => {
		let newHrValue = parseFloat(event.target.value)
		if (newHrValue > 100 || newHrValue < 0) {
			return openNotificationWithIcon('error', 'Error', 'Please input a number less than 100 and greater than 0.')
		}
		if (Number.isInteger(newHrValue) === false) {
			return openNotificationWithIcon('error', 'Error', 'Please input a whole number greater than 0.')
		}
		if (newHrValue < 100 && newHrValue > 0 && Number.isInteger(newHrValue)) {
			let cost = parseFloat(props.job.software.hourlyRate) * newHrValue
			setHoursValue(newHrValue)
			if(props.user){
				mixpanel.identify(props.user.email);
				mixpanel.track(`Technician - Selected ${newHrValue} hour's for fixed hour Long-Job`,{ JobId: props.job.id });
			}
		}
	}

	/**
	 * Function will send the hours filled by technician to customer using socket
	 * @params =  no params
	 * @response : no response
	 * @author : Manibha, Vinit
	 */

	 const sendHoursToCustomer = () => {
	 	console.log("calling me >>>>>>>>>>>>>>>>>>")
		if(props.user){
			mixpanel.identify(props.user.email);
			mixpanel.track('Technician - Click on Submit for additional Long-Job hours',{ JobId: props.job.id });
		}
		if (props.job.long_job_with_minutes && props.job.long_job_with_minutes === 'yes'){
			props.handleApprovalModal(totalJobCostUpdated)
			return
		}
		Modal.confirm({
			title: 'Are you sure you want to submit more Long-Job hours ?',
			okText: 'Yes',
			cancelText: 'No',
			className: 'app-confirm-modal',
			async onOk() {
				console.log('LongjobDetails::sendHoursToCustomer>>>>>>>>>>>')
				if(props.job.technician.user){
					mixpanel.identify(props.job.technician.user.email);
					mixpanel.track(`Technician - Click on Yes button to add more hours into Long-Job`,{ JobId: props.job.id });
					await JobCycleApi.create(JobTags.TECH_ADD_MORE_HOURS, props.job.id);
					const data = {}
					data['jobId'] = props.job.id
					data['hoursValue'] = hoursValue
					data['cost'] = parseInt(props.job.software.hourlyRate) * hoursValue
					data['phoneNumber'] = props.job.customer.phoneNumber
					data['email'] = props.job.customer.user.email
					data['customerName'] = props.job.customer.user.firstName + " " + props.job.customer.user.lastName
					data['user'] = props.job.customer.user.id
					console.log('on submit', data);
					socket.emit('send-more-hours', data)
					props.setShowSubmisssionModal(false)
					openNotificationWithIcon('info', 'Note', 'Request sent to customer for additional hours in long-job.')
				}
			},
		})
	}

	const handleApprove = () => {
		if(props.user){
			mixpanel.identify(props.user.email);
			mixpanel.track('Customer - Click on Approve for additional Long-Job hours',{ JobId: props.job.id });
		}
		Modal.confirm({
			title: 'Are you sure you want to approve additional Long-Job hours ?',
			okText: 'Yes',
			cancelText: 'No',
			className: 'app-confirm-modal',
			async onOk() {
				let hour_history_obj = props.job.hour_history.find((e) => e.extra_hours_submission === 'pending')
				if(hour_history_obj){
					if(props.job.customer.user){
						let charge = false;
						charge = await CustomerApi.chargeCustomer({ jobData: props.job,liveUser:liveUser });
				
						if(charge.status === "succeeded"){
							console.log("After Charge::::::")
							const notificationData = {
								user: props.job.technician.user.id,
								job: props.job.id,
								read: false,
								actionable: true,
								shownInBrowser: false,
								title: 'Customer has accepted the extra hours',
								type: 'long_job_notifcation',
							};
							createNotification(notificationData);
							mixpanel.identify(props.job.customer.user.email);
							mixpanel.track(`Customer - Click on Yes button to approve additional hours for Long-Job`,{ JobId: props.job.id });
							await JobCycleApi.create(JobTags.CUSTOMER_ACCEPT_ADDITIONAL_HOURS, props.job.id);
						
							await JobApi.updateJob(props.job.id, {
								hour_history_obj_id:hour_history_obj.id,
								extra_hours_submission:'accepted',
								long_job_hours: (Number(props.job.long_job_hours) + hour_history_obj.extra_hours_added), long_job_cost: props.job.long_job_cost + hour_history_obj.extra_cost,additional_hours_submission:'no',
								total_cost: props.job.total_cost + hour_history_obj.extra_cost, 
								total_time: (Number(props.job.long_job_hours) + hour_history_obj.extra_hours_added) > 9 ? (Number(props.job.long_job_hours) + hour_history_obj.extra_hours_added)+':00:00' : '0'+ (Number(props.job.long_job_hours) + hour_history_obj.extra_hours_added)+':00:00'
							}) 
							let updated_job = await JobApi.retrieveJob(props.job.id)
							console.log("APII JOBBBB",props.job)
							props.setShowSubmisssionModal(false)
							props.setshowAdditionalHoursApproveButtons(false)
							openNotificationWithIcon('info', 'Note', 'Additional hours for long-job approved.')
							socket.emit('customer-approved-additional-hours', updated_job)

							if(updated_job && updated_job.hour_history && updated_job.hour_history.length>0){

										let updateExtraHourData = 0;
										updated_job.hour_history.map((e) => {if(e.extra_hours_submission ==="accepted"){ updateExtraHourData+= e.extra_cost}});

										const savedDiscountedValue = updated_job && updated_job.saved_discounted_value ? 
										updated_job.saved_discounted_value : updated_job.total_discounted_cost

										if(updateExtraHourData !=0 && updateExtraHourData !=undefined){
										const totalDiscountedValue = updateExtraHourData + savedDiscountedValue
										if(updated_job .saved_discounted_value){
											await JobApi.updateJob(updated_job.id, { 'total_discounted_cost': totalDiscountedValue });
										}
										else{
										await JobApi.updateJob(updated_job.id, { 'total_discounted_cost': totalDiscountedValue , 'saved_discounted_value' : updated_job.total_discounted_cost });
										}
									}
							}		
						}
						else{
							const errorMessage = charge?.message ? charge.message : 'Something went wrong';
							openNotificationWithIcon('error', 'Error', errorMessage + ' Please update your card details from Settings -> Card Details');

						}
					}
				}			
			},
		})
	}

	const previousTime = (props.job.total_time)?Number(props.job.total_time.split(":")[0]):'0';
	
	const handleReject = () => {
		if(props.user){
			mixpanel.identify(props.user.email);
			mixpanel.track('Customer - Click on Reject for additional Long-Job hours',{ JobId: props.job.id });
		}
		Modal.confirm({
			title: 'Are you sure you want to reject additional Long-Job hours ?',
			okText: 'Yes',
			cancelText: 'No',
			className: 'app-confirm-modal',
			async onOk() {
				let hour_history_obj = props.job.hour_history.find((e) => e.extra_hours_submission === 'pending')
				if(hour_history_obj){
					if(props.job.customer.user){
						const notificationData = {
							user: props.job.technician.user.id,
							job: props.job.id,
							read: false,
							actionable: true,
							shownInBrowser: false,
							title: 'Customer has rejected extra hours.',
							type: 'long_job_notifcation',
						};
						createNotification(notificationData);
						mixpanel.identify(props.job.customer.user.email);
						mixpanel.track(`Customer - Click on Yes button to approve additional hours for Long-Job`,{ JobId: props.job.id });
						await JobCycleApi.create(JobTags.CUSTOMER_REJECT_ADDITIONAL_HOURS, props.job.id);
						await JobApi.updateJob(props.job.id, {hour_history_obj_id:hour_history_obj.id,additional_hours_submission:'no',extra_hours_submission:'rejected'})
						let updated_job = await JobApi.retrieveJob(props.job.id)
						props.setShowSubmisssionModal(false)
						props.setshowAdditionalHoursApproveButtons(false)
						openNotificationWithIcon('info', 'Note', 'Additional hours for long-job rejected.')
						socket.emit('customer-declined-additional-hours', updated_job)
					}

				}
			},
		})
	}

	return (
		<Modal title="Long job submission" onCancel={()=>{props.setShowSubmisssionModal(false)}} visible={props.showSubmisssionModal} className="longJobSubmissionModal" footer={ props.job.long_job_with_minutes === "no" && props.user.userType === 'customer'?
			[
			<Button key="btn-submit" className="btn app-btn app-btn-small declne-job-btn" onClick={handleReject} style={{minWidth :'100px'}}>
			  <span></span>Reject
			</Button>,            
			<Button key="btn-submit" className="btn app-btn app-btn-small declne-job-btn" onClick={handleApprove}  style={{minWidth :'100px'}}>
			  <span></span>Approve
			</Button>,           
			<Button key="btn-cancel" className="btn app-btn app-btn-light-blue  declne-job-btn" style={{minWidth:"100px"}} onClick={()=>{props.setShowSubmisssionModal(false)}}>
			  <span></span>Cancel
			</Button>,
		] :
			[<Button key="btn-cancel" className="btn app-btn app-btn-light-blue app-btn-small declne-job-btn" onClick={()=>{props.setShowSubmisssionModal(false)}}>
			  <span></span>Cancel
			</Button>,
			<Button key="btn-submit" className="btn app-btn app-btn-small declne-job-btn" onClick={sendHoursToCustomer} disabled={props.hoursWillNotAdd}>
			  <span></span>Submit
			</Button>,            
		]}>
			<Row className="transfer-call-outer">
				<Col xs={12} className="">		
					{ !props.hoursWillNotAdd &&
						<div className="text-muted small-text input-notes-text input-notes-modal">
							Following are your job details:
						</div>
					}
					<div className="table-responsive">
						<table className="table table-fluid w-100">
							<tbody>
								{props.job.long_job_with_minutes === "yes" ?
								<>
									<tr>
										<td width="170">Total job time</td>
										<td width="6">:</td>
										<td>{totalJobTime}</td>
									</tr>
									<tr>
										<td>Software Rate</td>
										<td>:</td>
										<td>{(props.job.software ? '$'+props.job.software.rate : 'NA')}</td>
									</tr>
									<tr>
										<td>Total time (Per 6 mins)</td>
										<td>:</td>
										<td>{totalPerSixMinTime}</td>
									</tr>
									{props.user?.technician?.tag !== "employed" && 
									<tr>
										<td>Total cost</td>
										<td>:</td>
										<td>
											{(totalJobCost ? '$'+totalJobCost : 'NA')} 
											<FontAwesomeIcon 
												icon={faEdit} 
												className="ml-2" 
												onClick={()=>{setShowUpdateCostBlock(true)}} 
												title="Click here to update cost"
											/>
											<br/>
											{showUpdateCostBlock &&
												<div className="updateCostBlock">
													{showSuccessAlert &&
														<Alert variant="success" className="w-100 mt-3">
															Cost successfully updated
														</Alert>
													}
													<label className="pt-2">Update Cost:</label>
													<br/>
													<InputGroup>
														<FormControl
														placeholder="Enter cost"
														aria-label="Recipient's username with two button addons"
														type="number" 
														min="1" 
														value={(totalJobCostUpdated ? totalJobCostUpdated : 0)} 
														onChange={(e)=>updateTotalJobCost(e)}
														/>
														<Button variant="outline-secondary" onClick={submitUpdatedCost}>
															<FontAwesomeIcon icon={faCheckCircle} className="" />
														</Button>
														<Button variant="outline-secondary" onClick={()=>{setShowUpdateCostBlock(false); setShowSuccessAlert(false);}}>
															x
														</Button>
													</InputGroup>
												</div>
											}
										</td>
									</tr>}
								</>  
								:  
								props.user.userType === 'technician' ? 
								(props.hoursWillNotAdd ?
									<>
										<h6>Previous additional hours are not accepted by customer.</h6>
										<h6>Wait till he accepts to add more</h6>
									</>							
								:
								<>
									<tr>
										<td width="170">Existing Hours</td>
										<td width="6">:</td>
										<td>{props.job.long_job_hours+" Hrs"}</td>
									</tr>
									<tr>
										<td width="170">Add more hours</td>
										<td width="6">:</td>
										<td><input
										type="number"
										onChange={changeHourValue}
										className="hoursClassInput form-control"
										placeholder="Please enter a number of hours."
										value={hoursValue}
										/></td>
									</tr>
								</> )
								: 
								<>
									<tr>
										<td width="170">Previous Hours</td>
										<td width="6">:</td>
										<td>{props.job.total_time}</td>
									</tr>
									<tr>
										<td width="170">Previous Cost</td>
										<td width="6">:</td>
										<td>{props.job.total_cost}</td>
									</tr>
									<tr>
										<td width="170">Additional Hours</td>
										<td width="6">:</td>
										<td>{props.hoursWillNotAdd ? extra_additional_hour_obj?.extra_hours_added : 0 }</td>
									</tr>
									<tr>
										<td width="170">Additional Cost</td>
										<td width="6">:</td>
										<td>{props.hoursWillNotAdd ? extra_additional_hour_obj?.extra_cost : 0 }</td>
									</tr>
								</>}
							</tbody>
						</table>
					</div>
				</Col>
			</Row>
		</Modal>
	);
}

export default LongJobSubmission;
