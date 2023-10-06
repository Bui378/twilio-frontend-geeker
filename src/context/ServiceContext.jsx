import React, { useState, useCallback } from 'react';
import * as ServiceApi from '../api/serviceProvider.api';
import * as TechnicianApi from '../api/technician.api';
import * as BillingDetailsApi from '../api/billingDetails.api';
import * as EarningDetailsApi from '../api/earningDetails.api';
import { useUser } from '../context/useContext';
import * as StripeApi from '../api/stripeAccount.api'
import mixpanel from 'mixpanel-browser';
const ServicesContext = React.createContext({});

function ServicesProvider(props) {
	const [totalTime, setTotalTime] = useState(0);
	const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
	const [totalEarnings, setTotalEarnings] = useState(0);
	const [unFormattedEarnings, setUnformattedEarnings] = useState(0)
	const [jobsData, setJobsData] = useState([]);
	const [monthlyEarnings, setMonthlyEarnings] = useState(0)
	const [monthlyHours, setMonthlyHours] = useState(0)
	const [monthlySeconds, setMonthlySeconds] = useState(0)
	const [onlineTechs, setOnlineTechs] = useState([])
	const [overAllRatings, setoverAllRatings] = useState(0)
	const [detailSubmission, setDetailSubmission] = useState();
	const [disable, setDisable] = useState(false);
	const { user, refetch } = useUser()
	const kFormatter = (num) => {
		return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
	}

	async function FetchDetails(data, FetchDetailsCallback) {
		try {
			const res = await ServiceApi.getTechEarnings(data);
			setUnformattedEarnings(res.totalEarnings)
			setTotalEarnings(kFormatter(res.totalEarnings))
			setTotalTime(res.total_time)
			setTotalTimeSeconds(res.total_time_seconds)
			setMonthlyEarnings(kFormatter(res.monthEarnings))
			setMonthlyHours(res.monthlyHours)
			setMonthlySeconds(res.monthlySeconds)
			setoverAllRatings(res.overAllRatings)

			setJobsData(res.jobs_data)
		} catch (err) {
			console.log('FetchDetails', err)
		}
	}

	async function CreateBillingReport(jobId, job, dataToSave) {
		try {
			let haveBill = false
			let getBillingDetail = await BillingDetailsApi.getBillingDetailsByJob(jobId)
			if (Object.keys(getBillingDetail).length > 0) {
				haveBill = true
			}
			console.log('haveBill>>>>>>', haveBill)
			if (job && haveBill == false) {

				let billDataToSave = {
					'job_id': jobId,
					'customer_user_id': job['customer']['user']['id'],
					'technician_user_id': job['technician']['user']['id'],
					'total_amount': dataToSave['total_amount'],
					'transaction_type': dataToSave['transaction_type'],
					'transaction_status': dataToSave['transaction_status'],
					'is_stripe_called': dataToSave['is_stripe_called']
				}
				let billDetails = await BillingDetailsApi.createBillingDetails(billDataToSave);
				return billDetails
			}
		} catch (err) {
			console.log('CreateJobCreateBillingReportReport error ::', err)
		}
	}

	async function CreateEarningReport(jobId, job, jobTotalCost, dataToSave, is_long_job_hourly = false) {
		try {
			let haveEarning = false
			let getBillingDetail = await EarningDetailsApi.getEarningDetailsByJob(jobId)

			if (Object.keys(getBillingDetail).length > 0) {
				haveEarning = true
			}
			console.log('haveEarning>>>>>>', haveEarning)

			if (job && haveEarning == false) {
				let softwareCommission = job['software']['comission']
				if (is_long_job_hourly) {
					softwareCommission = job['software']['hourlyComission']
				}
				console.log('softwareCommission>>>>>>>>', softwareCommission)
				let amountEarned = (jobTotalCost && jobTotalCost > 0 ? jobTotalCost - ((jobTotalCost * parseFloat(softwareCommission)) / 100) : 0)
				let earnDataToSave = {
					'job_id': jobId,
					'customer_user_id': job['customer']['user']['id'],
					'technician_user_id': job['technician']['user']['id'],
					'total_amount': jobTotalCost,
					'commision': softwareCommission,
					'amount_earned': amountEarned,
					'transaction_type': dataToSave['transaction_type'],
					'transaction_status': dataToSave['transaction_status'],
				}
				let earnDetails = await EarningDetailsApi.createEarningDetails(earnDataToSave);
				return earnDetails;
			}
		} catch (err) {
			console.log('CreateJoCreateEarningReportbReport error ::', err)
		}
	}

	async function checkIfTwoTierJobAndExpertTech(tech, job) {
		console.log('tech>>>>>>>', tech.expertise)
		console.log('job>>>>>>>', job)
		let all_expertise = tech.expertise;
		console.log("All expertise ", all_expertise);
		console.log("job hire expert", job.hire_expert);
		let hire_expert = job.hire_expert;
		console.log("hire_expert>>>>", hire_expert);
		if (hire_expert) {
			for (let exp in all_expertise) {
				if (job.subSoftware != undefined) {
					// for sub software
					let result = await checkMatchAndReturnResult(job.subSoftware, all_expertise[exp], 'subsoftware')
					if (typeof result == "boolean") {
						console.log("Result for expert ", result);
						return result
					}
				} else {
					// for main software
					let result = await checkMatchAndReturnResult(job.software, all_expertise[exp], 'software')
					if (typeof result == "boolean") {
						console.log("Result for expert ", result);
						return result
					}
				}
			}
		} else {
			return true
		}
	}

	function checkMatchAndReturnResult(software, exp, message_software) {
		if (software.id == exp.software_id) {
			if (exp.two_tier_value != undefined) {
				if (exp.two_tier_value == 'expert') {
					console.log('checkIfTwoTierJobAndExpertTech:: expert with ' + message_software + ' value')
					return true
				} else {
					console.log('checkIfTwoTierJobAndExpertTech::not expert with ' + message_software + ' value')
					return false
				}
			} else {
				console.log('checkIfTwoTierJobAndExpertTech::not expert without ' + message_software + ' value')
				return false
			}
		} else {
			return 'no-match'
		}
	}

	async function getOnlineTechnicians(data) {
		try {
			console.log("context getOnlineTechnicians >>", data)
			let techData = await TechnicianApi.getOnlineTechnicians(data)
			if (techData.success) {
				let temp = techData.data
				setOnlineTechs(temp)
			}
			else {
				console.log("techData >>> failed")
				setOnlineTechs([])
			}
		}
		catch (err) {
			console.log("error in getOnlineTechnicians >>>>>.", err)
		}
	}

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
		return hours + ':' + min + ':' + sec;
	}

	/**
 * this function get stripem account status  
 * @param : Stripe accountId id (Type:String)
 * @response : JSON object
 * @author : Sahil Sharma
 **/
	const getStripeAccountStatus = async (accountId) => {
		let accountstatus = false
		try {
			const accountData = await StripeApi.getAccountDetailSubmission({ 'accountId': accountId });
			if (accountData) {
				setDetailSubmission(accountData.accountStatus)
				accountstatus = accountData.accountStatus
			}
		} catch (err) {
			console.log("error in getStripeAccountStatus ::::::: ", {
				"error": err,
			})
		}
		return accountstatus
	}

	const generateAccountLink = async (user) => {

		try {
			setDisable(true)
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Click to complete stripe account profile', { "user email": user.email });
			let generateLink = await StripeApi.generateLink({ 'accountId': user.technician.accountId, 'email': user.email })
			if (generateLink && generateLink.accountLink !== "") {
				const newTab = window.open(generateLink.accountLink, '_blank');
				if (newTab) {
					newTab.focus();
				}
			}
		} catch (err) {
			console.log("error in generateAccountLink ::::::: ", {
				"error": err,
			})
		}
	}
	/**
	* this function create Stripe account   
	* @param :  Technician details (Type:Object)
	* @response : JSON object
	* @author : Sahil Sharma
	**/
	const createStripeAccount = async (user) => {
		try {
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Click to create stripe account', { "user email": user.email });
			setDisable(true)
			let dataToCreateAccount = await getTechDetails(user)
			const createAccount = await StripeApi.createStripeAccount({ 'dataToCreateAccount': dataToCreateAccount });
			if (createAccount.accountId && createAccount.accountLink) {
				await refetch()
				window.location.href = createAccount.accountLink
			}
		} catch (err) {
			console.log("error in createStripeAccount ::::::: ", { "error": err, })
		}
	}

	/**
	 * this function generate stripe login link  
	 * @param : Stripe accountId id (Type:String)
	 * @response : JSON object
	 * @author : Sahil Sharma
	 **/
	const getStripeAccountLoginLink = async (user) => {
		try {
			let generateLoginLink = await StripeApi.getAccountloginLink({ 'accountId': user.technician.accountId })
			if (generateLoginLink && generateLoginLink.loginUrl !== "") {
				window.open(generateLoginLink.loginUrl,
					'_blank');
			}
		} catch (err) {
			console.log("error in generateAccountLink ::::::: ", {
				"error": err,
			})
		}
	}

	const getTechDetails = useCallback((user) => {
		const dataToCreateAccount = {};
		dataToCreateAccount['id'] = user.technician.id
		dataToCreateAccount['firstName'] = user.firstName
		dataToCreateAccount['lastName'] = user.lastName
		dataToCreateAccount['email'] = user.email
		dataToCreateAccount['timezone'] = user.timezone
		return dataToCreateAccount;
	});

	return (
		<ServicesContext.Provider
			value={{
				FetchDetails,
				totalTime,
				totalTimeSeconds,
				totalEarnings,
				jobsData,
				monthlyEarnings,
				monthlyHours,
				monthlySeconds,
				overAllRatings,
				setJobsData,
				kFormatter,
				CreateBillingReport,
				CreateEarningReport,
				checkIfTwoTierJobAndExpertTech,
				onlineTechs,
				getOnlineTechnicians,
				unFormattedEarnings,
				convertTime,
				getStripeAccountStatus,
				generateAccountLink,
				createStripeAccount,
				detailSubmission,
				setDetailSubmission,
				disable,
				setDisable,
				getStripeAccountLoginLink
			}}
			{...props}
		/>
	);
}

function useServices() {
	const context = React.useContext(ServicesContext);
	if (context === undefined) {
		throw new Error('useJitsiMeet must be used within a JobProvider');
	}
	return context;
}

export { ServicesProvider, useServices };
