import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Pagination } from 'antd';
import { Row, Col, Tabs, Tab, Button, Dropdown } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router';
import DashboardTable from '../../../components/Dashboard/Table';
import { useUser } from '../../../context/useContext';
import { useAuth } from '../../../context/authContext';
import { useJob } from '../../../context/jobContext';
import { useSocket } from '../../../context/socketContext';
import * as JobApi from '../../../api/job.api';
import Loader from '../../../components/Loader';
import 'bootstrap/dist/css/bootstrap.min.css';
import { openNotificationWithIcon, handleStartCall, get_or_set_cookie, checkJobValidations, queryDecider, GAevent, PushUserDataToGtm } from '../../../utils';
import ReactGA from 'react-ga';
import mixpanel from 'mixpanel-browser';
import { GOOGLE_ANALYTICS_PROPERTY_ID } from '../../../constants';
import LogRocket from 'logrocket';
import * as WebSocket from '../../../api/webSocket.api';
import AddToCalendarHOC, { SHARE_SITES } from 'react-add-to-calendar-hoc';
import moment from 'moment';
import * as JobService from "../../../api/job.api";
import FeedbackCompulsionModal from '../../Technician/feedbackCompulsion';
import { isMobile } from 'react-device-detect';
import { useServices } from '../../../context/ServiceContext';
import JobCancelFrom from '../components/jobCancelFrom';
import { useTools } from '../../../context/toolContext';
import * as FullStory from '@fullstory/browser';
import { debounce } from 'lodash';
import { checkPendingStatus } from '../../../utils';
import { JOB_STATUS } from '../../../constants/index';
import * as UserApi from '../../../api/users.api';

let mainSoftwareWithoutState = [];
let subSoftwareWithoutState = [];
let activeTabGlobal = ''
const duration = 2

const Dashboard = ({ setcurrentStep, setjobId, setType, setOpenNotification, ShowBadge, hideBadge, setActiveMenu, toggle }) => {
	const { checkIfTwoTierJobAndExpertTech } = useServices();
	const { socket } = useSocket();
	const [showLoader, setShowLoader] = useState(true);
	const { refetch } = useAuth();
	const { user } = useUser();
	const { fetchJobByParams, allJobs, fetchJob, totalJobs, setTotalJobs, setAllJobs } = useJob();
	const [socketJobUpdated, setSocketJobUpdated] = useState(false)
	const history = useHistory();
	const [tableData, setTableData] = useState();
	const TabName = 'ActiveJobTab';
	const DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
	const [isLoading, setIsLoading] = useState(true);
	const [completedData, setCompletedData] = useState();
	const [proposalsData, setProposalsData] = useState([]);
	const [techCompletedData, setTechCompletedData] = useState();
	const [techMainSoftwares, setTechMainSoftwares] = useState([]);
	const [techSubSoftwares, setTechSubSoftwares] = useState([]);
	const [activeTabKey, setActiveTabKey] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [storedData, setStoredData] = useState({})
	const search = useLocation().search;
	const [scheduleMsg, setScheduleMsg] = useState(false);
	const [lastPendingSoftware, setLastPendingSoftware] = useState('');
	const tabNameInUrl = new URLSearchParams(search).get('t');
	const [tabInUrlLoaded, setTabInUrlLoaded] = useState(false);
	const AddToCalendarDropdown = AddToCalendarHOC(Button, Dropdown);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [FeedbackJobId, setFeedbackJobId] = useState('');
	const [isCancelModal, setIsCancelModal] = useState(false);
	const [cancelJobId, setCancelJobId] = useState(false);
	const [userType, setUserType] = useState(false);
	const [jobData, setJobData] = useState({})
	const { setJobFlowStep, jobFlowsDescriptions, startTimer, setShowChatButton, getTwilioConversationDetails } = useTools()
	const [isDisabled, setIsDisabled] = useState(false)
	const [customerConfirm, setCustomerConfirm] = useState(false);
	const [customerConfirmDraftJob, setCustomerConfirmDraftJob] = useState(false);
	const [customeJobIdDraftJob, setCustomeJobIdDraftJob] = useState();
	const [customerConfirmSameTech, setCustomerConfirmSameTech] = useState(false);
	const [customerData, setCustomerData] = useState();
	const [findSameTechnicianJobid, setFindSameTechnicianJobid] = useState();
	const [jobIdFromMessage, setJobIdFromMessage] = useState([])
	const [isCustomerStartCall, setIsCustomerStartCall] = useState(false)
	const [isTechnicianStartCall, setIsTechnicianStartCall] = useState(false)
	const queryParams = new URLSearchParams(search);

	const message = scheduleMsg
		? <span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
			One of your previous jobs of <b style={{ fontWeight: 'bold' }}>{lastPendingSoftware}</b> is already scheduled with a technician. Are you sure you want to create a new job post?if yes, then your previous job will be <b style={{ fontWeight: 'bold' }}>Cancelled</b>
		</span>
		: <span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
			We are still looking for a technician for your existing job of <b style={{ fontWeight: 'bold' }}>{lastPendingSoftware}</b>. Are you sure you want to create a new job post? if yes, then your previous job will be <b style={{ fontWeight: 'bold' }}>Cancelled</b>
		</span>;

	if (user && GOOGLE_ANALYTICS_PROPERTY_ID != null) {
		ReactGA.initialize(GOOGLE_ANALYTICS_PROPERTY_ID);
		ReactGA.ga('set', 'userId', user.id)
		ReactGA.ga('set', 'dimension1', user.id)
		ReactGA.ga('send', 'pageview', '/dashboard')

		LogRocket.identify(user.id, {
			name: user.firstName,
			email: user.email,
		});

		FullStory.identify(user.id, {
			displayName: user.firstName,
			email: user.email
		});
	}

	useEffect(() => {
		(async function () {
			const jobDetails = window.sessionStorage.getItem("chatScreen")
			if (jobDetails) {
				const jobid = jobDetails;
				await fetchJob(jobid)
				await setjobId(jobid)
				let jobResponse = await JobService.retrieveJob(jobid)
				setType("details")
				if (jobResponse.schedule_accepted == false && user && user.userType == 'technician' && jobResponse.tech_declined_ids.includes(user.technician.id) == false) {
					setType("apply")
				}
				if (user.userType === 'technician') {
					mixpanel.identify(user.email);
					mixpanel.track('Technician  - Click on Job details from dashboard page ', { 'JobId': jobid });
				} else {
					mixpanel.identify(user.email);
					mixpanel.track('Customer -  Click on Job details from dashboard page', { 'JobId': jobid });
				}
				setcurrentStep(6)
			}
			if (queryParams.get("chatScreen")) {

			}
		})()
	}, [])

	useEffect(() => {
		if (tabNameInUrl && !tabInUrlLoaded && user) {
			setTabInUrlLoaded(true);
			if (tabNameInUrl === 'cmp') {
				let main_software = [];
				let sub_software = [];
				if (user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed")) {
					const { expertise } = user.technician;
					fillSoftwares(expertise, main_software, sub_software)
				}
				setTimeout(function () {
					if (user && user.userType === "technician") {
						setTechMainSoftwares(main_software)
						setTechSubSoftwares(sub_software)
						mainSoftwareWithoutState = main_software;
						subSoftwareWithoutState = sub_software;
						changeTab('Completed Jobs Tech')
					} else {
						changeTab('Completed Jobs')
					}
				}, 500)
			}
			if (tabNameInUrl === 'sub') {
				setTimeout(function () {
					if (user && user.userType === "technician") {

					} else {
						setcurrentStep(10);
					}
				}, 500)
			}
		}
	}, [tabNameInUrl])

	/**
	 * @params : job Type(Object)
	 * @response: join rooms for the accepted jobs  technicians and customers
	 * @author :Sahil
	 * */
	const joinRoomsForAcceptedJobsCustomerAndTechnician = (job) => {
		try {
			if (job.status === 'Accepted' || job.status === 'Inprogress') {
				socket.emit("join", job.id)
			}
		}
		catch (err) {
			console.log("error in joinRoomsForAcceptedJobsCustomerAndTechnician >>>", err)
		}
	}

	const fillSoftwares = (expertise, main_software, sub_software) => {
		for (let i = 0; i <= expertise.length - 1; i++) {
			if (expertise[i].software_id) {
				if (!expertise[i].parent || expertise[i].parent === '0') {
					if (!main_software.includes(expertise[i].software_id)) {
						main_software.push(expertise[i].software_id);
					}
				} else {
					if (!main_software.includes(expertise[i].parent)) {
						main_software.push(expertise[i].parent);
					}
					if (!sub_software.includes(expertise[i].software_id)) {
						sub_software.push(expertise[i].software_id);
					}
				}
			}

		}
	}

	const findSameTechnician = async (e) => {
		e.stopPropagation()
		try {
			if (user && user.userType === 'customer' && user.customer) {
				let jobId = e.currentTarget.name
				setFindSameTechnicianJobid(e.currentTarget.name)
				let retrievedJob = await JobService.retrieveJob(jobId)
				let pendingJobs = await checkPendingStatus(user);
				if (pendingJobs.schedule_accepted) {
					setScheduleMsg(true);
				}
				if (pendingJobs.success) {
					setLastPendingSoftware(pendingJobs.name);
					setCustomerConfirmSameTech(true);
				} else {
					Modal.confirm({
						title: 'Are you sure you want to post this job again?',
						okText: "Yes",
						cancelText: "No",
						className: 'app-confirm-modal',
						okButtonProps: {
							id: 'post-with-same-tech-confirm', // Set the id for the "Yes" button
						},
						onOk() {
							mixpanel.identify(user.email)
							history.push(`/customer/profile-setup?jobId=${jobId}&repost=true&technicianId=${retrievedJob?.technician?.user?.id}`)
						}
					})
				}
			}
		} catch (e) {
			console.log('Error in checkPendingJobs', e);
		}
	}

	const handlePagination = async (page, pageSize) => {
		setIsLoading(true)
		setCurrentPage(page)
		let demoStoredData = { ...storedData }
		let pagination = { page: page, pageSize: pageSize, userType: (user.userType === "technician" ? user.technician.technicianType : user.customer.customerType), id: (user.userType === "technician" ? user?.technician?.id : '') }
		let query = queryDecider(activeTabKey, user, false, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
		const res = await call_fetch_jobs(query, pagination)
		let temp = {}
		temp[[JSON.stringify(page)]] = res
		temp['totalJobs'] = totalJobs
		demoStoredData[activeTabKey] = temp
		setStoredData(demoStoredData)
		setIsLoading(false)
	}

	const changeTab = useCallback(async (k, fromSocket = false) => {
		setIsLoading(true)
		let query = queryDecider(k, user, false, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
		let technicianAcceptanceArr = ["incomplete_profile", "completed"]
		setActiveTabKey(k)
		let demoStoredData = { ...storedData }
		let condition1 = k !== activeTabKey && !Object.keys(demoStoredData).includes(k)
		if (user.userType === "technician" && !technicianAcceptanceArr.includes(user.technician.registrationStatus)) {
			setIsLoading(false)
			return;
		}
		if (condition1 || fromSocket) {
			const res = await call_fetch_jobs(query)
			let theKey = JSON.stringify(1)
			let temp = {}
			setCurrentPage(1)
			temp[theKey] = res
			demoStoredData[k] = temp
			setStoredData(demoStoredData)
		}
		else {
			if (demoStoredData !== undefined && demoStoredData !== null && Object.keys(demoStoredData).length != 0 && demoStoredData[k] && Object.keys(demoStoredData[k]).length != 0) {
				let data = storedData[k][Object.keys(demoStoredData[k])[0]]["data"]
				setTotalJobs(storedData[k][Object.keys(demoStoredData[k])[0]]['totalCount'])
				setAllJobs({ "data": data })
				setCurrentPage(parseInt(Object.keys(demoStoredData[k])[0]))
			}
		}
		setIsLoading(false)

	}, [activeTabKey]);
	const location = useLocation();

	const push_to_job_detail = async (e) => {
		e.currentTarget.disabled = true;
		e.stopPropagation();
		const jobid = e.currentTarget.name;
		await fetchJob(jobid)
		await setjobId(jobid)
		let jobResponse = await JobService.retrieveJob(jobid)
		setType("details")
		if (jobResponse.schedule_accepted == false && user && user.userType == 'technician' && jobResponse.tech_declined_ids.includes(user.technician.id) == false) {
			setType("apply")
		}
		if (user.userType === 'technician') {
			mixpanel.identify(user.email);
			mixpanel.track('Technician  - Click on Job details from dashboard page ', { 'JobId': jobid });
		} else {
			mixpanel.identify(user.email);
			mixpanel.track('Customer -  Click on Job details from dashboard page', { 'JobId': jobid });
		}
		setcurrentStep(6)
	};

	const push_to_job_detailForChat = async (e) => {
		e.stopPropagation();
		const jobid = e.currentTarget.name;
		await fetchJob(jobid)
		await setjobId(jobid)
		await JobApi.updateJob(jobid, { tech_message_dashbord: false })
		setJobIdFromMessage([])
		setShowChatButton(true)
		let jobResponse = await JobService.retrieveJob(jobid)
		setType("details")
		if (jobResponse.schedule_accepted == false && user && user.userType == 'technician' && jobResponse.tech_declined_ids.includes(user.technician.id) == false) {
			setType("apply")
		}
		if (user.userType === 'technician') {
			mixpanel.identify(user.email);
			mixpanel.track('Technician  - Click on Job details from dashboard page ', { 'JobId': jobid });
		} else {
			mixpanel.identify(user.email);
			mixpanel.track('Customer -  Click on Job details from dashboard page', { 'JobId': jobid });
		}
		setcurrentStep(6)
	};

	/**
	 * Function will check if status of job is draft then redirect user to Job summary page  .
	 * @author : Mritunjay
	**/
	const push_to_post_draft_job = async (e) => {
		e.stopPropagation();
		try {
			if (user && user.userType === 'customer' && user.customer) {
				let data = e.currentTarget.name;
				const jobid = e.currentTarget.name;
				let jobResponse = await JobService.retrieveJob(jobid)
				setCustomeJobIdDraftJob(data)
				let pendingJobs = await checkPendingStatus(user)
				if (pendingJobs.schedule_accepted) {
					setScheduleMsg(true);
				}

				if (pendingJobs.success) {
					setLastPendingSoftware(pendingJobs.name);
					setCustomerConfirmDraftJob(true);
				} else {
					Modal.confirm({
						title: 'Are you sure you want to post this job again?',
						okText: "Yes",
						cancelText: "No",
						className: 'app-confirm-modal',
						onOk: async () => {
							if (jobResponse.status === "Draft") {
								if (jobResponse.post_again_reference_technician) {
									window.location.href = `/customer/profile-setup?page=job-summary&jobId=${jobResponse.id}&technicianId=${jobResponse.post_again_reference_technician}`
								} else {
									window.location.href = `/customer/profile-setup?page=job-summary&jobId=${jobResponse.id}`;
								}
							}
						},
					})
				}
			}
		} catch (e) {
			console.log('Error in checkPendingJobs', e);
		}
	};

	const push_to_job_detail_with_apply_button = (e) => {
		e.currentTarget.disabled = true;
		const jobid = e.currentTarget.name;
		fetchJob(jobid)
		setjobId(jobid)
		setType("apply")
		setcurrentStep(6)
		if (user) {
			mixpanel.identify(user.email);
			mixpanel.track(`${user.userType}- Apply for this job from dashboard`, { 'JobId': jobid });
		}
	};

	const CancelTheJob = (e) => {
		e.stopPropagation()
		const job = JSON.parse(e.currentTarget.name);
		console.log(" job ::::: ", job.id)
		setUserType("Customer")
		setCancelJobId(job.id)
		setJobData(job)
		setIsCancelModal(true)
	}

	useEffect(() => {
		try {
			if (user && user.userType === "technician") {
				filterJobsByTech()
			}
		} catch (err) {
			return
		}
	}, [socketJobUpdated, user])

	useEffect(() => {
		if (user && user.userType === "technician" && proposalsData && proposalsData.length === 0) {
			changeTab('Completed Jobs Tech')
		}
	}, [proposalsData])

	/**
	 * Function will check to show the scheduled job to technician or not if the job is post again reference to same technician.
	 * @params : user_id Type(String),JobData Type(Object)
	 * @response : return boolean value
	 * @author : Manibha
	 **/
	const checkIfPostAgainWithSameTech = (user_id, JobData) => {
		let checkVal = false
		if (JobData.status === 'Scheduled' && JobData.post_again_reference_technician != undefined && JobData.post_again_reference_technician === user_id) {
			checkVal = true
		} else if (JobData.status === 'Scheduled' && JobData.post_again_reference_technician == undefined) {
			checkVal = true
		}
		return checkVal
	}

	const handleAccepted = async (e) => {
		let job = JSON.parse(e.currentTarget.name)
		let jobId = job.id
		const res = await JobApi.retrieveJob(jobId);
		Modal.confirm({
			title: 'Are you sure you want to accept this job?',
			okText: "Yes",
			cancelText: "No",
			className: 'app-confirm-modal',
			async onOk() {
				let resultVal = await checkIfTwoTierJobAndExpertTech(user.technician, job)
				const check_feedback = await JobApi.checkLastJobFeedback({ 'technician': user.technician.id });
				await JobApi.updateJob(jobId, { acceptedJobTime: new Date() });
				if (resultVal == false) {
					openNotificationWithIcon('error', 'Error', 'This job is only for experts.Please contact admin to make you one.');
					window.location.reload();
				}
				else if (check_feedback.job_id != undefined) {
					setShowFeedbackModal(true)
					setFeedbackJobId(check_feedback.job_id)
				} else {
					let validation = checkJobValidations(user, jobId, location)
					if (validation) {
						try {
							await JobApi.sendJobAcceptEmail(jobId);
						} catch (err) {
							console.log("this is error in dashboard.js:: ", err)
						}
					}
				}
			},
		});
	}

	/**
	 * @params : event Type(Object)
	 * @response : starts a call for technician
	 * @author : Sahil
	 * */
	const handleTechnicianCall = async (e) => {
		e.currentTarget.disabled = true;
		let jobId = e.currentTarget.name
		handleStartCall(e, jobId, socket)
	}

	const push_to_post_job = async (e) => {
		e.stopPropagation();
		try {
			if (user && user.userType === 'customer' && user.customer) {
				let data = e.currentTarget.name;
				setCustomerData(data)
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
						okButtonProps: {
							id: 'post-again-yes-button', // Set the id for the "Yes" button
						},
						onOk() {
							const jobid = data;
							mixpanel.identify(user.email);
							mixpanel.track('Customer - Post again from dashboard', { 'JobId': jobid });
							setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
							history.push(`/customer/start-profile-setup?jobId=${jobid}&repost=true`)
						},
					})
				}
			}
		} catch (e) {
			console.log('Error in checkPendingJobs', e);
		}
	};

	/**
	 * Following function is use to check pending jobs and Decline the Latest Pending JOb regarding the  status provided  for post again
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
								const jobid = customerData;
								mixpanel.identify(user.email);
								mixpanel.track('Customer - Post again from dashboard', { 'JobId': jobid });
								setJobFlowStep(jobFlowsDescriptions['jobDetailView']);
								history.push(`/customer/start-profile-setup?jobId=${jobid}&repost=true`);
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

	/**
	 * Following function is use to check pending jobs and Decline the Latest Pending JOb regarding the  status provided  for post again with same tech
	 * @return : call the nextJobSummaryPageHandler
	 * @author : Kartar Singh
	 **/
	const postAgainFunctionWithSameTech = async () => {
		if (user && user.userType === 'customer' && user.customer) {
			if (user) {
				try {
					const latestJob = await JobApi.latestpendingJobs({ "customer": user.customer.id });
					if (latestJob.total_pending_jobs > 0) {
						if (latestJob.last_pending_job.status === JOB_STATUS.PENDING || latestJob.last_pending_job.status === JOB_STATUS.WAITING || latestJob.last_pending_job.status === JOB_STATUS.SCHEDULED) {
							try {
								await JobApi.updateJob(latestJob?.last_pending_job?.id, { status: 'Declined' });
								let jobId = findSameTechnicianJobid
								let retrievedJob = await JobService.retrieveJob(jobId)
								mixpanel.identify(user.email)
								history.push(`/customer/profile-setup?jobId=${jobId}&repost=true&technicianId=${retrievedJob?.technician?.user?.id}`)
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
								const jobid = customeJobIdDraftJob;
								let jobResponse = await JobService.retrieveJob(jobid)
								if (jobResponse.status === "Draft") {
									if (jobResponse.post_again_reference_technician) {
										window.location.href = `/customer/profile-setup?page=job-summary&jobId=${jobResponse.id}&technicianId=${jobResponse.post_again_reference_technician}`
									} else {
										window.location.href = `/customer/profile-setup?page=job-summary&jobId=${jobResponse.id}`;
									}
								}
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


	const try_again_post_job = (e) => {
		if (user && user.userType === 'customer' && user.customer) {
			const jobid = e.currentTarget.name;
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Try again from dashboard', { 'JobId': jobid });
			setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
			history.push(`/customer/start-profile-setup?jobId=${jobid}&repost=true`)
		}

	};

	const isCompletedJob = async (jobId) => {
		const findJob = await JobService.retrieveJob(jobId);
		return findJob && findJob.status === 'Completed' ? true : false;
	}

	useEffect(() => {
		const dataArray = []
		socket.on("open-chat-panel-talkjs", async (data) => {
			dataArray.push(data);
			setJobIdFromMessage((prevData) => [...prevData, data])
			JobApi.updateJob(data, { tech_message_dashbord: true })
				.then(response => {
					// Handle the response or perform any necessary actions
					console.log("Job updated successfully:", response);
				})
				.catch(error => {
					// Handle any errors that occurred during the update process
					console.error("Error updating job:", error);
				});
		})
		socket.on("open-chat-panel-talkjs-for-customer", async (data) => {
			setJobIdFromMessage(data)
			await JobApi.updateJob(data, { tech_message_dashbord: true })
		})
	}, [])

	const handleScheduledDecline = async (e) => {
		const jobid = e.currentTarget.name;
		let msg = "Are you sure you want to decline this job?";
		Modal.confirm({
			title: msg,
			okText: "Yes",
			cancelText: "No",
			className: 'app-confirm-modal',
			onOk() {
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Job declined from dashboard', { 'JobId': jobid });
				decline_job_by_technician(jobid, false)
			},
		})
	}

	const handleScheduledCancel = (e) => {
		const job = e.currentTarget.name;
		setUserType("Technician")
		setCancelJobId(job)
		setIsCancelModal(true)
	}

	/**
	* This function will is common function for decline the job by tech
	* @response : jobid(Type: String): Job id which is declined by tech
	*		techAlert(Type:Boolean): True for other case and in schedule job decline it will only decline the without notification
	* @author : unknown
	* @note: this function updated by Ridhima Dhir by adding techAlert flag
	*/

	const decline_job_by_technician = async (jobid, alert = true, reason = null) => {
		// find job details
		let selectedJob = await JobApi.retrieveJob(jobid)
		let tech_id = user.technician.id
		let notifiedTechs = selectedJob.notifiedTechs;
		console.log("notifiedTechs ::: before", notifiedTechs)
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
			socket.emit("technician:schedule-job-declined", {
				"jobId": selectedJob.id,
				"technician_user": user,
				"reason": reason
			})
			console.log(">>>>>>>>>>>>>>>>>>>>>>sending schedule job >>>>>>>>>>>>>>>>", selectedJob)
			await socket.emit("send-schedule-alerts", {
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

	const pushToMeeting = async (e) => {
		e.currentTarget.disabled = true;
		console.log("target", e.currentTarget.disabled)
		const job = JSON.parse(e.currentTarget.name);
		if (job.status == 'long-job' && user && user.userType) {
			mixpanel.identify(user.email);
			mixpanel.track(`${user.userType} - Join long-job from dashboard`, { 'JobId': job.id });
			window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/${user.userType}/${job.id}`
		}
		if (job.status === "Accepted") {

			mixpanel.identify(user.email);
			mixpanel.track(`${user.userType} -Start Call from dashboard`, { 'JobId': job.id });
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
				console.error('pushToMeeting error in dashboard page one>>>', err)
				await WebSocket.customer_start_call(job)
			}

		}

		if (user.userType === "customer") {
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Join Call from dashboard', { 'JobId': job.id });
			socket.emit("meeting-started-by-customer", { jobData: job })
			let filter_dict = { 'status': 'Inprogress', 'customer': user.customer.id }
			const checkStatus = await isCompletedJob(job.id);
			if (checkStatus) {
				openNotificationWithIcon('error', 'Error', `Job is already completed from Technician side Please refresh your page !!`);
				return;
			}
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result) => {
				console.log('result.data>>>>>>>>>>>>', { jobId: job.id, result })
				for (let i = 0; i < result.jobs.data.length; i++) {
					if (user.customer.id === result.jobs.data[i].customer.id) {
						if (job.id == result.jobs.data[i].id) {
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
								console.error('pushToMeeting error in dashboard page two>>>', err)
								await WebSocket.customer_start_call(job)
							}
							socket.emit("invite-technician", { "job": job.id, "tech": job.technician })
							get_or_set_cookie(user)
							if (!result.jobs.data[0].GA_start_call_event_called) {
								//GA3 tag commented by Vinit on 24/04/2023.
								GAevent('Call Started', 'customer-start-call', result.jobs.data[0].id, user?.customer?.id)
								if (process.env.REACT_APP_URL) {
									const appUrl = process.env?.REACT_APP_URL?.split("/")[2] || false;
									PushUserDataToGtm('call_started', user, appUrl);
								}
								await JobApi.updateJob(result.jobs.data[0].id, { GA_start_call_event_called: true })
							}
							window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/customer/${job.id}`
						} else {
							openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
						}
						break;
					} else {
						console.log("Customer id did not matched !!!!!");
					}
				}
			});
		}
		else {
			let filter_dict = { 'status': 'Inprogress', 'technician': user.technician.id }
			const checkStatus = await isCompletedJob(job.id);
			if (checkStatus) {
				openNotificationWithIcon('error', 'Error', `Job is already completed from Customer side Please refresh your page !!`);
				return;
			}
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result) => {

				if (job.id == result.jobs.data[0].id) {
					mixpanel.identify(user.email);
					mixpanel.track('Technician - Join Call from dashboard', { 'JobId': job.id });
					get_or_set_cookie(user)
					if (!result.jobs.data[0].GA_start_call_event_called) {
						//GA3 tag commented by Vinit on 24/04/2023.
						GAevent('Call Started', 'tech-start-call', result.jobs.data[0].id, user.technician.id)
						await JobApi.updateJob(result.jobs.data[0].id, { GA_start_call_event_called: true })
					}
					window.location.href = process.env.REACT_APP_MEETING_PAGE + `/meeting/technician/${job.id}`
				} else {
					openNotificationWithIcon('error', 'Error', 'Looks like you are busy in another meeting. Please end the other meeting to join this one.')
				}

			});
		}
	}

	const SetPostAgainButton = ({ job, data }) => {

		const handlePostAgain = debounce((e, jobId) => {
			setIsDisabled(true);
			data.postAgain(e, jobId);
			setIsDisabled(false);
		}, 300, { leading: true, trailing: false });

		const handleSameTech = debounce((e, jobId) => {
			setIsDisabled(true);
			data.sameTech(e, jobId);
			setIsDisabled(false);
		}, 300, { leading: true, trailing: false });

		let stat_arr = ['Completed']
		if (stat_arr.includes(job.status)) {
			if (stat_arr.includes(job.status)) {
				return <>
					<TableButton
						id='post-again-btn'
						disabled={isDisabled}
						onClick={(e) => { handlePostAgain(e, data.jobId) }}
						jobId={data.jobId}
						text="Post Again"
					/>
					<TableButton
						id="post-again-same-tech-btn"
						disabled={isDisabled}
						onClick={(e) => { handleSameTech(e, data.jobId) }}
						jobId={data.jobId}
						text="Post again with same technician"
					/>
				</>
			}
			else {
				return <TableButton
					id="post-again-btn2"
					onClick={data.tryAgain}
					jobId={data.jobId}
					text="Post Again"
				/>
			}
		}
		else {
			return <></>
		}

	}

	const SetForDeclinedPostAgainButton = ({ job, data }) => {
		let string_arr = ['Declined']
		if (string_arr.includes(job.status)) {
			return <>
				<TableButton
					id="post-again-declined-job"
					onClick={data.postAgain}
					jobId={data.jobId}
					text="Post Again"
				/>
			</>
		} else {
			return <></>
		};
	};


	const setData = async (JobData, data, doneData, pendingData, declineData, techCompletedData, techDeclinedData, techProposalsData, jobId = false, technicianId = false, loader = false) => {
		if (isCustomerStartCall) {
			techProposalsData = []
		}
		if (isTechnicianStartCall) {
			data = []
			techProposalsData = []
		}

		if (JobData.length > 0) {
			for (var k in JobData) {
				let temp = {};

				temp.key = JobData[k].JobId;
				if (JobData[k].software) {
					temp.software = JobData[k].software.name;
				} else {
					temp.software = 'None';
				}

				if (JobData[k].subSoftware) {
					temp.SubSoftware = JobData[k].subSoftware.name;
				} else {
					temp.SubSoftware = 'Others';
				}

				temp.date = JobData[k].createdAt;

				if (JobData[k].technician != undefined && JobData[k].technician.user != undefined && JobData[k].technician.user.firstName != undefined) {

					temp.technician = JobData[k].technician.user.firstName
				}
				else {
					temp.technician = "None"
				}

				if (JobData[k].customer && JobData[k].customer.status == 'deleted' && JobData[k].customer.user) {

					temp.customer = 'NA'
				}
				else {

					if (user && user.userType === 'customer') {
						temp.customer = JobData[k].customer?.user?.firstName;
					} else if (user && user?.userType === 'technician') {
						let businessName = '';
						temp.customer = JobData[k]?.customer?.user?.firstName
						if (JobData[k].customer?.user?.roles[0] === 'owner' && JobData[k].customer?.user?.isBusinessTypeAccount) {
							businessName = JobData[k]?.customer?.user?.businessName;
							temp.customer = JobData[k].customer?.user?.firstName + (businessName ? ' ' + '[' + businessName + ']' : '');

						}
						// Replace with your desired logic or JSX code
						if (JobData[k]?.customer?.user?.roles[0] === 'admin' || JobData[k]?.customer?.user?.roles[0] === 'user') {
							if (JobData[k]?.customer?.user?.ownerId) {
								const ownerUserInfo = await UserApi.getUserById(JobData[k]?.customer?.user?.ownerId);
								if (ownerUserInfo.isBusinessTypeAccount) {
									businessName = ownerUserInfo.businessName;
									console.log("User admin or user dashboard", ownerUserInfo);
									temp.customer = JobData[k].customer?.user?.firstName + (businessName ? ' ' + '[' + businessName + ']' : '');
								}
							}
						}
					}
				}

				temp.estimatedWait = JobData[k].software && JobData[k].software.estimatedWait ? JobData[k].software.estimatedWait : 'None'
				temp.estimatedTime = JobData[k].software && JobData[k].estimatedTime ? JobData[k].estimatedTime : 'None'
				temp.subOption = JobData[k].software && JobData[k].subOption ? JobData[k].subOption : 'None'
				temp.estimatedPrice = JobData[k].estimatedPrice ? JobData[k].estimatedPrice : 'None'
				temp.jobData = JobData[k] ? JobData[k] : {}
				temp.tech_search_start_at = JobData[k].tech_search_start_at ? JobData[k].tech_search_start_at : new Date()
				temp.tech_search_time = JobData[k].tech_search_time ? JobData[k].tech_search_time : 900000
				temp.notifiedTechs = JobData[k].notifiedTechs ? JobData[k].notifiedTechs : []
				temp.cardPreAuthorization = JobData[k].cardPreAuthorization !== undefined ? JobData[k].cardPreAuthorization : false
				if (user && user.userType === 'customer') {
					console.log("runinig >>>>")
					console.log("JobData[k] .accepted >>>", JobData[k])
					joinRoomsForAcceptedJobsCustomerAndTechnician(JobData[k])
					let jobId = JobData[k].id
					let index = k
					let tryAgain = try_again_post_job
					let postAgain = push_to_post_job
					let sameTech = findSameTechnician
					let dataForComp = {
						index: index,
						postAgain: postAgain,
						tryAgain: tryAgain,
						jobId: jobId,
						sameTech: sameTech
					}
					temp.action = (
						<Col key={JobData.id}>
							{user && JobData[k] && JobData[k].customer && JobData[k].customer.user && JobData[k].customer.user.id === user.id && JobData[k].status !== "Draft" &&
								<SetPostAgainButton job={JobData[k]} data={dataForComp} />}
							<Button className="mb-2 btn app-btn" onClick={push_to_job_detail} name={`${JobData[k].id}`} title="Click to see job details.">Details<span></span></Button>

							{user && JobData[k] && JobData[k].customer && JobData[k].customer.user && JobData[k].customer.user.id === user.id && JobData[k].status === 'Declined' && <SetForDeclinedPostAgainButton job={JobData[k]} data={dataForComp} />}

							{(JobData[k].status === 'Draft') && user && JobData[k].customer.user.id === user.id
								&& <Button className="mb-2 btn app-btn" onClick={push_to_post_draft_job} name={`${JobData[k].id}`} title="Please post job agian with valid card.">Post<span></span></Button>}

							{JobData[k].status === "Scheduled" && JobData[k].customer?.id === user?.customer?.id &&
								<React.Fragment key="scheduled">
									<div className="addToCalendar-geeker mb-2">
										<AddToCalendarDropdown
											event={{
												'title': 'Geeker Job',
												duration,
												'description': JobData[k].issueDescription,
												'startDatetime': moment.utc(JobData[k].primarySchedule).format('YYYYMMDDTHHmmssZ'),
												'endDatetime': moment.utc(new Date(new Date(JobData[k].primarySchedule).setHours(new Date(JobData[k].primarySchedule).getHours() + 2))).format('YYYYMMDDTHHmmssZ'),
											}}
											buttonProps={{
												'className': 'thisssssssssss'
											}}
											items={[SHARE_SITES.GOOGLE, SHARE_SITES.OUTLOOK]}
										/>
									</div>

									{JobData[k].customer?.id === user?.customer?.id &&
										<Button className="mb-2 btn app-btn" onClick={CancelTheJob} data-tech={`${technicianId}`} name={`${JSON.stringify(JobData[k])}`}>Cancel<span></span></Button>
									}
								</React.Fragment>
							}

							<MeetingButton job={JobData[k]} pushToMeeting={pushToMeeting} user={user} isMobile={isMobile} technicianId={technicianId} />

						</Col>
					);

					// This Condition  will run for the job status that is mentioned in the if condition
					if (JobData[k].status === 'Scheduled' || JobData[k].status === 'Accepted' || JobData[k].status === 'Waiting'
						|| (JobData[k].status === 'Inprogress' && JobData[k].technician && user.technician && JobData[k].technician.id === user.technician.id)
						|| (JobData[k].status === 'Inprogress' && JobData[k].customer && user.customer) || JobData[k].status === 'long-job'
						|| JobData[k].status === 'Pending' || JobData[k].status === 'Draft') {
						console.log('JobData[k].status>>>>>>>>', JobData[k].status)
						temp.stats = JobData[k].status;

						if (JobData[k].status === 'Scheduled' && (JobData[k].technician && JobData[k].technician !== '') && user.id === JobData[k].customer.user.id) {
							temp.stats = 'Scheduled & Accepted'
						}
						if (JobData[k].status === 'Waiting' && (JobData[k].technician && JobData[k].technician !== '') && user.id === JobData[k].customer.user.id) {
							temp.stats = JobData[k].status
						}
						if (JobData[k].status === 'Scheduled' || JobData[k].status === 'Waiting' || JobData[k].status === 'Accepted' || JobData[k].status === 'Inprogress'
							|| JobData[k].status === 'ScheduledExpired' || JobData[k].status === 'long-job' || JobData[k].status === 'Pending' || JobData[k].status === 'Draft') {
							if (JobData[k].status === 'long-job') {
								temp.stats = 'Long Job'
							}
							if (JobData[k].status === 'Inprogress') {
								temp.stats = "InProgress"
							}
							data.push(temp);
						}
					}


				} else if (user && user.userType === 'technician' && user.technician) {

					joinRoomsForAcceptedJobsCustomerAndTechnician(JobData[k])
					temp.action = (
						<Row key={JobData[k].id}>
							<Col xs="12">
								<Button className="mb-2 btn app-btn" onClick={push_to_job_detail} name={`${JobData[k].id}`} title="Click to see job details.">Details<span></span></Button>

								{JobData[k].status === 'Scheduled' && (JobData[k].technician === undefined || !JobData[k].technician) && !JobData[k].tech_declined_ids.includes(user.technician.id)
									&& <Button className="mb-2 btn app-btn" onClick={push_to_job_detail_with_apply_button} name={`${JobData[k].id}`} title="Click to see job details and apply for this job.">Apply<span></span></Button>}
								{JobData[k].status === 'Scheduled' && (JobData[k].technician && JobData[k].technician.id === user.technician.id) && !JobData[k].tech_declined_ids.includes(user.technician.id)
									&& <Button className="mb-2 btn app-btn"
										onClick={handleScheduledCancel}
										name={JobData[k].id}
										title="You will no longer see this job if you click on this button.">Cancel<span></span></Button>}
								{JobData[k].status === 'Scheduled' && !JobData[k].technician && !JobData[k].tech_declined_ids.includes(user.technician.id)
									&& <Button className="mb-2 btn app-btn"
										onClick={handleScheduledDecline}
										name={JobData[k].id}
										title="You will no longer see this job if you click on this button.">Decline<span></span></Button>}
								{JobData[k].technician && JobData[k].status === "Scheduled" && JobData[k].id === jobId && JobData[k].technician.user.id === technicianId
									&& <Button className="mb-2 btn app-btn" onClick={pushToMeeting} data-tech={`${technicianId}`} name={`${JSON.stringify(JobData[k])}`}>Join<span></span></Button>}
								{(JobData[k].status === 'Inprogress' && JobData[k].technician && JobData[k].technician.id === user.technician.id) &&
									<Button className="mb-2 btn app-btn" onClick={pushToMeeting} name={`${JSON.stringify(JobData[k])}`} >Join<span></span></Button>}

								{(JobData[k].status === 'long-job' && JobData[k].technician && JobData[k].technician.id === user.technician.id) &&
									<Button className="mb-2 btn app-btn" onClick={pushToMeeting} name={`${JSON.stringify(JobData[k])}`} >Join<span></span></Button>}


								{(JobData[k].status === 'Waiting' && !JobData[k].tech_declined_ids.includes(user.technician.id)) && !JobData[k].declinedByCustomer.includes(user.technician.id)
									&& <Button className="mb-2 btn app-btn" onClick={handleAccepted} name={`${JSON.stringify(JobData[k])}`} title="Accept the current job">Accept<span></span></Button>}


								{JobData[k].status === 'Scheduled' && JobData[k].technician && JobData[k].technician.id === user.technician.id &&
									<>
										<div className="addToCalendar-geeker mb-2">
											<AddToCalendarDropdown
												event={{
													'title': 'Geeker Job',
													duration,
													'description': JobData[k].issueDescription,
													'startDatetime': moment.utc(JobData[k].primarySchedule).format('YYYYMMDDTHHmmssZ'),
													'endDatetime': moment.utc(new Date(new Date(JobData[k].primarySchedule).setHours(new Date(JobData[k].primarySchedule).getHours() + 2))).format('YYYYMMDDTHHmmssZ'),
												}}
												buttonProps={{
													'className': 'thisssssssssss'
												}}
												items={[SHARE_SITES.GOOGLE, SHARE_SITES.OUTLOOK]}
											/>
										</div>
									</>
								}

								{JobData[k].status === 'Accepted' && JobData[k].technician && JobData[k].technician.id === user.technician.id &&
									<Button className="mb-2 btn app-btn" onClick={handleTechnicianCall} name={JobData[k].id} title="Accept the current job">Start call with customer<span></span></Button>
								}
							</Col>

						</Row>
					);

					if ((techMainSoftwares.includes(JobData[k].software.id) || techSubSoftwares.includes(JobData[k].software.id)) && (JobData[k].status === 'Pending' || JobData[k].status === 'Scheduled' || JobData[k].status === 'Waiting') && JobData[k].tech_declined_ids && !JobData[k].tech_declined_ids.includes(user.technician.id) && JobData[k].declinedByCustomer && !JobData[k].declinedByCustomer.includes(user.technician.id)) {

						if (JobData[k].status == 'Waiting' || JobData[k].status == 'Scheduled') {
							console.log('JobData[k].status>>>>>>>>>>', JobData[k].issueDescription)
							let resultVal = await checkIfTwoTierJobAndExpertTech(user.technician, JobData[k])
							let checkVal = checkIfPostAgainWithSameTech(user.id, JobData[k])

							if (resultVal && checkVal) {
								temp.stats = JobData[k].status
								techProposalsData.push(temp)
							}
						} else {
							temp.stats = JobData[k].status
							techProposalsData.push(temp)
						}

					}

					if ((JobData[k].status === 'Accepted' || JobData[k].status === 'Pending' || JobData[k].status === 'Inprogress' || JobData[k].status === 'long-job') && JobData[k].technician && user.technician && JobData[k].technician.id === user.technician.id) {

						console.log('JobData[k].status>>>>>>>>>>', JobData[k].status)

						temp.stats = JobData[k].status
						if (JobData[k].status === 'long-job') {
							temp.stats = 'Long Job'
						}
						if (JobData[k].status === "Inprogress") {
							temp.stats = "InProgress"
						}
						if (JobData[k].status === "Pending") {
							temp.stats = "Pending"
						}

						techProposalsData.push(temp)

					}

					if (JobData[k].status === 'Scheduled' && JobData[k].technician && JobData[k].technician.id === user.technician.id) {
						temp.stats = 'Scheduled & Accepted'
					}
					if (JobData[k].status === 'Scheduled' && JobData[k].tech_declined_ids.includes(user.technician.id)) {
						temp.stats = "Cancelled by you"
						techCompletedData.push(temp)
					}


					if (JobData[k].declinedByCustomer.includes(user.technician.id)) {
						temp.stats = 'Cancelled by Customer'
						techDeclinedData.push(temp)
						techCompletedData.push(temp);
					}
				}

				temp.issuedesc = JobData[k].issueDescription;
				temp.jobId = JobData[k].id
				if (JobData[k].status === 'Scheduled') {
					temp.date = JobData[k].primarySchedule;
				}

				if (JobData[k].status === 'Completed' || JobData[k].status === 'Declined' || JobData[k].status === 'Expired' || JobData[k].status === 'ScheduledExpired') {
					if (user.userType === 'customer') {
						temp.stats = JobData[k].status;
						if (JobData[k].status === 'ScheduledExpired' && user.id === JobData[k].customer.user.id) {
							temp.stats = 'ScheduledExpired'
						}
						if (JobData[k].status === 'Declined') {
							temp.stats = "Cancelled"
						}
						doneData.push(temp);
					} else {
						if (user.userType === 'technician' && JobData[k].technician && JobData[k].technician.id === user.technician.id) {
							temp.stats = JobData[k].status;
							if (JobData[k].tech_declined_ids.includes(user.technician.id)) {
								temp.stats = JobData[k].is_transferred === true ? "Completed" : 'Cancelled by You';
								techDeclinedData.push(temp);
							}
							techCompletedData.push(temp);
						}
					}
					console.log("JobData", JobData[k]);
				}

				else if (JobData[k].status === 'Pending' || JobData[k].status === 'Draft') {
					if (user.userType === 'customer') {
						temp.stats = JobData[k].status;
						pendingData.push(temp);
					}
				}

			}
		}

		const filteredTableData = data && data.length > 0 ? data.filter((v, i, a) => a.findIndex(v2 => (v2.key === v.key)) === i) : data;
		const filteredProposalData = techProposalsData && techProposalsData.length > 0 ? techProposalsData.filter((v, i, a) => a.findIndex(v2 => (v2.key === v.key)) === i) : techProposalsData;
		console.log('doneData>>>>>>>>>>', filteredTableData);
		setCompletedData(doneData);
		setTableData(filteredTableData);
		console.log('techProposalsData>>>>>>>>>>>', filteredProposalData)
		setProposalsData(filteredProposalData)
		setTechCompletedData(techCompletedData)
		setShowLoader(false);
	}

	useEffect(() => {
		activeTabGlobal = activeTabKey
	}, [activeTabKey])

	useEffect(() => {
		socket.on("scheduled-call-alert", function (receiver) {
			try {
				console.log("Inside socket FetchJob ::::1")

				filterJobsByTech()
			} catch (err) {
				console.log("this is the error", err)
			}
		})
		socket.on('update-dashboard-status', () => {
			if (user.userType === "technician") {
				filterJobsByTech()
			}
		})
		socket.on("join-scheduled-call", function (receiver) {
			try {
				console.log("Inside socket FetchJob ::::2")
				filterJobsByTech()
			} catch (err) {
				console.error("join-scheduled-call error :", err)
			}
		})

		socket.on("set-join-on-dashboard", function (receiver) {
			if (receiver.tech) {
				console.log("inside receiver.tech")
				if (user === undefined) {
					refetch()
				}
				try {
					filterJobsByTech()
				} catch (err) {
					refetch()
				}
			}
		})
		socket.on("technician:assigned", (data) => {
			console.log("data >>>>>>", data)
			try {
				if (user && user.technician && data.technician == user.technician.id) {
					console.log("activeTabKey >>>>>", activeTabGlobal)
					let query = queryDecider(activeTabGlobal, user, false, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
					call_fetch_jobs(query)
				}
			}
			catch (err) {
				console.error("error in technician:assigned socket >>>", err)
			}

		})
		socket.on("decline-technician", (receiver) => {
			if (user && user.technician && receiver.res != undefined && user.technician.id === receiver.res.id) {
				let query = queryDecider(activeTabKey, user, false, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
				call_fetch_jobs(query)
			}
		})
		socket.on("call:started-customer", () => {
			if (user) {
				let query = queryDecider(activeTabKey, user, false, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
				call_fetch_jobs(query)
			}
		})

		socket.on("update-job-technician", async (data) => {
			if (user) {
				if (user?.id === data?.techUserId) {
					setIsCustomerStartCall(true)
					console.log("My console for update-job-technician", data)
					let query = queryDecider('Proposals', user, false, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
					const res = await call_fetch_jobs(query)
					console.log("My console to chk socket reaction step 0", res)
					setAllJobs(res)

				}
			}
		})
		socket.on("update-job-customer", async (data) => {
			if (user) {
				if (user?.id === data?.cusUserId) {
					setIsTechnicianStartCall(true)
					console.log("My console for update-job-customer", data)
					let query = queryDecider('Active Jobs', user, false, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
					const res = await call_fetch_jobs(query)
					console.log("My console to chk socket reaction step 0", res)
					setAllJobs(res)
				}
			}
		})
	}, [socket])



	useEffect(() => {
		// This condition is added so that when tab is toggled then it will not  reset the data as if it reset then it assume that
		// there is no  Live Job Available and Completed and Declined Job Tab Occuply full width
		const data = tableData && tableData.length > 0 ? tableData : [];
		const doneData = [];
		let JobData = []
		const pendingData = []
		const declineData = []
		const techCompletedData = []
		const techDeclinedData = []
		const techProposalsData = proposalsData && proposalsData.length > 0 ? proposalsData : [];

		if (user.customer) {
			if (allJobs) {
				JobData = allJobs.data
			}
		}

		if (user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed")) {
			if (allJobs) {
				JobData = allJobs.data
			}
		} else if (user.technician) {
			setIsLoading(false)
		}
		if (JobData && JobData.length > 0) {
			try {
				setData(JobData, data, doneData, pendingData, declineData, techCompletedData, techDeclinedData, techProposalsData, true)
			} catch (err) {
				console.log("useEffect dashboard.js ", err)
			}
		}
	}, [allJobs, history, socket, user, startTimer]);

	const filterJobsByTech = () => {
		let main_software = [];
		let sub_software = [];
		if (user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed")) {
			const { expertise } = user.technician;
			fillSoftwares(expertise, main_software, sub_software)
			mainSoftwareWithoutState = main_software;
			setTechMainSoftwares(main_software)
			setTechSubSoftwares(sub_software)
			let newSoftArray = main_software.concat(sub_software)
			const query = {
				software: { "$in": newSoftArray }, $or: [{
					status: { $in: ["Waiting"] },
					tech_declined_ids: { $nin: [user.technician.id] }
				},
				{ $and: [{ status: "Accepted" }, { technician: user.technician.id }] },
				{
					"$or": [{ "$and": [{ "status": ["Scheduled"] }, { "schedule_accepted_by_technician": user.id }] }, {
						"$and": [{ "status": ['Scheduled'] }, { "schedule_accepted": false }]
					}
					]
				},
				{
					"$or": [{ "$and": [{ "status": "Inprogress" }, { "technician": user.technician.id }] },
					]
				},
				{
					"$or": [{ "$and": [{ "status": "long-job" }, { "technician": user.technician.id }] },
					]
				},

				]
			}
			console.log("filterJobsByTech query :::: ", query)
			call_fetch_jobs(query)
		}
		else {
			setTotalJobs(0)
		}
	}

	useEffect(() => {
		(async () => {
			if (user) {
				if (user.userType === 'customer') {
					if (user.customer) {
						setActiveTabKey("Active Jobs")
						// mixpanel code//
						mixpanel.identify(user.email);
						mixpanel.track('Customer - On dashboard page');
						mixpanel.people.set({
							$first_name: user.firstName,
							$last_name: user.lastName,
						});
						// mixpanel code//

						// Here firstly I check whether is there any live job or not, if not then we will fetch completed and Declined jobs of customer
						const customerLiveJobData = await call_fetch_jobs({ customer: `${user.customer.id}`, '$or': [{ status: { $in: ["Scheduled", "Inprogress", "Waiting", "Accepted", "long-job", "Pending", "Draft"] } }] })
						if (customerLiveJobData?.totalCount == 0 && customerLiveJobData?.data?.length == 0) {
							call_fetch_jobs({ customer: `${user.customer.id}`, '$or': [{ status: { $in: ["ScheduledExpired", "Expired", "Completed", "Declined"] } }] })
							setActiveTabKey("Completed Jobs")
						}
					} else {
						// when new customer registers,we get only user information in this file and no customer data, it is the final stage where code stops in this file , so here we will refetch user so that we can get customer data within it(manibha)
						refetch()
					}
				} else {
					let main_software = [];
					let sub_software = [];
					setActiveTabKey("Proposals")
					if (user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed")) {
						// mixpanel code//
						setActiveTabKey("Proposals")
						mixpanel.identify(user.email);
						mixpanel.track('Technician - On dashboard page');
						mixpanel.people.set({
							$first_name: user.firstName,
							$last_name: user.lastName,
						});
						// mixpanel code//

						const { expertise } = user.technician;
						fillSoftwares(expertise, main_software, sub_software)
						setTechMainSoftwares(main_software);
						setTechSubSoftwares(sub_software);
						let newSoftArray = main_software.concat(sub_software)
						const query = queryDecider("Proposals", user, newSoftArray, techMainSoftwares, techSubSoftwares, mainSoftwareWithoutState, subSoftwareWithoutState)
						console.log('useeffect query::', query)
						call_fetch_jobs(query, { page: 1, pageSize: 10, userType: (user.userType === "technician" ? user.technician.technicianType : user.customer.customerType), id: user.userType === "technician" ? user?.technician?.id : '' })
					}
					else {
						setTotalJobs(0)
					}
				}
			}
		})()
	}, [user, refreshData]);

	const call_fetch_jobs = async (filter,
		pagination = { page: 1, pageSize: 10, userType: (user.userType === "technician" ? user.technician.technicianType : user.customer.customerType), id: (user.userType === "technician" ? user?.technician?.id : '') }) => {
		const res = await fetchJobByParams(filter, pagination)
		setTimeout(function () {
			setIsLoading(false)
		}, 1500)

		console.log("call_fetch_jobs response :::::: ", res)
		if (res) {
			return res.jobs
		}
		else {
			return []
		}
	}

	if (!user) {
		history.push('/login');
	}
	const closePendingModal = () => {
		setCustomerConfirm(false);
		setCustomerConfirmSameTech(false)
		setCustomerConfirmDraftJob(false)
	};

	const [refreshData, setRefreshData] = useState(false)
	return (
		<>
			<Modal
				style={{ top: 40 }}
				closable={true}
				onCancel={closePendingModal}
				visible={customerConfirm || customerConfirmSameTech || customerConfirmDraftJob}
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
								setCustomerConfirmSameTech(false)
								setCustomerConfirmDraftJob(false)
							}}
							key='no'
						>
							<span></span>Back To Dashbord
						</Button>,

						<Button
							id="confirm-create-new-job-btn"
							className="btn app-btn job-accept-btn modal-footer-btn"
							onClick={customerConfirm ? postAgainFunction : customerConfirmSameTech ? postAgainFunctionWithSameTech : customerConfirmDraftJob ? postAgainFunctionDraft : null}
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

			<Col md="12" className="py-4 mt-1">
				<Loader height="100%" className={(isLoading ? "loader-outer" : "d-none")} />
				<Col xs="12" className="pb-3">
					<Row>
						<JobCancelFrom
							isCancelModal={isCancelModal}
							setIsCancelModal={setIsCancelModal}
							cancelJobId={cancelJobId}
							user={user}
							type={userType}
							job={jobData}
							decline_job_by_technician={decline_job_by_technician}
							setcurrentStep={setcurrentStep}
						/>
						<Col md="12" className="py-4 mt-1">
							<Col xs="12" className="p-0 dashboard-tables-outer">
								{user && user.userType === 'customer' &&

									<Tabs defaultActiveKey="Active Jobs" id="cust-dashboard" className={tableData && tableData.length > 0 ? "mb-3 tabs-outer-customer" : "mb-3 tabs-outer-customer-full-size"} activeKey={tableData && tableData.length > 0 ? activeTabKey : "Completed Jobs"} onSelect={(k) => { changeTab(k) }}>

										{tableData && tableData.length > 0 &&
											<Tab eventKey="Active Jobs" title="Live Jobs" className="col-md-12 p-0">
												<DashboardTable push_to_job_detailForChat={push_to_job_detailForChat} jobIdFromMessage={jobIdFromMessage} data={tableData} isLoading={showLoader} user_data={user} date_options={DATE_OPTIONS} tabname={TabName} />
											</Tab>}

										<Tab eventKey="Completed Jobs" title="Completed & Declined Jobs" className="col-md-12 p-0">
											<DashboardTable push_to_job_detailForChat={push_to_job_detailForChat} jobIdFromMessage={jobIdFromMessage} data={completedData} isLoading={showLoader} user_data={user} date_options={DATE_OPTIONS} />
										</Tab>
									</Tabs>
								}

								{user && user.userType === 'technician' &&

									<Tabs defaultActiveKey="Proposals" id="tech-dashboard" className={proposalsData && proposalsData.length > 0 ? "mb-3 tabs-outer-customer" : "mb-3 tabs-outer-customer-full-size"} activeKey={proposalsData && proposalsData.length > 0 ? activeTabKey : "Completed Jobs Tech"} onSelect={(k) => { changeTab(k) }}>
										{proposalsData && proposalsData.length > 0 &&
											<Tab eventKey="Proposals" title="Live Jobs" className="col-md-12 p-0">
												<DashboardTable push_to_job_detailForChat={push_to_job_detailForChat} jobIdFromMessage={jobIdFromMessage} data={proposalsData} isLoading={showLoader} user_data={user} date_options={DATE_OPTIONS} />
											</Tab>
										}

										<Tab eventKey="Completed Jobs Tech" title="Completed & Declined Jobs" className="col-md-12 p-0">
											<DashboardTable push_to_job_detailForChat={push_to_job_detailForChat} jobIdFromMessage={jobIdFromMessage} data={techCompletedData} isLoading={showLoader} user_data={user} date_options={DATE_OPTIONS} />
										</Tab>
									</Tabs>
								}
								{totalJobs !== 0 && <Pagination style={{ "float": "right", "marginRight": "40px" }} current={currentPage} onChange={handlePagination} total={totalJobs} />}
							</Col>
							{setShowFeedbackModal && <FeedbackCompulsionModal user={user} isModalOpen={showFeedbackModal} jobId={FeedbackJobId} />}
						</Col>
					</Row>
				</Col>
			</Col>
		</>
	)
};



export default Dashboard;

const TableButton = ({ index, onClick, jobId, text, disabled, isDisabled, id }) => {
	return (<>
		<Button className={(isDisabled ? "disable-btn " : "") + " mb-2 btn app-btn"} disabled={disabled} id={id} onClick={onClick} name={jobId} title="Click on this button to create a new similar job.">{text}<span></span></Button>
	</>)
}

/**
 * @params : job Type(Object) , pushToMeeting Type(Function), user Type(Object), isMobile Type(Boolean) , technicianId Type(String)
 * @response : Creates a component that returns start call buttons for Customer according to conditions
 * @author : Sahil
 * **/
const MeetingButton = ({ job, pushToMeeting, user, isMobile, technicianId }) => {
	if (job.technician && (job.status === "Inprogress" || job.status === "long-job" || job.technician_started_call) && job.status !== "Completed" && job.customer.id === user.customer.id) {
		return <Button className="mb-2 btn app-btn" onClick={pushToMeeting} data-tech={`${technicianId}`} name={`${JSON.stringify(job)}`}>Join<span></span></Button>
	}
	if (job.technician && job.status === "Accepted" && job.customer.id === user.customer.id) {
		return <Button className="mb-2 btn app-btn" onClick={pushToMeeting} data-tech={job.technician.id} name={`${JSON.stringify(job)}`}>Start Call<span></span></Button>
	}

	return <></>


}
