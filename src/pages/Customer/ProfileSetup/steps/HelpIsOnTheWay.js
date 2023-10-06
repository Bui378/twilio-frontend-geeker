import React, { useEffect, useState, useMemo } from "react"
import jsonAnimation from "../../../../assets/animations/animation.json"
import { Player } from '@lottiefiles/react-lottie-player';
import BasicButton from "components/common/Button/BasicButton";
import KeepSearchingModal from "../Components/KeepSearchingModal";
import ScheduleForLaterModal from "../Components/ScheduleForLaterModal";
import { useSocket } from '../../../../context/socketContext';
import { useTools } from '../../../../context/toolContext';
import mixpanel from 'mixpanel-browser';
import Countdown, { zeroPad, } from 'react-countdown';
import * as UserApi from "api/users.api";
import { useHistory, useLocation } from 'react-router';
import CancelJobConfirmationModal from "../Components/CancelJobConfirmationModal";
import { useJob } from '../../../../context/jobContext';
import { calculateTimeDifference, defaultContactNumber } from "constants/expandableJobContants";
import { openNotificationWithIcon, checkCustomerHaveSubscriptionMinutes, PushUserDataToGtm } from '../../../../utils/index';
import * as CustomerApi from '../../../../api/customers.api';
import * as JobNotificationHistory from '../../../../api/jobNotificationHistory.api';
import AfterBusinessHrsPopUpModal from '../Components/AfterBusinessHrsPopUpModal';
import styled from 'styled-components';
import Badge from '@mui/material/Badge';
import * as JobApi from '../../../../api/job.api';
import notifySound from '../../../../assets/sounds/notification.mp3'
import ChatPanelTwilio from "components/ChatPanelTwilio";
import * as TwilioApi from '../../../../api/twilioChat.api';
import '../../../../style.css'

const CountDown = ({ useTimer, renderer, timesUp }) => useMemo(() =>
    <Countdown
        date={Date.now() + useTimer}
        renderer={renderer}
        key={useTimer}
        onComplete={timesUp} />,
    [useTimer]);

const HelpIsOnTheWay = ({ user, job, jobInfo, scheduleJobTime, setScheduleJobTime, selectedTechnician }) => {
    const [showKeepSearchingModal, setShowKeepSearchingModal] = useState(false)
    const [showScheduleForLaterModal, setShowScheduleForLaterModal] = useState(false)
    const [showCancelJobModal, setShowCancelJobModal] = useState(false)
    const [keepSearchingFor, setKeepSearchingFor] = useState("1 hours");
    const { useTimer, setUseTimer } = useTools();
    const { socket } = useSocket();
    const location = useLocation();
    const { fetchJob, updateJob } = useJob();
    const queryParams = new URLSearchParams(location.search)
    const technicianId = queryParams.get("technicianId") ? queryParams.get("technicianId")
        : selectedTechnician.value ? selectedTechnician.value : false
    const jobIdParams = queryParams.get("jobId")
    const history = useHistory();
    const [newJobAlertCalled, setNewJobAlertCalled] = useState(false)
    const [searchTimesUp, setSearchTimesUp] = useState(false)
    const [sameTechIdAvailable, setSameTechIdAvailable] = useState(false)
    const [sameTechIdAvailableSched, setSameTechIdAvailableSched] = useState(false)
    const [showRendererMint, setShowRendererMint] = useState('');
    const [showAfterBusinessHrs, setShowAfterBusinessHrs] = useState(false);
    const [chatPanelHasOpen, setChatPanelHasOpen] = useState(true)
    const [socketHits, setSocketHits] = useState(0);
    const [buttonKeyForChatPanel, setButtonKeyForChatPanel] = useState(false)
    const [showModalFooterOffPeak, setShowModalFooterOffPeak] = useState(false)
    let audio = new Audio(notifySound)

    useEffect(() => {
        if (localStorage.getItem('postAgainJobModal')) {
            setSameTechIdAvailableSched(true)
        }
        (async () => {
            localStorage.removeItem('authorizationInfo');
            if (jobIdParams && job === undefined) {
                if (process.env.REACT_APP_URL) {
                    const appUrl = process.env?.REACT_APP_URL?.split("/")[2] || false;
                    PushUserDataToGtm('job_posted', user, appUrl);
                }
                console.log("jobIdParam in profile setup ::", jobIdParams)
                await fetchJob(jobIdParams);
                setNewJobAlertCalled(true)
            }
        })();
    }, [])

    const StyledBadge = styled(Badge)(({ theme }) => ({
        '& .MuiBadge-badge': {
            right: -3,
            top: 13,
            backgroundColor: 'red',
            padding: '0 4px',
        },
    }));

    const handelShowChat = () => {
        setButtonKeyForChatPanel(true)
        setChatPanelHasOpen(false)
        setSocketHits(0)
    }

    useEffect(() => {
        if (job && job?.post_again_reference_technician) {
            setSameTechIdAvailable(true)
        }

        if (job?.status == 'Completed' || job?.status == 'Inprogress' || job?.status == 'Accepted') {
            window.location.href = '/dashboard';
        }
    }, [job]);

    const totalChatCount = () => {
        const jobChatDetail = window.localStorage.getItem('pendingJobHaveChat')
        let dataToSave = {
            jobId: jobIdParams,
            count: socketHits + 1
        }
        if (jobChatDetail) {
            const responseData = JSON.parse(jobChatDetail);
            dataToSave['count'] = responseData['count'] + 1
        }
        window.localStorage.setItem('pendingJobHaveChat', JSON.stringify(dataToSave));
    }

    useEffect(() => {
        socket.on("open-chat-panel-talkjs-for-customer", (data) => {
            if (data === jobIdParams) {
                totalChatCount()
                setSocketHits((prevHits) => prevHits + 1);
                audio.play()
            }
        })

        socket.on('decline-post-again', async (data) => {
            if (data === jobIdParams) {
                openNotificationWithIcon('error', 'Error', "Previous geek you are trying to reach declined your job.")
                updateJob(jobIdParams, { tech_search_time: 0, post_again_reference_technician: '' })
                await TwilioApi.updateTwilioConversation(job?.twilio_chat_service?.sid)
                setSameTechIdAvailable(false)
                setShowKeepSearchingModal(true)
                setSameTechIdAvailableSched(true)
                localStorage.setItem('postAgainJobModal', true)
            }
        });
        socket.on("open-chat-panel-talkjs", async (data) => {
            console.log("open-chat-panel-talkjs", data)
        })

    }, [socket])


    useEffect(
        () => {
            (async () => {
                if (job && newJobAlertCalled) {
                    console.log("Job-------------", job)
                    if (job && user && user.customer && job.customer.id !== user.customer.id) {
                        console.log("window.location.href from helponway", user.customer.id)
                        window.location.href = `/dashboard`
                        window.localStorage.setItem('CurrentStep', 7)
                    }
                    else {
                        if (job && user) {
                            console.log("Inside useEffect if", job.customer.subscription)
                            socket.emit("join", job.id)
                            if ((job.id && job.cardPreAuthorization) || job.customer.subscription) {
                                newJobAlert(job, user, technicianId)
                            }
                            // This condition will check in case of transfer case that if customer or it's owner have subscription minutes , if so then we will not hold any payment
                            else if (job?.customer?.subscription || user?.ownerId) {
                                const checkHaveSubscription = await checkCustomerHaveSubscriptionMinutes(job?.customer);
                                if (!checkHaveSubscription) {
                                    updateJob(job.id, { cardPreAuthorization: true, payment_type: "subscription_only" })
                                    newJobAlert(job, user, technicianId);
                                } else {
                                    // Firstly it will hold the amount from customer if it is holded succedfully then it will redirect to tech search page
                                    const holdChargeResponse = await checkAuthorizationByHoldingAmount();
                                    console.log("holdChargeResponse 2: ", holdChargeResponse)

                                    if (holdChargeResponse?.status === "Successful") {
                                        updateJob(job.id, { cardPreAuthorization: true })
                                        newJobAlert(job, user, technicianId)
                                    } else {
                                        const holdChargeResponse = await checkAuthorizationByHoldingAmount();
                                        if (holdChargeResponse?.status === "Successful") {
                                            updateJob(job.id, { cardPreAuthorization: true })
                                            newJobAlert(job, user, technicianId)
                                        } else {
                                            // This will toast out error and redirect to dashboard
                                            openNotificationWithIcon('error', 'Error', holdChargeResponse?.message);
                                            setTimeout(() => {
                                                window.location.href = "/dashboard"
                                                window.localStorage.setItem('CurrentStep', 7)
                                            }, 2000);
                                        }
                                    }
                                }
                            }
                            else {
                                // Firstly it will hold the amount from customer if it is holded succedfully then it will redirect to tech search page
                                const holdChargeResponse = await checkAuthorizationByHoldingAmount();
                                console.log("holdChargeResponse 1 : ", holdChargeResponse)

                                if (holdChargeResponse?.status === "Successful") {
                                    updateJob(job.id, { cardPreAuthorization: true })
                                    newJobAlert(job, user, technicianId)
                                } else {
                                    const holdChargeResponse = await checkAuthorizationByHoldingAmount();
                                    console.log("holdChargeResponse 2: ", holdChargeResponse)

                                    if (holdChargeResponse?.status === "Successful") {
                                        updateJob(job.id, { cardPreAuthorization: true })
                                        newJobAlert(job, user, technicianId)
                                    } else {
                                        // This will toast out error and redirect to dashboard
                                        openNotificationWithIcon('error', 'Error', holdChargeResponse?.message);
                                        setTimeout(() => {
                                            window.location.href = "/dashboard"
                                            window.localStorage.setItem('CurrentStep', 7)
                                        }, 2000);
                                    }
                                }
                            };
                        }
                    }
                }
            })()
        }, [newJobAlertCalled]);

    const checkOwnerStripeId = async (user) => {
        if (user && user?.ownerId) {

            const ownerUserDetails = await UserApi.getUserById(user?.ownerId)
            console.log('ownerUserDetails ::::', ownerUserDetails)
            if (ownerUserDetails?.customer?.stripe_id) {
                const ownerStripeId = ownerUserDetails?.customer?.stripe_id
                return ownerStripeId
            } else {
                openNotificationWithIcon("info", "Info", `Please contact your owner to add card to proceed the current job!`)
                history.push("/")
                return
            }
        }
    }

    // This function hold the $100 amount from customer and if it is holded succedfully then it will return Successful status otherwise Not Successful
    const checkAuthorizationByHoldingAmount = async () => {
        const ownerStripeStatus = await checkOwnerStripeId(user)
        const stripeId = user?.ownerId ? ownerStripeStatus : user?.customer?.stripe_id
        const holdChargeResponse = await CustomerApi.holdChargeFromCustomer({
            'stripe_id': stripeId,
            'liveUser': (user?.customer?.customerType && user?.customer?.customerType === 'live' ? true : false), "jobId": job?.id
        });
        return holdChargeResponse;
    }

    const newJobAlert = async (jobInfo, userInfo, technicianId = false) => {
        mixpanel.identify(userInfo?.email);
        mixpanel.track('Customer - keep Searching technician ');
        mixpanel.people.set({
            $first_name: userInfo?.firstName,
            $last_name: userInfo?.lastName,
        });
        if (jobInfo.status === "Pending" || jobInfo.status === "Waiting") {
            const notifiedTechs = await JobNotificationHistory.getJobNotificationHistory(jobIdParams);
            console.log("notified techs", notifiedTechs);
            if (notifiedTechs?.totalCount === 0) {
                console.log("No notifiedtech available, so going to call search-for-tech socket")
                socket.emit('search-for-tech', {
                    jobData: jobInfo,
                    searchSameTech: job.post_again_reference_technician ? true : false,
                    technicianId: job.post_again_reference_technician ? job.post_again_reference_technician : false
                });
            }
        } else if (jobInfo.status === "Scheduled") {
            console.log("Nothing to do for schedule job here")
        } else {
            console.log("window.location.href from helponway", jobInfo)
            window.location.href = "/"
        }
        socket.on("meeting:join-button", (props) => {
            window.location.href = `/customer/accept-job/${props.res}`
        })
    }

    useEffect(() => {
        if (job) {
            const timeDiff = calculateTimeDifference(job.tech_search_start_at, job.notifiedTechs, job.tech_search_time)
            setUseTimer(timeDiff)
        }
    }, [job]);

    useEffect(() => {
        if (job && job?.post_again_reference_technician && showKeepSearchingModal) {
            openNotificationWithIcon('info', 'Info', 'Your selected tech is busy somewhere please continue search for other techs.');
        }
    }, [showKeepSearchingModal])

    useEffect(() => {
        if (job) {
            if (job?.post_again_reference_technician && showRendererMint < 4 && showRendererMint > 0) {
                checkGeekerAvailabilityTime(job);
            } else {
                if (showRendererMint < 13 && showRendererMint > 4) {
                    checkGeekerAvailabilityTime(job);
                };
            };
        };
    }, [showRendererMint]);



    const handleScheduleForLaterClick = () => {
        localStorage.removeItem('postAgainJobModal')
        setShowScheduleForLaterModal(true)
    }

    const handleCancelBtn = () => {
        setShowCancelJobModal(true)
    }

    /**
     * Checking Geeker Availability of time
     * @params = ''
     * @response : Will check if the job post time is between 9pm to 9am(EDT) and days are Saturday & Sunday then returns boolean value.
     * @author : Mritunjay
     */

    function checkGeekerAvailabilityTime(job) {
        const nonWorkingDays = ['Sat', 'Sun'];
        const usTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const usDay = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short' });
        const workingHours = usTime.getHours();
        console.log("workingHours :::: >>>>>>", workingHours, ' / usDay', usDay, ' / is weekend', nonWorkingDays.includes(usDay))
        if ((workingHours >= 21 || workingHours < 9) || (nonWorkingDays.includes(usDay))) {
            const storedValue = localStorage.getItem('showAfterBusinessHrs');
            if (storedValue) {
                setShowModalFooterOffPeak(storedValue === 'true')
            } else {
                setShowModalFooterOffPeak(true)
            }
            // mixpanel code
            mixpanel.identify(user?.email);
            mixpanel.track('Customer - Before or after hours job', { 'usTime': usTime, 'issue': job.id });
            mixpanel.people.set({
                $first_name: user?.firstName,
                $last_name: user?.lastName,
            });
        }

        if (workingHours >= 9 && workingHours < 21) {
            const storedValue = localStorage.getItem('showAfterBusinessHrs');
            if (storedValue) {
                setShowAfterBusinessHrs(storedValue === 'true');
            } else {
                setShowAfterBusinessHrs(true)
            }
        }
    };

    const renderer = useMemo(() => ({ hours, minutes, seconds }) => {
        console.log("countdown minutes", minutes);
        setShowRendererMint(minutes)
        return <span>{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
    }, []);


    const timesUp = async () => {
        JobApi.retrieveJob(job?.id).then((job) => {
            TwilioApi.updateTwilioConversation(job?.twilio_chat_service?.sid).then(() => {
                setShowKeepSearchingModal(true)
                setShowScheduleForLaterModal(false)
                setSearchTimesUp(true)
            })
        })
    }

    const showChatPanelInTimerPage = () => {
        try {
            if (job?.post_again && job?.post_again_reference_job && job?.post_again_reference_technician) {
                return true;
            } else if (socketHits > 0) {
                return true;
            }

            let haveMessages = window.localStorage.getItem('pendingJobHaveChat')
            haveMessages = JSON.parse(haveMessages)
            if (haveMessages && haveMessages.jobId && haveMessages.jobId == jobIdParams) {
                if (haveMessages.count) {
                    setSocketHits(haveMessages.count)
                }
                return true;

            } else {
                return false
            }
        } catch (error) {
            console.log("error while checking unread messages in pending job", error);
            return false;
        }
    }

    return (<>
        <div className="d-flex justify-content-center align-items-center flex-column mt-40-neg mb-50">
            <span className="job-alive-page-sub-heading mb-1 ">We are matching a Geek to your request...</span>
            <span className="job-alive-page-sub-heading mb-12">Typical wait time is usually less than {job && job?.post_again_reference_technician ? "5" : "15"} mins</span>
            <span className="job-alive-page-timer">
                <CountDown
                    useTimer={useTimer}
                    renderer={renderer}
                    timesUp={timesUp}
                />
            </span>
            <div className="job-alive-page-json-animation">
                <Player
                    autoplay
                    keepLastFrame={true}
                    src={jsonAnimation}
                    className='job-alive-page-json-animation-player'
                    loop={true}
                >
                </Player>
            </div>
            <span className="job-alive-page-dont-wait mb-2">Don't want to wait?</span>
            <div className="d-flex align-items-end flex-column">
                <div className="scd-and-cancel-btn ">
                    <BasicButton onClick={handleScheduleForLaterClick} btnTitle={"Schedule for later"} height={"60px"} width={"277px"} background={"#01D4D5"} color={"#fff"} btnIcon={"schedule"} faFontSize={"16px"} />&nbsp;&nbsp;&nbsp;&nbsp;
                    <BasicButton onClick={handleCancelBtn} btnTitle={"Cancel job"} height={"60px"} width={"200px"} background={"#97abb6"} color={"#fff"} faFontSize={"16px"} />
                </div>
                {showChatPanelInTimerPage() &&
                    <div display="flex" style={{ marginRight: '-11px' }} justifyContent="right" marginTop={20} marginLeft={10} className="float-right invite-tech-btn">
                        {chatPanelHasOpen && showChatPanelInTimerPage() ? (
                            <StyledBadge badgeContent={socketHits} color="secondary">
                                <span style={{ display: "flex", justifyContent: "center", fontWeight: "bold", color: "#97abb6", cursor: "pointer", pointerEvents: chatPanelHasOpen ? " " : "none", border: 'none', textDecoration: 'underline' }} className='bell-icon-class' onClick={handelShowChat}>Having trouble to start call?</span>
                            </StyledBadge>
                        ) : (
                            <span></span>
                        )}
                    </div>
                }
            </div>
        </div>
        {buttonKeyForChatPanel && showChatPanelInTimerPage() &&
            <div className='d-flex justify-content-center mb-5'>
                <ChatPanelTwilio job={job} width={'700px'} height={'500px'} />
            </div>
        }

        <div className="job-alive-page-info-div">
            <span className="job-alive-page-info-div-sub-heading">What happens next:</span>
            <div className="d-flex justify-content-around align-items-start flex-wrap">
                <div className="d-flex justify-content-start align-items-start flex-column">
                    <span className="job-alive-page-info-div-content wrap-content">When your Geek is ready to connect.</span>
                    <span className="job-alive-page-info-div-content mb-20 wrap-content">we'll attempt to contact you at:</span>
                    <span className="job-alive-page-info-div-content-bold wrap-content">{user.email}</span>
                    <span className="job-alive-page-info-div-content-bold wrap-content">{user.customer.phoneNumber}</span>
                </div>
                <div className="vertical-line-div"></div>
                <div className="d-flex justify-content-start align-items-start flex-column">
                    <span className="job-alive-page-info-div-content wrap-content">If you chose phone audio, your Geek will</span>
                    <span className="job-alive-page-info-div-content mb-20 wrap-content">be calling you on following number:</span>
                    <span className="job-alive-page-info-div-content-bold wrap-content">{defaultContactNumber}</span>
                </div>
            </div>
        </div>

        {/* all Modal */}
        {job &&
            <ChatPanelTwilio style={{ visibility: 'hidden' }} height={'0px'} job={job} />
        }

        <KeepSearchingModal showKeepSearchingModal={showKeepSearchingModal} setShowKeepSearchingModal={setShowKeepSearchingModal} setShowScheduleForLaterModal={setShowScheduleForLaterModal} jobInfo={jobInfo} setKeepSearchingFor={setKeepSearchingFor} keepSearchingFor={keepSearchingFor} useTimer={useTimer} setUseTimer={setUseTimer} job={job} setSearchTimesUp={setSearchTimesUp} sameTechIdAvailable={sameTechIdAvailable} setSameTechIdAvailable={setSameTechIdAvailable} sameTechIdAvailableSched={sameTechIdAvailableSched} showModalFooterOffPeak={showModalFooterOffPeak} />

        <ScheduleForLaterModal showScheduleForLaterModal={showScheduleForLaterModal} setShowScheduleForLaterModal={setShowScheduleForLaterModal} scheduleJobTime={scheduleJobTime} setScheduleJobTime={setScheduleJobTime} user={user} jobInfo={jobInfo} job={job} isDashboardSide={false} setShowKeepSearchingModal={setShowKeepSearchingModal} searchTimesUp={searchTimesUp} />

        <CancelJobConfirmationModal showCancelJobModal={showCancelJobModal} setShowCancelJobModal={setShowCancelJobModal} job={job} />

        <AfterBusinessHrsPopUpModal showAfterBusinessHrs={showAfterBusinessHrs} setShowAfterBusinessHrs={setShowAfterBusinessHrs} />
    </ >)
}

export default HelpIsOnTheWay
