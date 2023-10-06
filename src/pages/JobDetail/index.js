import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, Rate, Collapse, Checkbox, Spin } from 'antd';
import { Button, Row, Col, Table, Alert, Dropdown } from 'react-bootstrap';
import * as DOM from 'react-router-dom';
import style from 'styled-components';
import { useHistory, useLocation } from 'react-router';
import mixpanel from 'mixpanel-browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import queryString from 'query-string';
import { useUser } from '../../context/useContext';
import { useJob } from '../../context/jobContext';
import { useFeedback } from '../../context/feedbackContext';
import { useSocket } from '../../context/socketContext';
import { useNotifications } from '../../context/notificationContext';
import Loader from '../../components/Loader';
import './jobdetail.css';
import * as EarningDetailsApi from '../../api/earningDetails.api'
import { openNotificationWithIcon, handleStartCall, get_or_set_cookie, checkJobValidations, isLiveUser, haveUnreadMessagesForPendingJob } from '../../utils';
import * as JobApi from '../../api/job.api';
import * as WebSocket from '../../api/webSocket.api';
import { send_email_to_customer } from '../../api/serviceProvider.api';
import { updateReferalDiscount } from '../../api/referalDiscount.api'
import { retrieveTechnician } from '../../api/technician.api';
import * as JobService from "../../api/job.api";
import FeedbackCompulsionModal from '../Technician/feedbackCompulsion';
import { useServices } from '../../context/ServiceContext';
import { klaviyoTrack } from '../../api/typeService.api';
import { useChatEngineTools } from '../../context/chatContext';
import { APP_URL, JOB_STATUS } from '../../constants';
import LongJobSubmission from './longJobSubmission';
import * as CustomerApi from '../../api/customers.api';
import getTotalJobTime from '../../components/common/TotalTimeFunction'
import * as PromoApi from '../../api/promo.api';
import * as JobCycleApi from '../../api/jobCycle.api';
import { JobTags } from '../../constants/index.js';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import AddToCalendarHOC, { SHARE_SITES } from 'react-add-to-calendar-hoc';
import moment from 'moment';
import ApplyScheduleJobFrom from './applySchduleJobForm';
import JobCancelFrom from '../Dashboard/components/jobCancelFrom';
import { useTools } from '../../context/toolContext';
import ScheduleForLater from './Components/EditScheduleForLater';
import ChatPanel from './ChatPanel';
import { addTime } from '../../constants/index';
import { checkPendingStatus } from '../../utils';
import * as UserApi from "../../api/users.api";
import notifySound from '../../assets/sounds/notification.mp3'
import * as TwilioApi from '../../api/twilioChat.api';
import BasicButton from "../../components/common/Button/BasicButton";
let timeInt = false
const { Panel } = Collapse;
let liveUser = true;

/**
 * A custom component which renders total spent money of customer
 * @params = job (Type:Object)
 * @response : it returns the total amount customer spent on the job.
 * @author : Sahil
*/
const JobBilling = ({ job }) => {
	if (job && job.total_discounted_cost && job.total_discounted_cost != 0) {
		return <>${job.total_discounted_cost}</>
	}
	else if (job && job.total_subscription_seconds !== 0 && job.total_subscription_seconds === job.total_seconds) {
		return <>${0.00}</>
	}
	else if (job && job.total_subscription_seconds !== 0 && job.total_subscription_seconds < job.total_seconds && job.discounted_cost > 0) {
		return <>${job.discounted_cost}</>
	} else if (job && job?.is_free_job && job?.free_session_total) {
		return <>${job.free_session_total}</>
	}
	else if (job && job?.total_cost && !job?.is_free_job) {
		return <>${job.total_cost}</>
	}
	else if (job && job?.long_job_cost) {
		return <>${job.long_job_cost}</>
	}
	else if (job && job.long_job_cost == undefined && job.status == 'long-job') {
		return <>${0.00}</>
	}
	return <>${0.00}</>
}

/**
 * A custom component which renders total earned  money of technician
 * @params = job (Type:Object)
 * @response : it returns the total amount technician earned in job sessions
 * @author : Manibha, Vinit
*/
const TechEarning = ({ job }) => {
	const [technicianEarnedMoney, setTechnicianEarnedMoney] = useState(0.00);
	useEffect(() => {
		async function getData() {
			let earnedMoney = 0.00
			if (job && job.total_cost) {
				let getBillingDetail = await EarningDetailsApi.getEarningDetailsByJob(job.id)
				if (Object.keys(getBillingDetail).length > 0) {
					earnedMoney = getBillingDetail.amount_earned
					setTechnicianEarnedMoney(earnedMoney)
				}
				else {
					setTechnicianEarnedMoney(job.total_cost)
				}
			} else {
				setTechnicianEarnedMoney(earnedMoney)
			}
		}
		getData();
	}, [job])
	return <>${technicianEarnedMoney.toFixed(2)}</>;
};


const JobDetail = ({ jobId, type, setCurrentStep = null, setActiveMenu }) => {
	console.log("  type :::::::::; ", type)
	const { socket } = useSocket();
	const { user } = useUser();
	const { job, fetchJob } = useJob();
	const [techType, setTechtype] = useState(type);
	const [scheduleAccptOn, setscheduleAccptOn] = useState('primary');
	const history = useHistory();
	const location = useLocation();
	const [tempJobId, setTempJobId] = useState(jobId);
	const [isLoading, setIsLoading] = useState(true);
	const { getFeedback, createFeedback, updateFeedback } = useFeedback();
	const [customerFeedback, setCustomerFeedback] = useState(false);
	const [technicianFeedback, setTechnicianFeedback] = useState(false);
	const [rejectedCalls, setRejectedCalls] = useState([]);
	const [techCancellation, setTechCancellation] = useState([]);
	const [fromEmail, setFromEmail] = useState(false);
	const [showTimer, setShowTimer] = useState(false);
	const [fromVar, setFromVar] = useState('');
	const [showChangeFeedbackModal, setShowChangeFeedbackModal] = useState(false);
	const showChangeFeedbackLoader = false;
	const [checkboxIssues, setCheckboxIssues] = useState([]);
	const [showYesBlock, setshowYesBlock] = useState(false);
	const [showNoBlock, setshowNoBlock] = useState(false);
	const [rating, setRating] = useState();
	const [summary, setSummary] = useState('');
	const [problemSolved, setProblemSolved] = useState('');
	const [myFeedbackData, setMyFeedbackData] = useState({});
	const [submitFeedbackCalled, setSubmitFeedbackCalled] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [FeedbackJobId, setFeedbackJobId] = useState('');
	const [match, setMatch] = useState('');
	const { checkIfTwoTierJobAndExpertTech, CreateEarningReport, CreateBillingReport } = useServices();
	const [disableSubmitbutton, setDisableSubmitbutton] = useState(false);
	const [disableapprovalbtn, setDisableapprovalbtn] = useState(false);
	const [showSubmisssionModal, setShowSubmisssionModal] = useState(false);
	const [showApproveButtons, setShowApproveButtons] = useState(false);
	const [showAdditionalHoursApproveButtons, setshowAdditionalHoursApproveButtons] = useState(false);
	const { createNotification } = useNotifications();
	const [showSubmitLongJobButtonTech, setShowSubmitLongJobButtonTech] = useState(true);
	const [showJoinBtn, setShowJoinBtn] = useState(true);
	const [totalSecondsToPass, setTotalSecondsToPass] = useState(0)
	const [totalJobTimeToPass, setTotalJobTimeToPass] = useState('00:00:00')
	const AddToCalendarDropdown = AddToCalendarHOC(Button, Dropdown);
	const now_time = moment();
	const [duration, setDuration] = useState('')
	const [disableApplyForJobButton, setDisableApplyForJobButton] = useState(false);
	const [disableEditForJobButton, setDisableEditForJobButton] = useState(false);
	const [disableDeclineJobButton, setDisableDeclineJobButton] = useState(false);
	const [disableDeclineBtn, setDisableDeclineBtn] = useState(false);
	const [disableAcceptBtn, setDisableAcceptBtn] = useState(false);
	const [isApplyScheduleJob, setIsApplyScheduleJob] = useState(false);
	const [isEditScheduleJob, setIsEditScheduleJob] = useState(false);
	const [isCancelModal, setIsCancelModal] = useState(false);
	const [cancelJobId, setCancelJobId] = useState(false);
	const [userType, setUserType] = useState(false)
	const [showChat, setShowChat] = useState(false)
	const [autoApproveJob, setAutoApproveJob] = useState(new Date())
	const [hoursWillNotAdd, setHoursWillNotAdd] = useState(false)
	const [submitButton, setSubmitButton] = useState(false)
	const [disAcceptBtn, setDisAcceptBtn] = useState(false)
	const [scheduleMsg, setScheduleMsg] = useState(false);
	const [lastPendingSoftware, setLastPendingSoftware] = useState('');
	const [customerConfirmDraftJob, setCustomerConfirmDraftJob] = useState(false);
	const [customerConfirm, setCustomerConfirm] = useState(false);
	const [userIsOwner, setUserIsOwner] = useState(true)
	const [ownerHaveSubscription, setOwnerHaveSubscription] = useState(false)
	const { setJobFlowStep, jobFlowsDescriptions, showChatButton, setShowChatButton } = useTools()
	const queryParams = new URLSearchParams(location.search);
	const fromCustomerHistory = queryParams.get("from") === "customerhistory" ? true : false
	const intervalRef = useRef(null); // Ref to store the interval ID
	let audio = new Audio(notifySound)
	const [techShowBusinessName, setTechShowBusinessName] = useState('')
	const [isBrowserTypeSafari, setIsBrowserTypeSafari] = useState(false);
	const [showBrowserTypeMessageModal, setShowBrowserTypeMessageModal] = useState(false);
	const message = scheduleMsg ? (
		<span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
			One of your previous jobs of <b style={{ fontWeight: 'bold' }}>{lastPendingSoftware}</b> is already scheduled with a technician. Are you sure you want to create a new job post? If yes, then your previous job will be <b style={{ fontWeight: 'bold' }}>Cancelled</b>
		</span>
	) : (
		<span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
			We are still looking for a technician for your existing job of <b style={{ fontWeight: 'bold' }}>{lastPendingSoftware}</b>. Are you sure you want to create a new job post? If yes, then your previous job will be <b style={{ fontWeight: 'bold' }}>Cancelled</b>
		</span>
	);

	useEffect(() => {
		(async () => {
			if (user) {
				liveUser = await isLiveUser(user)
				if (user.ownerId && user.ownerId !== null) {
					setUserIsOwner(false)
					const ownerInfoObject = await UserApi.getUserById(user.ownerId)
					if (ownerInfoObject && ownerInfoObject.customer && ownerInfoObject.customer.subscription) {
						setOwnerHaveSubscription(true)
					}
				}
			}
		})()
	}, [user])

	useEffect(() => {
		const observeElement = document.getElementById('my-div');
		if (showChatButton) {
			if (observeElement) {
				observeElement.scrollIntoView({ behavior: 'auto' });
				setShowChatButton(false);
			} else {
				const observer = new MutationObserver((mutationsList) => {
					for (const mutation of mutationsList) {
						if (mutation.type === 'childList') {
							const targetElement = document.getElementById('my-div');
							if (targetElement) {
								observer.disconnect();
								targetElement.scrollIntoView({ behavior: 'auto' });
								setShowChatButton(false);
								console.log('targetElement :::: 2', targetElement)
								break;
							}
						}
					}
				});
				observer.observe(document, { childList: true, subtree: true });
			}
		}
	}, [showChatButton]);

	useEffect(() => {
		let jobScheduledTime = new Date(job?.primarySchedule).toLocaleTimeString('en-US', DATE_OPTIONS);

		const updateButtonStatus = () => {
			const currentTime = new Date(); // Get the updated current time
			const timeDiff = new Date(jobScheduledTime).getTime() - currentTime.getTime();
			const timeDiffHours = timeDiff / (1000 * 60 * 60);
			if (timeDiffHours <= 1) {
				setDisableEditForJobButton(true);
				setIsEditScheduleJob(false); // Close the modal
				clearInterval(intervalRef.current);  // Clear the interval
			} else {
				setDisableEditForJobButton(false);
			}
		};

		intervalRef.current = setInterval(updateButtonStatus, 10000);
		updateButtonStatus(); // Call the function immediately to handle the initial state
		return () => clearInterval(intervalRef.current); // Clear the interval in the cleanup function
	}, [job]);

	useEffect(() => {
		let userAgent = navigator.userAgent;
		let browserInfo = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		let browserName = browserInfo[1];
		console.log("browser at JobdetailsPage>>>>>>> ", browserName)
		if (browserName === 'Safari') {
			setIsBrowserTypeSafari(true)
		} else {
			setIsBrowserTypeSafari(false)
		}
	}, []);
	
	const handleOpenModal = () => {
		let userAgent = navigator.userAgent;
		let browserInfo = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		let browserName = browserInfo[1];
		console.log("browser at JobdetailsPage>>>>>>> ", browserName)
		if (browserName === 'Safari') {
			setShowBrowserTypeMessageModal(true);
		} else {
			setShowBrowserTypeMessageModal(false);
		}
	  };
	  const handleCloseModal = () => {
		setShowBrowserTypeMessageModal(false);
	  };
	const handleStartCallWithModal = async (e, jobId, socket) => {
		handleOpenModal();
		try {
		  setTimeout(() => {
			handleStartCall(e, jobId, socket);
		  }, 4000); 
		} catch (err) {
		  console.log("error in handleStartCall >>>", err);
		}
	  };

	const scheduledCancelByCustomer = (e) => {
		const job = e.currentTarget.name;
		setUserType("Customer")
		setCancelJobId(job)
		setIsCancelModal(true)
	}

	const scheduledCancelByTech = (e) => {
		const job = e.currentTarget.name;
		setUserType("Technician")
		setCancelJobId(job)
		setIsCancelModal(true)
	}

	const scheduledDeclineByTech = async (e) => {
		const jobid = e.currentTarget.name;
		let msg = "Are you sure you want to decline this job?";
		Modal.confirm({
			title: msg,
			okText: "Yes",
			cancelText: "No",
			className: 'app-confirm-modal',
			onOk() {
				setDisableAcceptBtn(true)
				setDisableDeclineJobButton(true)
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Job declined from dashboard', { 'JobId': jobid });
				postAgainJobDeclineByTech(jobid)
				decline_job_by_technician(jobid, false)
			},
		})
	}

	/**
	* This function will is common function for decline the job by tech
	* @response : jobid(Type: String): Job id which is declined by tech
	*		techAlert(Type:Boolean): True for other case and in schedule job decline it will only decline the without notification
	* @author : unknown
	* @note: this function updated by Ridhima Dhir by adding techAlert flag
	*/

	const decline_job_by_technician = async (jobid, alert = true, reason = null) => {
		try {
			// find job details 
			let selectedJob = await JobApi.retrieveJob(jobid)
			let tech_id = user.technician.id
			let notifiedTechs = selectedJob.notifiedTechs;
			console.log("notifiedTechs ::: before", notifiedTechs)
			await TwilioApi.updateTwilioConversation(selectedJob?.twilio_chat_service?.sid)
			socket.emit("refresh-job-after-decline-by-user", jobid)
			// get notifiedTech object and reverse the object bcz notifiedTech have multiple same value 
			// bcz after decline find tech function will work and push tech values agagin.
			// in secondryTime true: notification again goes to all tech but exclude declined techs.
			notifiedTechs.reverse().forEach(function (techs, index) {
				if (techs['techId'] == tech_id) {
					notifiedTechs[index]['jobStatus'] = "tech-decline"
					notifiedTechs[index]['notifyEndAt'] = new Date();
				}
				tech_id = false;
			});
			console.log("notifiedTechs ::: after", notifiedTechs)

			let dataToUpdate = {
				$unset: { schedule_accepted_by_technician: 1, technician: 1, schedule_accepted_on: 1 },
				schedule_accepted: false,
				notifiedTechs: notifiedTechs.reverse(),
				$push: { tech_declined_ids: user.technician.id }
			}
			await JobApi.updateJob(jobid, dataToUpdate)
			if (alert) {
				let checkScheduleJobStatus = await JobApi.checkScheduleJobAvailability(jobid)
				if (!checkScheduleJobStatus['scheduleDetails']['scheduleExpired']) {
					socket.emit("technician:schedule-job-declined", {
						"jobId": selectedJob.id,
						"technician_user": user,
						"reason": reason
					})
					console.log(">>>>>>>>>>>>>>>>>>>>>>sending schedule job >>>>>>>>>>>>>>>>", selectedJob)
					await socket.emit("search-for-tech", {
						jobId: jobid,
						accepted: false,
						customerTimezone: selectedJob.customer.user.timezone,
						jobObj: selectedJob,
						primaryTime: selectedJob.primarySchedule,
						secondryTime: selectedJob.secondrySchedule,
						phoneNumber: selectedJob.customer.user.phoneNumber,
						customerEmail: selectedJob.customer.user.email,
						customerName: selectedJob.customer.user.firstName,
						technicianId: false,
						decliedTechnician: user.id
					})
					JobApi.sendSmsForScheduledDeclinedJob({ 'jobId': jobid, 'technicianName': user.firstName })
				}
			} else {
				console.log("not alert schedule job not found");
				await socket.emit("technician:schedule-job-declined-without-accepted", {
					"jobId": selectedJob.id,
					"technician_user": user,
					"reason": reason
				})
			}
			setTimeout(() => {
				window.location.reload()
			}, 3000)
		}
		catch (err) {
			openNotificationWithIcon('error', 'Error', err.message);
			setDisableDeclineJobButton(false)
		}
	}

	const postAgainJobDeclineByTech = async (jobid) => {
		try {
			// find job details 
			let selectedJob = await JobApi.retrieveJob(jobid)
			let tech_id = user.technician.id;
			let post_again_reference_technician = selectedJob.post_again_reference_technician;
			console.log('outside the job decline by tech ', post_again_reference_technician)
			if (post_again_reference_technician && post_again_reference_technician.length > 0) {

				let dataToUpdate = {
					status: 'Declined',
				}
				await JobApi.updateJob(jobid, dataToUpdate)
				const notificationData = {
					user: job.customer.user.id,
					job: job.id,
					read: false,
					actionable: true,
					shownInBrowser: true,
					title: 'Previous geek you are trying to reach declined your Schedule job.',
					type: 'Post_Again_Schedule_Job_Decline',
				};
				createNotification(notificationData);
				socket.emit("post-again-schedule-job-cancel", jobid)
			}
		}
		catch (err) {
			openNotificationWithIcon('error', 'Error', err.message);
			setDisableDeclineJobButton(false)
		}
	}

	if (timeInt) {
		clearInterval(timeInt);
	}

	const checkFeedback = async () => {
		const findJob = await JobService.findJobByParams({ 'technician': user.technician.id }, { page: 1, pageSize: 1 });
		if (findJob != undefined) {
			if (findJob.jobs != undefined && findJob.jobs.data != undefined && findJob.jobs.data.length > 0) {
				if (findJob.jobs.data[0].status === 'Completed') {
					const feedbackDataRes = await getFeedback(findJob.jobs.data[0].id);
					setFeedbackJobId(findJob.jobs.data[0].id);
					if (feedbackDataRes.length == 0) {
						setShowFeedbackModal(true);
						return false;
					} else {
						return true;
					}
				} else {
					return true;
				}
			} else {
				return true
			}
		} else {
			return true;
		}

	};

	const handleCustomerJoin = (e, job) => {
		e.currentTarget.disabled = true;
		get_or_set_cookie(user)
		window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${job.id}`
	}

	const distanceCalc = (job, DATE_OPTIONS) => {
		let selectedTime = '';
		if (job.schedule_accepted_on === 'primary') {
			selectedTime = new Date(job.primarySchedule).toLocaleTimeString('en-US', DATE_OPTIONS);
		} else {
			selectedTime = new Date(job.secondrySchedule).toLocaleTimeString('en-US', DATE_OPTIONS);
		}
		const countDownDate = new Date(selectedTime).getTime();
		const DATE_OPTIONS_FOR_TIMER = {
			weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: user.timezone,
		};
		const timeNow = new Date(new Date().toLocaleTimeString('en-US', DATE_OPTIONS_FOR_TIMER)).getTime();
		const distance = countDownDate - timeNow;
		return distance;
	};

	useEffect(() => {
		console.log("setShowChat::::", showChat)
		console.log("changed")
		console.log("jobId >>>>>>", jobId)
		if (showChat) {
			socket.emit("toStartChat-WithCustomer", { "jobId": jobId })
		}
	}, [showChat])

	useEffect(() => {
		(async () => {
			const emailJob = queryString.parse(location.search);
			if (emailJob) {
				const jobid = emailJob.jobID;
				const { type } = emailJob;
				const { from } = emailJob;
				if (jobid) {
					setFromVar(from);
					setTempJobId(tempJobId);
					fetchJob(jobid);
					const feedbackDataRes = await getFeedback(jobid);
					setDataForFeedback(feedbackDataRes);
					setTimeout(() => {
						setIsLoading(false);
					}, 800);
					setTechtype(type);
				} else {
					setFromEmail(false);
					call_fetch_job();
				}
			}
		})();
	}, [tempJobId]);
	useEffect(() => {
		if (jobId) {
			socket.emit("join", jobId)
		}

		socket.on("refresh-customer", async () => {
			fetchJob(jobId)
		})

		socket.on("refresh-tech", async () => {
			fetchJob(jobId)
		})

		socket.on('set-join-on-dashboard', (data) => {
			if (data.jobId === jobId) {
				fetchJob(data.jobId);
			}
		});

		socket.on("call:started-customer", () => {
			fetchJob(jobId)
		})

		socket.on("refreshScheduleTime", (data) => {
			if (data.id === jobId) {
				setTechtype("apply")
				setDisableApplyForJobButton(false)
				fetchJob(data.id);
			}
		})

		socket.on("long-job-submission-to-cust", (data) => {
			if (user.userType === 'customer') {
				console.log('long-job-submission-to-cust>>>>>>>>>>>>>>>>>')
				fetchJob(data.jobId)
				setShowApproveButtons(true)
				setDisableapprovalbtn(false)
			}
		})

		socket.on("re-submit-job-to-tech", (data) => {
			fetchJob(data.jobId)
			if (user.userType === 'technician') {
				setShowSubmitLongJobButtonTech(true)
				setDisableSubmitbutton(false)
			}
			if (user.userType === 'customer') {
				setDisableapprovalbtn(false)
				setshowAdditionalHoursApproveButtons(true);
			}
		})

		socket.on("long-job-approved-to-tech", (data) => {
			openNotificationWithIcon('success', 'Success', 'Please provide feedback by clicking on give feedback button.');
			setShowJoinBtn(false)
			setDisableSubmitbutton(false)
			fetchJob(data.jobId)
		})

		socket.on("update-additional-hours", async (data) => {
			fetchJob(jobId)
			console.log('update-additional-hours', data);
			setshowAdditionalHoursApproveButtons(true);
			console.log("additional hours", showAdditionalHoursApproveButtons);
		})

		socket.on("job-updated", async () => {
			fetchJob(jobId)
			console.log('job-updated :::', jobId);
		})

		socket.on("additional-hours-approved", async (data) => {
			fetchJob(data.id)
			setHoursWillNotAdd(false)
		})

		socket.on("refresh-customer", (data) => {
			fetchJob(jobId)
		})

		socket.on("refresh-chat", (data) => {
			if (user.userType === 'customer') {
				console.log("refresh-chat")
			}
		})

		socket.on("additional-hours-rejected", (data) => {
			if (user.userType === 'technician') {
				fetchJob(data.id)
				setHoursWillNotAdd(false)
				openNotificationWithIcon('info', 'Info', 'Extra additional hours request rejected by customer');
			}
		})

		socket.on("additional-hours-rejected", (data) => {
			if (user.userType === 'technician') {
				fetchJob(data.id)
				setHoursWillNotAdd(false)
				openNotificationWithIcon('info', 'Info', 'Extra additional hours request rejected by customer');
			}
		})

		socket.on('decline-post-again-schedule', async (jobId) => {
			if (user?.userType === 'customer') {
				fetchJob(jobId)
			}
		});

		socket.on("open-chat-panel-talkjs", async (data) => {
			if (data === jobId) {
				if (user?.userType === 'technician') {
					audio.play();
				}
			}
		})

		socket.on("open-chat-panel-talkjs-for-customer", async (data) => {
			if (data === jobId) {
				if (user?.userType === 'customer') {
					audio.play();
				}
			}
		})

		socket.on("refresh-job-after-decline", async (data) => {
			if (data === jobId) {
				fetchJob(jobId)
			}
		})

	}, [jobId, socket]);




	//Utkarsh Dixit
	//purpose : approve button will be visible even after reload

	useEffect(() => {
		(async () => {
			console.log("This is to check if job is updated", job);
			console.log('checkScheduleJobStatus::: ', jobId);
			let checkScheduleJobStatus = await JobApi.checkScheduleJobAvailability(jobId)
			console.log('checkScheduleJobStatus::: ', checkScheduleJobStatus);
			if (job != undefined && job.additional_hours_submission != undefined && job.additional_hours_submission == "yes") {
				setshowAdditionalHoursApproveButtons(true);
				console.log("additional hours", showAdditionalHoursApproveButtons);
			}
		})();
	}, []);

	const DATE_OPTIONS = {
		weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: user.timezone,
	};
	const JoinJob = (e) => {
		e.currentTarget.disabled = true;

		if (user && job) {
			mixpanel.identify(user.email);
			mixpanel.track(user.userType + ' - Click on join button from job details page', { 'JobId': job.id });
		}

		if (user.userType === 'customer' && job.status == 'long-job') {
			window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${job.id}`
		}
		if (user.userType === 'technician' && job.status == 'long-job') {
			window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/technician/${job.id}`
		}

		if (user.userType === 'customer' && job.status == 'Inprogress') {
			let filter_dict = { 'status': 'Inprogress', 'customer': user.customer.id }
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result) => {
				console.log('result.data>>>>>>>>>>>>', result)
				if (job.id == result.jobs.data[0].id) {
					window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${job.id}`
				}
				else {
					openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
				}
			});
		}

		if (user.userType === 'technician' && job.status == 'Inprogress') {
			let filter_dict = { 'status': 'Inprogress', 'technician': user.technician.id }
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result) => {
				if (result &&
					result.jobs &&
					result.jobs.data &&
					result.jobs.data.length > 0 &&
					job.id == result.jobs.data[0].id) {
					window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/technician/${job.id}`
				}
				else {
					openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
				}
			})
		}
	};

	const AcceptJob = async (job) => {
		const retrieveUpdatedJob = await JobApi.retrieveJob(jobId);
		if (retrieveUpdatedJob.status === JOB_STATUS.SCHEDULED) {
			fetchJob(retrieveUpdatedJob.id)
			setIsApplyScheduleJob(true)
		} else {
			let feedb = await checkFeedback();
			if (feedb) {
				const jobId = job.id;
				const res = await JobApi.retrieveJob(jobId);
				let resultVal = await checkIfTwoTierJobAndExpertTech(user?.technician, job);

				if (resultVal === false) {
					setDisAcceptBtn(true)
					return openNotificationWithIcon('error', 'Error', 'This job is only for experts.Please contact admin to make you one.');
				};

				Modal.confirm({
					title: 'Are you sure you want to accept this job?',
					okText: 'Yes',
					cancelText: 'No',
					className: 'app-confirm-modal',
					async onOk() {
						const check_feedback = await JobApi.checkLastJobFeedback({ 'technician': user.technician.id });
						await JobApi.updateJob(jobId, { acceptedJobTime: new Date() });
						if (check_feedback.job_id != undefined) {
							setShowFeedbackModal(true)
							setFeedbackJobId(check_feedback.job_id)
						} else if (res.status === 'Declined') {
							openNotificationWithIcon('error', 'Error', `The job has been declined by customer.`)
							history.push('/')
						} else if (res.status === "Scheduled") {
							openNotificationWithIcon('error', 'Error', `This job has been converted to scheduled.`)
							history.push('/')
						} else {
							let validation = checkJobValidations(user, jobId, location)
							if (validation) {
								try {
									JobApi.sendJobAcceptEmail(jobId);
									openNotificationWithIcon('success', 'Success', 'We have sent email to the customer.');
								} catch (err) {
									setTechtype('noapply');
									openNotificationWithIcon('success', 'Success', 'Thanks for applying the job. you can join the meeting from dashboard when customer starts the call ');
									history.push('/');
								}
							} else {
								openNotificationWithIcon('error', 'Error', 'Sorry! The job has been taken by someone else.');
							}
						}
					}
				});
			};
		}

	};

	const startCall = async (e) => {
		e.currentTarget.disabled = true;
		console.log(job.status === 'Accepted', 'the condition');
		let filter_dict = { 'status': 'Inprogress', 'customer': user.customer.id }
		const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
		findInprogressLatestJob.then(async (result) => {
			if (result.jobs.totalCount >= 1) {
				openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
			} else {
				if (job.status === 'Accepted' || job.schedule_accepted === true) {
					await JobCycleApi.create(JobTags.CUSTOMER_START_SCHEDULE_CALL, job.id);
					if (isBrowserTypeSafari) {
						setShowBrowserTypeMessageModal(true)
					} else {
						try {
							const webdata = await WebSocket.create({
								user: user.id,
								job: job.id,
								socketType: 'accept-job',
								userType: user.userType,
								hitFromCustomerSide: true,
							});

							job.web_socket_id = webdata.websocket_details.id;
							await WebSocket.customer_start_call(job);
						} catch (err) {
							console.log('onSubmit error in InviteTech page>>>', err);
							await WebSocket.customer_start_call(job);
						}
						socket.emit('invite-technician', { job: job.id, tech: job.technician });
						window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${job.id}`
					}
				}
			}

		})
	};

	const closeBrowserTypeMessageModal = async () => {
		setShowBrowserTypeMessageModal(false)
		
		if (job.status === 'Accepted' || job.schedule_accepted === true) {
			try {
				const webdata = await WebSocket.create({
					user: user.id,
					job: job.id,
					socketType: 'accept-job',
					userType: user.userType,
					hitFromCustomerSide: true,
				});

				job.web_socket_id = webdata.websocket_details.id;
				await WebSocket.customer_start_call(job);
			} catch (err) {
				await WebSocket.customer_start_call(job);
			}
			socket.emit('invite-technician', { job: job.id, tech: job.technician });
			window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${job.id}`

		}
	}

	if (!user) {
		history.push('/login');
	}

	const call_fetch_job = async () => {
		await fetchJob(jobId);
		const feedbackDataRes = await getFeedback(jobId);
		setDataForFeedback(feedbackDataRes);
		setTimeout(() => {
			setIsLoading(false);
		}, 800);
	};

	//Consider time for 24 hours -> chat expires in normal job
	useEffect(() => {
		(async () => {
			if (job && job.meeting_end_time) {
				//chat panel not appear after 24 hours
				let jobExpireTime = new Date(job?.meeting_end_time);
				console.log("jobExpireTime:::::", jobExpireTime)
				let chatExpireDate = new Date(new Date(jobExpireTime).getTime() + 60 * 60 * 24 * 1000);
				console.log("Data:::", chatExpireDate)
				let currentDate = new Date()
				console.log("Data1:::", currentDate)
				if (+currentDate < +chatExpireDate) {
					console.log("hre Comes")
				}
			}
		})();
	}, [job])

	useEffect(() => {
		console.log("job**********************", job)

		if (job) {
			let jobCreatedTime = new Date(job?.long_job_sent_approval_at);
			let updateDate = jobCreatedTime.setDate(jobCreatedTime.getDate() + 3);
			setAutoApproveJob(moment(updateDate).format('lll'))
			setDuration(moment.duration(moment(job.primarySchedule).diff(now_time)))
			const res = getTotalJobTime(job);
			console.log('response is', res);
			setTotalSecondsToPass(res.totalSeconds);
			setTotalJobTimeToPass(res.totalTime);

			const distance = distanceCalc(job, DATE_OPTIONS);
			if (distance > 0) {
				setShowTimer(true);
			} else {
				setShowTimer(false);
			}
			if (job && job.submission === 'yes' && job.status === 'long-job') {
				setShowApproveButtons(true)
				setDisableSubmitbutton(true)

			}
			const arr = [];
			if (job?.tech_declined_ids && job?.tech_declined_ids.length > 0) {
				job.tech_declined_ids.map((t, i) => {
					const o = {};
					o.reason = (job.reasons && job.reasons[i] ? job.reasons[i] : 'NA');
					retrieveTechnician(t).then((d) => {
						o.technician = (d.user ? `${d.user.firstName} ${d.user.lastName}` : '');
						arr.push(o);
					});
					if (i + 1 === job?.tech_declined_ids.length) {
						setTimeout(() => {
							setRejectedCalls(arr);
						}, 600);
					}
					return true;
				});
			}

			const techCancellationArr = [];
			if (job.techCancellation) {
				job.techCancellation.map(async (t, i) => {
					let o = {};
					o.reason = (t.reason ? t.reason : 'NA');
					await retrieveTechnician(t.technician).then((d) => {
						o.technician = (d.user ? `${d.user.firstName} ${d.user.lastName}` : '');
						techCancellationArr.push(o);
						console.log("techCancellationArr :::::: ", techCancellationArr)
					});
					setTechCancellation(techCancellationArr);
					return true;
				});
			}

			const DeclinedIdTech = [];
			for (let i = 0; i < job?.tech_declined_ids.length; i++) {
				DeclinedIdTech.push(job.tech_declined_ids[i]);
			}
			if (user.userType === "technician") {
				const matchvalue = DeclinedIdTech.find(e => e === user.technician.id);
				return (
					setMatch(matchvalue)
				)
			}
		}

		// The following if condition is used to show approve/reject buttons on customer side technician hits submit for approval in long job.
		if (job && job.submission != undefined && job.submission === 'yes') {
			setShowApproveButtons(true)
		}

	}, [job]);

	useEffect(() => {
		(async () => {
			try {
				if (job) {
					console.log("job data>>>>>: ", job)
					const ownerUserInfo = await UserApi.getUserById(job?.customer?.user?.ownerId);
					setTechShowBusinessName(ownerUserInfo);
					console.log("ownerUserInfo: ", ownerUserInfo)
				}
			} catch (error) {
				// Handle the error, e.g., display an error message or perform fallback actions.
				console.error('API request failed:', error);
			}
		})();

	}, [job]);

	const setDataForFeedback = useCallback((feedbackDataRes) => {
		if (feedbackDataRes) {
			for (let i = 0; i <= feedbackDataRes.length - 1; i++) {
				if (feedbackDataRes[i].user && feedbackDataRes[i].user.userType) {
					if (feedbackDataRes[i].user.userType === 'customer') {
						setCustomerFeedback(feedbackDataRes[i]);
					}
					if (feedbackDataRes[i].user.userType === 'technician') {
						setTechnicianFeedback(feedbackDataRes[i]);
					}

					if (user && user.userType === feedbackDataRes[i].user.userType) {
						setMyFeedbackData(feedbackDataRes[i]);
						setRating(feedbackDataRes[i].rating);
						setSummary(feedbackDataRes[i].comments);
						setCheckboxIssues(feedbackDataRes[i].issues);
						if (feedbackDataRes[i].is_solved) {
							setshowYesBlock(true);
							setshowNoBlock(false);
							setProblemSolved('yes');
						} else {
							setshowYesBlock(false);
							setshowNoBlock(true);
							setProblemSolved('no');
						}
					}
				}
			}
		}
	});

	/**
	 * Following function is use to check pending jobs and Decline the Latest Pending JOb regarding the  status provided  for post again with same tech
	 * @author : Kartar Singh
	 **/

	const postAgainFunction = async () => {
		if (user && user.userType === 'customer' && user.customer) {
			if (user) {
				try {
					const latestJob = await JobApi.latestpendingJobs({ "customer": user.customer.id });
					if (latestJob.total_pending_jobs > 0) {
						if (latestJob.last_pending_job.status === JOB_STATUS.PENDING || latestJob.last_pending_job.status === JOB_STATUS.WAITING || latestJob.last_pending_job.status === JOB_STATUS.SCHEDULED) {
							try {
								await JobApi.updateJob(latestJob?.last_pending_job?.id, { status: 'Declined' });
								mixpanel.identify(user.email);
								mixpanel.track('Customer - Try again from job-details page.', { JobId: job.id });
								setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
								history.push(`/customer/start-profile-setup?jobId=${job.id}&repost=true`);
							} catch (error) {
								console.error(error);
							}
						}
					}
				} catch (error) {
					console.error(error);
				}
			}
		}
	}

	const try_again_post_job = async (e) => {
		try {
			if (user && user.userType === 'customer' && user.customer) {

				mixpanel.identify(user.email);
				mixpanel.track('Customer - Try again from job-details page.', { JobId: job.id });

				let pendingJobs = await checkPendingStatus(user);

				if (pendingJobs.schedule_accepted) {
					setScheduleMsg(true);
				}

				if (pendingJobs.success) {
					setLastPendingSoftware(pendingJobs.name);
					setCustomerConfirm(true);
				} else {
					Modal.confirm({
						title: 'Are you sure you want to post this job again?',
						okText: "Yes",
						cancelText: "No",
						className: 'app-confirm-modal',
						onOk() {
							setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
							history.push(`/customer/start-profile-setup?jobId=${job.id}&repost=true`);
						},
					})
				}
			} else {
				openNotificationWithIcon('error', 'Error', 'User not found.');
			}
		} catch (e) {
			console.log('Error in try_again_post_job', e);
		}
	};


	const post_draft_job = async (e) => {
		try {
			if (user && user.userType === 'customer' && user.customer) {
				mixpanel.identify(user.email);
				mixpanel.track('Customer - Draft job post again from job-details page.', { JobId: job.id });
				console.log('inside thos ::::')
				let pendingJobs = await checkPendingStatus(user);
				console.log('inside thos :::: 1', pendingJobs)

				if (pendingJobs.schedule_accepted) {
					setScheduleMsg(true);
				}

				if (pendingJobs.success) {
					console.log('inside thos :::: 2')
					setLastPendingSoftware(pendingJobs.name);
					setCustomerConfirmDraftJob(true);
				} else {
					console.log('inside thos :::: 3')
					Modal.confirm({
						title: 'Are you sure you want to post this job again?',
						okText: "Yes",
						cancelText: "No",
						className: 'app-confirm-modal',
						onOk() {
							window.location.href = `${APP_URL}/customer/profile-setup?page=job-summary&jobId=${job.id}`;
						},
					})
				}
			} else {
				openNotificationWithIcon('error', 'Error', 'User not found.');
			};
		} catch (e) {
			console.log('Error in try_again_post_job', e);
		}
	};

	/**
	 * Following function is use to check pending jobs and Decline the Latest Pending JOb regarding the  status provided  for draft job
	 * @author : Kartar Singh
	 **/

	const postAgainFunctionDraft = async () => {
		if (user && user.userType === 'customer' && user.customer) {
			if (user) {
				try {
					const latestJob = await JobApi.latestpendingJobs({ "customer": user.customer.id });
					if (latestJob.total_pending_jobs > 0) {
						if (latestJob.last_pending_job.status === JOB_STATUS.PENDING || latestJob.last_pending_job.status === JOB_STATUS.WAITING || latestJob.last_pending_job.status === JOB_STATUS.SCHEDULED) {
							try {
								await JobApi.updateJob(latestJob?.last_pending_job?.id, { status: 'Declined' });
								window.location.href = `${APP_URL}/customer/profile-setup?page=job-summary&jobId=${job.id}`;

							} catch (error) {
								console.error(error);
							}
						}
					}
				} catch (error) {
					console.error(error);
				}
			}
		}
	}

	const handleChangeFeedback = async () => {
		if (problemSolved === '') {
			openNotificationWithIcon('error', 'Error', 'Please select between Yes or No. is problem solved?');
			return false;
		}
		if (user && user.userType === 'technician' && (!summary || summary.trim() === '')) {
			openNotificationWithIcon('error', 'Error', 'Meeting summary is required.');
			return false;
		}

		const newFeedbackData = {};
		newFeedbackData.is_solved = (problemSolved === 'yes');
		let checkboxFinalValues = [];
		if (problemSolved === 'no') {
			checkboxFinalValues = checkboxIssues;
		}
		newFeedbackData.issues = checkboxFinalValues;
		newFeedbackData.rating = rating;
		newFeedbackData.comments = summary;

		if (problemSolved !== '' && problemSolved === 'no' && checkboxIssues.length === 0) {
			openNotificationWithIcon('error', 'Error', 'Please select the reason why problem is not solved.');
			return false;
		}

		setSubmitFeedbackCalled(true);
		let feedbackRes = {};
		if (myFeedbackData && myFeedbackData.id) {
			feedbackRes = await updateFeedback(myFeedbackData.id, newFeedbackData);
			if (feedbackRes) {
				setMyFeedbackData(feedbackRes);
				if (user && user.userType === 'customer') {
					setCustomerFeedback(feedbackRes);
					if (user.customer.customerType === 'live') {
						const klaviyoData = {
							email: job.technician.user.email,
							event: 'Client rating',
							properties: {
								$first_name: job.technician.user.firstName,
								$last_name: job.technician.user.lastName,
								$job: job.id,
								$rating: rating,
							},
						};
						await klaviyoTrack(klaviyoData);

					};
				}
				if (user && user.userType === 'technician') {
					setTechnicianFeedback(feedbackRes);
					if (user.technician.technicianType === 'live') {
						const klaviyoData = {
							email: job.customer.user.email,
							event: 'Client rating',
							properties: {
								$first_name: job.customer.user.firstName,
								$last_name: job.customer.user.lastName,
								$job: job.id,
								$rating: rating,
							},
						};
						await klaviyoTrack(klaviyoData);
					};
				};
				setShowChangeFeedbackModal(false);
				openNotificationWithIcon('success', 'Success', 'Feedback changed successfully.');
				// mixpanel code//
				mixpanel.identify(user.email);
				mixpanel.track('Feedback changed', { JobId: job.id });
				// mixpanel code//
			} else {
				openNotificationWithIcon('error', 'Error', 'Failed to update feedback. Please reload your page and try again.');
			}
		} else {
			let feedBackGivenTo = '';
			if (user.userType === 'technician') {
				feedBackGivenTo = job.customer.user.id;
				if (user.technician.technicianType === 'live') {
					const klaviyoData = {
						email: job.customer.user.email,
						event: 'Client rating',
						properties: {
							$first_name: job.customer.user.firstName,
							$last_name: job.customer.user.lastName,
							$job: job.id,
							$rating: rating,
						},
					};
					await klaviyoTrack(klaviyoData);
				};
			};
			if (user.userType === 'customer') {
				feedBackGivenTo = job.technician.user.id;
				if (user.customer.customerType === 'live') {
					const klaviyoData = {
						email: job.technician.user.email,
						event: 'Client rating',
						properties: {
							$first_name: job.technician.user.firstName,
							$last_name: job.technician.user.lastName,
							$job: job.id,
							$rating: rating,
						},
					};
					await klaviyoTrack(klaviyoData);
				};
			};

			newFeedbackData.job = job.id;
			newFeedbackData.user = user.id;
			newFeedbackData.to = feedBackGivenTo;
			await createFeedback(newFeedbackData);
			feedbackRes = await getFeedback(job.id);
			if (feedbackRes) {
				setDataForFeedback(feedbackRes);
				setShowChangeFeedbackModal(false);
				openNotificationWithIcon('success', 'Success', 'Feedback changed successfully.');
			}
		}

		setSubmitFeedbackCalled(false);
	};

	const toggle_solved = (res) => {
		// console.log("res",res)
		setProblemSolved(res);
		if (res === 'yes') {
			setshowYesBlock(true);
			setshowNoBlock(false);
		} else {
			setshowYesBlock(false);
			setshowNoBlock(true);
		}
	};

	const setIssueCheckbox = (checkedValues) => {
		const tempCheckValues = [...checkboxIssues];
		if (checkedValues.target.checked === true) {
			tempCheckValues.push(checkedValues.target.value);
		} else {
			const index = tempCheckValues.indexOf(checkedValues.target.value);
			if (index > -1) {
				tempCheckValues.splice(index, 1);
			}
		}
		setCheckboxIssues(tempCheckValues);
	};

	const ratingChanged = (newRating) => {
		setRating(newRating);
	};

	const handleChangeText = e => {
		const data = e.target.value;
		if (data.trim() !== '') {
			setSummary(e.target.value);
		}
	};

	async function handleApprovalModal(total_cost) {
		try {
			Modal.confirm({
				title: 'Are you sure you want to submit job for approval?',
				okText: "Yes",
				cancelText: "No",
				className: 'app-confirm-modal',
				async onOk() {
					if (user) {
						mixpanel.identify(user.email);
						mixpanel.track('Technician - Click on Yes for Long-job approval', { 'JobId': job.id });
					}
					let lifeCycleTag = ''
					if (job.additional_hours_submission === 'yes') {
						lifeCycleTag = JobTags.TECH_SUBMIT_FOR_APPROVAL_WITH_EDIT;
					} else {
						lifeCycleTag = JobTags.TECH_SUBMIT_FOR_APPROVAL_WITHOUT_EDIT;
					}
					await JobCycleApi.create(lifeCycleTag, job.id);
					jobSubmitCompletion(total_cost);
				}
			})
		}
		catch (err) {
			console.error("error in handleApprovalModal ::: ", err)
		}
	}

	/**
	* Function will run when technician will submit the long job for approval by customer and will update the job.
	* @params =  no params
	* @response : no response
	* @author : Karan
	*/
	const handleLongJobSubmission = async () => {
		if (user) {
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Click on Submit for approval for Long-Job ', { 'JobId': job.id });
		}
		console.log(">>>>.job >>>>>>>", job)
		if (job.long_job_with_minutes && job.long_job_with_minutes === 'yes') {
			setShowSubmisssionModal(true)
		} else {
			handleApprovalModal()
		}
	}

	/**
	* Function will run when technician will submit the long job for approval by customer and will update the job.
	* @params =  no params
	* @response : no response
	* @author : Manibha
	*/
	const jobSubmitCompletion = async (total_cost) => {
		let data = {}
		setShowSubmitLongJobButtonTech(false)
		setDisableSubmitbutton(true)
		await JobApi.updateJob(job.id, {
			'submission': 'yes',
			'total_cost': total_cost,
			'long_job_cost': total_cost,
			"long_job_sent_approval_at": new Date()

		});
		socket.emit("long-job-submission-by-tech", { "jobId": job.id })
		data['jobId'] = job.id
		data['userType'] = user.userType
		if (job && !job.meeting_pause) {
			JobApi.pauseStartLongJobTimer({ action: "pauseTimer", JobId: job.id, userType: job.technician.user.userType })
		}
		longJobSubmitNotification()
		setShowSubmisssionModal(false)
		JobApi.sendTextForJobSubmission({ 'customerNumber': job.customer.phoneNumber, 'jobId': job.id, 'customerName': job.customer.user.firstName, 'techName': job.technician.user.firstName, 'softwareName': job.software.name })
		JobApi.sendEmailForJobSubmission({ 'email': job.customer.user.email, 'firstName': job.customer.user.firstName, 'lastName': job.customer.user.lastName })
		openNotificationWithIcon('success', 'Success', 'Submission taken successfully.We will send you a notification when customer will approve/reject your submission.');
	}

	/**
	* Function will created a new notification when technican will submit the long job.
	* @params =  no params
	* @response : no response
	* @author : Manibha
	*/
	const longJobSubmitNotification = () => {
		const notificationData = {
			user: job.customer.user.id,
			job: job.id,
			read: false,
			actionable: true,
			shownInBrowser: false,
			title: 'Technician have submitted long job.',
			type: 'long_job_notifcation',
		};
		createNotification(notificationData);
	}

	/**

	 * Function will run when technician submit the long job with per six minute calculation
	 * @params =  totalJobCost (Type: Number), jobTotalSeconds (Type: Number),totalJobTime (Type: Number)
	 * @response : will update the job details in db
	 * @author : Karan
	 */
	const minutesLongJobSubmission = async (
		totalJobCost,
		jobTotalSeconds,
		totalJobTime
	) => {
		setShowSubmitLongJobButtonTech(false);
		setDisableSubmitbutton(true);
		const discountData = await CustomerApi.handleReferralDiscount({ 'customerId': job.customer.id, 'totalCost': totalJobCost })

		await JobApi.updateJob(job.id, {
			submission: "yes",
			long_job_cost: totalJobCost,
			total_cost: totalJobCost,
			total_time: totalJobTime,
			total_seconds: jobTotalSeconds,
			referalDiscount: discountData.referalDiscountCost
		});

		longJobSubmitNotification();
		socket.emit("long-job-submission-by-tech", { jobId: job.id });
		JobApi.sendTextForJobSubmission({
			customerNumber: job.customer.phoneNumber,
			jobId: job.id,
			customerName: job.customer.user.firstName,
			techName: job.technician.user.firstName,
			softwareName: job.software.name,
		});

		setShowSubmisssionModal(false)
		openNotificationWithIcon('success', 'Success', 'Submission taken successfully.We will send you a notification when customer will approve/reject your submission.');
	}

	/**
	* Function will check if the technician submission is approved or reject by customer and will update the job accordingly.
	* @params =  answer (Type:String), status (Type:String)
	* @response : no response
	* @author : Manibha
	*/
	const job_approval_status = (answer, status) => {
		let modal_title = ''
		console.log("Checking job data for charge", job);
		if (answer == 'yes') {
			// mixpanel code//
			if (user) {
				mixpanel.identify(user.email);
				mixpanel.track('Customer -Click on Approve Button', { 'JobId': job.id });
			}
			// mixpanel code//
			modal_title = 'Are you sure you are ready to mark your job as complete? This action cannot be undone, and once done, your job will be marked as final.'

		} else {
			if (user) {
				mixpanel.identify(user.email);
				mixpanel.track('Technician -Click on Reject Button', { 'JobId': job.id });
			}
			modal_title = 'Are you sure you want to ' + status + ' this job?.If you select yes the job will remain same and technician will have to submit the job completion again.'
		}
		Modal.confirm({
			title: modal_title,
			okText: "Yes",
			cancelText: "Go Back",
			className: 'app-confirm-modal',
			async onOk() {
				if (user) {
					mixpanel.identify(user.email);
					mixpanel.track(`Technician -Click on Yes to ${status} Job`, { 'JobId': job.id });
				}
				setDisableapprovalbtn(true)
				setShowApproveButtons(false)
				console.log('hiding>>>>>>>>>>>>>')
				if (answer === 'no') {
					await JobCycleApi.create(JobTags.CUSTOMER_REJECT_LONG_JOB_APPROVAL, job.id);
					console.log("Answer is no")
					await JobApi.updateJob(job.id, {
						'approval_status': answer,
						'submission': ''
					});

					const notificationData = {
						user: job.technician.user.id,
						job: job.id,
						read: false,
						actionable: true,
						shownInBrowser: false,
						title: 'Your long job submission was rejected by customer.',
						type: 'long_job_notifcation',
					};
					createNotification(notificationData);
					JobApi.pauseStartLongJobTimer({ action: "startTimer", JobId: job.id, userType: job.technician.user.userType })
					socket.emit("re-submit-job-by-cust", { "jobId": job.id })
					openNotificationWithIcon('success', 'Success', 'Response taken successfully.We will send you a notification when technician resubmits the job.');
					JobApi.sendEmailForJobRejection({ 'email': job.technician?.user?.email, 'firstName': job.technician?.user?.firstName, 'date': new Date(job.long_job_sent_approval_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: job.technician?.user?.timezone }) })
				}

				if (answer === 'yes') {
					await JobCycleApi.create(JobTags.CUSTOMER_ACCEPT_LONG_JOB_APPROVAL, job.id);
					// console.log("answer is yes");
					let charge = false
					setShowJoinBtn(false)
					const totalMeetingSeconds = Math.round(getTotalJobTime(job).totalSeconds)
					const updatedDataFirst = await JobApi.updateJob(job.id, {

						'approval_status': answer, 'meeting_end_time': new Date(), 'technician_charged_customer': 'yes', 'total_seconds': totalMeetingSeconds
					});

					if (updatedDataFirst.long_job_with_minutes != undefined && updatedDataFirst.long_job_with_minutes === 'yes') {

						const totalMeetingTime = getTotalJobTime(job).totalTime
						let updateObj = { total_time: totalMeetingTime }
						if (updatedDataFirst['meeting_pause'] === true) {
							const pauseStartTime = new Date(updatedDataFirst.pause_start_time)
							const seconds = (new Date().getTime() - pauseStartTime.getTime()) / 1000
							const totalPauseSeconds = updatedDataFirst.total_pause_seconds ? updatedDataFirst.total_pause_seconds + seconds : seconds
							updateObj['total_pause_seconds'] = totalPauseSeconds
							updateObj['technician_paused_timer'] = false
							updateObj['meeting_pause'] = false
						}
						await JobApi.updateJob(job.id, updateObj);
						charge = await CustomerApi.chargeCustomer({ jobData: job, liveUser: liveUser });
					} else {
						if (updatedDataFirst.payment_id != undefined && updatedDataFirst.payment_id !== '') {
							charge = await CustomerApi.retrieveCharge({ charge_id: updatedDataFirst.payment_id, liveUser: liveUser });
						}
					}
					if (user && user.userType === "customer" && !user.customer.subscription && job && job.status === 'Completed') {
						const createPromoData = await PromoApi.create({
							customer_id: user.customer.id,
							technician_id: job.technician.id,
							promo_code: job.technician.promo_code,
							redeemed: false,
							technician_earn: 10,
						});
					}
					if (charge) {
						const updatedData = await JobApi.updateJob(job.id, {
							'status': 'Completed'
						});
						let dataToSave = {}
						dataToSave['total_amount'] = updatedData.long_job_cost
						dataToSave['transaction_type'] = capitalizeFirstLetter(charge?.payment_method_details?.card?.brand)
						dataToSave['transaction_status'] = capitalizeFirstLetter(charge.status)
						const result = updatedData?.payment_id?.match("ch_")
						if (updatedData.is_long_job == true && updatedData.status == "Completed" && result[0] == "ch_") {
							dataToSave['is_stripe_called'] = true
						}
						else {
							dataToSave['is_stripe_called'] = false
						}
						console.log("going to generate billing report ")
						await CreateBillingReport(job.id, job, dataToSave);

						console.log("job Id :::::::::: ", job.id)
						console.log("updated data ::::::::: ", updatedData.long_job_with_minutes)
						console.log("data to save:::::::::::::::::::::", dataToSave)
						if (updatedData.long_job_with_minutes == undefined || updatedData.long_job_with_minutes === 'no') {
							console.log("going to generate earning report")
							await CreateEarningReport(job.id, job, updatedData.long_job_cost, dataToSave, true);
						} else {
							console.log("going to generate billing report in else")
							await CreateEarningReport(job.id, job, updatedData.long_job_cost, dataToSave);
						}

						socket.emit("long-job-approved-by-cust", { "jobId": job.id })

						const notificationData = {
							user: job.technician.user.id,
							job: job.id,
							read: false,
							actionable: true,
							customer: job.customer.id,
							shownInBrowser: false,
							title: 'Greetings! Customer has approved your long job submission.',
							type: 'long_job_notifcation',
						};

						CustomerApi.meetingEndEmails({ JobId: job.id });
						createNotification(notificationData);
						try {
							let responseForReferals = await updateReferalDiscount({ "customerId": job.customer.id })
							console.log("responseForReferals :::::::::::::::", responseForReferals)
						}
						catch (err) {
							console.log("error in response :::")
						}
						openNotificationWithIcon('success', 'Success', 'Job has been approved and marked as completed.');
						setTimeout(() => {
							pushToFeebackPage()
						}, 1500)

					} else {
						openNotificationWithIcon('error', 'Error', 'Seems like there is some issue with the job.Please try again later.');
					}
					JobApi.sendEmailForJobApproval({ 'email': job.technician.user.email, 'firstName': job.customer.user.firstName, 'lastName': job.customer.user.lastName, 'date': new Date(job.long_job_sent_approval_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: job.technician?.user?.timezone }), 'JobId': job.JobId })
				}


			}
		})
	}

	/**
	* This function changes the first letter of string to capital.
	* @params = str (Type:String)
	* @response : returns the string with first letter capitalize
	* @author : Manibha
	*/

	function capitalizeFirstLetter(str) {
		if (str) {
			return str.replace(/^\p{CWU}/u, char => char.toLocaleUpperCase());
		}
		return '';
	}



	if (isLoading) {
		return (
			<Col md="12" className="px-4 py-5">
				<Row>
					<Loader height="100%" className={`mt-5 ${isLoading ? 'loader-outer' : 'd-none'}`} />
				</Row>
			</Col>
		);
	}


	/**
	* This function helps in column sizing.
	* @params = no params
	* @response : returns the number for the column size
	* @author : Manibha
	*/
	function firstColSize() {
		if (user && user.userType === 'customer' && job?.status === 'long-job' && job?.submission == 'yes' && (job?.approval_status == undefined || job?.approval_status == 'no')) {
			return "6"
		} else if (user && user.userType === 'technician' && job?.status === 'long-job' && job?.submission == 'yes' && (job?.approval_status == undefined || job?.approval_status == 'no')) {
			return "8"
		} else if (user && user.userType === 'customer') {
			return "6"
		} else {
			return "8"
		}
	}

	/**
	* This function helps in column sizing.
	* @params = no params
	* @response : returns the number for the column size
	* @author : Manibha
	*/
	function secondColSize() {
		if (user && user.userType === 'customer' && job.status === 'long-job' && job.submission == 'yes' && (job.approval_status == undefined || job.approval_status == 'no')) {
			return "6"
		} else if (user && user.userType === 'technician' && job.status === 'long-job' && job.submission == 'yes' && (job.approval_status == undefined || job.approval_status == 'no')) {
			return "4"
		} else if (user && user.userType === 'customer') {
			return "6"
		}
		else {
			return "4"
		}
	}


	/**
	* This function shows feedback button in case of long job if feedback not given.
	* @params = no params
	* @response : returns boolean value which decides to show feeback button or not 
	* @author : Manibha
	*/
	function checkShowFeebackButton() {
		if (job && job.status === 'Completed' && !customerFeedback && user.userType === 'customer') {
			return true
		}

		if (job && job.status === 'Completed' && !technicianFeedback && user.userType === 'technician') {
			return true
		}

		return false
	}

	/**
	* This function changes the url to feedback page.
	* @params = no params
	* @response : no response
	* @author : Manibha
	*/
	function pushToFeebackPage(e) {
		window.location.href = `/meeting-feedback/${job.id}`
	}

	/**
	* This function checks if the job is long job or not.
	* @params :  
	* @response : true /false
	* @author : Vinit
	*/
	const isLongJob = () => {
		return job.is_long_job;
	}

	/**
	* This function will open a modal for tech to update long job hours..
	* @params :  
	* @response : 
	* @author : Vinit
	*/
	const handleHoursEdit = async () => {
		if (job.is_long_job && job.long_job_with_minutes === 'no') {
			if (user) {
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Click on Edit to increase hours for Long-Job ', { 'JobId': job.id });
			}
			setShowSubmisssionModal(true)
		}
	}

	/**
	* This function will open a modal for customer to approve or reject additional long job hours..
	* @params :  
	* @response : 
	* @author : Vinit
	*/
	const handleAdditionalHoursApproval = async () => {
		// console.log('inside click');
		if (user) {
			console.log('on clicking', user);
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Click on Approve Additional Hours button to check more hours added by technician for Long-Job ', { 'JobId': job.id });
		}
		setShowSubmisssionModal(true)
	}


	const changeTab = () => {
		setCurrentStep(0);
		setActiveMenu('home');
	}
	const closePendingModal = () => {
		setCustomerConfirm(false);
		setCustomerConfirmDraftJob(false)
	};

	const displayChatPanel = (job) => {

		let now = new Date();
		let isScheduledJobTwoHourPassed = false;
		let selectedDate = new Date(job.createdAt); // Assuming 'job.createdAt' contains the creation date of the job
		selectedDate.setHours(selectedDate.getHours() + addTime); // Add 2 hours instead of 1
		if (selectedDate.getTime() < now.getTime()) {
			isScheduledJobTwoHourPassed = true;
		}

		let isCompletedJobTwentyFourHourPassed = false;
		let completeJobEndTime = new Date(job?.meeting_end_time);
		completeJobEndTime.setHours(completeJobEndTime.getHours() + 24); // Add 2 hours instead of 1
		if (completeJobEndTime.getTime() < now.getTime()) {
			isCompletedJobTwentyFourHourPassed = true;
		}

		const isTechnician = user?.technician?.id === job?.technician?.id;
		const isScheduleAccepted = job?.schedule_accepted;
		const isLongJob = job?.is_long_job;
		const isPostAgainWithSameTech = job?.post_again_reference_technician;
		const isJobCompleted = job.status === "Completed";
		const isTechDeclined = (job?.tech_declined_ids)?.includes(user?.technician?.id);
		const isTransferReferenceJob = job?.transfer_reference_job;
		const isJobInProgress = job?.status === "Inprogress";
		const isJobAccepted = job?.status === "Accepted";
		const isJobPending = job?.status === "Pending";
		const isJobWaiting = job?.status === "Waiting";
		const isJobScheduled = job?.status === "Scheduled";
		const isCancelledJob = job?.status === "Declined"

		const shouldDisplayChatPanel =
			(!fromCustomerHistory || isTechnician) &&
			!isTechDeclined


		if (shouldDisplayChatPanel) {
			if (isLongJob && !job.schedule_accepted) {
				return <ChatPanel job={job} userType={userType} />;
			}

			if (
				(isJobScheduled && isPostAgainWithSameTech) ||
				(isJobPending && isPostAgainWithSameTech) ||
				(isJobInProgress && !isScheduleAccepted) ||
				(isJobCompleted && !isLongJob && !isScheduleAccepted && !isCompletedJobTwentyFourHourPassed) ||
				(isScheduleAccepted) ||
				(isJobScheduled && isScheduledJobTwoHourPassed && !isJobAccepted) ||
				(isJobAccepted) || haveUnreadMessagesForPendingJob(jobId) || isCancelledJob
			) {
				return <ChatPanel job={job} userType={userType} />;
			}
		}

		return null;
	};

	return (
		<>
			<Modal
				style={{ top: 40 }}
				closable={true}
				onCancel={closePendingModal}
				visible={customerConfirm || customerConfirmDraftJob}
				maskStyle={{ backgroundColor: "#DCE6EDCF" }}
				maskClosable={true}
				width={800}
				bodyStyle={{ height: 170, paddingTop: 50 }}
				footer={
					[
						<Button
							className="btn app-btn app-btn-light-blue modal-footer-btn"
							onClick={() => {
								setCustomerConfirm(false);
								setCustomerConfirmDraftJob(false)
							}}
							key='no'
						>
							<span></span>Back To Dashbord
						</Button>,

						<Button
							className="btn app-btn job-accept-btn modal-footer-btn"
							onClick={customerConfirm ? postAgainFunction : customerConfirmDraftJob ? postAgainFunctionDraft : null}
							key='yes'
						>
							<span></span>Create New
						</Button>,

					]}
			>
				<div className="">
					<span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
						{message}
					</span>
				</div>
			</Modal>
		
			<Col md="12" className="">
				<Col md="12">
					<Row>
						<Col xs="12" className="mt-5 mb-4">
							{fromEmail
								? (
									<Link to="/" className="back-link">
										<FontAwesomeIcon icon={faChevronLeft} />
										<span className="pl-3">View All Jobs</span>
									</Link>
								)
								: (
									<>
										{fromVar !== 'customerhistory'
											&& (
												<a className="back-link" onClick={changeTab}>
													<FontAwesomeIcon icon={faChevronLeft} />
													<span className="pl-3">Recent Jobs</span>
												</a>
											)}
									</>
								)}
						</Col>

						<Col xs="12" md={firstColSize()}>
							<h3 className="app-heading">{job ? (job.issueDescription.length > 40 ? `${job.issueDescription.substring(0, 40)}...` : job.issueDescription) : ''}</h3>
						</Col>

						<Col xs="12" md={secondColSize()} className="text-right">

							{user && user.userType === 'technician' && job && job.status === 'Waiting' && !job?.tech_declined_ids.includes(user.technician.id) && !job.declinedByCustomer.includes(user.technician.id)
								&& (
									<Button className="btn app-btn app-btn-small app-btn-light-blue-remove" title="Accept this job" onClick={() => { AcceptJob(job); }}>
										<span />
										Accept
									</Button>
								)}

							{user && user.userType === 'customer' && job && job.customer !== null && user.id === job.customer.user.id && (job.status === 'Inprogress' || job.status === "long-job") && showJoinBtn

								&& (
									<Button className="btn app-btn app-btn-small app-btn-light-blue-remove" title="Join the meeting" onClick={JoinJob}>
										<span />
										Join
									</Button>
								)}


							{user && user.userType === 'technician' && job && job.technician && job.technician.user && user.id === job.technician.user.id && (job.status === 'Inprogress' || job.status === "long-job") && !job?.tech_declined_ids.includes(job.technician.id) && showJoinBtn
								&& (
									<Button className="btn app-btn app-btn-large app-btn-light-blue-remove mb-3" title="Join the meeting" onClick={JoinJob}>
										<span />
										Join
									</Button>
								)}

							{job && job.schedule_accepted === true && (job.customer.user.id === user.id || (job.technician && job.technician.user.id === user.id)) && (
								<>
									<ScheduleTimer user={user} job={job} DATE_OPTIONS={DATE_OPTIONS} setShowTimer={setShowTimer} />
									{showTimer
										&& (
											<>
												<div>
													<p className="d-block label-total-value">
														{' '}
														<span className="label-value">Time left -</span>
														{' '}
														<span id="timingDiv" />
													</p>
												</div>

											</>
										)}
								</>
							)}

							{job.status === "Scheduled" && job && ((user.userType === 'customer' && job.customer !== null && user.id === job.customer.user.id)) &&
								<React.Fragment key={job?.customer?.user.id}>
									<Button className="mr-2 btn app-btn mb-2"
										onClick={() => {
											setIsEditScheduleJob(true)
											setSubmitButton(false)
										}} disabled={disableEditForJobButton}
										name={job.id}
										title={disableEditForJobButton ? "" : "You also have the option to request a time change up to one hour before the scheduled time"}
										style={{ backgroundColor: disableEditForJobButton ? "#97ABB6" : "" }}
									>Edit<span></span></Button>


									<ScheduleForLater
										job={job}
										setIsEditScheduleJob={setIsEditScheduleJob}
										isEditScheduleJob={isEditScheduleJob}
										user={user}
										setSubmitButton={setSubmitButton}
										submitButton={submitButton}
										setDisableEditForJobButton={setDisableEditForJobButton}
									/>
								</React.Fragment>
							}

							{job.status === "Scheduled" && user.userType === 'customer' && job && job.customer !== null && user.id === job.customer.user.id &&
								<>
									<Button className="mr-2 btn app-btn mb-2"
										onClick={scheduledCancelByCustomer}
										name={job.id}
										title="You will no longer see this job if you click on this button.">Cancel<span></span></Button>
								</>
							}

							<JobCancelFrom
								isCancelModal={isCancelModal}
								setIsCancelModal={setIsCancelModal}
								cancelJobId={cancelJobId}
								user={user}
								type={userType}
								job={job}
								decline_job_by_technician={decline_job_by_technician}
								setcurrentStep={setCurrentStep}
							/>
							{techType === 'apply' && job.status === 'Pending' && user.userType === 'technician' && (
								<Button className="btn app-btn app-btn-large app-btn-light-blue-remove mr-3" title="Apply for this job" disabled={disAcceptBtn} onClick={() => { AcceptJob(job); }}>
									<span />
									Accept job
								</Button>
							)}

							{(user.userType === 'technician' && job.status === 'Accepted') && user.id === job.technician.user.id &&
								<>
									<Button className="btn app-btn app-btn-small app-btn-transparent" title="waiting for customer." onClick={() => { }} disabled={disAcceptBtn}>
										<span />
										<p className='mb-8'>Waiting for customer</p>
									</Button>
								</>
							}

							{techType === 'noapply' && job && user && job.status !== 'Completed' && job.technician && job.technician.user.id !== user.id && (
								<Button className="btn app-btn app-btn-large app-btn-transparent mr-3">
									<span />
									Not Available
								</Button>
							)}
							{job && user && job.technician && job.technician.user.id === user.id && job.status === 'ScheduledsubOption' && (
								<Button className="btn app-btn app-btn-small  mr-3">
									<span />
									Accepted
								</Button>
							)}
							{user && user.userType === 'customer' && (job.status === 'Completed' || job.status === 'Pending' || job.status === 'Declined') && user.id === job.customer.user.id && (
								<Button className="btn app-btn app-btn-large app-btn-light-blue-remove" title="Click on this button to make this job live." onClick={try_again_post_job}>
									<span />
									Post Again
								</Button>
							)}

							{user && user.userType === 'customer' && job.status === 'Draft' && user.id === job.customer.user.id && (
								<Button className="btn app-btn app-btn-large app-btn-light-blue-remove" title="Click on this button to make this job live." onClick={post_draft_job}><span />Post
								</Button>)
							}

							{(user && user.userType === 'technician' && job.status === 'long-job' && job.submission != 'yes' && (job.approval_status == undefined || job.approval_status == 'no') && showSubmitLongJobButtonTech) && user.id === job.technician.user.id &&
								<Button className="btn app-btn app-btn-small app-btn-large" title="Click on this button to submit for job completion." onClick={handleLongJobSubmission} disabled={disableSubmitbutton}>
									<span />
									Job is Complete
								</Button>
							}

							<MeetingButton showTimer={showTimer} user={user} job={job} startCall={startCall} handleStartCall={handleStartCall} socket={socket} handleCustomerJoin={handleCustomerJoin} handleStartCallWithModal={handleStartCallWithModal} />

							{(user  && job && job.status === 'Scheduled' && job.schedule_accepted !== false &&
								<Modal
									footer={null}
									closable={false}
									visible={showBrowserTypeMessageModal}
									maskStyle={{ backgroundColor: "#DCE6EDCF" }}
									maskClosable={false}
									width={616}
								>
									<div className="">
										<span style={{ fontSize: '18px' }}>To fully experience our share screen and remote access features, Geeker recommends switching to <span className='font-weight-bold'>Google Chrome</span> browser.</span>
									</div>

									<div className="d-flex justify-content-end">
										{user && user.userType === 'customer' ? (
											<BasicButton
												onClick={() => {
													// Customer-specific click behavior
													closeBrowserTypeMessageModal();
												}}
												btnTitle={"Close"}
												height={"40px"}
												width={"100px"}
												background={"#1bd4d5"}
												color={"#fff"}
											/>
										) : (
											<BasicButton
												onClick={() => {
													// Non-customer-specific click behavior
													handleCloseModal();
												}}
												btnTitle={"Close"}
												height={"40px"}
												width={"100px"}
												background={"#1bd4d5"}
												color={"#fff"}
											/>
										)}







									</div>
								</Modal>
							)} 

							{(user && user.userType === 'customer' && job.status === 'long-job' && job.submission == 'yes' && showApproveButtons) && user.id === job.customer.user.id &&
								<>
									<Button key="Approve" className="btn app-btn app-btn-small app-btn ml-2 mr-2" title="Click on this button to approve job completion." onClick={() => job_approval_status('yes', 'approve')} disabled={disableapprovalbtn}>
										<span />
										Approve
									</Button>
									<Button key="Reject" className="btn app-btn app-btn-small app-btn-transparent" title="Click on this button to reject job completion." onClick={() => job_approval_status('no', 'reject')} disabled={disableapprovalbtn}>
										<span />
										Reject
									</Button>
								</>
							}

							{(user && user.userType === 'customer' && job.status === 'long-job' && job.additional_hours_submission === 'yes' && showAdditionalHoursApproveButtons) && (job?.submission === undefined || job?.submission === "") && user.id === job.customer.user.id &&
								<>
									<Button className="btn app-btn app-btn-small app-btn ml-2 mr-2 mt" title="Click on this button to approve job completion." onClick={() => handleAdditionalHoursApproval()} disabled={disableapprovalbtn}>
										<span />
										Approve Additional Hours
									</Button>
								</>
							}

							{checkShowFeebackButton() && user && job && (user.id === job?.technician?.user.id || user.id === job?.customer?.user.id) &&
								<Button className="btn app-btn app-btn-large app-btn-light-blue ml-2" title="Click on this button to give feedback." onClick={pushToFeebackPage}>
									<span />
									Give Feedback
								</Button>
							}

							{job && job.status === 'Scheduled' && !job.scheduleDetails && !job.scheduleDetails.scheduleExpired && techType === 'apply'
								&& (
									<Col className="card-element-outer ml-2 mr-2">
										<Col xs="12" className="card-element-inner pb-3 iframe-outer" >
											<div className="addToCalendar-geeker mb-2">
												<AddToCalendarDropdown
													event={{
														'title': 'Geeker Job',
														duration,
														'description': job.issueDescription,
														'startDatetime': moment.utc(job.primarySchedule).format('YYYYMMDDTHHmmssZ'),
														'endDatetime': moment.utc(new Date(new Date(job.primarySchedule).setHours(new Date(job.primarySchedule).getHours() + 2))).format('YYYYMMDDTHHmmssZ'),
													}}
													buttonProps={{
														'className': 'addToCalendarDropdownButton'
													}}
													items={[SHARE_SITES.GOOGLE, SHARE_SITES.OUTLOOK]}
												/>
											</div>
										</Col>
									</Col>
								)}
						</Col>

						<Col xs="12" className="">
							{(user && user.userType === 'technician' && job.status === 'long-job' && disableSubmitbutton) &&
								<div className="col-12 mb-4 px-4 mt-4 notification-badge  jobBadge1 ">
									<Row>
										<span>
											<p className='schedule-text float-left'> Job is submitted by you and waiting for customer approval</p>
										</span>
									</Row>
								</div>}

							{(user && user.userType === 'customer' && job.status === 'long-job' && job.submission == 'yes' && showApproveButtons) &&
								<div className="col-12 mb-4 px-4 mt-4 notification-badge  jobBadge1 ">
									<Row>
										<span>
											<p className='schedule-text float-left'> {`Your job will be approve automatically on ${autoApproveJob}`}</p>
										</span>
									</Row>
								</div>
							}
							<span className="job-status">
								{job && job.status === 'Scheduled'
									&& (
										<>
											<b>Scheduled Time : </b>
											{new Date(job.primarySchedule).toLocaleTimeString('en-US', DATE_OPTIONS)}
										</>
									)}
								<br />
								{job
									&& (
										<>
											<b>Created at : </b>
											{new Date(job.createdAt).toLocaleTimeString('en-US', DATE_OPTIONS)}
										</>
									)}
							</span>
						</Col>

						{job && job.status === 'Completed'
							&& (
								<Col xs="12" className="">
									<span className="job-status">
										{job.status}
										{' '}
										:
										{' '}
										{new Date(job.updatedAt).toLocaleTimeString('en-US', DATE_OPTIONS)}
									</span>
									<span className="job-rating">
										{user && user.userType === 'technician'
											&& <Rate disabled defaultValue={customerFeedback.rating} />}
										{user && user.userType === 'customer'
											&& <Rate disabled defaultValue={technicianFeedback.rating} />}
									</span>
								</Col>
							)}

						<Col xs="12" className="ant-collapse-outer mt-4">
							<Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7']}>
								<Panel header="Job Details" key="1" className="mb-4 py-3 px-2">
									<Row>
										<Col xs="12">
											<div className="job-detail-table">
												<Table responsive={true}>
													<thead>
														<tr>
															<th className="label-name">Software</th>
															<th className="label-name">Area</th>
															<th className="label-name">Status</th>
															<th className="label-name">
																{
																	user && user.userType === 'customer'
																		? 'Technician'
																		: 'Customer'
																}
															</th>
															<th className="label-name">
																{(() => {
																	if (user.userType === 'technician') {
																		return (
																			<>
																				{user && user.userType === 'technician' && 'Total Earnings'}
																			</>
																		);
																	}
																	else {
																		return (
																			<>
																				{user && user.userType === 'customer' && 'Total Cost'}
																			</>
																		)
																	}
																})()}
															</th>
															<th className="label-name">Total Time</th>
															<th className="label-name">Is Long Job</th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td className="label-value">{job && job.software ? job.software.name : 'NA'}</td>
															<td className="label-value">{job && job.subOption ? job.subOption : 'NA'}</td>

															{user.userType === 'technician'
																&& (
																	<>

																		{job && job.schedule_accepted && job.technician && job.technician.user.id === user.id && job.status === JOB_STATUS.IN_PROGRESS ?
																			<td className="label-value">{(job.status === JOB_STATUS.IN_PROGRESS ? 'InProgress' : job.status)}</td>
																			:
																			job && job.schedule_accepted && job.technician && job.technician.user.id === user.id && job.status !== JOB_STATUS.COMPLETED
																				? <td className="label-value">Scheduled & Accepted</td>
																				: <td className="label-value">
																					{job && job.status === 'Declined' ? 'Cancelled' : (job && job.status === 'long-job' ? 'Long Job' : (job && job.status === 'Inprogress' ? 'InProgress' : job.status))}
																				</td>}
																	</>
																)}

															{user.userType === 'customer'
																&& (
																	<>
																		{job && job.schedule_accepted && job.customer.user.id === user.id && job.status === JOB_STATUS.IN_PROGRESS
																			?
																			<td className="label-value">{(job.status === JOB_STATUS.IN_PROGRESS ? 'InProgress' : job.status)}</td>
																			:
																			job && job.schedule_accepted && job.customer.user.id === user.id && job.status !== 'Completed'
																				? <td className="label-value">Scheduled & Accepted</td>
																				: <td className="label-value">
																					{job && job.status === 'Declined' ? 'Cancelled' : (job && job.status === 'long-job' ? 'Long Job' : (job && job.status === 'Inprogress' ? 'InProgress' : job.status))}
																				</td>
																		}
																	</>
																)}

															<td className="label-value">
																{user && user.userType === 'customer'
																		? (job && job.technician && job.technician.user ? `${job.technician.user.firstName} ${job.technician.user.lastName}` : 'NA')
																		: (job && job.customer && job.customer.user && job.customer.status === 'deleted'
																			? 'NA'
																			: (() => {
																				if (job && job.customer && job.customer.user) {
																					const { user } = job.customer;
																					if (user.roles[0] === 'owner' && user.isBusinessTypeAccount) {
																						return (
																							<span>
																								{`${job.customer.user.firstName} ${job.customer.user.lastName}, `}
																								<b>{`${user.businessName}`}</b>
																							</span>
																						);
																					} else {
																						return (
																							<span>
																								{`${job.customer.user.firstName} ${job.customer.user.lastName} `}
																							</span>
																						)
																					}
																					if (user.roles.includes('admin') || user.roles.includes('user')) {
																						if (user.parentId) {

																							return (
																								<span>
																									{`${job.customer.user.firstName} ${job.customer.user.lastName}, `}
																									<b>{`${techShowBusinessName.businessName}`}</b>
																								</span>
																							);

																						}
																					} else {
																						return (
																							<span>
																								{`${job.customer.user.firstName} ${job.customer.user.lastName} `}
																							</span>
																						)
																					}

																				}
																				return 'NA';
																			})()
																		)
																}


															</td>
															<td className="label-value">
																{(() => {
																	if (job && user.userType === "technician") {
																		return (
																			<>
																				{user?.technician?.tag !== 'employed' && user.technician.id !== match && (!fromCustomerHistory || job.technician.id === user.technician.id) ?
																					<TechEarning job={job} />
																					:
																					job?.is_transferred && (!fromCustomerHistory || job.technician.id === user.technician.id) ?
																						<TechEarning job={job} /> : 'NA'}
																			</>
																		);
																	} else {
																		return (<>
																			{(userIsOwner || !ownerHaveSubscription) ?
																				<JobBilling job={job} />
																				:
																				"NA"}
																		</>)
																	}
																})()}
															</td>
															<td className="label-value">
																{(() => {
																	if (user.userType === 'technician') {
																		return (
																			<>{job && job.is_long_job && job.long_job_with_minutes === "no" ? job.long_job_hours + "hours" : job.long_job_with_minutes === 'yes' ? totalJobTimeToPass : job && job.total_time && user.technician.id != match ? job.total_time :
																				job?.is_transferred ? job.total_time : 'NA'}{" "}

																				{isLongJob && job.status === "long-job" && job.long_job_with_minutes === "no" &&
																					<FontAwesomeIcon
																						className="dark-green-text mr-3"
																						icon={faPencilAlt}
																						title="Add more hours"
																						onClick={handleHoursEdit}
																					/>}
																			</>
																		)
																	}
																	else {
																		return (
																			<>{job && job.is_long_job && job.long_job_with_minutes === "no" ? job.long_job_hours + "hours" : job.long_job_with_minutes === 'yes' ? totalJobTimeToPass : job && job.total_time ? job.total_time : 'NA'}</>
																		)
																	}
																})()}
															</td>
															<td className="label-value">
																{job && job.is_long_job ? 'Yes' : "No"}
															</td>
														</tr>
													</tbody>
												</Table>
											</div>
											{(customerFeedback.is_solved !== undefined || technicianFeedback.is_solved !== undefined) && (
												<>
													<Table className="mb-2">
														<thead className="m-0">
															<tr>
																{customerFeedback.is_solved
																	&& (
																		<th className="label-name p-0">
																			Issue Solved from Client End
																		</th>
																	)}
															</tr>
														</thead>
														<tbody className="m-0">
															<tr>
																<td className="label-value pt-0 ">
																	{customerFeedback.is_solved !== undefined
																		? (
																			<>
																				{customerFeedback.is_solved ? 'Yes' : 'No'}
																			</>
																		)
																		: <></>}
																</td>
															</tr>
														</tbody>
													</Table>
													<Table className="mb-2">
														<thead className="m-0">
															<tr>
																{technicianFeedback.is_solved !== undefined
																	&& (
																		<th className="label-name p-0">
																			Issue Solved from technician End
																		</th>
																	)}
															</tr>
														</thead>
														<tbody>
															<tr>
																<td className="label-value pt-0 ">
																	{technicianFeedback.is_solved !== undefined
																		? (
																			<>
																				{technicianFeedback.is_solved ? 'Yes' : 'No'}
																			</>
																		)
																		: <></>}
																</td>
															</tr>
														</tbody>
													</Table>
												</>
											)}
											<Table className="my-4">
												<thead>
													<tr>
														<th className="label-name pt-0">
															{job && job.updatedIssueDescription && job.updatedIssueDescription.length > 0
																? (
																	<>
																		{user && user.userType === 'technician'
																			? <>Issue added by client :</>
																			: <>Issue added by you :</>}

																	</>
																)
																: <>Issue</>}
														</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td className="label-value medium-font">{job ? job.issueDescription : 'NA'}</td>
													</tr>
												</tbody>
											</Table>
											{job && job.updatedIssueDescription && job.updatedIssueDescription.length > 0 && (
												<>
													{
														job.updatedIssueDescription.map((i, d) => (
															<Table className="mb-4" key={d}>
																<thead>
																	<tr>
																		<th className="label-name">
																			Issue updated by
																			{' '}
																			{i.technicianName}
																			{' '}
																			at
																			{' '}
																			{new Date(i.updatedAt).toLocaleTimeString('en-US', DATE_OPTIONS)}
																			:
																		</th>
																	</tr>
																</thead>
																<tbody>
																	<tr>
																		<td className="label-value medium-font">{i.issueDescription}</td>
																	</tr>
																</tbody>
															</Table>
														))
													}
												</>
											)}
											{job && job.customer && job.schedule_accepted && job.customer.user.id === user.id && (
												<Table className="mb-4">
													<thead>
														<tr>
															<th className="label-name">Meeting At </th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<TimeDecider job={job} DATE_OPTIONS={DATE_OPTIONS} />
														</tr>
													</tbody>
												</Table>
											)}
											{(job && job.technician) && job.schedule_accepted && job.technician.user.id === user.id && (
												<Table className="mb-4">
													<thead>
														<tr>
															<th className="label-name">Meeting At </th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<TimeDecider job={job} DATE_OPTIONS={DATE_OPTIONS} />
														</tr>
													</tbody>
												</Table>
											)}

											{
												techType === 'apply' && job.status === 'Scheduled' && job.scheduleDetails.primaryTimeAvailable && !job.scheduleDetails.scheduleExpired && user.userType === 'technician'
													? (
														<div className="mb-6 col-12 d-flex justify-content-around">
															<div className="col-12 text-right">
																<Button className="btn app-btn app-btn-large btn-primary job-accept-btn mr-3 mb-2"
																	onClick={() => { setIsApplyScheduleJob(true); }}
																	disabled={disableApplyForJobButton || disableAcceptBtn}>
																	<span />
																	{disableApplyForJobButton ? <Spin /> : " Accept job "}
																</Button>
																{job.status === 'Scheduled' && !job.technician && user.technician && !job?.tech_declined_ids.includes(user.technician.id)
																	&& <Button className="btn app-btn job-accept-btn mr-3 mb-2"
																		onClick={scheduledDeclineByTech}
																		disabled={disableDeclineJobButton || disableDeclineBtn}
																		name={job.id}
																		title="You will no longer see this job if you click on this button.">{disableDeclineJobButton ? <Spin /> : "Decline"}<span></span></Button>
																}
																<ApplyScheduleJobFrom
																	isApplyScheduleJob={isApplyScheduleJob}
																	setIsApplyScheduleJob={setIsApplyScheduleJob}
																	job={job}
																	user={user}
																	checkFeedback={checkFeedback}
																	checkIfTwoTierJobAndExpertTech={checkIfTwoTierJobAndExpertTech}
																	setShowFeedbackModal={setShowFeedbackModal}
																	setFeedbackJobId={setFeedbackJobId}
																	fromEmail={fromEmail}
																	fetchJob={fetchJob}
																	setTechtype={setTechtype}
																	DATE_OPTIONS={DATE_OPTIONS}
																	setDisableApplyForJobButton={setDisableApplyForJobButton}
																	// fetchSingleJob={fetchSingleJob}
																	setDisableDeclineBtn={setDisableDeclineBtn}
																/>
															</div>
														</div>
													)
													: <></>
											}
											{job.status === 'Scheduled' && !job.scheduleDetails.scheduleExpired
												? (
													<div className="mb-6 col-12 d-flex justify-content-around">
														<div className="col-12 text-right">
															{job.status === 'Scheduled' && user.technician && (job.technician && job.technician.id === user.technician.id) && !job?.tech_declined_ids.includes(user.technician.id) &&
																<>
																	<Button className="btn app-btn mr-3 mb-2"
																		onClick={scheduledCancelByTech}
																		name={job.id}
																		title="You will no longer see this job if you click on this button.">Cancel<span></span></Button>
																</>
															}
														</div>
													</div>
												)
												: <></>
											}

											{rejectedCalls.length > 0
												&& <hr className="w-100" />}
											{rejectedCalls.length > 0
												&& rejectedCalls.map((j, i) => (
													<Table key={i}>
														<thead>
															<tr>
																<th className="label-name">
																	<b>Rejected by:</b>
																	{' '}
																	{j.technician}
																</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																<td className="label-value medium-font">
																	<b>Reason:</b>
																	{' '}
																	{j.reason}
																</td>
															</tr>
														</tbody>
													</Table>
												))}

											{techCancellation.length > 0
												&& <hr className="w-100" />}
											{techCancellation.length > 0
												&& techCancellation.map((j, c) => (
													<Table key={c}>
														<thead>
															<tr>
																<th className="label-name">
																	<b>Cancelled by:</b>
																	{' '}
																	{j?.technician}
																</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																<td className="label-value medium-font">
																	<b>Reason:</b>
																	{' '}
																	{j?.reason}
																</td>
															</tr>
														</tbody>
													</Table>
												))}

											{job?.custCancellation?.reason &&
												<>
													<Table>
														<thead>
															<tr>
																<th className="label-name">
																	<b>Cancelled By:</b>
																	{' '}
																	{user.userType === 'customer' &&
																		'You'
																	}
																	{user.userType === 'technician' && job.customer &&
																		<>
																			Customer {job.customer.user.firstName + ' ' + job.customer.user.lastName}
																		</>
																	}
																</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																<td className="label-value medium-font">
																	<b>Reason:</b>
																	{' '}
																	{job.custCancellation.reason}
																</td>
															</tr>
														</tbody>
													</Table>
												</>
											}
										</Col>
										<Col xs="12" />
									</Row>
								</Panel>

								{!fromEmail && (
									<>
										{job.status != 'long-job' &&
											<Panel header={(user && user.userType === 'technician' ? 'Client Comments' : 'Technician Comments')} key="4" className="mb-4 py-3 px-2">
												{user && user.userType === 'technician'
													&& (
														<>
															{customerFeedback.issues && customerFeedback.issues.length > 0
																&& (customerFeedback.issues.length === 1 && customerFeedback.issues[0] !== "") && (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{customerFeedback.issues.map((ci, c) => (<li key={c}>{ci}</li>))}
																		</ul>
																	</span>
																)}
															{customerFeedback.comments && customerFeedback.comments !== ''
																? (
																	<span className="medium-font">
																		{customerFeedback.comments}
																	</span>
																)
																: <span className="medium-font">No comments available.</span>}
														</>
													)}
												{user && user.userType === 'customer'
													&& (
														<>
															{technicianFeedback.issues && technicianFeedback.issues.length > 0 && (technicianFeedback.issues.length === 1 && technicianFeedback.issues[0] !== "")
																&& (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{technicianFeedback.issues.map((ti, t) => (
																				<li key={t}>{ti}</li>
																			))}
																		</ul>
																	</span>
																)}
															{technicianFeedback.comments && technicianFeedback.comments !== ''
																? (
																	<span className="medium-font">
																		{technicianFeedback.comments}
																	</span>
																)
																: <span className="medium-font">No comments available.</span>}
														</>
													)}
											</Panel>
										}

										{job.status != 'long-job' &&
											<Panel header={`${job && job.customer && job.customer.user ?
												(job.customer.user.id === user.id ? "Your"
													: (!fromCustomerHistory || job.technician.id === user?.technician?.id) ? "Your"
														: "Technician's")
												: "Your"} comments to ${user && user.userType === 'technician' ? 'client' : 'technician'}`} key="5" className="mb-4 py-3 px-2">
												{user && user.userType === 'customer'
													&& (
														<>
															{customerFeedback.issues && customerFeedback.issues.length > 0
																&& (customerFeedback.issues.length === 1 && customerFeedback.issues[0] !== "") && (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{customerFeedback.issues.map((ci, f) => (<li key={f}>{ci}</li>))}
																		</ul>
																	</span>
																)}
															{customerFeedback.comments && customerFeedback.comments !== ''
																? (
																	<span className="medium-font">
																		{customerFeedback.comments}
																	</span>
																)
																: <span className="medium-font">No comments available.</span>}
														</>
													)}
												{user && user.userType === 'technician'
													&& (
														<>
															{technicianFeedback.issues && technicianFeedback.issues.length > 0
																&& (technicianFeedback.issues.length === 1 && technicianFeedback.issues[0] !== "") && (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{technicianFeedback.issues.map((ti, t) => (<li key={t}>{ti}</li>))}
																		</ul>
																	</span>
																)}

															{technicianFeedback.comments && technicianFeedback.comments !== ''
																? (
																	<span className="medium-font">
																		{technicianFeedback.comments}
																	</span>
																)
																: <span className="medium-font">No comments available.</span>}
														</>
													)}
											</Panel>
										}
										<div id='my-div'>
											{displayChatPanel(job)}
										</div>
									</>
								)}

								{job && job.status === 'Completed' && (
									<Panel header="Feedback" key="6" className="mb-4 py-3 px-2 feedback-panel">
										<Row>
											<Col md="6" className="mt-3 mb-4">
												<Row>
													<Col xs="12">
														<span className="label-name medium-font">
															{user && user.userType === 'technician'
																&& <>Client`s </>}
															{user && user.userType === 'customer'
																&& <>Tech`s </>}
															feedback to
															{job.technician.id === user?.technician?.id ? <> you</> : <> Technician</>}
														</span>
													</Col>
													<Col xs="12" className="mt-4">
														<span className="job-rating">
															{user && user.userType === 'technician'
																&& (
																	<>
																		<Rate disabled defaultValue={customerFeedback.rating} />
																		{' '}
																		<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(customerFeedback.rating && customerFeedback.rating > 0 ? `${customerFeedback.rating}.00` : '0.00')}</span>
																	</>
																)}
															{user && user.userType === 'customer'
																&& (
																	<>
																		<Rate disabled defaultValue={technicianFeedback.rating} />
																		{' '}
																		<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(technicianFeedback.rating && technicianFeedback.rating > 0 ? `${technicianFeedback.rating}.00` : '0.00')}</span>
																	</>
																)}
														</span>
													</Col>
												</Row>
											</Col>
											<Col md="6" className="mt-3 mb-4">
												<Row>
													<Col xs="12">
														<span className="label-name medium-font">
															{job && job.customer && job.customer.user ? (job.customer.user.id === user.id ? "Your" : job.technician.user.firstName) : "Your"}  feedback to a
															{user && user.userType === 'technician'
																&& <> client</>}
															{user && user.userType === 'customer'
																&& <> tech</>}
															.
														</span>
													</Col>
													<Col xs="12" className="mt-4">
														<span className="job-rating">
															<span className="job-rating">
																{user && user.userType === 'customer'
																	&& (
																		<>
																			<Rate disabled value={customerFeedback.rating} />
																			{' '}
																			<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(customerFeedback.rating && customerFeedback.rating > 0 ? `${customerFeedback.rating}.00` : '0.00')}</span>
																		</>
																	)}
																{user && user.userType === 'technician'
																	&& (
																		<>
																			<Rate disabled value={technicianFeedback.rating} />
																			{' '}
																			<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(technicianFeedback.rating && technicianFeedback.rating > 0 ? `${technicianFeedback.rating}.00` : '0.00')}</span>
																		</>
																	)}
															</span>
														</span>
													</Col>
													<Col xs="12" className="mt-4 pl-5">
														<Modal
															title="Change Feedback"
															onCancel={() => { setShowChangeFeedbackModal(false); }}
															visible={showChangeFeedbackModal}
															className="change-feedback-modal"
															footer={[
																<Button
																	className="btn app-btn app-btn-light-blue app-btn-small"
																	onClick={() => { setShowChangeFeedbackModal(false); }}
																	disabled={submitFeedbackCalled}
																>
																	<span />
																	Cancel
																</Button>,
																<Button
																	className="btn app-btn app-btn-small"
																	onClick={handleChangeFeedback}
																	disabled={submitFeedbackCalled}
																>
																	{submitFeedbackCalled
																		? <Spin />
																		: (
																			<>
																				<span />
																				Submit
																			</>
																		)}
																</Button>,
															]}
														>
															<Row className="transfer-call-outer">
																<Loader height="100%" className={(showChangeFeedbackLoader ? 'loader-outer' : 'd-none')} />

																<Col xs={12} className="my-3 text-center">
																	<h6 className="title font-weight-bold">
																		WAS
																		{' '}
																		{(user && user.userType === 'customer' ? 'YOUR' : 'CLIENT')}
																		{' '}
																		PROBLEM RESOLVED?
																	</h6>
																	<div className="section_sub_one mt-2">
																		<Button
																			className={`${problemSolved === 'yes' ? 'active' : ''} change-feedback-btn yes mr-3`}
																			onClick={() => { toggle_solved('yes'); }}
																		>
																			<span />
																			{' '}
																			Yes
																		</Button>
																		<Button
																			className={`${problemSolved === 'no' ? 'active' : ''} change-feedback-btn no`}
																			onClick={() => { toggle_solved('no'); }}
																		>
																			<span />
																			{' '}
																			No
																		</Button>
																	</div>
																</Col>

																{showYesBlock && (
																	<Col xs={12} className="my-3 text-center">
																		<Alert variant="success" className="p-0 pt-2">
																			<div className="alert-heading h5">Glad we could help!</div>
																		</Alert>
																	</Col>
																)}

																{showNoBlock && user && user.userType === 'customer' && (
																	<Col xs={12} className="my-3">
																		<p className="title font-weight-bold"> Sorry we couldn't solve your issue. Help us understand what went wrong! </p>
																		<div className="section_sub_three">
																			<Checkbox
																				value="Technician was not knowledgeable."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf('Technician was not knowledgeable.') !== -1}
																			>
																				Technician was not knowledgeable.
																			</Checkbox>
																			<br />
																			<Checkbox
																				value="Audio or screen share was not clear."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf('Audio or screen share was not clear.') !== -1}
																			>
																				Audio or screen share was not clear.
																			</Checkbox>
																			<br />
																			<Checkbox
																				value="I couldn't understand technician's language."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf("I couldn't understand technician's language.") !== -1}
																			>
																				I couldn't understand technician's language.
																			</Checkbox>
																			<br />
																			<Checkbox
																				value="Others."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf('Others.') !== -1}
																			>
																				Others.
																			</Checkbox>

																			<Panel header={`${job && job.customer && job.customer.user ? (job.customer.user.id === user.id ? "Your" : "Your") : "Your"} comments to ${user && user.userType === 'technician' ? 'client' : 'technician'}`} key="5" className="mb-4 py-3 px-2">
																				{user && user.userType === 'customer'
																					&& (
																						<>
																							{customerFeedback.issues && customerFeedback.issues.length > 0
																								&& (customerFeedback.issues.length === 1 && customerFeedback.issues[0] !== "") && (
																									<span className="medium-font">
																										<ul className="pl-3 m-0 mb-2">
																											{customerFeedback.issues.map((ci, c) => (<li key={c}>{ci}</li>))}
																										</ul>
																									</span>
																								)}
																							{customerFeedback.comments && customerFeedback.comments !== ''
																								? (
																									<span className="medium-font">
																										{customerFeedback.comments}
																									</span>
																								)
																								: <span className="medium-font">No comments available.</span>}
																						</>
																					)}
																				{user && user.userType === 'technician'
																					&& (
																						<>
																							{technicianFeedback.issues && technicianFeedback.issues.length > 0
																								&& (technicianFeedback.issues.length === 1 && technicianFeedback.issues[0] !== "") && (
																									<span className="medium-font">
																										<ul className="pl-3 m-0 mb-2">
																											{technicianFeedback.issues.map((ti) => (<li>{ti}</li>))}
																										</ul>
																									</span>
																								)}
																							{technicianFeedback.comments && technicianFeedback.comments !== ''
																								? (
																									<span className="medium-font">
																										{technicianFeedback.comments}
																									</span>
																								)
																								: <span className="medium-font">No comments available.</span>}
																						</>
																					)}
																			</Panel>
																		</div>
																	</Col>
																)}

																{showNoBlock && user && user.userType === 'technician' && (
																	<Col xs={12} className="my-3">
																		<p className="title font-weight-bold"> Sorry we couldn't solve your issue. Help us understand what went wrong! </p>
																		<div className="section_sub_three">
																			<Checkbox
																				value="Customer was not knowledgeable."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf('Customer was not knowledgeable.') !== -1}
																			>
																				Customer was not knowledgeable.
																			</Checkbox>
																			<br />
																			<Checkbox
																				value="Audio or screen share was not clear."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf('Audio or screen share was not clear.') !== -1}
																			>
																				Audio or screen share was not clear.
																				{checkboxIssues.indexOf('Audio or screen share was not clear.')}
																			</Checkbox>
																			<br />
																			<Checkbox
																				value="I couldn't understand customer's language."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf("I couldn't understand customer's language.") !== -1}
																			>
																				I couldn't understand customer's language.
																				{checkboxIssues.indexOf("I couldn't understand customer's language.")}
																			</Checkbox>
																			<br />
																			<Checkbox
																				value="Others."
																				onChange={setIssueCheckbox}
																				className="checkbox-font"
																				checked={checkboxIssues.indexOf('Others.') !== -1}
																			>
																				Others.
																			</Checkbox>
																		</div>
																	</Col>
																)}

																<Col xs={12} className="my-3 text-center">
																	{user && user.userType === 'technician' ? <p className="title font-weight-bold"> RATE THE CLIENT </p> : <p className="title font-weight-bold"> RATE YOUR GEEK </p>}

																	<div className="section_sub_four">
																		<Rate onChange={ratingChanged} value={rating} style={{ fontSize: 30, color: '#1BD4D5' }} />
																	</div>
																</Col>

																<Col xs={12} className="my-3 text-center">
																	{user && user.userType === 'technician'
																		? (
																			<p className="title font-weight-bold">
																				Meeting Notes
																				{' '}
																				<span className="red-text">*</span>
																			</p>
																		)
																		: <p className="title"> COMMENTS </p>}
																	<div className="section_sub_five">
																		<textarea className="w-100 p-2" spellCheck rows={4} onChange={handleChangeText} id="textarea">
																			{summary}
																		</textarea>
																	</div>
																</Col>
															</Row>
														</Modal>
													</Col>
												</Row>
											</Col>
										</Row>
									</Panel>
								)}
							</Collapse>
						</Col>

						{setShowFeedbackModal && <FeedbackCompulsionModal user={user} isModalOpen={showFeedbackModal} jobId={FeedbackJobId} />}

						<LongJobSubmission
							showSubmisssionModal={showSubmisssionModal}
							setShowSubmisssionModal={setShowSubmisssionModal}
							minutesLongJobSubmission={minutesLongJobSubmission}
							job={job}
							handleApprovalModal={handleApprovalModal}
							totalJobTimeToPass={totalJobTimeToPass}
							totalSecondsToPass={totalSecondsToPass}
							user={user}
							fetchJob={fetchJob}
							hoursWillNotAdd={hoursWillNotAdd}
							setHoursWillNotAdd={setHoursWillNotAdd}
							setshowAdditionalHoursApproveButtons={setshowAdditionalHoursApproveButtons}
						/>
					</Row>
				</Col>
			</Col>
		</>
	);
};

export default JobDetail;

const TimeDecider = (props) => {
	let selectedDate = '';
	if (props.job.schedule_accepted_on === 'primary') {
		selectedDate = new Date(props.job.primarySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
	} else {
		selectedDate = new Date(props.job.secondrySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
	}
	return <td className="label-value medium-font">{selectedDate}</td>;
};

const ScheduleTimer = (props) => {
	timeInt = setInterval(() => {
		let selectedTime = '';
		if (props.job.schedule_accepted_on === 'primary') {
			selectedTime = new Date(props.job.primarySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
		} else {
			selectedTime = new Date(props.job.secondrySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
		}
		const countDownDate = new Date(selectedTime).getTime();
		const DATE_OPTIONS_FOR_TIMER = {
			weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: props.user.timezone,
		};
		const timeNow = new Date(new Date().toLocaleTimeString('en-US', DATE_OPTIONS_FOR_TIMER)).getTime();
		const distance = countDownDate - timeNow;
		let days = Math.floor(distance / (1000 * 60 * 60 * 24));
		let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((distance % (1000 * 60)) / 1000);

		if (days < 9 || days === 9) {
			days = `0${days}`;
		}
		if (hours < 9 || hours === 9) {
			hours = `0${hours}`;
		}
		if (minutes < 9 || minutes === 9) {
			minutes = `0${minutes}`;
		}
		if (seconds < 9 || seconds === 9) {
			seconds = `0${seconds}`;
		}
		const timeLeft = `${days} : ${hours} : ${minutes} : ${seconds}`;
		if (distance > 0) {
			if (document.getElementById('timingDiv') != null) {
				document.getElementById('timingDiv').innerHTML = timeLeft;
			}
		}
		if (distance < 0) {
			props.setShowTimer(false);
			clearInterval(timeInt);
		}
	}, 1000);

	return <></>;
};
const MeetingButton = ({ showTimer, user, job, startCall, handleStartCall, socket, handleCustomerJoin,handleStartCallWithModal}) => {
	if (!showTimer && user && user.userType == 'customer' && job && job.status === 'Accepted' && job.schedule_accepted && job.technician_started_call) {
		return <Button className="btn app-btn app-btn-large app-btn-light-blue-remove" onClick={(e) => { handleCustomerJoin(e, job) }}>
			<span />
			Join
		</Button>
	}

	if (!showTimer && user && user.userType == 'customer' && job && job.status === 'Scheduled' && job.schedule_accepted !== false) {
		return <Button className="btn app-btn app-btn-large app-btn-light-blue-remove mr-2 mb-2" onClick={startCall}>
			<span />
			Start Call with Technician
		</Button>
	}
	if (!showTimer && user && user.userType == 'technician' && job && job.status === 'Scheduled' && job.schedule_accepted !== false && job.technician.user.id === user.id) {
		 return <Button className="btn app-btn app-btn-large app-btn-light-blue-remove mb-2" onClick={(e) => { handleStartCallWithModal(e, job.id, socket) }}>
			<span />
			Start Call with Customer
		</Button>
	}
	return <></>

}
const Link = style(DOM.Link)`
		cursor:pointer;
`;
