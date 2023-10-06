import React, { useEffect, useState, useMemo } from "react";
import Countdown, { zeroPad, } from 'react-countdown';
import { useTools } from "context/toolContext";
import { formatResult, pageDetailData, hrArray, defaultContactNumber, calculateTimeDifference } from "constants/expandableJobContants";
import { useUser } from "context/useContext";
import ScheduleForLaterModal from "pages/Customer/ProfileSetup/Components/ScheduleForLaterModal";
import bellIcon from '../../../assets/images/bellIcon.png'
import CancelJobConfirmationModal from "pages/Customer/ProfileSetup/Components/CancelJobConfirmationModal";
import TimeDropDown from "pages/Customer/ProfileSetup/Components/TimeDropDown";
import BasicButton from "components/common/Button/BasicButton";
import { useJob } from "context/jobContext";
import * as JobApi from '../../../api/job.api';
import { Button } from 'react-bootstrap';
import { authorizeCard, openNotificationWithIcon } from '../../../utils/index';
import { useSocket } from '../../../context/socketContext';
import mixpanel from 'mixpanel-browser';
import AfterBusinessHrsPopUpModal from 'pages/Customer/ProfileSetup/Components/AfterBusinessHrsPopUpModal';

/**
 * @author:  Jagroop Singh
 * @description: This component is used to show the Job Detail and Summary when user Click on the Table Row
 **/
// this component is used to show the Countdown for Valid Jobs in the Dashboard
const CountDown = ({ useTimer, renderer, timesUp }) => useMemo(() =>
    <Countdown
        date={Date.now() + useTimer}
        renderer={renderer}
        key={useTimer}
        onComplete={timesUp} />,
    [useTimer])

// This Component is used to show the Job Detail and Summary when user Click on the Table Row
const ExpandableJobDetail = ({ jobSummaryData, setRefreshData }) => {
    const { updateJob } = useJob();
    const { socket } = useSocket();
    const [jobStatus, setJobStatus] = useState('')
    const { useTimer, setUseTimer } = useTools()
    const [showKeepSearchingModal, setShowKeepSearchingModal] = useState(false)
    const [showScheduleForLaterModal, setShowScheduleForLaterModal] = useState(false)
    const [scheduleJobTime, setScheduleJobTime] = useState({})
    const [jobData, setJobData] = useState({})
    const [keepSearchingFor, setKeepSearchingFor] = useState("1 hours");
    const [jobInfo, setJobInfo] = useState({ currentSoftware: {}, currentSubSoftware: "Select", needThisDone: "", moreDetails: "" })
    const [showTimer, setShowTimer] = useState(true)
    const [showCancelJobModal, setShowCancelJobModal] = useState(false);
    const [userDetails, setUserDetails] = useState({ "email": "", "phoneNumber": "" })
    const [refresh, setRefresh] = useState(false)
    const [showFiveMint, setShowFiveMint] = useState(false)
    const { user } = useUser();
    const [showRendererMint, setShowRendererMint] = useState('');
    const [hideButtonForOwner, setHideButtonForOwner] = useState(true)
    const [showAfterBusinessHrs, setShowAfterBusinessHrs] = useState(false);
    const renderer = useMemo(() => ({ hours, minutes, seconds }) => {
        console.log("countdown minutes", minutes);
        setShowRendererMint(minutes)
        return <span>{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
    }, []);

    const timesUp = async () => {
        setShowKeepSearchingModal(true)
        let updatedJobData = await JobApi.retrieveJob(jobSummaryData?.jobData?.id)
        const timeDiff = calculateTimeDifference(updatedJobData.tech_search_start_at, updatedJobData.notifiedTechs, updatedJobData.tech_search_time)
        console.log("timeDiff from timesUp function", timeDiff)
        if (timeDiff <= 0) {
            setShowTimer(false)
        }
    }

    useEffect(() => {
        if (user && user.email && user.customer && user.customer.phoneNumber) {
            setUserDetails({ "email": user.email, "phoneNumber": user.customer.phoneNumber })
        }
    }, [user])

    useEffect(() => {
        if (jobSummaryData && jobSummaryData.key) {
            setJobStatus(jobSummaryData.stats)
            setJobData(jobSummaryData.jobData)
            setJobInfo({ ...jobInfo, currentSoftware: jobSummaryData.jobData.software, currentSubSoftware: jobSummaryData.subOption })
            if (jobSummaryData.date) {
                const date = new Date(jobSummaryData.date)
                const { hours, minutes, durationType } = formatResult(date)
                let defaultMinutes = minutes >= 53 || minutes < 8 ? "00" : minutes >= 8 && minutes < 23 ? "15" : minutes >= 23 && minutes < 38 ? "30" : "45"
                setScheduleJobTime({ date, hours, minutes: defaultMinutes, durationType })
            }
        }
    }, [jobSummaryData,])

    useEffect(() => {
        (async () => {
            if (jobSummaryData) {
                console.log('ShowTimer in ExandableJobDeatils with onchange jobSummaryData >>', jobSummaryData);
                let updatedJobData = await JobApi.retrieveJob(jobSummaryData?.jobData?.id)
                const timeDiff = calculateTimeDifference(updatedJobData.tech_search_start_at, updatedJobData.notifiedTechs, updatedJobData.tech_search_time)
                console.log("My console 110 timeDiff", timeDiff)
                setUseTimer(timeDiff)
                if (timeDiff > 0) {
                    console.log("My console 110 inside if", timeDiff)
                    setShowTimer(true)
                } else {
                    console.log("My console 110 inside else", timeDiff)
                    setShowTimer(false)
                }
                if (user?.customer?.id === updatedJobData?.customer?.id) {
                    setHideButtonForOwner(true)
                } else {
                    setHideButtonForOwner(false)
                }
            }
        })();
    }, [jobSummaryData, refresh]);

    useEffect(() => {
        if (jobSummaryData && jobSummaryData?.jobData?.post_again_reference_technician && showKeepSearchingModal) {
            openNotificationWithIcon('info', 'Info', 'Your selected tech is busy somewhere please continue search for other techs.');
        };
    }, [showKeepSearchingModal]);

    useEffect(() => {
        if (jobSummaryData && jobSummaryData?.jobData?.post_again_reference_technician) {
            setShowFiveMint(true)
        };
    }, []);

    useEffect(() => {
        if (jobSummaryData && jobSummaryData?.jobData) {
            if (jobSummaryData?.jobData?.post_again_reference_technician && showRendererMint < 4 && showRendererMint > 0) {
                checkGeekerAvailabilityTime(jobSummaryData);
            } else {
                if (showRendererMint < 13 && showRendererMint > 4) {
                    checkGeekerAvailabilityTime(jobSummaryData);
                };
            };
        };
    }, [showRendererMint]);

    useEffect(() => {
        socket.on('decline-post-again-dashboard', async (data) => {
            if (data === jobSummaryData?.jobData?.id) {
                openNotificationWithIcon('error', 'Error', "Previous geek you are trying to reach declined your job.")
                updateJob(jobSummaryData?.jobData?.id, { tech_search_time: 0, post_again_reference_technician: '' })
                setShowTimer(false)
            }
        });
    }, [socket])

    const handleScheduleForLaterClick = () => {
        setShowScheduleForLaterModal(true)
    }

    const handleCancelJobClick = () => {
        setShowCancelJobModal(true)
    }

    const handlePendingJob = async (user, jobData) => {
        console.log("jobData::::", jobData)
        let preauthorize = await authorizeCard(user, jobData)
        console.log('preauthorize:::>>>', preauthorize)
        if (preauthorize) {
            await updateJob(jobData.id, { cardPreAuthorization: true, tech_search_start_at: new Date() })
            window.location.href = `/customer/profile-setup?id=${jobData.id}`
        } else {
            openNotificationWithIcon('error', 'Error', "Card authorization failed. Please check the card and try again")
        }
    }

    /**
 * Checking Geeker Availability of time
 * @params = ''
 * @response : Will check if the job post time is between 9pm to 9am  (EDT) and days are Saturday & Sunday then returns boolean value.
 * @author : Mritunjay
 */
    function checkGeekerAvailabilityTime(jobSummaryData) {
        const nonWorkingDays = ['Sat', 'Sun'];
        const usTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const usDay = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short' });
        const workingHours = usTime.getHours();
        console.log("workingHours :::: >>>>>>", workingHours)
        if (workingHours >= 9 && workingHours < 21) {
            const storedValue = localStorage.getItem('showAfterBusinessHrs');
            if (storedValue) {
                setShowAfterBusinessHrs(storedValue === 'true');
            } else {
                setShowAfterBusinessHrs(true)
            }
            // mixpanel code//
            mixpanel.identify(user?.email);
            mixpanel.track('Customer - Before or after hours job', { 'usTime': usTime, 'issue': jobSummaryData?.jobData?.id });
            mixpanel.people.set({
                $first_name: user?.firstName,
                $last_name: user?.lastName,
            });
        };
    };

    return (
        <>
            {jobSummaryData && jobStatus == 'Pending' && user.userType == "customer" ? (
                <div className="row help-on-the-way-box-style">
                    <div className="col-md-1" />
                    <div className="col-md-5 expandable-job-style">
                        {jobData.cardPreAuthorization || jobData.customer.subscription ?
                            <>
                                <span className={showTimer ? "job-alive-heading mb-2" : "job-alive-heading"}>{showTimer ? pageDetailData.help : pageDetailData.time_finished_message}</span>
                                <p className="job-alive-sub-heading " style={{ color: 'black' }}>{showTimer ? pageDetailData.matching : null}</p>
                                <p className="job-alive-sub-heading" style={{ color: 'black' }}>{showTimer ? <span>Typical wait time is usually less than {showFiveMint ? "5" : "15"} minutes...</span> : pageDetailData.message_for_times_up} {showTimer ? null : <span style={{ fontWeight: "bold" }}>{jobSummaryData.software}</span>}</p>
                                {console.log("My console to check showTimer", showTimer)}
                                {showTimer ?
                                    <span className="job-alive-heading mt-5" style={{ fontSize: '51px', fontWeight: "700" }} >
                                        <CountDown
                                            useTimer={useTimer}
                                            renderer={renderer}
                                            timesUp={timesUp}
                                        />
                                    </span> : <IncreaseTimerComponent user={user} keepSearchingFor={keepSearchingFor} setKeepSearchingFor={setKeepSearchingFor} job={jobData} setUseTimer={setUseTimer} setShowTimer={setShowTimer} setRefresh={setRefresh} setRefreshData={setRefreshData} useTimer={useTimer} setShowKeepSearchingModal={setShowKeepSearchingModal} setShowFiveMint={setShowFiveMint} />}
                                {hideButtonForOwner && <div className="row" style={{ marginLeft: '1px' }}>
                                    <button type="button" onClick={handleScheduleForLaterClick} className="btn schedule-later-btn-style">Schedule for Later</button>
                                    <p className="cancel-job-style" onClick={handleCancelJobClick}>Cancel Job</p>
                                </div>}
                            </>
                            :
                            <>
                                <span className={showTimer ? "job-alive-heading mb-2" : "job-alive-heading"}>Card authorization failed.Please check your default card and click on Get Help Now button</span>
                                <Button key="btn-post-job" onClick={() => {
                                    handlePendingJob(user, jobData)
                                }} className="btn app-btn mt-4">
                                    <span />
                                    Get Help Now
                                </Button>
                            </>
                        }
                    </div>

                    <div className="col-md-5">
                        <div className="help-on-the-way-style">
                            <div className="centered-help-on-the-way-style">
                                <p className="job-bold-text-style " style={{ fontWeight: "bold", fontSize: '20px', marginBottom: '15px' }}><img src={bellIcon} className='bell-icon-style' alt="bellIcon" />{pageDetailData.next}</p>
                                <p className="job-alive-sub-heading ">{pageDetailData.ready_to_connect}</p>
                                <p className="job-bold-text-style ">{userDetails.email ? userDetails.email : "xxxx@gmail.com"}</p>
                                <p className="job-bold-text-style ">{userDetails.phoneNumber ? userDetails.phoneNumber : "xxx-xxx-xxxx"}</p>
                                <p className="job-alive-sub-heading mt-4">{pageDetailData.contact_through_num}</p>
                                <p className="job-bold-text-style ">{defaultContactNumber}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-1" />


                </div>) :
                <>
                    <div className="row help-on-the-way-box-style">
                        <div className="col-md-1" />

                        <div className="col-md-5 expandable-job-style">


                        </div>

                    </div>
                    <div className="col-md-1" />
                </>

            }

            <ScheduleForLaterModal showScheduleForLaterModal={showScheduleForLaterModal} setShowScheduleForLaterModal={setShowScheduleForLaterModal} scheduleJobTime={scheduleJobTime} setScheduleJobTime={setScheduleJobTime} user={user} jobInfo={jobInfo} job={jobData} isDashboardSide={true} />
            <CancelJobConfirmationModal showCancelJobModal={showCancelJobModal} setShowCancelJobModal={setShowCancelJobModal} job={jobData} />
            <AfterBusinessHrsPopUpModal showAfterBusinessHrs={showAfterBusinessHrs} setShowAfterBusinessHrs={setShowAfterBusinessHrs} />
        </>
    )
}

export default ExpandableJobDetail


const IncreaseTimerComponent = ({ keepSearchingFor, setKeepSearchingFor, job, setUseTimer, setShowTimer, setRefresh, setRefreshData, setShowKeepSearchingModal, useTimer, setShowFiveMint, user }) => {
    const { setStartTimer } = useTools();
    const { socket } = useSocket();

    const handleGoButtonClick = async () => {
        await JobApi.updateJob(job.id, { tech_search_time: Number(keepSearchingFor.substring(0, 2)) * 3600000, tech_search_start_at: new Date(), 'post_again_reference_technician': '' }).then(() => {
            setUseTimer(Number(keepSearchingFor.substring(0, 2)) * 3600000)
            setShowTimer(true)
            setRefresh(true)
            setStartTimer(true)
            setShowFiveMint(false)
            setShowKeepSearchingModal(false)
            socket.emit('search-for-tech', {
                jobData: job,
                searchSameTech: false,
                technicianId: false,
            });
        })
    }

    return (
        <>
            <p className="job-bold-text-style mt-4" style={{ fontWeight: "bold", fontSize: '18px', color: "black" }}>Keep Searching for:</p>
            <div className="d-flex justify-content-center align-items-center  mt-2">
                <div className="keep-searching-drop-down d-flex justify-content-around align-items-center">
                    <TimeDropDown
                        dropdownValues={hrArray}
                        name={"hrArray"}
                        setKeepSearchingFor={setKeepSearchingFor}
                        keepSearchingFor={keepSearchingFor}
                    />
                </div>
                {user?.customer?.id === job.customer.id &&
                    <BasicButton onClick={() => handleGoButtonClick()} btnTitle={"Go"} height={"60px"} width={"67px"} color={"#293742"} background={"#fff"} border={"solid 1px #01D4D5"} />
                }
            </div>
        </>
    );
}
