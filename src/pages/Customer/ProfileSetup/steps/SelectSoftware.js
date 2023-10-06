import React, { useEffect, useState } from 'react'
import * as SoftwareApi from '../../../../api/software.api';
import BasicButton from 'components/common/Button/BasicButton';
import SoftwareDropDown from 'components/common/SoftwareDropDown';
import { useAuth } from '../../../../context/authContext';
import { useJob } from '../../../../context/jobContext';
import mixpanel from 'mixpanel-browser';
import * as JobCycleApi from '../../../../api/jobCycle.api';
import { JobTags, SECRET_KEY, EmailOutlook } from '../../../../constants';
import * as JobApi from '../../../../api/job.api';
import { isLiveUser, GAevent, getCookie, PushUserDataToGtm } from '../../../../utils';
import { useLocation } from 'react-router';
import { openNotificationWithIcon } from '../../../../utils';
import { useResizeObserver } from '../../../../utils/index';
import Loader from '../../../../components/Loader';
import { INACTIVE_ACCOUNT_STATUS_MSG } from '../../../../constants';
import { Spin } from 'antd';
import Select from 'react-select'
import * as TechnicianApi from '../../../../api/technician.api';
import AfterSelectedSoftwareModal from '../Components/AfterSelectedSoftwareModal';
import axios from "axios";

let liveUser = true;
let isSoftwareEmailOrOutlook = false;

function SelectSoftware({ setJobInfo, jobInfo, user, job, setGuestJobId, newPost, setIsFirsJob, isFirsJob }) {

    const [softwareList, setSoftwareList] = useState([]);
    const [currentSoftware, setCurrentSoftware] = useState(jobInfo.currentSoftware ? [jobInfo.currentSoftware] : []);
    const [currentSubSoftware, setCurrentSubSoftware] = useState(jobInfo.currentSubSoftware ? jobInfo.currentSubSoftware : "");
    const [needThisDone, setNeedThisDone] = useState(jobInfo.needThisDone)
    const [disable, setDisable] = useState(false)
    const [disablePrevGeek, setDisablePrevGeek] = useState(false)
    const [disableDetails, setDisableDetails] = useState(true)
    const [textarea, setTextarea] = useState(jobInfo.moreDetails);
    const [characterCount, setCharacterCount] = useState(textarea.length);
    const [count, setCount] = useState(500);
    const [charLeftColor, setCharLeftColor] = useState(false)
    const [nextButton, setNextButton] = useState(true)
    const [hireValue, setHireValue] = useState(false);
    const { getGuestUser } = useAuth();
    const { createJobAsGuest, createJob, fetchJob } = useJob();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const repostJob = queryParams.get('repost') ? queryParams.get('repost') : false;
    let technicianIdParams = queryParams.get("technicianId") ? queryParams.get("technicianId") : false
    const [technicianId, setTechnicianId] = useState(technicianIdParams)
    const postAgainJobReference = queryParams.get("jobId") ? queryParams.get("jobId") : false
    const hireExpertTransferJob = queryParams.get('hireExpertTransferJob') ? queryParams.get('hireExpertTransferJob') : false;
    const transferredJob = queryParams.get('transferredJob') ? queryParams.get('transferredJob') : false;
    const technicianProfile = queryParams.get('medium') ? queryParams.get('medium') : false;
    const uniqueTechScheduleJob = queryParams.get('applyJobFor') ? queryParams.get('applyJobFor') : false;
    const editJob = queryParams.get('edit') ? queryParams.get('edit') : false;
    let newPostJob = newPost != undefined ? newPost : queryParams.get("newpost")
    const [showSpinner, setShowSpinner] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [softwareId, setSoftwareId] = useState()
    const [subSoftwareName, setSubSoftwareName] = useState()
    const [transferJobData, setTransferJobData] = useState()
    const [selectedTechs, setSelectedTechs] = useState(technicianId && postAgainJobReference ? true : false)
    const [isSpecificSoftwareSelected, setIsSpecificSoftwareSelected] = useState(false);
    const [goToJobSummaryPage, setGoToJobSummaryPage] = useState(false)
    const [techniciansList, setTechniciansList] = useState([])
    const [selectedPrevGeek, setSelectedPrevGeek] = useState()
    const [ip, setIp] = useState("")
    const getMeasurementId = process.env.REACT_APP_GA_MEASUREMENT_ID
    const mes_id = getMeasurementId ? getMeasurementId.split("-")[1] : false
    const [uniqueTechSoftId, setUniqueTechSoftId] = useState([]);
    const [isTechUniqueLink, setIsTechUniqueLink] = useState(false)

    useEffect(() => {
        (async () => {
            try {
                if (user) {
                    console.log("My console to check user for tech", user)
                    if (user.userType === "technician") {
                        console.log("tetch token removed from selectSoftware")
                        localStorage.removeItem(SECRET_KEY);
                        console.log("window.location.href from selectSoftware", user)
                        window.location.href = "/"
                    }
                }
                console.log("My console to check editJob", editJob)
                localStorage.removeItem('authorizationInfo');
                const res = await SoftwareApi.getSoftwareList();
                console.log("My console to check", res)
                if (res && res.data) {
                    setSoftwareList(res.data);
                    setIsLoading(false)
                }
                if (postAgainJobReference) {
                    await fetchJob(postAgainJobReference)
                }
                if (user) {
                    // getting total jobs of customer from DB
                    const totalNumberOfJobsOfCustomer = await JobApi.getTotalJobs({ customer: user.customer.id })
                    if (totalNumberOfJobsOfCustomer === 0) setIsFirsJob(true)
                }
                if (hireExpertTransferJob) {
                    console.log("My console ------------- 1", hireExpertTransferJob)
                }
            } catch (e) {
                console.log("Err while getting software list --------------", e)
            }
            console.log("My console to check technicianId", technicianId)
        })();
        //GA3 tag commented by Vinit on 24/04/2023.
        GAevent('Job Initiate', 'job_initiated', 'job_initiated', user ? (user?.customer ? user.customer?.id : user.id) : 'guest_user');
        getIPData();
        const jobIdParams = queryParams.get("jobId");
        // we need to make sure the event is triggered only once
        if (process.env.REACT_APP_URL && !jobIdParams && job === undefined) {
            const appUrl = process.env?.REACT_APP_URL?.split("/")[2] || false;
            PushUserDataToGtm('job_initiated', user, appUrl);
        }
    }, []);

    /**
     * Following function is to get ip address of customer
     * @params : none
     * @return : none
     * @author : Vinit
     **/
    const getIPData = async () => {
        try {
            const res = await axios.get(" https://geolocation-db.com/json/");
            console.log("Customer's ip is ", res.data);
            setIp(res.data.IPv4)
        } catch (error) {
            console.log("Err occured while getting ip", { error })
        }
    };

    /**
     * This useEffect is responsible to fetch techs when customer wish to select a specific tech from past.
     * @params : selectedTechs : Boolean
     * @return : returns a list of relevant techs(whether online/offline)
     * @author : Kartar Singh
     **/

    useEffect(() => {
        (async () => {
            if (technicianId && postAgainJobReference) {

                const techData = await TechnicianApi.getTechnicianDetailesByUserId(technicianId)

                const onlineTech = await TechnicianApi.getOnlineTechnicianById(technicianId)

                let temp = [];
                let techId = techData?.data[0].id
                let value = techData?.data[0].user?.id
                let label = `${techData?.data[0].user?.firstName} ${techData?.data[0].user?.lastName}`
                let status = techData?.data[0].status

                if (onlineTech.activeUserFound) {
                    temp.push({ techId, value, label, status, online: true })
                } else {
                    temp.push({ techId, value, label, status, online: false })
                }
                setTechniciansList(temp)
                setSelectedPrevGeek(technicianId)

            }
        })()
    }, [])

    /**
 * This useEffect is responsible to fetch all the relevant techs when customer wish to select a specific tech from past.
 * @params : selectedTechs : Boolean
 * @return : returns a list of relevant techs(whether online/offline)
 * @author : Vinit
 **/
    useEffect(() => {
        (async () => {
            console.log("My console for selected software id", softwareId)
            if (selectedTechs && user && softwareId) {
                console.log("My console for selected software id", softwareId)
                // getting all online technician data from DB
                const allActiveTechnicians = await TechnicianApi.getOnlineTechnicians({ "softwares": softwareId })
                console.log("My console for active techs", allActiveTechnicians.data)
                // getting all customers job response from DB by there customer.id
                const allCustomerJobsRes = await JobApi.findAllJobsByParams({ customer: user.customer.id })
                let temp = [{ techId: "Any", value: "Any", label: "Any Geek" }]
                const allTechniciansId = allCustomerJobsRes.jobs.data.map((item) => {
                    if (item?.technician?.id !== undefined && item?.technician?.id !== "") {
                        let techId = item?.technician?.id
                        let value = item?.technician?.user?.id
                        let label = `${item?.technician?.user?.firstName} ${item?.technician?.user?.lastName}`
                        let status = item?.technician?.status
                        temp.push({ techId, value, label, status })
                    }
                })
                console.log("My console to check temp", temp)
                let filteredArr = temp.filter((ele, index, arr) => arr.findIndex(ele2 => (ele2.value === ele.value)) === index)
                console.log("My console to check filteredArr", filteredArr)

                let finalArr = filteredArr.map((ele) => {
                    console.log("My console to check ele", ele.techId, allActiveTechnicians.data)
                    allActiveTechnicians.data.forEach((item) => {
                        console.log("My console to look for ele", ele)
                        if (!ele.online) {
                            console.log("My console to check for condition", ele.techId === item.id)
                            if (ele.techId === item.id) {
                                ele['online'] = true
                            } else {
                                ele['online'] = false
                            }
                        }
                    })
                    return ele
                })
                console.log("My console to check ele 2", finalArr)
                setTechniciansList(finalArr)
            }
        })()
    }, [selectedTechs, softwareId])
    /**
 * This useEffect is responsible to fetch technician details  that unique link will be share.
 * @params : technician userId
 * @return : returns a relevant techs(whether online/offline)
 * @author : Mritunjay
 **/
    useEffect(() => {
        (async () => {
            if (technicianId && technicianProfile) {
                let temp = [];
                const techData = await TechnicianApi.getTechnicianDetailesByUserId(technicianId)
                setUniqueTechSoftId(techData.data[0].expertise)
                const onlineTech = await TechnicianApi.getOnlineTechnicianById(technicianId)
                let techId = techData?.data[0].id
                let value = techData?.data[0].user?.id
                let label = `${techData?.data[0].user?.firstName} ${techData?.data[0].user?.lastName}`
                let status = techData?.data[0].status
                if (onlineTech.activeUserFound) {
                    temp.push({ techId, value, label, status, online: true })
                } else {
                    temp.push({ techId, value, label, status, online: false })
                }
                setTechniciansList(temp)
                setSelectedPrevGeek(technicianId)
            }
        })()
    }, [technicianId])

    useEffect(() => {
        if (technicianId && technicianProfile && softwareId) {
            setIsTechUniqueLink(true)
        }
    }, [technicianId, softwareId])

    useEffect(() => {
        if (jobInfo && jobInfo.needThisDone.length > 0) {
            setNextButton(false)
            if (jobInfo.moreDetails.length > 0) {
                setDisableDetails(false)
            }
        }
        setSoftwareId(jobInfo.currentSoftware.id)
        setSubSoftwareName(jobInfo.currentSubSoftware)
        setCurrentSoftware(jobInfo.currentSoftware)
    }, [jobInfo])

    useEffect(() => {
        (async () => {
            if (user) {
                liveUser = await isLiveUser(user)
            }
        })()
    }, [user])

    useEffect(() => {
        if (job) {
            console.log("My console updated job from URL", job)
            setSoftwareId(job.software.id)
            setSubSoftwareName(job.subOption)
            setCurrentSoftware(job.software)
            setCurrentSubSoftware(job.subOption)
            setTextarea(job.issueDescription)
            if (transferredJob) {
                let updatedDescription = job.updatedIssueDescription[0].issueDescription
                console.log("console for transfer job", { hireExpertTransferJob, newPostJob, job })
                setTransferJobData(prepareDataForTransferJob(job, updatedDescription))
            }
        }
    }, [job])

    useEffect(() => {
        (async () => {
            if (transferJobData) {
                console.log("My console for transferJobData", transferJobData)
                // const newTransferJob = createJob(transferJobData)
                await JobApi.createJob(transferJobData).then(async (res) => {
                    console.log("My console for newTransferJob", res)
                    window.location.href = `/customer/profile-setup?page=tech-search&jobId=${res.id}`
                })
            }
        })()
    }, [transferJobData])

    useEffect(() => {
        console.log("Console in main useEffect 1")
        if (currentSoftware && currentSoftware.sub_option && currentSoftware.sub_option.length > 0) {
            console.log("Console in main useEffect 2", currentSoftware)
            setDisable(false)
            setDisablePrevGeek(false)
            // setNextButton(false)
        } else {
            console.log("Console in main useEffect 3", currentSoftware)
            setDisable(true)
            setDisablePrevGeek(true)
            // setNextButton(true)
        }

        // if(currentSubSoftware && currentSubSoftware.length > 0 ){
        if (currentSubSoftware && currentSubSoftware !== "Select") {
            console.log("Console in main useEffect 4", currentSubSoftware)
            setDisableDetails(false)
            // setNextButton(false)
        } else {
            console.log("Console in main useEffect 5", currentSubSoftware)
            // setDisableDetails(true)
            // setNextButton(true)
        }

        if (textarea && textarea.length > 0) {
            console.log("Console in main useEffect 6", textarea)
            // setNextButton(true)
            setNextButton(false)
        } else {
            console.log("Console in main useEffect 7", textarea)
            setNextButton(true)
            setNeedThisDone("")
        }

        if (textarea && textarea.length > 450) {
            console.log("Console in main useEffect 8", textarea, textarea.length)
            setCharLeftColor(true)
        }
        else {
            console.log("Console in main useEffect 9", textarea, textarea.length)
            setCharLeftColor(false)
        }

        if (textarea && textarea.length > 450) {
            console.log("Console in main useEffect 12", textarea, textarea.length)
            setCharLeftColor(true)
        }
        else {
            console.log("Console in main useEffect 13", textarea, textarea.length)
            setCharLeftColor(false)
        }

    }, [currentSubSoftware, currentSoftware, textarea])

    useEffect(() => {
        (async (e) => {
            if (goToJobSummaryPage) {
                await nextJobSummaryPageHandler(e)
            }
        })()
    }, [goToJobSummaryPage]);



    const sizeRef = useResizeObserver(({ width, height }) => {
        console.log(`Inside selectSoftware Element width: ${width}, height: ${height}`);
    });

    const prepareDataForTransferJob = (job, updatedDescription) => {
        let jobDataToCreateNewTransferJob = {}
        jobDataToCreateNewTransferJob.transfer_reference_job = job?.id
        jobDataToCreateNewTransferJob.customer = user?.customer?.id ? user?.customer?.id : user?.customer
        jobDataToCreateNewTransferJob.software = job?.software?.id
        jobDataToCreateNewTransferJob.expertise = job?.software?.expertise;
        jobDataToCreateNewTransferJob.subOption = job?.subOption;
        jobDataToCreateNewTransferJob.issueDescription = updatedDescription ? updatedDescription : job?.issueDescription;
        jobDataToCreateNewTransferJob.level = 'advanced';
        jobDataToCreateNewTransferJob.estimatedTime = (job?.software ? job?.software.estimatedTime : '0-0');
        if (hireExpertTransferJob) {
            jobDataToCreateNewTransferJob.estimatedPrice = (job?.software ? job?.software.twoTierEstimatePrice : '0-0');
        } else {
            jobDataToCreateNewTransferJob.estimatedPrice = (job?.software ? job?.software.estimatedPrice : '0-0');
        }
        jobDataToCreateNewTransferJob.status = 'Pending';
        jobDataToCreateNewTransferJob.is_transferred = true;
        jobDataToCreateNewTransferJob.hire_expert = hireExpertTransferJob;
        jobDataToCreateNewTransferJob.is_transferred_hire_expert = hireExpertTransferJob;
        // If this is true then we will not send any notification to that particular tech who declined the job
        jobDataToCreateNewTransferJob.is_transferred_notification_sent = true;
        jobDataToCreateNewTransferJob.ownerId = job?.ownerId;
        jobDataToCreateNewTransferJob['tech_declined_ids'] = job?.tech_declined_ids
        jobDataToCreateNewTransferJob.reasons = job?.reasons
        return jobDataToCreateNewTransferJob
    }

    /**
     * Following function is to handle change for second dropdown i.e. technician list
     * @params : data : {value: "", label: ""}
     * @return : Set a state var i.e. selectedTechnician : Boolean
     * @author : Vinit
     **/
    const handleTechniciansList = (data) => {
        console.log("My console to check selected technician", data.value)
        setSelectedPrevGeek(data.value)
        console.log('prev geek  :::', selectedPrevGeek)
    }

    /**
 * Following function is to manipulate the UI for second dropdown options
 * @params : data : {value: "", label: "", online: Boolean}
 * @return : HTML for dropdown and options
 * @author : Vinit
 **/
    const formatOptionLabel = ({ value, label, online, status }) => (
        <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginLeft: "5px", width: "100%" }}>
                {(label === "Any Geek" ? label :
                    status === "Busy" ?
                        <span>{label}<span style={{ color: "#ffc800" }}>{' (In Session)'}</span></span>
                        : online ? <span>{label}<span style={{ color: "#7ed957" }}>{' (Online)'}</span></span> :
                            <span>{label}<span style={{ color: "#a8a8a8" }}>{' (Offline)'}</span></span>)}

            </div>
        </div>
    );

    /**
     * Following function will check if user made any changes  in the existing job data
     * @params = none
     * @response : Boolean
     * @author : Vinit
     */
    const checkIfDataChanged = () => {
        if (softwareId === job.software.id &&
            subSoftwareName === job.subOption &&
            textarea === job.issueDescription) {
            return false
        } else {
            return true
        }
    }

    useEffect(() => {
        removeStorageFromPendingChat();
    }, [])

    // This function will remove localStorage for job whose status is pending and admin sent message to it ~Jagroop
    const removeStorageFromPendingChat = () => {
        try {
            const haveLocalStorage = window.localStorage.getItem('pendingJobHaveChat');
            if (haveLocalStorage) {
                window.localStorage.removeItem('pendingJobHaveChat')
            }
            return;
        } catch (error) {
            console.error("error while removing pending job chat storage", error);
            return;
        }
    }

    const nextBtnHandler = async (e) => {
        setShowSpinner(true)
        e.preventDefault()
        let popupRequiredOptions = ['Local printer and scanner', 'Network printer and scanner']
        if ((popupRequiredOptions.indexOf(currentSubSoftware) != -1) || (currentSoftware?.id === EmailOutlook)) {
            setIsSpecificSoftwareSelected(true);
            if (currentSoftware?.id === EmailOutlook) {
                isSoftwareEmailOrOutlook = true;
            };
        } else {
            await nextJobSummaryPageHandler(e);
        }
    };

    const nextJobSummaryPageHandler = async (e) => {
        if (user && user.blocked) {
            return openNotificationWithIcon('error', 'Error', 'You\'re blocked by the admin.');
        };
        if (user && !user.activeStatus) {
            setShowSpinner(false)
            return openNotificationWithIcon('info', 'Info', INACTIVE_ACCOUNT_STATUS_MSG);
        };
        if (editJob) { // var got from query string.
            console.log("job to be edited", { editJob, softwareId, subSoftwareName, textarea, job })
            if (user) console.log("user at software selection", user)
            const dataChanged = checkIfDataChanged()
            if (dataChanged) {
                console.log("there is change in data")
                // updating changed or edited data
                const updateJobRes = await JobApi.updateJob(postAgainJobReference, { software: softwareId, subOption: subSoftwareName, issueDescription: textarea })
                if (updateJobRes) {
                    setShowSpinner(false)
                    if (selectedPrevGeek && selectedPrevGeek !== 'Any') {
                        window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${postAgainJobReference}&technicianId=${selectedPrevGeek}`;
                    } else {
                        window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${postAgainJobReference}`;
                    }
                } else {
                    setShowSpinner(false)
                    openNotificationWithIcon('error', "Error", "Please try again.")
                }
            } else {
                if ((selectedPrevGeek && selectedPrevGeek !== 'Any')) {
                    window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${postAgainJobReference}&technicianId=${selectedPrevGeek}`;
                } else {
                    window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${postAgainJobReference}`;
                }
            }
        } else {
            const dataToSave = {};
            dataToSave.software = currentSoftware?.id;
            dataToSave.subOption = currentSubSoftware;
            dataToSave.issueDescription = textarea;
            dataToSave.level = 'advanced';
            dataToSave.estimatedTime = (currentSoftware ? currentSoftware.estimatedTime : '0-0');
            dataToSave.estimatedPrice = (currentSoftware ? currentSoftware.estimatedPrice : '0-0')
            dataToSave.hire_expert = hireValue;
            dataToSave.client_id = String(getCookie('_ga').split(".")[2] + "." + getCookie('_ga').split(".")[3]);
            dataToSave.session_id = String(getCookie(`_ga_${mes_id}`).split(".")[2]);
            dataToSave.facebook_fbp = String(getCookie("_fbp"));
            dataToSave.facebook_fbc = String(getCookie("_fbc"));
            dataToSave.status = 'Draft';
            dataToSave.user_agent = navigator.userAgent;
            dataToSave.customer_ip = ip;
            dataToSave.ownerId = user?.ownerId ? user?.ownerId : user?.id;

            if ((selectedPrevGeek && selectedPrevGeek !== 'Any')) {
                dataToSave['post_again_reference_job'] = job?.id
                dataToSave['post_again_reference_technician'] = selectedPrevGeek ? selectedPrevGeek : false;
            }
            let draftJobData;
            if (!user || user.email === "guest@geeker.co") {
                localStorage.removeItem("isScheduleJob")
                console.log("No user exists!")
                dataToSave.customer = `guest_${new Date().getTime()}`;
                dataToSave.guestJob = true;
                const res = await getGuestUser();
                console.log("Guest user response", res)
                if (res && res.token) {
                    console.log("My console - res & res.token", res)
                    await createJobAsGuest(dataToSave, res.token.accessToken).then(async (res) => {
                        mixpanel.track('Customer guest Job Created', { 'JobID': res.id })
                        setGuestJobId(res.id);
                        // creating jobCycle
                        await JobCycleApi.create(JobTags.DRAFT_JOB_CREATED, res.id);
                        console.log(">>>>>>>>>>>>>>>>>>> 1  >>>>>>>>>>>>", res)
                        draftJobData = res
                        console.log("window.location.href from Selectsoftwares with guest user", res)
                        if ((selectedPrevGeek && selectedPrevGeek !== 'Any')) {
                            window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${res.id}&technicianId=${selectedPrevGeek}`;
                            setTimeout(() => {
                                window.location.replace(`/customer/start-profile-setup?page=job-summary&jobId=${res.id}&technicianId=${selectedPrevGeek}`);
                            }, 3000);

                            if (uniqueTechScheduleJob) {
                                window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${res.id}&technicianId=${selectedPrevGeek}&applyJobFor=${uniqueTechScheduleJob}`;
                                setTimeout(() => {
                                    window.location.replace(`/customer/start-profile-setup?page=job-summary&jobId=${res.id}&technicianId=${selectedPrevGeek}&applyJobFor=${uniqueTechScheduleJob}`);
                                }, 3000);
                            };
                        } else {
                            window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${res.id}`;
                            setTimeout(() => {
                                window.location.replace(`/customer/start-profile-setup?page=job-summary&jobId=${res.id}`);
                            }, 3000);
                        };
                    });
                }
            } else {
                localStorage.removeItem("isScheduleJob")
                console.log("user exists!", user)
                dataToSave.customer = user.customer.id ? user.customer.id : user.customer;
                dataToSave.guestJob = false;
                draftJobData = await createJob(dataToSave)
                console.log("window.location.href from selectsoftwares", draftJobData)
                console.log('my selected geek ::: ', selectedPrevGeek)
                if ((selectedPrevGeek && selectedPrevGeek !== 'Any')) {
                    window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${draftJobData.id}&technicianId=${selectedPrevGeek}`;
                    setTimeout(() => {
                        window.location.replace(`/customer/start-profile-setup?page=job-summary&jobId=${draftJobData.id}&technicianId=${selectedPrevGeek}`);
                    }, 3000);
                    if (uniqueTechScheduleJob) {
                        window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${draftJobData.id}&technicianId=${selectedPrevGeek}&applyJobFor=${uniqueTechScheduleJob}`;
                        setTimeout(() => {
                            window.location.replace(`/customer/start-profile-setup?page=job-summary&jobId=${draftJobData.id}&technicianId=${selectedPrevGeek}&applyJobFor=${uniqueTechScheduleJob}`);
                        }, 3000);
                    };
                } else {
                    window.location.href = `/customer/start-profile-setup?page=job-summary&jobId=${draftJobData.id}`;
                    setTimeout(() => {
                        window.location.replace(`/customer/start-profile-setup?page=job-summary&jobId=${draftJobData.id}`);
                    }, 3000);
                };
            };

            console.log("My console to check dataToSave", dataToSave)
            setJobInfo({
                currentSoftware,
                currentSubSoftware,
                needThisDone,
                moreDetails: textarea
            })
            console.log("testing console for draftJobRes", draftJobData)
        };
    };

    useEffect(() => {
        setCharacterCount(textarea.length);
    }, [textarea]);

    const handleChange = (event) => {
        const data = event.target.value.trim();
        if (data === "") {
            setTextarea("");
            setCharacterCount(0);
        } else if (data.length > 500) {
            event.preventDefault();
            return;
        } else {
            setTextarea(event.target.value);
            setCharacterCount(event.target.value.length);
        }
    }

    const onSoftwareSelection = (softId) => {
        const currSoftware = softwareList.find(item => item.id === softId)
        setCurrentSoftware(currSoftware)
        setSoftwareId(currSoftware.id)
        console.log('this is current :::', softwareId)
        setCurrentSubSoftware()
        setSubSoftwareName("Select")
        setDisableDetails(true)
        setTextarea("")
        setSelectedTechs(false)
        setSelectedPrevGeek()
        const selectedSoftwareId = uniqueTechSoftId.map(softId => { return softId.software_id; });
        if (selectedSoftwareId.includes(softId)) {
            setTechnicianId(technicianIdParams)
            setSelectedPrevGeek(technicianIdParams)
            setIsTechUniqueLink(true);
        } else {
            setTechnicianId(false)
            setIsTechUniqueLink(false);
            setTechniciansList([])
        }
    }

    const onSubSoftwareSelection = (value) => {
        setCurrentSubSoftware(value)
        setSubSoftwareName(value)
    }

    if (isLoading || transferredJob) return <Loader height="100%" />;

    return (<React.Fragment key="dropdown">

        <form>
            <div ref={sizeRef}>
                <div className='d-flex justify-content-center margin-bottom-25'>
                    <div style={{ width: "100%", maxWidth: "600px", height: "106px" }}>
                        <div className='softare-label-div'>
                            <label className='softare-label' >I'm using:</label>
                        </div>
                        <div id='softwares'>
                            <SoftwareDropDown
                                dropDownOptions={softwareList}
                                onSoftwareSelection={onSoftwareSelection}
                                value={jobInfo.currentSoftware.id}
                                name={'softwares'}
                                currentSoftware={currentSoftware}
                                job={job}
                                subSoftwareName={subSoftwareName}
                                softwareId={softwareId}
                            />
                        </div>
                    </div>
                </div>
                <div className='d-flex justify-content-center margin-bottom-25'>
                    <div style={{ width: "100%", maxWidth: "600px", height: "106px" }}>
                        <div className={`${disable ? 'opacity-point-5' : ''} softare-label-div`}>
                            <label className='softare-label-n'>and I need help with:</label>
                        </div>
                        <div id="subsoftwares" className={`${disable ? "opacity-point-5" : " "}`}>
                            <SoftwareDropDown
                                disable={disable}
                                dropDownOptions={currentSoftware.sub_option ? currentSoftware.sub_option : []}
                                onSubSoftwareSelection={onSubSoftwareSelection}
                                name={`subsoftwares`}
                                value={jobInfo.currentSubSoftware}
                                currentSubSoftware={currentSubSoftware}
                                job={job}
                                subSoftwareName={subSoftwareName}
                            />
                        </div>
                    </div>
                </div>

                <div className='d-flex justify-content-center margin-bottom-15'>
                    <div style={{ width: "100%", maxWidth: "600px" }}>
                        <div className={`${disableDetails ? 'opacity-point-5' : ''} softare-label-div`}>
                            <label className='softare-label-n'>More details:</label>
                        </div>
                        <div className={`${disableDetails ? "opacity-point-5" : " "}`} >
                            <textarea
                                id="issue-description"
                                maxLength="500"
                                disabled={disableDetails}
                                type="text"
                                className="software-more-details-input"
                                value={textarea}
                                onChange={handleChange}
                                key={"MyTextAreaKey"}
                            />
                        </div>
                    </div>
                </div>

                <div className={`d-flex justify-content-center margin-bottom-61 ${disableDetails ? 'opacity-point-5' : ''}`}>
                    <div style={{ width: "100%", maxWidth: "600px", }}>
                        <span className={`character ${charLeftColor ? "red-character" : " "}`}> ({`${count - characterCount} character left`}) </span>
                    </div>
                </div>

                {<div className="max-w-60p margin-auto">
                    <div className="p-0-30-10-25 media-max-width-500-padding-lr-0 mb-4">
                        <div className={` softare-label-div margin-bottom-15`}>
                            {!user && !(technicianProfile === 'technician-profile') &&
                                <>
                                    <span className='softare-label-n2' style={{ cursor: "not-allowed", 'color': '#d9d9d9' }} title="No previous geeks available">
                                        Find a previous geek
                                    </span>{" "}
                                    <span className="no-prev-geeks">(no previous geeks available)</span>
                                </>
                            }
                            {user && isFirsJob && !(technicianProfile === 'technician-profile') &&
                                <>
                                    <span className='softare-label-n2' style={{ cursor: "not-allowed", 'color': '#d9d9d9' }} title="No previous geeks available">
                                        Find a previous geek
                                    </span>{" "}
                                    <span className="no-prev-geeks">(no previous geeks available)</span>
                                </>
                            }
                            {user && !isFirsJob && !(technicianProfile === 'technician-profile') &&
                                <span onClick={disablePrevGeek ? () => { } : () => setSelectedTechs(true)} className='softare-label-n2 '>
                                    Find a previous geek
                                </span>
                            }
                            {technicianProfile === 'technician-profile' &&
                                <>
                                    <span className='softare-label-n2' style={isTechUniqueLink ? { cursor: "pointer" } : { cursor: "not-allowed", 'color': '#d9d9d9' }}>
                                        Find a previous geek
                                    </span>{" "}
                                    {isTechUniqueLink ? "" : <span className="no-prev-geeks">(no previous geeks available)</span>}
                                </>
                            }
                        </div>

                        <div className="jobSummaryDropDownDiv" style={isFirsJob === true ? { cursor: "not-allowed" } : { cursor: "pointer" }}>
                            {selectedTechs && !(technicianProfile === 'technician-profile') &&
                                (techniciansList.length === 0 ? <Spin className="job-summary-spinner" />
                                    : <Select options={techniciansList} className="jobSummaryDropDown media-max-width-500-mt-20" isSearchable={false} onChange={handleTechniciansList} formatOptionLabel={formatOptionLabel} defaultValue={techniciansList[0]} isDisabled={isFirsJob ? true : false}
                                    />)
                            }
                        </div>

                        <div className="jobSummaryDropDownDiv">
                            {(technicianProfile === 'technician-profile') && isTechUniqueLink &&
                                (techniciansList.length === 0 ? <Spin className="job-summary-spinner" />
                                    : <Select options={techniciansList} className="jobSummaryDropDown media-max-width-500-mt-20" isSearchable={false} onChange={handleTechniciansList} formatOptionLabel={formatOptionLabel} defaultValue={techniciansList[0]}
                                    />)
                            }
                        </div>
                    </div>
                </div>}



                <div className='d-flex justify-content-center mb-50'>
                    <div className="d-flex justify-content-end" style={{ width: "100%", maxWidth: "600px" }}>
                        <BasicButton id="softwares-next-btn" disable={nextButton || showSpinner} onClick={nextBtnHandler} btnTitle={"Next"} height={"60px"} width={"158px"} background={"#01D4D5"} color={"#fff"} showSpinner={showSpinner} />
                    </div>
                </div>
            </div>
        </form>
        {/* show modal after specific software selected */}
        <AfterSelectedSoftwareModal isSpecificSoftwareSelected={isSpecificSoftwareSelected} setIsSpecificSoftwareSelected={setIsSpecificSoftwareSelected} setGoToJobSummaryPage={setGoToJobSummaryPage} isSoftwareEmailOrOutlook={isSoftwareEmailOrOutlook} setNextButton={setNextButton} setShowSpinner={setShowSpinner} />
    </React.Fragment>
    );
};



export default SelectSoftware
