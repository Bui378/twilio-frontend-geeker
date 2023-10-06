import React, { useState, useCallback, useEffect } from "react"
import CheckInCircle from 'components/CheckInCircle';
import ScheduleForLater from '../Components/ScheduleForLater';
import BasicButton from 'components/common/Button/BasicButton';
import mixpanel from 'mixpanel-browser';
import { useAuth } from '../../../../context/authContext';
import { useJob } from '../../../../context/jobContext';
import * as JobCycleApi from '../../../../api/jobCycle.api';
import { JobTags, SECRET_KEY, LAUNCHDARKLY_JAAS_INTEGRATION } from '../../../../constants';
import { useSocket } from '../../../../context/socketContext';
import * as CustomerApi from '../../../../api/customers.api';
import * as PromocodeApi from '../../../../api/promoCode.api';
import * as JobApi from '../../../../api/job.api';
import { openNotificationWithIcon, GAevent, isWorkingHours, decideEstimatesToShowUsingLD, checkCustomerHaveSubscriptionMinutes } from '../../../../utils/index.js';
import { useHistory, useLocation } from 'react-router';
import { isMobile, isTablet } from 'react-device-detect';
import { Modal } from 'antd';
import { klaviyoTrack } from '../../../../api/typeService.api';
import { useNotifications } from '../../../../context/notificationContext';
import { getPrimaryTime } from "../../../../utils/index";
import * as UserApi from "api/users.api";
import { Button } from "react-bootstrap";
import Loader from '../../../../components/Loader';
import LDClient from 'launchdarkly-js-client-sdk'

const MESSAGES = ["Promo Code is Already Expired !!", "Promo Code is already used !!",
	"Promo Code Successfully Applied !!", "Please Enter a Promo Code !!", "Something Went Wrong !!"];

const JobSummary = ({ jobInfo, isScheduleJob, setIsScheduleJob, scheduleJobTime, setScheduleJobTime, job, user, newPost, jobId, selectedTechnician, setSelectedTechnician, isFirsJob }) => {

	const { getGuestUser } = useAuth();
	const { fetchJobAsGuest, createJob, updateJob, getTotalJobs, setJob, fetchJob, updateJobAsGuest } = useJob();
	const [needThisDone, setNeedThisDone] = useState(jobInfo.needThisDone)
	const [nextButton, setNextButton] = useState(true)
	const [showSpinner, setShowSpinner] = useState(false);
	// Promocode States 
	const [promoCodeInput, setPromoCodeInput] = useState('');
	const [promoCodeApplied, setIsPromocodeApplied] = useState({});
	const [searchTechType, setSearchTechType] = useState('');
	const { socket } = useSocket();
	const location = useLocation();
	const history = useHistory();
	const queryParams = new URLSearchParams(location.search);
	let repostJob = queryParams.get('repost') ? queryParams.get('repost') : false;
	const technicianId = queryParams.get("technicianId") ? queryParams.get("technicianId")
		: selectedTechnician.value ? selectedTechnician.value : false
	const jobIdFromUrl = queryParams.get("jobId") ? queryParams.get("jobId") : false
	const hireExpertTransferJob = queryParams.get('hireExpertTransferJob') ? queryParams.get('hireExpertTransferJob') : false;
	let newPostJob = newPost != undefined ? newPost : queryParams.get("newpost")
	const uniqueTechScheduleJob = queryParams.get('applyJobFor') ? queryParams.get('applyJobFor') : false;
	const [havePromoCode, setHavePromoCode] = useState(false)
	const { createNotification, fetchNotifications } = useNotifications();
	const [showLoader, setShowLoader] = useState(true)
	const [calculatedPrices, setCalculatedPrices] = useState({})
	const [openModalForScheduleMessgae, setOpenModalForScheduleMessgae] = useState(false);
	const [isEstimatesVisible, setIsEstimatesVisible] = useState(false)
	const [haveSubscription, setHaveSubscription] = useState(false)
	const [userIsOwner, setUserIsOwner] = useState(true)
	const [ownerHaveSubscription, setOwnerHaveSubscription] = useState(false)

	// This Hook will check if Customer or their Owner have Subscription if so then don't show Customer the option
	// to apply promocode
	useEffect(() => {
		if (user) {
			//Here checking customer have subscion or have owner id
			const haveSubscription = user?.customer?.subscription && user?.customer.subscription?.invoice_id
			const useAllSubScriptionTime = user?.customer?.subscription?.time_used == user?.customer?.subscription?.total_seconds
			const haveOwnerAccountId = user?.ownerId
			if (haveSubscription && !useAllSubScriptionTime) {
				setHaveSubscription(true)
			}
			// If owner id is available then extract details of that owner and check is subscription available
			if (haveOwnerAccountId) {
				(async () => {
					const ownerCustomerResponse = await UserApi.getUserById(haveOwnerAccountId);
					const isOwnerHaveSubscription = ownerCustomerResponse?.customer?.subscription && ownerCustomerResponse?.customer.subscription?.invoice_id
					const useAllSubScriptionTime = ownerCustomerResponse?.customer?.subscription?.time_used == ownerCustomerResponse?.customer?.subscription?.total_seconds
					if (isOwnerHaveSubscription && !useAllSubScriptionTime) {
						setHaveSubscription(true)
					}
				})();
			}
		}
	}, [])

	useEffect(() => {
		(async () => {
			if (!user) {
				const guestUserRes = await getGuestUser();
				console.log("check guest user", guestUserRes)
				const fetchUserRes = await fetchJobAsGuest(jobIdFromUrl, guestUserRes.token.accessToken)
				console.log("fetch job as guest user", fetchUserRes)
				const featureResponse = await decideEstimatesToShowUsingLD(guestUserRes?.user, jobIdFromUrl);
				setIsEstimatesVisible(featureResponse)
			}
			if (jobIdFromUrl) {
				console.log("jobIdFromUrl", jobIdFromUrl)
				fetchJob(jobIdFromUrl)
			}
			if (user) {
				if (user.ownerId && user.ownerId !== null) {
					setUserIsOwner(false)
					const ownerInfoObject = await UserApi.getUserById(user.ownerId)
					if (ownerInfoObject) {
						if (ownerInfoObject.customer && ownerInfoObject.customer.subscription) {
							setOwnerHaveSubscription(true)
						}
					}
				}
				const featureResponse = await decideEstimatesToShowUsingLD(user, jobIdFromUrl);
				setIsEstimatesVisible(featureResponse)
			}
		})();
	}, [])

	useEffect(() => {
		if (job) {
			console.log("job var", job)
			if (user) {
				console.log("window.location.href from jobSummery", user)
				if (job.status !== "Draft") window.location.href = "/"
			}
			setCalculatedPrices(calculatePrice(job && job.software))
			if (job?.software?.name) {
				setShowLoader(false)
			}
		}
	}, [job])

	// This function is used to set the  Meeting Platform [ winkitAway or Jaas8x8] in Job Database
	const decideMeetingServiceViaLaunchdarkly = async () => {
		console.log("Add a console check by Karun.")
		try {
			const JobId = job?.id
			const email = user?.email
			const name = user?.firstName + " " + user?.lastName
			const newUser = {
				kind: 'customer',
				key: JobId,
				name: name,
				email: email,
			}
			const ldclient = await LDClient.initialize(process.env.REACT_APP_LAUNCHDARKLY_KEY, newUser)
			ldclient.on('ready', async () => {
				const flagData = ldclient.allFlags()
				const jaas8x8InegrationFlag = flagData[LAUNCHDARKLY_JAAS_INTEGRATION]
				console.log("Launchdarkly jaas8x8InegrationFlag", { flagData, jaas8x8InegrationFlag })

				if (jaas8x8InegrationFlag == "jaas8x8") {
					await updateJob(JobId, { meeting_service: 'jaas8x8' });
					return "jaas8x8";
				}
				if (jaas8x8InegrationFlag == "winkitaway") {
					await updateJob(JobId, { meeting_service: 'winkitaway' });
					return "winkitaway";
				}
				if (jaas8x8InegrationFlag == "getgeeker") {
					await updateJob(JobId, { meeting_service: 'getgeeker' });
					return 'getgeeker';
				}
			})

		} catch (error) {
			console.log("Launchdarkly error while  Updating Meeting Service", error);
			return "winkitaway"
		}
	}

	/**
	 * This useEffect is responsible to set later for schedule when customer click at schedule btn from technician profile page.
	 * @author : Mritunjay
	 **/
	useEffect(() => {
		if (uniqueTechScheduleJob) laterHandler();
		else return;
	}, [uniqueTechScheduleJob])

	const logoutGuestAccount = () => {
		console.log("tetch token removed from page job summary")
		localStorage.removeItem(SECRET_KEY);
	}

	const asapHandler = () => {
		console.log("ASAP Job")
		setNeedThisDone("asap")
		setNextButton(false)
		setIsScheduleJob(false)
	}

	const laterHandler = () => {
		console.log("Schedule Job")
		setNeedThisDone("later")
		setNextButton(false)
		setIsScheduleJob(true)
	}

	const calculatePrice = (softwareData, hire_expert = false, forfreeMinutes = false) => {
		let initPriceToShow = 0;
		let finalPriceToShow = 0;
		try {
			let price_per_six_min = softwareData.rate
			let time1 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
			let time2 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)
			let main_price = ''
			if (hire_expert) {
				main_price = softwareData.twoTierEstimatePrice
			} else {
				main_price = softwareData.estimatedPrice
			}
			console.log("> main price >>>>>>>>> ", main_price)
			let price1 = (softwareData && String(main_price).indexOf('-') !== -1 ? parseInt(String(main_price).split("-")[0]) : 0)
			let price2 = (softwareData && String(main_price).indexOf('-') !== -1 ? parseInt(String(main_price).split("-")[1]) : 0)

			price1 = (price1 ? price1 : price_per_six_min)
			price2 = (price2 ? price2 : price_per_six_min)
			initPriceToShow = forfreeMinutes ? (Math.ceil(time1 / 6) - 1) * parseInt(price1) : Math.ceil(time1 / 6) * parseInt(price1)
			finalPriceToShow = forfreeMinutes ? (Math.ceil(time2 / 6) - 1) * parseInt(price2) : Math.ceil(time2 / 6) * parseInt(price2)

			initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 0)
			finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 0)

			console.log("initPriceToShow >>>>>>>>>> ", initPriceToShow)
		}
		catch (err) {
			console.error("issue in calculating price :::: ", err)
		}
		return { initPriceToShow: initPriceToShow, finalPriceToShow: finalPriceToShow }
	}

	/**
	* Function will check card authorization before any job except first job, if successful then make the job live.
	* @params = job (Type:job Object)
	* @response : Will call findTechnician function so the job gets live
	* @author : Kartik
	*/
	const cardPreAuthorization = async (updateJobData, card_info = false) => {
		setShowSpinner(true)
		// Here we are checking is jobid is available in url then we are using that jobid otherwise we are using job.id
		const JobId = jobIdFromUrl ? jobIdFromUrl : job?.id;
		console.log("console to check client_id, session_id and _fbp", updateJobData, JobId)

		if (promoCodeInput && promoCodeApplied) {
			await updatePromoCodeDetails(updateJobData);
		}
		console.log(!job.cardPreAuthorization, "OrganizationTesting :: Check job OBJ>>>>>>>>>>>>>>>>", { job, updateJobData })
		console.log(!job.cardPreAuthorization, "OrganizationTesting :: Check job OBJ>>>>>>>>>>>>>>>> 2", !job.customer.subscription)
		localStorage.removeItem('authorizationInfo');

		// holdPaymentWhileSubscription variable check if there is any subscription purchased by customer owner and have subscription minutes to zero then we will charge to customer
		let holdPaymentWhileSubscription = false;
		if (job?.customer) {
			holdPaymentWhileSubscription = await checkCustomerHaveSubscriptionMinutes(job?.customer)
		}
		// If customer have owner then we will update job with that id otherwise that's customer's user id will be set to that field
		const ownerId = user?.ownerId ? user?.ownerId : user?.id
		console.log("holdPaymentWhileSubscription", holdPaymentWhileSubscription)
		if (!job.cardPreAuthorization && holdPaymentWhileSubscription) {
			const ownerStripeStatus = await checkOwnerStripeId(user);
			const stripeId = user?.ownerId && ownerStripeStatus.success ? ownerStripeStatus.stripeId : user?.customer?.stripe_id
			const preAuthorization = await CustomerApi.holdChargeFromCustomer({
				'stripe_id': stripeId,
				'liveUser': (user?.customer?.customerType === 'live' ? true : false), "jobId": job?.id
			})

			console.log("OrganizationTesting :: cardPreAuthorization logs to check 1", job)

			if (preAuthorization.status === "Successful") {
				console.log("cardPreAuthorization logs to check 2")
				updateJobData.cardPreAuthorization = true
				updateJobData.payment_type = "card_only"
				updateJobData.ownerId = ownerId
				const updatedJob = await JobApi.updateJob(JobId, updateJobData);
				if (needThisDone === "later") {
					console.log("cardPreAuthorization logs to check 3", updatedJob)
					await emitSocketCreateFetchNotification(updatedJob)
					window.localStorage.setItem('CurrentStep', 7)
					setTimeout(() => {
						setShowSpinner(false)
						window.location.href = '/dashboard?&scheduleJobId=' + JobId;
					}, 4500);
				} else {
					console.log("OrganizationTesting :: cardPreAuthorization logs to check 4")
					setShowSpinner(false)
					window.location.href = `/customer/profile-setup?page=tech-search&jobId=${JobId}`
				}
				return job
			} else {
				setShowSpinner(false)
				let localstorageData = { isCardAuthorized: false, job: job }
				localStorage.setItem('authorizationInfo', JSON.stringify(localstorageData));
				let message = preAuthorization?.message ? preAuthorization?.message : "Card authorization failed."
				openNotificationWithIcon("error", "Error", message)
			}
		}
		else {
			console.log("OrganizationTesting :: cardPreAuthorization logs to check 5")
			updateJobData.cardPreAuthorization = true
			updateJobData.payment_type = "subscription_only"
			updateJobData.ownerId = ownerId
			let jobData = await JobApi.updateJob(JobId, updateJobData);
			if (needThisDone === "later") {
				await emitSocketCreateFetchNotification(jobData)
				window.location.href = '/dashboard?&scheduleJobId=' + JobId;
				window.localStorage.setItem('CurrentStep', 7)
			} else {
				window.location.href = `/customer/profile-setup?page=tech-search&jobId=${JobId}`
			}
			return jobData
		}
	}

	/**
	 * Function will create a new job if not already posted and make the job live.
	 * @params =  dataToSave (Type:Object), totalJobsCount (Type:Number),firstjob(Type:Boolean)
	 * @response : Will call validateAndCreateJob or cardPreAuthorization function so the job gets live
	 * @author : Manibha
	 */
	const checkAndCreateNewJob = async (dataToSave, totalJobsCount, firstjob = false, sendTofindTechnician = true) => {
		// Here we are checking is jobid is available in url then we are using that jobid otherwise we are using job.id
		const JobId = jobIdFromUrl ? jobIdFromUrl : job?.id;
		if (newPostJob !== 'yes') {
			let authorizationInfo = JSON.parse(localStorage.getItem('authorizationInfo'));
			console.log('authorizationInfo:inside checkAndCreateNewJob function localstorage info >>>', authorizationInfo);
			if (authorizationInfo === undefined || authorizationInfo === null) {
				console.log('authorizationInfo:inside card authorization validateAndCreateJob', authorizationInfo)
				validateAndCreateJob(dataToSave, totalJobsCount, firstjob, sendTofindTechnician)
			} else {
				if (authorizationInfo != undefined && authorizationInfo != null && !authorizationInfo.isCardAuthorized) {
					console.log('authorizationInfo:inside card authorization', authorizationInfo)
					console.log('authorizationInfo:inside card authorization job data', authorizationInfo.job)
					cardPreAuthorization(authorizationInfo.job);
				} else {
					console.log('authorizationInfo:inside card authorization else', authorizationInfo)
					validateAndCreateJob(dataToSave, totalJobsCount, firstjob, sendTofindTechnician)
				}
			}
		} else {
			console.log("Inside else part of checkAndCreateNewJob ... *-*-*-*")
			console.log(" job.status: before :: ", job.status)
			if (job.status == "Accepted" && newPostJob == 'yes') {
				console.log(" job.status: after :: ", job.status)
				return window.location.href = "/dashboard?mobileJobId=" + JobId;
			}
			if (sendTofindTechnician) {
				//Call Klaviyo api
				callKlaviyoAPI(job, totalJobsCount, firstjob)

				cardPreAuthorization(job);
			}
		}
	}
	const validateAndCreateJob = async (dataToSave, totalJobsCount, firstjob, sendTofindTechnician) => {
		if (isMobile || isTablet) {
			dataToSave.status = 'Draft'
		}
		console.log("=== checkAndCreateNewJob before create job ", dataToSave)
		const jobData = await createJob(dataToSave);
		console.log("=== checkAndCreateNewJob after create job ", jobData);
		if (promoCodeInput && promoCodeApplied) {
			await updatePromoCodeDetails(jobData);
		}
		setJob(jobData)
		if (jobData?.customer?.id) {
			//GA3 tag commented by Vinit on 24/04/2023.
			GAevent('Conversion', 'new_job', 'Conversion', jobData.customer.id)
		}
		//Call Klaviyo api
		callKlaviyoAPI(jobData, totalJobsCount, firstjob)

		if (sendTofindTechnician) {
			cardPreAuthorization(jobData);
		}
	}

	/**
	 * Function will send the data to Klaviyo when added new job
	 * @params =  jobData (Type:Object), totalJobsCount (Type:Int), firstjob (Type:Bool)
	 * @response : no response
	 * @author : Karan
	 */
	const callKlaviyoAPI = async (jobData, totalJobsCount, firstjob) => {
		try {
			console.log("User data ::", user)
			console.log("jobData ::", jobData)
			if (user && jobData) {
				console.log("Inside if part of callKlaviyoAPI ")
				const klaviyoData = {
					email: user.email,
					event: 'Job Created',
					properties: {
						$first_name: user.firstName,
						$last_name: user.lastName,
						$job: jobData.id,
						$total_jobs: totalJobsCount,
						$software_name: jobData?.software?.name,
					},
				};
				if (firstjob) {
					klaviyoData['properties']['$first_job'] = true
				}
				console.log("klaviyoData ::", klaviyoData)
				await klaviyoTrack(klaviyoData);
			}
		}
		catch (err) {
			mixpanel.identify(user?.email);
			mixpanel.track('There is catch error while creating job (callKlaviyaAPI) ::::', { scheduleJobData: jobData, errMessage: err.message });
			console.error('There is catch error while creating job (callKlaviyaAPI)  :::: ' + err.message)
		}
	}

	async function checkCustomerSubscription(user) {
		let customerInfo;
		if (user && user.customer) {
			customerInfo = await CustomerApi.checkIfOrganisationHasSubscription({
				user: user,
				liveUser: user.customer.customerType === "live" ? true : false
			});
		}
		return customerInfo;
	}

	const checkOwnerStripeId = async (user) => {
		try {
			if (user && user?.ownerId) {
				const ownerUserDetails = await UserApi.getUserById(user?.ownerId)
				console.log('ownerUserDetails ::::', ownerUserDetails)
				if (ownerUserDetails?.customer?.stripe_id) {
					const ownerStripeId = ownerUserDetails?.customer?.stripe_id
					return { 'success': true, 'stripeId': ownerStripeId }
				} else {
					return { 'success': false, 'stripeId': '' }
				}
			} else {
				return { 'success': true, 'stripeId': '' }
			}
		} catch (error) {
			console.error('error while getting the owner stripeId', { error })
			return { 'success': false, 'stripeId': '' }
		}
	}

	const findTechnician = async (e) => {
		e.preventDefault();
		localStorage.removeItem("showAfterBusinessHrs");
		// Function  decideMeetingServiceViaLaunchdarkly decides with which meetingService this job would continue
		await decideMeetingServiceViaLaunchdarkly();
		// Here we are checking is jobid is available in url then we are using that jobid otherwise we are using job.id
		const JobId = jobIdFromUrl ? jobIdFromUrl : job?.id;
		console.log("OrganizationTesting :: checking jobId while checking finding technician", JobId)
		setShowSpinner(true)
		if (searchTechType === "other") {
			if (!selectedTechnician.value) {
				console.log("OrganizationTesting :: selectedTechnician", selectedTechnician)
				setShowSpinner(false)
				openNotificationWithIcon("info", "Info", `Please either select a technicain or choose "Any" technicians to proceed further!`)
				return
			}
		}
		const isStripeAvilable = await checkOwnerStripeId(user)
		console.log('isStripeAvilable ::::', isStripeAvilable)
		if (isStripeAvilable.success) {
			console.log("OrganizationTesting :: Find technician function called", isScheduleJob)
			let card_info = { has_card_or_subscription: false }
			let updateJobObject = {}
			if (user) {
				mixpanel.identify(user.email);
				mixpanel.track('Customer - Click on Get help Now');
			}
			if (!user || user.email === "guest@geeker.co") {
				console.log("OrganizationTesting :: My console - no user found!!")
				console.log("OrganizationTesting :: window.location.href from jobSummary", job)
				if (technicianId) {
					updateJobObject['post_again'] = true
					updateJobObject['post_again_reference_job'] = jobIdFromUrl
					updateJobObject['post_again_reference_technician'] = technicianId
					updateJobObject['tech_search_time'] = '300000'
					await updateJobAsGuest(jobIdFromUrl, updateJobObject)
					window.location.href = `/customer/start-profile-setup?page=registration&jobId=${JobId}&technicianId=${technicianId}`;
				}
				else {
					window.location.href = `/customer/start-profile-setup?page=registration&jobId=${JobId}`;
				}
				if (job?.guestJob) logoutGuestAccount()
			} else {
				if (job?.guestJob) logoutGuestAccount()
				updateJobObject.status = "Pending"
				updateJobObject.tech_search_start_at = new Date()
				console.log("OrganizationTesting :: user exists")
				let lifeCycleTag = ''
				if (job && job.is_transferred && job.is_transferred == true) {
					lifeCycleTag = JobTags.GET_HELP_NOW_AFTER_TRANSFER;
				} else {
					lifeCycleTag = JobTags.GET_HELP_NOW;
				}
				await JobCycleApi.create(lifeCycleTag, false, user.id);
				const totalJobsCount = await getTotalJobs({ customer: user.customer.id ? user.customer.id : user.customer });
				console.log('OrganizationTesting :: totalJobsCount>>>>>>>>>>>>>>', totalJobsCount);
				const customerTypeValid = true
				let customer_info = await checkCustomerSubscription(user);
				console.log("OrganizationTesting :: cardsInfo >>>>>>>>> in schedule later1", card_info)
				if (user && user.customer) {
					console.log("Checking if customer have card or subscription!")
					customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
						user: user,
						liveUser: user.customer.customerType === "live" ? true : false
					});
				}
				if (customer_info.has_card_or_subscription == false && customerTypeValid && user && !user.roles.includes('user') && !user.roles.includes('admin')) {
					console.log("Customer have no card - ask for card")
					// mixpanel code//
					mixpanel.identify(user.email);
					mixpanel.track('Customer - Ask Credit Card');
					mixpanel.people.set({
						$first_name: user.firstName,
						$last_name: user.lastName,
					});
					let proceedAfterPromoCode = true
					if (promoCodeInput && promoCodeApplied) {
						proceedAfterPromoCode = false
						proceedAfterPromoCode = await updatePromoCodeDetails(job);
					}
					if (proceedAfterPromoCode) {
						if (technicianId) {
							window.location.href = `/customer/profile-setup?page=registration&haveCC=false&jobId=${JobId}&technicianId=${technicianId}`;
						} else {
							window.location.href = `/customer/profile-setup?page=registration&haveCC=false&jobId=${JobId}`;
						}
					} else {
						openNotificationWithIcon("error", "Error", "Please try again!")
						setShowSpinner(false)
					}
				} else {
					console.log("OrganizationTesting :: have card")
					let lifeCycleTag = ''
					if (job && job.is_transferred && job.is_transferred == true) {
						lifeCycleTag = JobTags.HAVE_CARD_AFTER_TRANSFER;
					} else {
						lifeCycleTag = JobTags.HAVE_CARD;
					}
					if (job && JobId && !repostJob) {
						await JobCycleApi.create(lifeCycleTag, JobId, user.id);
					} else {
						await JobCycleApi.create(lifeCycleTag, false, user.id);
					}
					if (technicianId || selectedTechnician?.value) {
						updateJobObject['post_again'] = true
						updateJobObject['post_again_reference_job'] = jobIdFromUrl
						updateJobObject['post_again_reference_technician'] = technicianId ? technicianId : selectedTechnician?.value
						updateJobObject['tech_search_time'] = '300000'
					}
					if (repostJob) {
						checkAndCreateNewJob(updateJobObject)
					} else if (hireExpertTransferJob) {
						console.log("inside else if hireExpertTransferJob")
						checkAndCreateNewJob(updateJobObject)
					} else if (jobId !== '' && job && JobId && jobId === JobId && newPostJob != 'yes') {
						console.log("inside else if - jobId !== emptyString && job && JobId && jobId === JobId && newPostJob != yes")
						cardPreAuthorization(job)
					} else {
						console.log("OrganizationTesting :: finally posting job", { job, updateJobObject })
						//mixpanel code
						mixpanel.identify(user.email);
						mixpanel.track('Customer - ASAP job posted')
						cardPreAuthorization(updateJobObject, card_info)
					}
				}
			}
			console.log("OrganizationTesting :: from btn click", updateJobObject)
		} else {
			openNotificationWithIcon("info", "Info", `Please contact your owner to add credit card`)
			history.push("/")
		}
	}

	/**
	 * emit send-schedule-alerts socket and create / fetch notification customer notifications
	 * @params : jobStats(Type:Object): Have job details
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const emitSocketCreateFetchNotification = async (jobStats) => {
		try {
			console.log("send-schedule-alerts :::::::::::", jobStats)
			//Notification for customer
			const notificationData = {
				user: user.id,
				job: jobStats.id,
				read: false,
				actionable: false,
				title: 'We are finding a technician for you. We will inform you when we find the technician',
				type: 'Scheduled Job',
			};
			console.log("notificationData ::::::::", notificationData)
			await createNotification(notificationData);
			await fetchNotifications({ user: user.id });

			// call send-schedule-alerts socket from backend.
			// It will find available techs and send alerts by sms/email/notification
			let scheduleTimeNew = getPrimaryTime(scheduleJobTime);
			socket.emit('search-for-tech', {
				jobId: jobStats.id,
				customerTimezone: user.timezone,
				jobData: jobStats,
				primaryTime: scheduleTimeNew,
				phoneNumber: user.customer.phoneNumber,
				customerName: user.firstName,
				customerEmail: user.email,
				technicianId: technicianId ? technicianId : selectedTechnician.value,
			});
		} catch (err) {
			mixpanel.identify(user.email);
			mixpanel.track('There is catch error while create/fetch notification', { jobStats: jobStats, errMessage: err.message });
			console.error('There is catch error while create/fetch notification  :::: ' + err.message)
		}
	}

	const openScheduleForLaterModal = () => {
		const isWithinWorkingHours = isWorkingHours(scheduleJobTime);
		if (!isWithinWorkingHours) {
			openNotificationWithIcon('error', 'Error', "Our techs are mostly available between 9am-9pm EST Mon-Fri. Please schedule a good time during these business hours.");
			return;
		}
		setOpenModalForScheduleMessgae(true)
	};

	const scheduleForLater = async (e) => {
		setOpenModalForScheduleMessgae(false);
		e.preventDefault()
		// Function  decideMeetingServiceViaLaunchdarkly decides with which meetingService this job would continue
		await decideMeetingServiceViaLaunchdarkly();
		// Here we are checking is jobid is available in url then we are using that jobid otherwise we are using job.id
		const JobId = jobIdFromUrl ? jobIdFromUrl : job?.id;
		console.log("verify jobId for schedule job", JobId)
		if (searchTechType === "other") {
			if (!selectedTechnician.value) {
				console.log("selectedTechnician", selectedTechnician)
				setShowSpinner(false)
				openNotificationWithIcon("info", "Info", `Please either select a technicain or choose "Any" technicians to proceed further!`)
				return
			}
		}

		const isStripeAvilable = await checkOwnerStripeId(user)
		if (isStripeAvilable.success) {
			let scheduleTimeNew = getPrimaryTime(scheduleJobTime);
			console.log("scheduleTimeNew", scheduleTimeNew)
			const hourDifferenceFromNow = scheduleTimeNew - new Date().getTime()
			if (hourDifferenceFromNow < 3600000) {
				openNotificationWithIcon("error", "Error", "Please select time atleast 1 hour from now!")
			}
			else {
				localStorage.setItem("isScheduleJob", true)
				setShowSpinner(true)
				console.log("My console from schedule job")
				const scheduleJobData = {};
				let scheduleDetails = {
					'primaryTimeAvailable': true,
					'primaryTimeExpiredAt': null,
					'secondaryTimeAvailable': false,
					'secondaryTimeExpiredAt': null,
					'scheduleExpired': false,
					'scheduleExpiredAt': null
				}
				scheduleJobData.scheduleDetails = scheduleDetails
				scheduleJobData.scheduleDetails.scheduleExpiredAt = new Date(scheduleTimeNew - 1200000)

				// If this is true then we will not send any notification to that particular tech who declined the job
				scheduleJobData['is_transferred_notification_sent'] = job?.is_transferred

				if (user) {
					mixpanel.identify(user.email);
					mixpanel.track('Customer - Click on Schedule for later button ');
				}
				if (!user || user.email === "guest@geeker.co") {
					console.log("guest user!")
					scheduleJobData.primarySchedule = scheduleTimeNew;

					setScheduleJobTime(scheduleTimeNew)

					await updateJobAsGuest(jobIdFromUrl, scheduleJobData)
					setShowSpinner(false)
					if (technicianId) {
						scheduleJobData['post_again_reference_job'] = jobIdFromUrl
						scheduleJobData['post_again_reference_technician'] = technicianId
						await updateJobAsGuest(jobIdFromUrl, scheduleJobData)
						if (job?.guestJob) logoutGuestAccount()
						window.location.href = `/customer/start-profile-setup?page=registration&jobId=${JobId}&technicianId=${technicianId}`;
					} else {
						if (job?.guestJob) logoutGuestAccount()
						window.location.href = `/customer/start-profile-setup?page=registration&jobId=${JobId}`;
					}

				} else {
					if (job?.guestJob) logoutGuestAccount()
					console.log("user logged in!")
					console.log('Job data>>>schedule', job)
					let lifeCycleTag = ''
					if (job && job.is_transferred && job.is_transferred == true) {
						lifeCycleTag = JobTags.SCHEDULE_AFTER_TRANSFER;
					} else {
						lifeCycleTag = JobTags.SCHEDULE;
					}
					await JobCycleApi.create(lifeCycleTag, false, user.id);
					const klaviyoData = {
						email: user.email,
						event: 'Scheduled Job Created',
						properties: {
							$first_name: user.firstName,
							$last_name: user.lastName,
						},
					};
					await klaviyoTrack(klaviyoData);
					localStorage.removeItem("showAfterBusinessHrs");
					let customer_info = await checkCustomerSubscription(user);
					console.log("cardsInfo >>>>>>>>> in schedule later ", customer_info)

					if (customer_info.has_card_or_subscription == false && user && !user.roles.includes('user') && !user.roles.includes('admin')) {
						JobApi.updateJob(jobIdFromUrl, { primarySchedule: scheduleTimeNew })
						setShowSpinner(false)
						window.location.href = `/customer/profile-setup?page=registration&jobId=${JobId}`;
					} else {
						await JobCycleApi.create(JobTags.HAVE_CARD, JobId, user.id);
						scheduleJobData.primarySchedule = scheduleTimeNew;
						scheduleJobData.status = 'Scheduled'
						if (technicianId || selectedTechnician?.value) {
							scheduleJobData['post_again_reference_job'] = jobIdFromUrl
							scheduleJobData['post_again_reference_technician'] = technicianId ? technicianId : selectedTechnician?.value
						}
						setScheduleJobTime(scheduleTimeNew)
						let jobStats = await cardPreAuthorization(scheduleJobData)
						console.log("jobStats after cardPreAuthorization", jobStats)
					}
				}
			}
		} else {
			openNotificationWithIcon("info", "Info", `Please contact your owner to add credit card`)
			history.push("/")
		}
	}

	// Promo Code Apply Function
	const applyPromoCode = async () => {
		if (promoCodeInput) {
			setIsPromocodeApplied({})
			const promocode = (promoCodeInput.trim())
			// retrieving promocode data to db
			const response = await PromocodeApi.retrievePromoData(promocode);
			console.log("response- when coupon code is applied", promocode)
			if (response) {
				if (response && response.message) {
					return openNotificationWithIcon("error", "Error", response.message);
				} if (response && response.expiry_date && (new Date(response.expiry_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
					return openNotificationWithIcon("error", "Error", MESSAGES[0]);
				} if (response && response.used_by) {
					if (user && user.id) {
						const findUser = response.used_by.find((item) => item.user_id === user.id);
						console.log("Check User Exists ?", findUser)
						if (findUser && !(JSON.stringify(findUser) === "{}")) {
							return openNotificationWithIcon("error", "Error", MESSAGES[1]);
						}
						else {
							setIsPromocodeApplied(response);
							const message = response.discount_type === "fixed" ? `Promocode of $${response.discount_value} is applied !!` :
								`Promocode of ${response.discount_value}% is applied !!`
							return openNotificationWithIcon("success", "Success", message);
						}
					}
				}
			} else {
				return openNotificationWithIcon("error", "Error", MESSAGES[4]);
			}
		} else {
			return openNotificationWithIcon("error", "Error", MESSAGES[3]);
		}
	}

	// Update Details of User and JobID in Promocode Database
	const updatePromoCodeDetails = async (jobData) => {
		if (promoCodeApplied && promoCodeApplied.id) {
			const updateData = {
				user_id: user ? user.id : '',
				job_id: jobIdFromUrl,
				used_date: new Date()
			}
			console.log('updateData', updateData)
			console.log('response-promo', promoCodeApplied)
			// updating promo code to the DB
			const updateResponse = await PromocodeApi.updatePromoData(promoCodeApplied.id, updateData);
			console.log("check updateResponse", updateResponse)
			if (updateResponse) {
				const updateUser = {
					"coupon_id": promoCodeApplied.id,
					"coupon_code": promoCodeApplied.promo_code,
					"discount_type": promoCodeApplied.discount_type,
					"coupon_code_discount": promoCodeApplied.discount_value
				}
				updateJob(jobIdFromUrl, updateUser)
				return true
			}
		} else {
			return false;
		}

	}

	/**
	 * Following function is to handle back button click
	 * @params : none
	 * @return : none
	 * @author : Vinit
	 **/
	const handleBackBtnClick = () => {
		console.log("Back button clicked from job summary page for job with id", jobIdFromUrl)
		if (technicianId) {
			window.location.href = `/customer/start-profile-setup?page=select-software&jobId=${jobIdFromUrl}&edit=true&technicianId=${technicianId}`
		} else {
			window.location.href = `/customer/start-profile-setup?page=select-software&jobId=${jobIdFromUrl}&edit=true`
		}
	}

	if (showLoader) return <Loader height="100%" />;

	return (<>
		<div className="d-flex justify-content-center align-items-start flex-wrap max-w-60p margin-auto" >
			<div className="d-flex justify-content-center align-items-start w-100p flex-wrap">
				<div className="d-flex flex-column justify-content-start w-50p p-0-30-10-30 media-max-width-500-width-100p media-max-width-500-padding-lr-0">
					<span className="job-summary-heading">Software:</span>
					<span className="job-summary-value">{job?.software?.name ? job?.software?.name : "NA"}</span>
					<span className="job-summary-heading">Area:</span>
					<span className="job-summary-value">{job?.subOption ? job?.subOption : "NA"}</span>
					<span className="job-summary-heading">Details:</span>
					<span className="job-summary-value">{job?.issueDescription ? job?.issueDescription : "NA"}</span>
				</div>
				<div className="d-flex flex-column  justify-content-start w-50p p-0-30-10-30 media-max-width-500-width-100p media-max-width-500-padding-lr-0">
					{isEstimatesVisible ?
						// {true ? 
						<>
							<span className="job-summary-heading">Estimated wait time is:</span>
							<span className="job-summary-value">{job?.software?.estimatedWait ? job?.software?.estimatedWait + " min" : "NA"}</span>
							<span className="job-summary-heading">Most jobs like yours take between:</span>
							<span className="job-summary-value">{job?.software?.estimatedTime ? job?.software?.estimatedTime + " min" : "NA"}</span>
							{/* {userIsOwner || !ownerHaveSubscription ? (
								<>
									<span className="job-summary-heading">Most jobs like yours cost between:</span>

									<div>
										{user && !isFirsJob && (
											<span className="job-summary-value">
												${calculatedPrices.initPriceToShow}-${calculatedPrices.finalPriceToShow}
											</span>
										)}
										{(!user || isFirsJob) && (
											<span className="strike-through">
												${calculatedPrices.initPriceToShow}-${calculatedPrices.finalPriceToShow}
											</span>
										)}{" "}
										{(!user || isFirsJob) && (
											<span className="job-summary-value">
												${Number(
													calculatedPrices.initPriceToShow
														? calculatedPrices.initPriceToShow - job?.software?.rate
														: ""
												)}-${Number(
													calculatedPrices.finalPriceToShow
														? calculatedPrices.finalPriceToShow - job?.software?.rate
														: ""
												)}
											</span>
										)}
									</div>
								</>

							) : (
								<></>
							)} */}
						</> : null}
				</div>
			</div>
			<hr className="w-90p p-0-30 mt-0 mb-50" />
			<div className='p-0-30-10-30 media-max-width-500-padding-lr-0' style={{ width: "100%", maxWidth: "600px" }}>
				<div className={` softare-label-div margin-bottom-15`}>
					<label className='softare-label-n '>I need this done:</label>
				</div>
				<div className='d-flex justify-content-start '>
					<div id="asap-btn" className={`later-div d-flex align-items-center justify-content-center ${needThisDone === "asap" ? "asap-div d-flex align-items-center justify-content-center" : ""} ${showLoader ? " disabledButton" : ""}`} onClick={asapHandler} >
						<div className='inner-asap d-flex justify-content-start align-items-center'>
							{needThisDone === "asap" ? <CheckInCircle bgColor={"cyan"} style={{ height: "16px", width: "16px", marginRight: "10px" }} /> : <div className='asap-circle'></div>}
							<span className={"asap-span " + (needThisDone === "asap" ? "font-weight-600" : "")}>ASAP</span>
						</div>
					</div>
					<div id="later-btn" className={`later-div d-flex align-items-center justify-content-center ${needThisDone === "later" ? "asap-div d-flex align-items-center justify-content-center " : ""} ${showLoader ? " disabledButton" : ""}`} onClick={laterHandler}>
						<div className='inner-asap d-flex justify-content-start align-items-center'>
							{needThisDone === "later" ? <CheckInCircle bgColor={"cyan"} style={{ height: "16px", width: "16px", marginRight: "10px" }} /> : <div className='asap-circle'></div>}
							<span className={"asap-span " + (needThisDone === "later" ? "font-weight-600" : "")}>Later</span>
						</div>
					</div>
				</div>
			</div>
			<div className='sched-later-div d-flex w-100p p-0-30-10-30 mt-10 media-max-width-500-padding-lr-0'>
				{needThisDone === "later" && <ScheduleForLater scheduleJobTime={scheduleJobTime} setScheduleJobTime={setScheduleJobTime} showSpinner={showSpinner} />}
			</div>
		</div>
		<div className="max-w-60p margin-auto">
			<div className="p-0-30-10-30 media-max-width-500-padding-lr-0">
				{user && havePromoCode && <div>
					<div className="promoText">Have a promo code? Enter here</div>
					<div className="promoInputGroup media-max-width-500-width-100p">
						<input className="promoInput mr-10 media-max-width-500-width-70p" type="text" onChange={(e) => { setPromoCodeInput(e.target.value) }} />
						<a className="promoApplyText" onClick={applyPromoCode}  >Apply</a>
					</div>
				</div>}
			</div>
		</div>

		<div className="max-w-60p margin-auto">
			<div className="d-flex justify-content-between align-items-start flex-wrap p-0-30-10-30 media-max-width-500-padding-lr-0 mt-15 w-100p">
				<BasicButton disable={showSpinner} onClick={handleBackBtnClick} height={"70px"} width={"75px"} background={"#92A9B8"} color={"#fff"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"left"} />
				<div className="media-max-width-355-mt-20"  >
					<BasicButton id="get-help-job-summary" disable={nextButton || showSpinner} onClick={needThisDone === "later" ? openScheduleForLaterModal : findTechnician} btnTitle={needThisDone === "later" ? "Schedule" : "Get Help Now"} height={"70px"} width={"175px"} background={"#01D4D5"} color={"#fff"} showSpinner={showSpinner} />
					<div>
						<Modal
							style={{ top: 100 }}
							closable={false}
							onCancel={() => { setOpenModalForScheduleMessgae(false) }}
							visible={openModalForScheduleMessgae}
							maskStyle={{ backgroundColor: "#DCE6EDCF" }}
							maskClosable={true}
							width={615}
							footer={
								[
									<Button
										className="btn app-btn app-btn-light-blue modal-footer-btn"
										onClick={() => {
											setOpenModalForScheduleMessgae(false);
										}}
										key="no"
									>
										<span></span>No
									</Button>,

									<Button
										className="btn app-btn job-accept-btn modal-footer-btn"
										disabled={nextButton || showSpinner}
										showSpinner={showSpinner}
										onClick={scheduleForLater}
										key="yes"
									>
										<span></span>Yes
									</Button>,

								]}
						>
							<div className="">
								<span className="divsize">Please note, if you don`t show up to the call on scheduled time after a Geek accepted the call a fee of $24.99 will be applied. Are you sure you want to continue?</span>
							</div>
						</Modal>
					</div>

					{user && !havePromoCode && !haveSubscription &&
						<p onClick={() => setHavePromoCode(true)} className='softare-label-n mt-2 promo-hover-effect'>Promo Code? Click Here</p>}
				</div>
			</div>
			<p className="mt-4 text-center job-summary-heading">You will be charged once the geek accepts the job</p>
		</div>
	</>
	)
}

export default JobSummary
