import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Modal, Spin } from 'antd';
import styled from 'styled-components';
import moment from 'moment';
import { useHistory, useParams } from 'react-router';
import { useSocket } from '../../../../context/socketContext';
import Box from '../../../../components/common/Box';
import * as CustomerApi from '../../../../api/customers.api';
import * as UserApi from '../../../../api/users.api';
import PhoneInput from 'react-phone-input-2';
import { Switch } from 'antd';
import Input from 'components/AuthLayout/Input';
import {
	isPossiblePhoneNumber,
	isValidPhoneNumber,
} from 'react-phone-number-input';
import { useJob } from '../../../../context/jobContext';
import { get_or_set_cookie, GAevent, PushUserDataToGtm } from '../../../../utils';
import { useNotifications } from '../../../../context/notificationContext';
import { openNotificationWithIcon } from '../../../../utils';
import $ from 'jquery';
import mixpanel from 'mixpanel-browser';
import Loader from '../../../../components/Loader';
import * as WebSocket from '../../../../api/webSocket.api';
import * as JobApi from '../../../../api/job.api';
import * as JobCycleApi from '../../../../api/jobCycle.api';
import { JobTags } from '../../../../constants/index.js';
import notifySound from '../../../../assets/sounds/notification.mp3'
import Badge from '@mui/material/Badge';
import ChatPanelTwilio from 'components/ChatPanelTwilio';
import * as TwilioApi from 'api/twilioChat.api';
import Rating from '@mui/material/Rating';
import BasicButton from "components/common/Button/BasicButton";

const { Text } = Typography;

const InviteTech = ({ user, job }) => {

	console.log('job>>>>>>>>>>>', job)
	const [error, setError] = useState({});
	const { fetchJob, updateJob } = useJob()
	const { jobId } = useParams();
	const { updateReadStatus } = useNotifications()
	const [method, setMethod] = useState("ComputerAudio");
	const { socket } = useSocket();
	const history = useHistory();
	const [phoneNum, setPhoneNum] = useState(0);
	const [EditPhoneNum, setEditPhone] = useState(0);
	const [showLine, setShowLine] = useState(false);
	const [showeditor, setShowEditor] = useState(false);
	const [customerId, setCustomerId] = useState();
	const pattern = new RegExp(/^\+\d[0-9\b]+$/);
	const DATE_OPTIONS = { hour: '2-digit', minute: '2-digit', timeZone: user.timezone };
	const [isLoading, setIsLoading] = useState(true);
	const [startCallDisable, setStartCallDisable] = useState(false);
	const [declineCallDisable, setDeclineCallDisable] = useState(false);
	const [techRating, setTechRating] = useState('5.00');
	const [jobMethodType, setJobMethodType] = useState('ComputerAudio')
	const [callAlreadyStarted, setCallAlreadyStarted] = useState(false)
	const [buttonKeyForChatPanel, setButtonKeyForChatPanel] = useState(false)
	const [chatPanelHasOpen, setChatPanelHasOpen] = useState(true)
	const [userIsOwner, setUserIsOwner] = useState(true)
	const [ownerHaveSubscription, setOwnerHaveSubscription] = useState(false)
	const [checkForOwner, setCheckForOwner] = useState(false)
	const [socketHits, setSocketHits] = useState(0);
	let audio = new Audio(notifySound)
	const [isBrowserTypeSafari, setIsBrowserTypeSafari] = useState(false);

	const StyledBadge = styled(Badge)(({ theme }) => ({
		'& .MuiBadge-badge': {
			right: -3,
			top: 13,
			backgroundColor: 'red',
			padding: '0 4px',
		},
	}));

	useEffect(() => {
		if (user) {
			mixpanel.track('Customer - On Start Call Page ', { 'Email': user.email });
		}
	}, [user])

	const BackToDashBoard = () => {

		Modal.confirm({
			title: 'Are you sure you want to decline this technician?',
			okText: 'Yes',
			cancelText: 'No',
			className: 'app-confirm-modal',
			onOk() {
				BackToDashBoardSubmit();
			},
		});
	}

	const handleSocketEvent = () => {
		// Increase the socket hits count
		setSocketHits((prevHits) => prevHits + 1);
		// Perform other actions
		audio.play();
	};

	/**
	 * This function takes the user to dashboard.
	 * @params = no params
	 * @response : It redirects to dashboard page.
	 * @author : Manibha
		*/
	const switchToDashBoard = (e) => {
		e.currentTarget.disabled = true;
		window.location.href = '/'
	}

	useEffect(() => {
		if (job && job.status === 'Inprogress') {
			setCallAlreadyStarted(true)
		}
	}, [job])

	useEffect(() => {
		let userAgent = navigator.userAgent;
		let browserInfo = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		let browserName = browserInfo[1];
		console.log("browserName>>>>>>>", browserName)
		if (browserName === 'Safari') {
			setIsBrowserTypeSafari(true)
		} else {
			setIsBrowserTypeSafari(false)
		}
	}, []);

	useEffect(() => {
		(async () => {
			if (user.ownerId && user.ownerId !== null) {
				setUserIsOwner(false)
				const ownerInfoObject = await UserApi.getUserById(user.ownerId)
				if (ownerInfoObject) {
					if (ownerInfoObject.customer && ownerInfoObject.customer.subscription) {
						setOwnerHaveSubscription(true)
						setCheckForOwner(true)
					} else {
						setCheckForOwner(true)
					}
				} else {
					setCheckForOwner(true)
				}
			} else {
				setCheckForOwner(true)
			}
		})()
		setMethod('ComputerAudio')
		setShowLine(false);
		setShowEditor(false);
		socket.emit("join", jobId)
	}, [])

	useEffect(() => {
		socket.on("call:started-customer", () => {
			setCallAlreadyStarted(true)
		})
		console.log('inside the use effect ::::')
		socket.on("open-chat-panel-talkjs-for-customer", (data) => {
			if (data === jobId) {
				handleSocketEvent();
			}
		})
	}, [socket])

	socket.on("phone-from-tech", () => {
		window.localStorage.setItem("callFromSystem", true)
	})

	useEffect(() => {
		let callFromSystem = localStorage.getItem('callFromSystem')
		if (callFromSystem && user.userType === "customer") {
			openNotificationWithIcon('info', 'Info', `System calling you on your phone number ${user.customer.phoneNumber}.`)
			window.localStorage.removeItem("callFromSystem")
		}
	}, [])

	const BackToDashBoardSubmit = async () => {
		setDeclineCallDisable(true)
		const res = await JobApi.retrieveJob(jobId);
		if (res.status == "Inprogress") {
			history.push("/");
		} else if (res.status == "Completed") {
			history.push("/");
		} else {
			var dec_arr = job.tech_declined_ids
			dec_arr.push(job.technician.id)
			let tempdecOb = [...job.declinedByCustomer]
			tempdecOb.push(job.technician.id)
			const updatedJobData = await JobApi.updateJob(jobId, { "status": "Waiting", "technician": "", "declinedByCustomer": tempdecOb, "post_again_reference_technician": "" })
			updateReadStatus({ "job": jobId, "user": job.technician.user.id, status: false })
			await deleteParticipant(jobId, job?.technician?.user?.id)
			try {
				const webdata = await WebSocket.create({
					user: user.id,
					job: job.id,
					socketType: 'technician-declined',
					userType: user.userType,
					hitFromCustomerSide: true,
				});

				job['web_socket_id'] = webdata['websocket_details']['id']
				await WebSocket.technicianDeclined({ jobId: jobId, tech: job.technician, job: job })
				console.log("Sending job notification to rest of the eligible technicians", updatedJobData)
				socket.emit('search-for-tech', {
					jobData: updatedJobData,
					keepSearching: true
				});
			}
			catch (err) {
				console.log('onSubmit error in InviteTech page>>>', err)
				await WebSocket.technicianDeclined({ jobId: jobId, tech: job.technician, job: job })
			}



			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Decline technician', { 'JobId': job.id });
			// mixpanel code//
			await JobCycleApi.create(JobTags.CUSTOMER_DECLINED_CALL, job.id, false);
			history.push("/")
		}

	}

	const HandleInputDisplay = () => {
		setShowEditor(true);
	};

	const handelShowChat = () => {
		setButtonKeyForChatPanel(true)
		setChatPanelHasOpen(false)
		setSocketHits(0)
	}

	// This function will remove particiapnt from twilio conversation when customer decline that participant
	const deleteParticipant = async (jobId, techId) => {
		try {
			const getTwilioResponse = await TwilioApi.getTwilioChatDetails({ chat_id: jobId });
			if (getTwilioResponse) {
				const chatId = getTwilioResponse.conversation[0]?.twilio_chat_service?.sid;
				if (chatId) {
					const findParticipants = await TwilioApi.getTwilioUnreadMessageResponse(chatId);
					const participantList = findParticipants?.data?.participants
					if (participantList && techId) {
						const filteredParticipants = participantList.filter(participant => {
							const attributes = JSON.parse(participant.attributes);
							return attributes.userId == techId;
						});
						if (filteredParticipants && filteredParticipants[0] && filteredParticipants[0]?.sid) {
							const participantID = filteredParticipants[0]?.sid
							await TwilioApi.deleteParticipantFromChat(chatId, participantID);
							return;
						}
					}

				}
			}
			return;
		} catch (error) {
			console.log("error while deleting participant from list of conversation", error);
			return;
		}
	}

	/**
		  * Handling on submit of start call button by customer
		  * @params = no params
		  * @response : it redirects the customer to meeting page according to the phone/computer audio selection.
		  * @author : Manibha
	**/
	const onSubmit = async () => {
		const res = await JobApi.retrieveJob(jobId);
		socket.emit("meeting-started-by-customer", { jobData: job })
		if (res.status == 'Inprogress' || res.status == 'long-job') {
			let lifeCycleTag = ''
			if (job.is_transferred && job.is_transferred == true) {
				lifeCycleTag = JobTags.CUSTOMER_START_CALL_AFTER_TRANSFER;
			} else {
				lifeCycleTag = JobTags.CUSTOMER_START_CALL;
			}
			await JobCycleApi.create(lifeCycleTag, job.id);
			openNotificationWithIcon('error', 'Error', 'Job is already in progress.')
			setTimeout(() => {
				window.location.href = `/dashboard`
			}, 2000);
			console.log("inprogress")
		} else if (res.status == 'Accepted') {

			if (!res.GA_start_call_event_called) {
				console.log("Hereeee")
				//GA3 tag commented by Vinit on 24/04/2023.
				GAevent('Call Started', 'customer-start-call', res.id, res?.customer?.id)
				if (process.env.REACT_APP_URL) {
					const appUrl = process.env?.REACT_APP_URL?.split("/")[2] || false;
					PushUserDataToGtm('call_started', user, appUrl);
				}
				await updateJob(res.id, { 'GA_start_call_event_called': true })
			}
			switchToMeetingPage()
		} else if (res.status == 'Completed') {
			openNotificationWithIcon('error', 'Error', 'Job is already completed.')
			setTimeout(() => {
				window.location.href = `/dashboard`
			}, 2000);
		}
	};


	/**
		  * If the job is accepted then it makes changes in database and send both C and T to meeting page on submit of start call button.
		  * @params = no params
		  * @response : It redirects the customer to meeting page.
		  * @author : Manibha
	**/
	const switchToMeetingPage = async () => {
		setStartCallDisable(true)
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Customer - Start call with technician', { 'JobId': job.id });
		// mixpanel code//
		console.log("EditPhoneNum :::::: ", EditPhoneNum)
		await updateJob(jobId, { 'callStartType': jobMethodType })
		if (jobMethodType === "Phone") {
			if (EditPhoneNum !== 0) {
				if (isPossiblePhoneNumber(EditPhoneNum) === false || isValidPhoneNumber(EditPhoneNum) === false) {
					setStartCallDisable(false)
					return (openNotificationWithIcon('error', 'Error', 'Phone Number Not Valid'))
				}

				if (!EditPhoneNum) {
					setStartCallDisable(false)
					setError({ ...error, EditPhoneNum: 'Please add your phone number.' });
					return;
				}

				if (!pattern.test(EditPhoneNum)) {
					setStartCallDisable(false)
					setError({ ...error, EditPhoneNum: 'Please provide valid phone number.' });
					return;
				}
			}

			if (!pattern.test(EditPhoneNum)) {
				setError({
					...error,
					EditPhoneNum: 'Please provide valid phone number.',
				});
				console.log("need error ", EditPhoneNum)
				setStartCallDisable(false)
				return;
			}

			await CustomerApi.updateCustomer(customerId, {
				phoneNumber: EditPhoneNum,
			}).then(() => {
				setPhoneNum(EditPhoneNum);
				fetchJob(jobId)
			})
				.catch(() => {
					console.log("Error in handle Phone save")
				})
		}

		fetchJob(jobId)

		try {
			const webdata = await WebSocket.create({
				user: user.id,
				job: job.id,
				socketType: 'accept-job',
				userType: user.userType,
				hitFromCustomerSide: true,
			});


			job['web_socket_id'] = webdata['websocket_details']['id']

			await WebSocket.customer_start_call(job)
		}
		catch (err) {
			console.log('onSubmit error in InviteTech page>>>', err)

			await WebSocket.customer_start_call(job)
		}

		get_or_set_cookie(user)
		let lifeCycleTag = ''
		if (job && job.is_transferred && job.is_transferred == true) {
			lifeCycleTag = JobTags.CUSTOMER_START_CALL_AFTER_SEARCH;
		} else {
			lifeCycleTag = JobTags.CUSTOMER_START_CALL;
		}
		await JobCycleApi.create(lifeCycleTag, jobId);
		window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${jobId}`

	}


	/**
* Starts a call on technician side
* @params =
* @response : it redirects the customer to meeting page, if meeting is already started by the customer.
* @author : Sahil
*/

	const sendCustomerToMeeting = () => {
		setStartCallDisable(true)
		get_or_set_cookie(user)
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Customer - Join Meeting', { 'JobId': job.id });
		// mixpanel code//
		window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${jobId}`
	}

	const SwitchHandler = (checked) => {
		console.log('checked>>>>>>>>>>', checked)
		if (checked) {
			setMethod("ComputerAudio")
			setShowLine(false)
			setShowEditor(false)
			$('.switchClassComp').addClass('computer')
			$('.switchClassPhone').removeClass('phone')
			setJobMethodType("ComputerAudio")
			socket.emit("set-method", { 'method': "ComputerAudio" })
			//mixpanel code //
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Choose computer audio', { 'JobId': job.id });
			//mixpanel code //
		}
		else {
			setMethod("Phone")
			setShowLine(true)
			$('.switchClassPhone').addClass('phone')
			$('.switchClassComp').removeClass('computer')
			setJobMethodType("Phone")
			socket.emit("set-method", { 'method': "Phone" })
			//mixpanel code //
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Choose choose with phone ', { 'JobId': job.id });
			//mixpanel code //
		}
	}

	useEffect(() => {
		if (job && job.id === jobId) {
			if (job.technician && job.technician.rating) {
				if (job?.technician && job?.technician?.rating !== undefined) {
					setTechRating(parseFloat(job?.technician?.rating).toFixed(2))
				}
			} else {
				setTechRating(parseFloat(5.0).toFixed(1))
			}

			setCustomerId(job.customer.id);
			setEditPhone(job.customer.phoneNumber)
			setPhoneNum(job.customer.phoneNumber); // "Some User token"
			console.log("customer extension ", job.customer.extension)
			setIsLoading(false)

		}

		if (job.status === 'Completed') {
			openNotificationWithIcon('info', 'Info', 'This job has already been completed. Please go to dashboard.')
		}
	}, [job])


	if (isLoading) return <Col md="12" className="px-4 py-5">
		<Row>
			<Loader height="100%" className={"mt-5 " + (isLoading ? "loader-outer" : "d-none")} />
		</Row>

	</Col>
		;
	// updateCustomer
	return (
		<Container span={15}>
			<StepContainer>
				<NewJobContainer>
					<Box width="100%">
						<Box
							display="flex"
							direction="column"
							alignItems="center"
							marginVertical={40}
						>
							<SubTitle>{job && job.status !== "Completed"
								? `Great news! ${job.technician?.user.firstName} is ready to help.`
								: `Looking like meeting is over. Please click on Back to dashboard button to view your jobs`}
							</SubTitle>
							<SubTitle>
								{job && job.status !== "Completed" && `Press the ${callAlreadyStarted && job.status !== "Completed" ? "Join" : "Start Call"} button down below to join your technician now.`}
							</SubTitle>

						</Box>
						<hr />
						<Box marginVertical={20}>
							<Row>
								<Col xs={24} className="table-responsive">
									<table className="table job-info-table">
										<thead>
											<tr>
												<th><TextHeader className="label-name" >Tech</TextHeader></th>
												<th><TextHeader className="label-name" >Tech Rating</TextHeader></th>
												<th><TextHeader className="label-name" >Rate per 6 min</TextHeader></th>
												<th><TextHeader className="label-name" >ISSUE</TextHeader></th>
												<th><TextHeader className="label-name" >DATE</TextHeader></th>
												<th><TextHeader className="label-name " >Time</TextHeader></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td><Title className="label-value small-title">{job.technician?.user.firstName} {job.technician?.user.lastName}</Title></td>
												<td><Title className="label-value small-title">
													<div className='d-flex align-items-center'>
														<Rating
															name="simple-controlled"
															value={techRating}
															precision={0.5}
														/>
														<span className="small-title-rating">{techRating}</span>
													</div>
												</Title>
												</td>
												<td>
													<Title className="label-value small-title">
														{checkForOwner ?
															userIsOwner || !ownerHaveSubscription ?
																"$" + job.software?.rate || ''
																:
																"NA"
															:
															"NA"
														}
													</Title></td>
												<td><Title md={3} className="halftext label-value small-title overflow-text-correction-style" title={job && job.issueDescription}>{job && job.issueDescription && job.issueDescription.length > 120 ? job.issueDescription.substring(0, 120) + "..."
													: job.issueDescription}</Title></td>
												<td><Title className="label-value small-title">{moment().format('MM/DD/YYYY')}</Title></td>
												<td><Title className="label-value small-title">{new Date().toLocaleTimeString('en-US', DATE_OPTIONS)}</Title></td>
											</tr>
										</tbody>
									</table>
								</Col>
							</Row>
						</Box>
						<hr />
						<ItemDescription>
							<span className={`switchClassPhone ${method === "Phone" ? "phone" : ""}`}>Phone</span>
							<Switch
								id="computer-audio-toggle"
								className="PhoneSwitch"
								style={{ marginLeft: "10px", marginRight: "10px" }}
								onChange={SwitchHandler}
								checked={method !== "Phone"} // Set the default option to "Computer Audio"
							/>
							<span className={`switchClassComp ${method === "Phone" ? "" : "computer"}`}>Computer Audio</span>
						</ItemDescription>
						{showLine ? <div><ItemDescription>
							You will receive a call on number {phoneNum}.{' '}
						</ItemDescription>{' '}
							<SmallButton onClick={HandleInputDisplay}>
								Edit Number
							</SmallButton></div> : <div></div>
						}
						{showeditor ? <EditDiv className="acceptJobTelInput">
							<div className="d-flex flex-column">
								<div className="d-flex">
									<span>
										<PhoneInput
											country="us"
											countryCodeEditable={false}
											onlyCountries={['gr', 'fr', 'us', 'in', 'ca', 'gb']}
											value={phoneNum}
											onChange={(e) => {
												setEditPhone('+' + e);
											}}
										/>
									</span>
								</div>

							</div>
						</EditDiv> : <div></div>}
						<Box display="flex" justifyContent="right" marginTop={30} className=" invite-tech-btn">

							{!callAlreadyStarted && job.status !== "Completed" &&
								<React.Fragment key="backtodashboard">
									<button className="app-btn app-btn-light-blue mr-md-3" onClick={BackToDashBoard} disabled={isLoading || startCallDisable || declineCallDisable}><span></span> {declineCallDisable ? <Spin className="spinner" /> : "Decline Call"}
									</button>
									<button className="app-btn job-accept-btn" onClick={onSubmit} disabled={startCallDisable || declineCallDisable} id="start-call-job-btn">
										<span></span> {startCallDisable ? <Spin className="spinner" /> : "Start Call"}
									</button>
								</React.Fragment>
							}

							{callAlreadyStarted && job.status !== "Completed" &&
								<button className="app-btn" onClick={sendCustomerToMeeting} disabled={startCallDisable}>
									<span></span> {startCallDisable ? <Spin /> : "Join"}
								</button>
							}

							{job.status === "Completed" &&
								<button className="app-btn" onClick={switchToDashBoard}>
									<span></span> Back to Dashboard
								</button>
							}

						</Box>

						<Box display="flex" style={{ marginRight: '-11px' }} justifyContent="right" marginTop={20} marginLeft={10} className="float-right invite-tech-btn">
							{chatPanelHasOpen ? (
								<StyledBadge badgeContent={socketHits} color="secondary">
									<span style={{ display: "flex", justifyContent: "center", fontWeight: "bold", color: "#97abb6", cursor: "pointer", pointerEvents: chatPanelHasOpen ? " " : "none", border: 'none', textDecoration: 'underline' }} className='bell-icon-class' onClick={handelShowChat}>Having trouble to start call?</span>
								</StyledBadge>
							) : (
								<span></span>
							)}

						</Box>

						<Modal
							footer={null}
							closable={false}
							visible={isBrowserTypeSafari}
							maskStyle={{ backgroundColor: "#DCE6EDCF" }}
							maskClosable={false}
							width={616}
						>
							<div className="">
								<span style={{ fontSize: '18px' }}>To fully experience our share screen and remote access features, Geeker recommends switching to <span style={{ fontWeight: "bold" }}>Google Chrome</span> browser.</span>
							</div>

							<div className="d-flex justify-content-end">
								<BasicButton onClick={() => setIsBrowserTypeSafari(false)} btnTitle={"Close"} height={"40px"} width={"100px"} background={"#1bd4d5"} color={"#fff"} />
							</div>
						</Modal>

						<Container>
						</Container>
					</Box>
				</NewJobContainer>
			</StepContainer>
			{buttonKeyForChatPanel &&
				<div className='d-flex justify-content-center new-mb-chat'>
					<ChatPanelTwilio job={job} width={'700px'} height={'500px'} />
				</div>
			}
		</Container>
	);
};

const EditDiv = styled.div`
	display: flex;
	flex-direction: row;
	& .react-tel-input {
		margin-top: 5px;
	}
	& .react-tel-input .form-control {
		height: 50px;
		border-radius: 5px;
		border: 1px solid #cacaca !important;
		margin-left: 10px;
	}
	& .react-tel-input .flag-dropdown {
	    position: absolute;
	    top: 0;
	    bottom: 0;
	    padding: 0;
	    background-color: #f5f5f5;
	    border: 1px solid #cacaca;
	    border-radius: 3px 0 0 3px;
	    left: 11px;
	}

`;
const SmallButton = styled(Text)`
	text-decoration: underline;
	color: rgb(18, 67, 215) !important;
	font-weight: bold;
	cursor: pointer;
`;
const ItemDescription = styled(Text)`
	opacity: 0.8;
	font-weight: 700;
	font-style: italic;


	& .phone{
		font-size: 19px;
	font-family: ui-rounded;
	color: #2e5aa9;
	}
	& .successText{
		color:green !important;
	}
	& .computer{
		font-size: 19px;
	font-family: ui-rounded;
	color: #2e5aa9;
	}
	& .PhoneSwitch{
		background-color:#577AC2;
	}
`;

const RegInput = styled(Input)`
	border-radius: 10px;
	padding: 15px 20px;
	font-family: 'Open-Sans', sans-serif;
	& input {
		width:100px !important;
	}
`;

const Title = styled.h1`
	margin-bottom: 0.5em;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 600;
	font-size: 20px;
	line-height: 1.4;
	padding: 0 10px;
`;
const SubTitle = styled.span`
	margin-bottom: 0.5em;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 600;
	font-size: 20px;
	line-height: 1.4;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

const NewJobContainer = styled.div`
	background: #fff;
	margin-bottom: 50px;
	border-radius: 5px;
	display: flex;
	flex-direction: column;
	margin-top: 20px;
	align-items: flex-start;
	padding: 60px;
	box-shadow: 0px 15px 50px 0px #d5d5d566;
	flex: 1;
	@media screen and (max-width: 763px) {
		padding: 40px 20px;
	}
`;

const TextHeader = styled(Text)`
	font-size: 20px;
	font-weight: 600;
	color: #c9c9c9;
	display:inline-block;
    white-space: break-spaces !important;
	min-height:50px;
	padding: 0 10px;
	text-transform: uppercase;
`;

const StepContainer = styled.div`
	width: 80%;
	height: 100%;
	margin: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	@media screen and (max-width: 991px) {
		width: 100%;
	}
`;

export default InviteTech;
