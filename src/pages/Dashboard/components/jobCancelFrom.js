import React, {useState} from 'react';
import { Input, Spin, Modal } from 'antd';
import { Row, Col, Button } from 'react-bootstrap';
import {updateJob, cancelScheduleJob } from '../../../api/job.api';
import mixpanel from 'mixpanel-browser';
import { openNotificationWithIcon } from '../../../utils';
import { useSocket } from '../../../context/socketContext';
import * as CustomerApi from '../../../api/customers.api';
import * as UserApi from '../../../api/users.api';
import * as TwilioApi from '../../../api/twilioChat.api';

const JobCancelFrom = (props) => {
	const [isDisabled,setIsDisabled] = useState(false)
	const [reason,setReason] = useState('')
	const [isEmptyReason,setIsEmptyReason] = useState(false)
	const { socket } = useSocket();

	/**
	 * cancel job by tech and customer.
	 * @params : we are using use state variables in this function
	 * @returns: reload page after timeout
	 * @author : Ridhima Dhir
	 */
	const handleCancel = async (event) => {
		if(reason){
			setIsDisabled(true)
			// Block native form submission.
			event.preventDefault();
			console.log(" cancelJobId:::: ",props.cancelJobId, ' ::: reason :::', reason)
			// check type is customer then emit socket scheduleCancelledByCustomer
			// updatejob status and schedule_accepted to false
			if(props.type == "Customer"){
				mixpanel.identify(props.user.email);
				mixpanel.track('Customer -  Cancelled the schedule job from dashboard',{'JobId':props.cancelJobId});
				 // This will refund the hold money from customer account
				if (props?.job && props?.job?.customer_holded_payments && props?.job?.customer_holded_payments.length >0){
					
					let ownerStripeId = '';
					const ownerId =props?.job?.customer?.user?.ownerId;
					if(ownerId){
					   const ownerStripeRes = await UserApi.getUserById(ownerId)
					   if(ownerStripeRes?.customer?.stripe_id){
						ownerStripeId = ownerStripeRes?.customer?.stripe_id 
					   } 
					}
					const stripeId = ownerId ? ownerStripeId : props?.job?.customer?.stripe_id
					// Here payment_hold_id is not-applicable-here because we want to send only when we are Adding card as in that case of card no payment_hold_id is stored somewhere  but in normal cases like this all the data is stored in the form of object and may have more than one stripe id
					const obj = {
						payment_hold_id: "not-applicable-here",
						isDeduct: false,
						jobId: props.job?.id,
						stripe_id: stripeId
					}
					await CustomerApi.deductOrRefundHoldMoney(obj);
				}
				await socket.emit("scheduleCancelledByCustomer",{jobId:props.cancelJobId, reason:reason})
				await updateJob(props.cancelJobId, { "status": "Declined","schedule_accepted":false,"tech_message_dashbord":false})
				await TwilioApi.updateTwilioConversation(props.job?.twilio_chat_service?.sid)
				socket.emit("refresh-job-after-decline-by-user",props.job)
				openNotificationWithIcon('success', 'Success', 'Job has been cancelled.');
			}

			// check type is Technician then call function decline_job_by_technician
			if(props.type == "Technician"){
				mixpanel.identify(props.user.email);
				mixpanel.track('Technician - Job declined from dashboard',{'JobId':props.cancelJobId});
				await props.decline_job_by_technician(props.cancelJobId, true, reason)
			}

			// Update the custCancellation or techCancellation object of job as per cancellation type (customer or tech)
			//	custCancellation object update if type is Customer and push object in techCancellation field if type is tech
			// and update job
			await cancelScheduleJob(props.cancelJobId, {'calcellationBy':props.type, 'reason':reason, 'user':props.user})
			
			//Modal close
			props.setIsCancelModal(false)
			
			//Reload current location
			setTimeout(function(){
				window.location.reload()
			},1000)
		}else{
			// show error message if reason is empty
			event.preventDefault();
			setIsEmptyReason(true)
		}
	};

	const changeReason = (e) =>{
		setReason(e.target.value)
	}

	return (
		<Modal
			title="Cancel Schedule Job"
			visible={props.isCancelModal}
			onOk={() => {}}
			onCancel={() => {props.setIsCancelModal(false); } }
			closable={true}
			className="customCloseButton"
			footer={[
				<Button key="back" onClick={() => {
					props.setIsCancelModal(false);
				}} className="btn app-btn app-btn-light-blue modal-footer-btn">
					<span></span>No
				</Button>,
				<Button key="cancel"
					className={"btn app-btn modal-footer-btn "+(isDisabled ? "disabled-btn" : "")}
					disabled={isDisabled}
					onClick={handleCancel}
				  >
					<span></span>
					{isDisabled 
					? 
						<Spin/>
					:
						<>Yes</>
					}
				</Button>,
			]}
			>
				<Col md="12" className="pb-4 m-auto add-card-form-outer text-left">
					
				{props.user.userType === "customer" ? (
					<span>Please note, your job is accepted by one of our Geek, so if you cancel this job now then a fee of $24.99 will be applied. Are you sure you want to continue?</span>
				) : null}
					<form>
						<h6><span className="red-text">*</span>Please provide reason for cancellation.</h6>
						<Row>
							<Col md="12" className= "card-element-outer mt-2 mb-4">
								<Col xs="12" className= "card-element-inner pb-3 iframe-outer" >
									<Input.TextArea 
										rows={3} 
										placeholder="Please tell us reason for cancellation" 
										onChange={changeReason} 
										className = {isEmptyReason?"red-border":""}
										required />
								</Col>                            
							</Col>
						</Row>
					</form>            
				</Col>
		</Modal>
	);
};

export default JobCancelFrom;