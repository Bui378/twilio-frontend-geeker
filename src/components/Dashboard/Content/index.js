import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'react-bootstrap';
import CustomerTopBar from '../../TopBar/CustomerTopBar';
import TopBar from '../../../pages/Dashboard/components/TopBar';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import { useAuth } from '../../../context/authContext';
import Dashboard from '../../../pages/Dashboard/steps/dashboard';
import { useJob } from '../../../context/jobContext';
import EarningsTech from '../../../pages/Dashboard/steps/earnings';
import BillingReportTech from '../../../pages/Dashboard/steps/billingReports';
import TechnicianTransactons from '../../../pages/Dashboard/steps/transactions'
import JobReports from '../../../pages/Dashboard/steps/jobReports';
import TechnicianProfile from '../../../pages/Technician/Profile';
import CustomerProfile from '../../../pages/Customer/Profile';
import JobDetail from '../../../pages/JobDetail';
import ActiveTechnicianTable from '../../../pages/Dashboard/steps/activeTechnicians';
import ReferalRewardsTable from '../../../pages/Dashboard/steps/referalRewards';
import TechnicianRewardsTable from '../../../pages/Dashboard/steps/technicianRewards'
import Invite from '../../../pages/Invites';
import Notifications from '../../Sidebar/Notifications';
import { useNotifications } from '../../../context/notificationContext';
import ReferPeople from '../../../pages/Dashboard/steps/referPeople';
import Subscription from '../../../pages/Customer/Subscription';
import Instructions from '../../../pages/Technician/Register/steps/instructions';
import { INACTIVE_ACCOUNT_MESSAGE } from '../../../constants';
import { useServices } from '../../../context/ServiceContext'
import PreviousTechnicianList from '../../../pages/Customer/PreviousTechnicianList'
import { useTools } from '../../../context/toolContext';
import { openNotificationWithIcon } from 'utils';
import Badge from '@mui/material/Badge';
import { useSocket } from '../../../context/socketContext';
import Box from 'components/common/Box';
import * as UserApi from '../../../api/users.api';
import * as JobApi from '../../../api/job.api';
import TransferModal from '../TransferReason/TransferModal';
import MessageTab from 'pages/Customer/MessageTab';

function DashboardData({ user, scheduledBadge, sethideBadge, currentStep, setcurrentStep, fromEmail, allNotifications, softwareList, setActiveMenu, initialLoad, scheduledJob, handleScheduledJob, showNotificationBadge, notifyCount, setOpenNotification, hideBadge, setjobId, openNotification, estimatedWaitTime, setEstimatedWaitTime, jobId, type, setType, setShowNotificationBadge }) {
	const history = useHistory()
	const detailRef = useRef()
	const { fetchJob } = useJob()
	const { verificationEmailHandler } = useAuth();
	const [verificationSent, setVerificationSent] = useState(false)
	const [hideEmailmsg, sethideEmailmsg] = useState(false)
	const [displayList, setDisplayList] = useState(false);
	const { updateReadStatus } = useNotifications();
	const [notifyList, setNotifyList] = useState([])
	const [subscriptionName, setSubscriptionName] = useState(false)
	const [subscriptionPendingTime, setSubscriptionPendingTime] = useState(false)
	const [latestJobIndex, setLatestJobIndex] = useState(0)
	const [cardDetailActive, setCardDetailsActive] = useState(false)
	const { showChatButton, setShowChatButton } = useTools();
	const [socketHits, setSocketHits] = useState(0);
	const { logout } = useAuth();
	const { socket } = useSocket();
	const [businessNameBadge, setBusinessNameBadge] = useState('');
	const [transferModal, setTransferModal] = useState(false);
	const [transferReason, setTransferReason] = useState('');

	const { getStripeAccountStatus, generateAccountLink, createStripeAccount, detailSubmission, disable } = useServices()
	useEffect(() => {
		console.log(">>>>>>>>>> currentStep >>>>>>>>>>> ", currentStep)
	}, [currentStep])

	useEffect(() => {
		(async () => {
			if (user && user.technician && user.technician.accountId !== undefined) {
				await getStripeAccountStatus(user.technician.accountId)
			}
		})();
	}, [user, detailSubmission])

	useEffect(() => {
		if (allNotifications && user.userType === "technician") {
			socket.on("open-chat-panel-talkjs", (data) => {
				if (data === allNotifications[latestJobIndex]?.job.id) {
					handleSocketEvent()
				}
			})
		}
	}, [allNotifications, socket])

	const handleSocketEvent = () => {
		// Increase the socket hits count
		setSocketHits((prevHits) => prevHits + 1);
	};

	/**
	 * @description : This will check if customer is accessing card through customer/card-detail-page. If then then
	 * 			   We Will direct it directly through Card Detail Section
	 */
	useEffect(() => {
		if (history && history?.location?.pathname === '/customer/card-detail-page') {
			setcurrentStep(5)
			setCardDetailsActive(true)
		}
	}, [history])

	useEffect(() => {
		(async function () {
			if (user && user?.userType == 'customer' && user?.blocked) {
				await logout();
				setTimeout(() => {
					openNotificationWithIcon('error', 'Error', 'Your account is Blocked due to Payment Issue.Please contact admin');
					window.location.href = '/'
				}, 1000);
			}
		})()
	}, [user])

	useEffect(() => {
		console.log('empty useEffect in CustomerTopBar>>>>>>>', user.customer)
		if (user.customer) {
			if (user.customer.subscription != undefined) {
				setSubscriptionName(user.customer.subscription.plan_name)
				let time_used_in_seconds = user.customer.subscription.time_used
				let remaining_seconds
				if (user.customer.subscription.grand_total_seconds) {
					remaining_seconds = (user.customer.subscription.grand_total_seconds) - time_used_in_seconds
				} else {
					remaining_seconds = (user.customer.subscription.total_seconds) - time_used_in_seconds
				}
				let remaining_minutes = (remaining_seconds / 60).toFixed(2);
				let string_in_min = remaining_minutes + ' min'
				let converted_format = convertTime(remaining_seconds)
				setSubscriptionPendingTime(converted_format)
			}
		}
	}, [user])

	function convertTime(sec) {
		var hours = Math.floor(sec / 3600);
		(hours >= 1) ? sec = sec - (hours * 3600) : hours = '00';
		var min = Math.floor(sec / 60);
		(min >= 1) ? sec = sec - (min * 60) : min = '00';
		(sec < 1) ? sec = '00' : void 0;
		(min.toString().length == 1) ? min = '0' + min : void 0;
		(sec.toString().length == 1) ? sec = '0' + sec : void 0;
		if (hours >= 1 && hours <= 9) {
			hours = '0' + hours
		}
		// This will check if seconds are of nan type if so then replace it with 00
		if (sec.toString() == "NaN") {
			sec = '00'
		}
		console.log("checking the resultant value of hh:mm:ss", hours + ':' + min + ':' + sec)
		return hours + ':' + min + ':' + sec;
	}

	useEffect(() => {
		if (allNotifications && user.userType === "customer") {
			setNotifyList(allNotifications)
		}
	}, [allNotifications])

	useEffect(() => {
		(async () => {
			if (allNotifications && user.userType === "technician") {
				const isAvailable = (element) => element?.job?.tech_declined_ids.includes(user.technician.id) === false && element?.job?.declinedByCustomer.includes(user.technician.id) === false && (element?.job.status === "Pending" || element?.job.status === "Waiting" || element?.job.status === "Scheduled" && element?.job?.schedule_accepted === false);
				const index = allNotifications.findIndex(isAvailable)

				let foundJob = allNotifications[index]
				if (foundJob && foundJob?.job?.customer?.user) {
					let customerUserInfo = foundJob.job.customer.user;
					if (customerUserInfo.roles[0] === 'owner' && customerUserInfo.isBusinessTypeAccount) {
						setBusinessNameBadge(customerUserInfo.businessName)
						setLatestJobIndex(index)
					}
					if (customerUserInfo.roles[0] === 'admin' || customerUserInfo.roles[0] === 'user') {
						const ownerUserInfo = await UserApi.getUserById(foundJob.job.customer.user.ownerId);
						setBusinessNameBadge(ownerUserInfo.businessName)
						setLatestJobIndex(index)
					}
				} else {
					setLatestJobIndex(index)
				}
			}
		})();
	}, [allNotifications, initialLoad, showNotificationBadge])

	const HandleDetailsDashboard = async (e) => {
		e.currentTarget.disabled = true;
		sethideBadge(true)
		setShowNotificationBadge(false)
		updateReadStatus({ "user": user.id, "status": true, "job": e.currentTarget.id })
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician- Click to see job details from dashboard notification', { 'JobId': e.currentTarget.id });
		// mixpanel code//
		history.push(`/technician/new-job/${e.currentTarget.id}`, { userIds: [user.id], appendedJob: e.currentTarget.id });
	}

	const handleJobDetails = (e) => {
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician- Click to see Schedule job details from dashboard notification', { 'JobId': jobId });
		// mixpanel code//
		setjobId(e.currentTarget.name)
		setType("apply")
		console.log("setType ::: schedule job :::: ", type);
		fetchJob(e.currentTarget.name)
		setActiveMenu('home')
		setcurrentStep(6)
	}

	const handleJobDetailsForChat = (id) => {
		// mixpanel code //
		mixpanel.identify(user.email);
		mixpanel.track('Technician- Click to see Schedule job details from dashboard notification', { 'JobId': jobId });
		// mixpanel code//
		setjobId(id)
		setType("apply")
		console.log("setType ::: schedule job :::: ", type);
		fetchJob(id)
		setActiveMenu('home')
		setShowChatButton(true)
		setcurrentStep(6)
		setSocketHits(0)
	}

	const handleTransferReason = async (jobId) => {
		console.log("handleTransferReason :::")
		let updateJob = await JobApi.retrieveJob(jobId)
		console.log("UpdateJob :::", updateJob.reasons[0])
		setTransferReason(updateJob.reasons[0])
		setTransferModal(true)
	}
	const ButtonHandler = ({ allNotifications }) => {
		if (allNotifications[latestJobIndex].type === "Scheduled Job" && allNotifications[[latestJobIndex]].job.status === "Scheduled") {
			console.log("inside the schedule job")
			return (
				<>
					<div className="d-flex flex-column">
						<Button name={allNotifications[[latestJobIndex]].job.id} onClick={(e) => { handleJobDetails(e) }} className="btn app-btn app-btn-light-blue joinBtn float-right job-issue-btn"><span></span> Details</Button>
						{allNotifications[latestJobIndex].job.post_again_reference_technician &&
							<span className="p-2 float-right job-issue-text" onClick={() => handleJobDetailsForChat(allNotifications[latestJobIndex].job.id)}>Chat with customer</span>
						}
					</div>
				</>
			)
		} else {
			console.log("inside the normal job")
			return (
				<>
					<div className="d-flex flex-column align-items-end">
						<button id={allNotifications[latestJobIndex].job.id} ref={detailRef} onClick={(e) => { HandleDetailsDashboard(e) }} className="btn app-btn app-btn-light-blue joinBtn float-right job-issue-btn job-details-badge-btn">
							<span></span> Details
						</button>
						{allNotifications[latestJobIndex].job.is_transferred &&
							<button className="btn app-btn app-btn-light-blue joinBtn float-right job-issue-btn" style={{ top: '48px' }} onClick={() => handleTransferReason(allNotifications[latestJobIndex].job.id)}><span></span>More Details</button>
						}
						<Box display="flex" style={{ marginRight: '-7px' }} justifyContent="right" marginTop={20} className="float-right invite-tech-btn       float-right job-issue-btn-1 ">
							{allNotifications[[latestJobIndex]].job.post_again &&
								allNotifications[latestJobIndex].job.post_again_reference_technician &&
								allNotifications[latestJobIndex].job.post_again_reference_technician !== "" &&
								<Badge
									sx={{
										"& .MuiBadge-badge": {
											borderRadius: 50,
											backgroundColor: socketHits ? "red" : "",
											marginTop: '10px',
											right: -'3px',
										},
									}}
									variant="dot"
								>
									<span style={{ display: "flex", justifyContent: "center", fontWeight: "bold", color: "#97abb6", cursor: "pointer", border: 'none', textDecoration: 'underline' }} className='bell-icon-class' onClick={() => handleJobDetailsForChat(allNotifications[latestJobIndex].job.id)}>Start chat with customer</span>
								</Badge>
							}
						</Box>
					</div>
				</>
			)
		}
	}

	const sendVerificationMail = () => {
		verificationEmailHandler({ "email": user.email })
		setVerificationSent(true)
		setTimeout(() => { sethideEmailmsg(true) }, 3000)
	}

	const handleDropDown = () => {
		setDisplayList(!displayList)
		updateReadStatus({ "user": user.id, "status": true })
	}

	return (
		<Row>
			<Col xs="12">
				{user && user.userType === 'technician' &&
					<Row>
						<Col xs="12">
							<TopBar softwareList={softwareList} />
						</Col>
					</Row>
				}
				{user && user.userType === 'customer' &&
					<Row>
						<Col
							lg={(user && !user.isBusinessTypeAccount && user.roles[0] === "owner") ? 4 : 9}
							md={(user && !user.isBusinessTypeAccount && user.roles[0] === "owner") ? 5 : 8} className="float-left"
						>
							{<CustomerTopBar setcurrentStep={setcurrentStep} setActiveMenu={setActiveMenu} />}
						</Col>

						{(user && !user.isBusinessTypeAccount && user.roles[0] === "owner") && <Col lg="5" md="3" className="float-left pt-4 pr-0 mt-2">
							{user?.userType === "customer" && subscriptionName &&
								<>
									<span className="show-subscription"> Subscription -  </span> <span className="value-subscription"> {subscriptionName} </span>
									<span className="show-subscription"> Remaining time -  </span> <span className="value-subscription"> {subscriptionPendingTime} </span>
								</>
							}
						</Col>}

						<Col lg="3" md="4" className="pt-5 float-right">
							<Notifications user={user} handleDropDown={handleDropDown} notificationCount={notifyCount} userNotifications={notifyList} displayList={displayList} setDisplayList={setDisplayList} setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} setActiveMenu={setActiveMenu} />
						</Col>
					</Row>
				}
				{scheduledBadge &&
					<Row>
						<Col md="12" className="mb-3 px-3 mt-4 notification-badge jobBadge">
							<p>
								Time now to start the scheduled meeting and solve the issue
								<Button onClick={handleScheduledJob} className="btn app-btn app-btn-light-blue joinBtn float-right" >Details</Button>
							</p>
							<p></p>
						</Col>
					</Row>
				}
				{user
					&& user.userType === "technician"
					&& allNotifications
					&& !initialLoad
					&& allNotifications.length > 0
					&& allNotifications[0].actionable === false
					&& allNotifications[0].read === false
					&& showNotificationBadge
					?
					<Row>
						<Col xs="12">
							{notifyCount > 1
								?
								<div className="col-12 mb-3 mt-4 notification-badge text-center">
									You've got {notifyCount} notifications. <a onClick={() => { setOpenNotification(true) }} className="app-link text-primary"> Click here </a> to show
								</div>
								: <>
									{notifyCount === 1 &&
										<div className="col-12 mb-3 px-3 mt-4 notification-badge ">
											<p> {allNotifications[0].title} </p>
										</div>
									}
								</>
							}
						</Col>
					</Row>
					: <React.Fragment key="techside">
						{user
							&& user.userType === "technician"
							&& user.technician
							&& user.technician.id
							&& allNotifications
							&& !initialLoad
							&& allNotifications.length > 0
							&& allNotifications[[latestJobIndex]]
							&& allNotifications[[latestJobIndex]].job
							&& allNotifications[[latestJobIndex]].job.status
							&& allNotifications[[latestJobIndex]].job.status !== "Declined"
							&& (!allNotifications[[latestJobIndex]].job.technician || allNotifications[[latestJobIndex]].type == 'assinged_by_admin')
							&& allNotifications[[latestJobIndex]].actionable
							&& allNotifications[[latestJobIndex]].job.tech_declined_ids
							&& allNotifications[[latestJobIndex]].job.tech_declined_ids.includes(user.technician.id) === false
							&& allNotifications[[latestJobIndex]].job.declinedByCustomer.includes(user.technician.id) === false
							&& showNotificationBadge
							?
							<Row>
								<Col xs="12">
									{notifyCount > 1 && allNotifications[[0]].read === false
										?
										<div className="col-12 mb-3 mt-4 notification-badge text-center">
											You've got {notifyCount} notifications. <a onClick={() => { setOpenNotification(true) }} className="app-link text-primary"> Click here </a> to show
										</div>
										: <>
											{(allNotifications[[latestJobIndex]].job.status === "Pending" || allNotifications[[latestJobIndex]].job.status === "Waiting" || allNotifications[[latestJobIndex]].job.status === "Scheduled" && allNotifications[[latestJobIndex]].job.schedule_accepted === false) &&
												<div className="col-12 mb-3 px-3 mt-4 notification-badge  jobBadge ">
													{allNotifications[[latestJobIndex]].job?.hire_expert && <p>This is a 2-tier job</p>}
													{console.log("allNotifications[[latestJobIndex]].job", allNotifications[latestJobIndex].job.post_again_reference_technician)}
													{allNotifications[latestJobIndex].job.post_again_reference_technician ? (
														<p>
															{allNotifications[latestJobIndex].job.software.name} {allNotifications[latestJobIndex].job.subOption} Direct Job Posted by: {allNotifications[latestJobIndex].job.customer.user.firstName}
															<strong style={boldTextStyle}>{businessNameBadge !== '' ? ', ' + businessNameBadge : ''}</strong>
														</p>
													) : (
														<p>
															New {allNotifications[latestJobIndex].job.software.name} {allNotifications[latestJobIndex].job.subOption} Job Posted by: {allNotifications[latestJobIndex].job.customer.user.firstName}
															<strong style={boldTextStyle}>{businessNameBadge !== '' ? ', ' + businessNameBadge : ''}</strong>
														</p>
													)}
													<p> Issue Description :{allNotifications[latestJobIndex].job.issueDescription.length > 90 ? allNotifications[latestJobIndex].job.issueDescription.substring(0, 90) + " ..." : allNotifications[latestJobIndex].job.issueDescription} </p>
													<ButtonHandler allNotifications={allNotifications} />
												</div>
											}
										</>
									}
								</Col>
							</Row>
							: <></>
						}
					</React.Fragment>
				}

				{user && user.technician && user.technician.expertise.length < 1 &&
					<Row>
						<Col xs="12">
							<div className="col-12 mb-3 mt-4 notification-badge text-center"> Your profile is incomplete.<a onClick={() => { setcurrentStep(4) }} className="app-link text-primary"> Click here </a>to complete your profile </div>
						</Col>
					</Row>
				}
				{user && !user.verified && !verificationSent &&
					<Row>
						<Col xs="12">
							<div className="col-12 notification-badge mt-4 text-center"> Please verify your account. <a onClick={sendVerificationMail} className="app-link text-primary"> Click here </a> to resend Verification Email </div>
						</Col>
					</Row>
				}
				{user && user.technician && !user.technician.accountId && currentStep !== 14 &&
					<Row>
						<Col xs="12">
							<div className="col-12 notification-badge mt-4 text-center">
								For US only please<a onClick={() => createStripeAccount(user)} className="app-link text-primary" disabled={disable} > click here </a>to setup your stripe account, Non US please email sarah@geeker.co
							</div>
						</Col>
					</Row>
				}

				{detailSubmission === false && currentStep !== 14 &&
					<Row>
						<Col xs="12">
							<div className="col-12 notification-badge mt-4 text-center"> Please Complete your stripe account profile. <a onClick={() => generateAccountLink(user)} className="app-link text-primary" disabled={disable} > Click here </a> to complete profile </div>
						</Col>
					</Row>
				}

				{verificationSent && !hideEmailmsg &&
					<Row>
						<Col xs="12">
							<button className="col-12 notification-badge mt-4 btn-success text-center"> An email is sent with the link. Please Check </button>
						</Col>
					</Row>
				}

				{user && user.userType === 'customer' && user.activeStatus == false &&
					<Row>
						<Col xs="12">
							<button className="col-12 notification-badge mt-4 text-center inactive-account">{INACTIVE_ACCOUNT_MESSAGE}</button>
						</Col>
					</Row>
				}
			</Col>
			{currentStep === 0 && <Dashboard currentStep={currentStep} hideBadge={hideBadge} fromEmail={fromEmail} setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} setOpenNotification={setOpenNotification} ShowBadge={openNotification} />}
			{currentStep === 1 && <EarningsTech setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} />}
			{currentStep === 2 && <JobReports setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} />}
			{currentStep === 3 && <BillingReportTech setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} />}
			{currentStep === 4 && <TechnicianProfile estimatedWaitTime={estimatedWaitTime} setEstimatedWaitTime={setEstimatedWaitTime} />}
			{currentStep === 5 && <CustomerProfile cardDetailActive={cardDetailActive} />}
			{currentStep === 6 && <JobDetail jobId={jobId} setCurrentStep={setcurrentStep} type={type} setActiveMenu={setActiveMenu} />}
			{currentStep === 111 && <Instructions currentStep={currentStep} />}
			{currentStep === 8 && <ReferPeople />}
			{currentStep === 9 && <Invite setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} />}
			{currentStep === 10 && <Subscription user={user} />}
			{currentStep === 11 && <ActiveTechnicianTable user={user} />}
			{currentStep === 14 && <TechnicianTransactons user={user} />}
			{currentStep === 12 && <ReferalRewardsTable user={user} />}
			{currentStep === 25 && <TechnicianRewardsTable user={user} />}
			{currentStep === 112 && <PreviousTechnicianList user={user} />}
			{currentStep === 15 && <MessageTab user={user} />}
			<TransferModal transferModal={transferModal} transferReason={transferReason} setTransferModal={setTransferModal} />
		</Row>
	);
}
const boldTextStyle = {
	fontWeight: 800,
};
export default DashboardData;