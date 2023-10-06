import BasicButton from "components/common/Button/BasicButton";
import React, { useEffect, useState, useCallback } from "react"
import { Row, Col } from "react-bootstrap";
import HeadingText from "../Components/HeadingText";
import ProgressBar from "../Components/ProgressBar";
import SubHeadingText from "../Components/SubHeadeingText";
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Testimony from "../Components/Testimony";
import ChosenPlanSummary from "../Components/ChosenPlanSummary";
import PasswordInput from "components/AuthComponents/PasswordInput";
import * as AuthApi from '../../../../api/auth.api';
import { useHistory, useLocation } from 'react-router';
import { Modal } from 'antd';
import * as CustomerApi from '../../../../api/customers.api';
import { INACTIVE_ACCOUNT_STATUS_MSG } from '../../../../constants';
import { isLiveUser, openNotificationWithIcon } from '../../../../utils';
import * as UserApi from '../../../../api/users.api';
import mixpanel from 'mixpanel-browser';
import * as JobApi from '../../../../api/job.api';
import { useSocket } from '../../../../context/socketContext';
import { useJob } from '../../../../context/jobContext';
import { useNotifications } from '../../../../context/notificationContext';
import JobInfoRightSideBar from "components/JobInfoRightSideBar";

const LogIn = ({ userInfo, setUser, setToken, setbusinessPlanStepNumber, jobFlowStepsObj, setchosenProdId, setShowSubscriptionPlanModal, setShowtwentyPercentModal, user, job }) => {
    const { socket } = useSocket();
    const [pwModelVisible, setPwModelVisible] = useState()
    const [password, setPassword] = useState("")
    const [disableBtn, setDisableBtn] = useState(false)
    const [incorrectPassword, setIncorrectPassword] = useState(false)
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const planId = queryParams.get('planId') ? queryParams.get('planId') : false;
    const jobIdFromUrl = queryParams.get("jobId") ? queryParams.get("jobId") : false
    const [showSubscriptionPlanModalTime, setShowSubscriptionPlanModalTime] = useState(150000)
    const [discountModalShown, setDiscountModalShown] = useState(false)
    let liveUser = isLiveUser(user)
    const { updateJob } = useJob();
    const { createNotification, fetchNotifications } = useNotifications();
    const technicianId = queryParams.get("technicianId") ? queryParams.get("technicianId") : false
    const couponCode = queryParams.get('couponCode') ? queryParams.get('couponCode') : false;

    useEffect(() => {
        if (!discountModalShown) {
            if (planId) {
                setTimeout(() => {
                    setShowtwentyPercentModal(true)
                    setDiscountModalShown(true)
                }, showSubscriptionPlanModalTime);
            }
        }
    }, [showSubscriptionPlanModalTime])

    const resetPasswordConfirmationModal = useCallback(() => {
        setShowSubscriptionPlanModalTime(150000)
        Modal.confirm({
            title: 'Reset Password ?',
            okText: 'Yes',
            cancelText: 'No',
            className: "reset-password-confirmation-modal",
            onOk() {
                setbusinessPlanStepNumber(jobFlowStepsObj['ResetPasswordLink'])
            },
        });
    }, []);

    /**
    * Following function is to handle back button click
    * @params : none
    * @return : none
    * @author : Mritunjay Chaurasia
    **/
    const handleBackBtnClicked = () => {
        setbusinessPlanStepNumber(jobFlowStepsObj["SignIn"])
    }

    /**
   * Following function handle user login
   * @params = null
   * @response : null
   * @author : Vinit
   */
    const handleLogIn = async () => {
        setShowSubscriptionPlanModalTime(150000)
        setDisableBtn(true)
        const loginResponse = await AuthApi.login({ email: userInfo.email, password: password })
        console.log("My console for loginResponse from business plan", loginResponse)
        if (loginResponse && loginResponse.success) {
            openNotificationWithIcon("success", "Success", "User logged in successfully!")
            setIncorrectPassword(false)
            setToken(loginResponse.token.accessToken)
            setUser(loginResponse.user)
            if (loginResponse?.user?.userType === 'customer') {
                if (jobIdFromUrl) {
                    const customerTypeValid = (loginResponse.user.customer.customerType ? loginResponse.user.customer.customerType !== 'test' : true);
                    checkCustomerHaveCard(loginResponse.user, customerTypeValid)
                } else {
                    if (planId) {
                        if (couponCode) {
                            window.location.href = `/buy-business-plan?planId=${planId}&page=CompleteYourPurchase&couponCode=${couponCode}`
                        } else {
                            window.location.href = `/buy-business-plan?planId=${planId}&page=CompleteYourPurchase`
                        }
                    } else {
                        //Checking if customer already have card added to account.
                        if (loginResponse.user) {
                            let liveUser = await isLiveUser(loginResponse.user)
                            let customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
                                user: loginResponse.user,
                                liveUser: liveUser
                            });
                            console.log("My console for customer_info", customer_info)
                            if (customer_info.has_card_or_subscription) {
                                window.location.href = `/`
                            } else {
                                window.location.href = `/customer/registered`
                            }
                        }
                    }
                }
            }
        } else {
            openNotificationWithIcon("error", "Error", "Incorrect Password")
            setDisableBtn(false)
            setIncorrectPassword(true)
        }
    }


    const checkCustomerHaveCard = async (user, customerTypeValid) => {
        try {
            if (user && !user?.activeStatus) {
                openNotificationWithIcon('info', 'Info', INACTIVE_ACCOUNT_STATUS_MSG);
                const timer = setTimeout(() => { history.push('/dashboard') }, 2000);
                return () => clearTimeout(timer);
            }
            if (user && user.customer) {
                mixpanel.identify(user.email);
                const ownerId = user?.ownerId;
                console.log('owner iiddddd :::::::', ownerId)
                let ownerStripeId = '';
                if (ownerId) {
                    const ownerUserDetails = await UserApi.getUserById(ownerId)
                    console.log('ownerUserDetails ::::', ownerUserDetails)
                    if (ownerUserDetails?.customer?.stripe_id) {
                        ownerStripeId = ownerUserDetails?.customer?.stripe_id
                    } else {
                        openNotificationWithIcon("info", "Info", `Please contact your organization owner to add card to proceed with this job!`)
                        history.push("/")
                        return
                    }
                }

                let customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
                    user: user,
                    liveUser: liveUser
                });
                if (customer_info.has_card_or_subscription === false && customerTypeValid) {
                    // mixpanel code//					
                    mixpanel.track('Customer - Ask Credit Card');
                    mixpanel.people.set({
                        $first_name: user.firstName,
                        $last_name: user.lastName,
                    });
                    // mixpanel code//
                    await updateJob(jobIdFromUrl, { customer: user.customer.id, guestJob: false, cardPreAuthorization: false })
                    window.location.href = `/customer/profile-setup?page=add-card&jobId=${jobIdFromUrl}`
                } else {
                    let paidJobs = await JobApi.getTotalJobs({ "customer": user?.customer?.id })
                    if (paidJobs >= 1) {
                        await JobApi.updateJob(jobIdFromUrl, { isReturningCustomer: true })
                    }
                    const stripeId = user?.ownerId ? ownerStripeId : user?.customer?.stripe_id;
                    let preauthorize = await CustomerApi.holdChargeFromCustomer({
                        'stripe_id': stripeId,
                        'liveUser': (user?.customer?.customerType && user?.customer?.customerType === 'live' ? true : false), "jobId": jobIdFromUrl
                    })
                    console.log("My console for preaut", preauthorize)
                    if (preauthorize.status === "Successful") {
                        mixpanel.track('Customer - Preauthorize successfully', { jobId: jobIdFromUrl });
                        if (localStorage.getItem("isScheduleJob")) {
                            localStorage.removeItem("isScheduleJob")
                            console.log("inside preauthorize schedule if")
                            const updatedJob = await JobApi.updateJob(jobIdFromUrl, {
                                status: "Scheduled",
                                customer: user.customer.id,
                                guestJob: false,
                                cardPreAuthorization: true,
                            })
                            // createUpdateJob("Scheduled")
                            await emitSocketCreateFetchNotification(updatedJob, user)

                            setTimeout(() => {
                                window.location.href = '/dashboard?&scheduleJobId=' + jobIdFromUrl;
                            }, 500);
                            setDisableBtn(false)
                        } else {
                            console.log("inside preauthorize ASAP else")
                            await JobApi.updateJob(jobIdFromUrl, {
                                status: "Pending",
                                customer: user.customer.id,
                                guestJob: false,
                                cardPreAuthorization: true,
                                tech_search_start_at: new Date(),
                            }).then((testingRes) => {
                                console.log("window.location.href from SignIn", testingRes)
                                window.location.href = `/customer/profile-setup?page=tech-search&jobId=${jobIdFromUrl}`
                            })
                        }
                    } else {
                        let mixpanelData = {}
                        if (job && job.id) {
                            mixpanelData = { jobId: job.id }
                        }
                        mixpanel.track('Customer - Preauthorize Failed', mixpanelData);
                        if (job && job.id && job.guestJob && user && user.customer) {
                            await updateJob(job.id, { customer: user.customer.id, guestJob: false })
                        }
                        let timeOutDuration = 2000;
                        if (preauthorize?.response?.decline_code === "invalid_account" || preauthorize?.message.includes('Invalid account')) {
                            timeOutDuration = 4000;
                            openNotificationWithIcon('error', 'Error', 'Unable to authorize your existing credit card. Please add new credit card from Settings -> Card Details.')
                        } else {
                            openNotificationWithIcon('error', 'Error', preauthorize.message)
                        }

                        setTimeout(() => {
                            window.location.href = '/dashboard'
                        }, timeOutDuration);
                    }
                    // }
                }
            }
        } catch (err) {
            console.log("error in checkForCard", err)
        }
    }

    /**
   * emit send-schedule-alerts socket and create / fetch notification customer notifications
   * @params : jobStats(Type:Object): Have job details
   * @returns : null
   * @author : Ridhima Dhir
   */
    const emitSocketCreateFetchNotification = async (jobStats, user) => {
        try {
            console.log("send-schedule-alerts :::::::::::")
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
            socket.emit('search-for-tech', {
                jobId: jobStats.id,
                customerTimezone: user.timezone,
                jobData: jobStats,
                primaryTime: jobStats.primarySchedule,
                phoneNumber: user.customer.phoneNumber,
                customerName: user.firstName,
                customerEmail: user.email,
                technicianId: technicianId ? technicianId : false,
            });
        } catch (err) {
            console.log('There is catch error while create/fetch notification  :::: ' + err.message)
            mixpanel.identify(user.email);
            mixpanel.track('There is catch error while create/fetch notification', { jobStats: jobStats, errMessage: err.message });
        }
    }
    return <div className="custom-container  min-height-inherit">
        <Row className="min-height-inherit d-flex justify-content-center align-items-center parent-row">
            <Col md={9} xs={12} className="d-flex flex-column min-height-inherit">
                {planId && <ProgressBar currentStep={1} />}
                <div className="d-flex flex-column justify-content-center align-items-center min-height-inherit">
                    <div className="mb-50">
                        <HeadingText firstBlackText={"Log In"} />
                    </div>
                    <div className="choose-password-email-div d-flex justify-content-center align-items-center mb-20">
                        <span className="choose-password-email">{userInfo?.email}</span>
                    </div>
                    <form onSubmit={handleLogIn}>
                        <div className="mb-20 w-428 max-width-768-w-265px position-relative">
                            <SubHeadingText text={"Password"} />
                            <PasswordInput
                                name="Password"
                                placeholder="Password"
                                type="password"
                                onFocus={() => setPwModelVisible(true)}
                                onBlur={() => setPwModelVisible(false)}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                            />
                            <a onClick={resetPasswordConfirmationModal}>
                                <SubHeadingText text={"Forgot Password?"} />
                            </a>
                        </div>
                        <div className="business-plan-sign-in-button mb-15 d-flex flex-row justify-content-between">
                            <BasicButton btnType={'button'} disable={disableBtn} onClick={handleBackBtnClicked} height={"70px"} width={"75px"} background={"#92A9B8"} color={"#fff"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"left"} />

                            <BasicButton btnType={'submit'} btnTitle={"Log In"} height={"70px"} width={"175px"} background={"#01D4D5"} color={"white"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"right"} onClick={handleLogIn} disable={disableBtn} showSpinner={disableBtn} />
                        </div>
                    </form>
                    {incorrectPassword && <div className="d-flex align-items-center">
                        <div className="login-info-round-div mr-10">
                            <FontAwesomeIcon icon={faInfo} className="business-plan-info-icon" />
                        </div>
                        <span className="tAndc-text grey-color-text">Incorrect Password</span>
                    </div>}
                </div>
            </Col>
            <Col md={3} xs={12} className="sign-in-side-column">
                {planId && <ChosenPlanSummary setchosenProdId={setchosenProdId} setShowSubscriptionPlanModal={setShowSubscriptionPlanModal} />}
                {jobIdFromUrl && <JobInfoRightSideBar user={user} />}
                <Testimony testimonyBy={"jennifer"} />
            </Col>
        </Row>
    </div>
}

export default LogIn