import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Radio } from 'antd';
import { useHistory, useLocation } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import style from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../context/useContext';
import RightSidebar from '../../components/Sidebar/RightSidebar';
import LeftSidebar from '../../components/Sidebar/LeftSidebar';
import DashboardData from '../../components/Dashboard/Content';
import { useServices } from '../../context/ServiceContext';
import { useNotifications } from '../../context/notificationContext';
import * as SoftwareApi from '../../api/software.api';
import { useSocket } from '../../context/socketContext';
import { useTools } from '../../context/toolContext';
import { VERSION, SECRET_KEY } from '../../constants';
import { retrieveJob } from 'api/job.api';
import { clearAllTimeOuts, handleRefModal, openNotificationWithIcon } from '../../utils';
import { Button } from 'react-bootstrap';
import * as customerSourceApi from '../../api/customerSource.api';
import './index.css';
import Loader from "../../components/Loader";
import mixpanel from 'mixpanel-browser';
import BusinessModal from './steps/BusinessModal';
import AskIfBusinessAccountModal from './steps/AskIfBusinessAccountModal';

let initialLoad = true;
const MainPage = () => {

  const { setJobId, jobId, typeForDetails, setOpenModal, openTechModal, setTypeForDetails, stepDeciderForDashboard, setStepDeciderDashboard, hideBadge, sethideBadge, hearAboutUsModal, setHearAboutUsModal, activeMenu, setActiveMenu } = useTools();
  const { socket } = useSocket();
  const fromEmail = false;
  const { FetchDetails, getStripeAccountStatus } = useServices();
  const { user } = useUser();
  const { fetchNotifications, allNotifications, updateReadStatus } = useNotifications();
  const [openNotification, setOpenNotification] = useState(false);
  const [notifyCount, setNotifyCount] = useState(0);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [softwareList, setSoftwareList] = useState([]);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState('NA');
  const [scheduledBadge, setScheduledBadge] = useState(false);
  const [scheduledJob, setScheduledJob] = useState({});
  const [notificationsArr, setNotificationsArr] = useState([]);
  const history = useHistory();
  const [menuSidebar, setmenuSidebar] = useState(false);
  const [profileSidebar, setprofileSidebar] = useState(false);
  const [customerFeedWhereToCome, setCustomerFeedWhereToCome] = useState(false);
  const [showWhereToFieldError, setShowWhereToFieldError] = useState(false);
  const [otherComeFeedBack, setOtherComeFeedBack] = useState('');
  const [whereHeComeFrom, setWhereHeComeFrom] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showUpdateBusinessNameModal, setShowUpdateBusinessNameModal] = useState(false);
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);
  const urlParams = new URLSearchParams(location.search)
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  console.log("url parms >>>>>>> :::::::::::: ", urlParams.get("jobId"), urlParams.get("schedule"));

  useEffect(() => {
    socket.emit("calculate-unread-twiio-messages", { user })
  }, [])

  const menuSidebarHandle = () => {
    setmenuSidebar(!menuSidebar);
  };

  const profileSidebarHandle = () => {
    setprofileSidebar(!profileSidebar);
  };

  let getStripeNotification = true
  let checkStripeAccountStatus = localStorage.getItem('checkStripeAccountStatus')

  useEffect(() => {
    (async () => {
      if (urlParams.get("checkStripeAccountStatus") || checkStripeAccountStatus && getStripeNotification && user.userType === 'technician') {
        let response = await getStripeAccountStatus(user.technician.accountId)
        setStepDeciderDashboard(14)
        setActiveMenu("technician_transactions")
        if (response) {
          getStripeNotification = false
          openNotificationWithIcon('success', 'Success', 'Your stripe account detail submitted. Please check by Stripe Login');
          localStorage.removeItem('checkStripeAccountStatus')
        } else {
          getStripeNotification = false
          openNotificationWithIcon('info', 'Info', 'Your stripe account profile is incomplete.Please complete your profile');
          localStorage.removeItem('checkStripeAccountStatus')
        }
        let nextState = { additionalInformation: 'Updated the URL with JS' }
        const nextTitle = document.title;
        let nextURL = "/dashboard"
        window.history.pushState(nextState, nextTitle, nextURL);
      }
    })()
  }, [user])

  const handleLinkTransfer = async () => {
    try {
      let updatedJob = await retrieveJob(urlParams.get("scheduleJobId"))
      if (updatedJob.customer.user.id === user.id) {
        setJobId(urlParams.get("scheduleJobId"))
        setTypeForDetails("apply")
        setStepDeciderDashboard(6)
      }
      if (user && user?.userType == 'technician' && updatedJob?.tech_declined_ids.includes(user?.technician.id) == false) {
        setJobId(urlParams.get("scheduleJobId"))
        setTypeForDetails("apply")
        setStepDeciderDashboard(6)
      }
    }
    catch (err) {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", urlParams.get("scheduleJobId"))
      console.log("error in handleLinkTransfer ::: ", err)
    }
  }

  /**   this function is responsible to get url params and send the tech and customer to the job detail page  
  *     this function first retreve the updated job 
  *     @author : kartar singh
  **/

  // This function handles the transfer of a job link from Slack to the dashboard
  const handleLinkTransferSlack = async () => {
    try {
      let slackJobidFromParams = urlParams.get("slackJobid");
      // Retrieve the job using the slackJobid from the URL params
      let updatedJob = await retrieveJob(slackJobidFromParams)

      // If the user is the customer who created the job, set the job ID, type for details, and step decider dashboard
      if (user && updatedJob) {
        if (updatedJob?.customer?.user?.id === user.id) {
          setJobId(slackJobidFromParams)
          setTypeForDetails("apply")
          setStepDeciderDashboard(6)
        }
      }

      // If the user is a technician who hasn't declined the job and the job has not been assigned to anyone, set the job ID, type for details, and step decider dashboard
      if (user && user?.userType === 'technician' && updatedJob?.tech_declined_ids.includes(user?.technician.id) === false) {
        setTypeForDetails("apply")
        setJobId(slackJobidFromParams)
        setStepDeciderDashboard(6)
      }

      // If the user is a technician, track their activity in Mixpanel
      if (user) {
        if (user?.userType === 'technician') {
          mixpanel.identify(user.email);
          mixpanel.track('Technician  - technician come from slack ', { 'userType': user.userType, 'JobId': slackJobidFromParams });
        }
        // If the user is a customer, track their activity in Mixpanel
        else {
          mixpanel.identify(user.email);
          mixpanel.track('Customer -  customer come from slack', { 'userType': user.userType, 'JobId': slackJobidFromParams });
        }
      }

    }
    // If an error occurs, log it to the console
    catch (err) {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", urlParams.get("scheduleJobId"))
      console.log("error in handleLinkTransfer ::: ", err)
    }
  }

  const handleLinkTransferMessage = async () => {
    try {
      let messageFromParams = urlParams.get("message");
      console.log('message :::::', messageFromParams)
      setTimeout(() => {
        setStepDeciderDashboard(15)
        setActiveMenu('messages')
      }, 1000);
    }
    // If an error occurs, log it to the console
    catch (err) {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", urlParams.get("message"))
      console.log("error in handleLinkTransfer ::: ", err)
    }
  }

  useEffect(() => {

    clearAllTimeOuts()
    if (urlParams.get("mobileJobId") || urlParams.get("invaildUser")) {
      if (urlParams.get("invaildUser")) {
        openNotificationWithIcon('error', 'Error', "You are not authorized to access this Job.");
      }

      if (urlParams.get("mobileJobId")) {
        setJobId(urlParams.get("mobileJobId"))
        setTypeForDetails("details")
        setStepDeciderDashboard(6)
      }

      let nextState = { additionalInformation: 'Updated the URL with JS' }
      const nextTitle = document.title;
      let nextURL = "/dashboard"
      window.history.pushState(nextState, nextTitle, nextURL);
    }
    if (urlParams.get("scheduleJobId")) {
      handleLinkTransfer()
      console.log("before url parms >>>>>>> :::::::::::: ", urlParams.get("scheduleJobId"));


      let nextState = { additionalInformation: 'Updated the URL with JS' }
      const nextTitle = document.title;
      let nextURL = "/dashboard"
      window.history.pushState(nextState, nextTitle, nextURL);
    }
    /**   
     *   this if will get slackJobid from params and call handleLinkTransferSlack and convert the link to dashboard
     *   @author : kartar singh
    **/

    if (urlParams.get("slackJobid")) {
      handleLinkTransferSlack();
      let nextState = { additionalInformation: 'Updated the URL with JS' };
      const nextTitle = document.title;
      let nextURL = "/dashboard";
      window.history.pushState(nextState, nextTitle, nextURL);
    }
    if (urlParams.get("chatScreen")) {
      let nextState = { additionalInformation: 'Updated the URL with JS' };
      const nextTitle = document.title;
      let nextURL = "/dashboard";
      window.history.pushState(nextState, nextTitle, nextURL);
    }

    if (urlParams.get("message")) {
      console.log('inside the message')
      handleLinkTransferMessage();
      let nextState = { additionalInformation: 'Updated the URL with JS' };
      const nextTitle = document.title;
      let nextURL = "/dashboard";
      window.history.pushState(nextState, nextTitle, nextURL);
    }

    if (urlParams.get("checkJobId")) {
      console.log("before url parms >>>>>>> :::::::::::: ", urlParams.get("checkJobId"));
      const job_id = urlParams.get("checkJobId")
      handleLinkTransferToJobDetails(job_id)
      let nextState = { additionalInformation: 'Updated the URL with JS' }
      const nextTitle = document.title;
      let nextURL = "/dashboard"
      window.history.pushState(nextState, nextTitle, nextURL);
    }

    /**   
     *  This function used for redirect the user to JobDetails Page 
     *  @param : jobId
     *   @author : Mritunjay
    **/
    async function handleLinkTransferToJobDetails(job_id) {
      try {
        const jobResult = await retrieveJob(job_id);
        if (jobResult.technician.user.id) {
          if (jobResult.technician.user.id) {
            setJobId(job_id)
            setTypeForDetails("apply")
            setStepDeciderDashboard(6)
            setActiveMenu("job-reports")
          } else {
            window.location.href = '/dashboard'
          };
        } else {
          if (jobResult.customer.user.id) {
            setJobId(job_id)
            setTypeForDetails("apply")
            setStepDeciderDashboard(6)
            setActiveMenu("job-reports")
          } else {
            window.location.href = '/dashboard'
          };
        };
      }
      catch (err) {
        console.log("error in handleLinkTransferToJobDetails ::: ", err)
      };
    };

    if (user && user.customer && user.customer.askedForBusiness === false && user.isBusinessTypeAccount && user.roles.includes("owner")) {
      console.log("Asking user for business info", user)
      setShowBusinessModal(true)
    }

    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "update_technician") {
      window.location.href = "/technician/register_steps?t=update_technician";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "select_softwares") {
      window.location.href = "/technician/register_steps?t=select_softwares";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "level_of_expertise") {
      window.location.href = "/technician/register_steps?t=level_of_expertise";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "availability") {
      window.location.href = "/technician/register_steps?t=availability";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "demo_video") {
      window.location.href = "/technician/register_steps?t=demo_video";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "instructions") {
      window.location.href = "/technician/register_steps?t=instructions";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "exam") {
      window.location.href = "/technician/register_steps?t=exam";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "exam_fail") {
      window.location.href = "/technician/register_steps?t=exam_fail";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "finalize_profile") {
      window.location.href = "/technician/register_steps?t=finalize_profile";
    }
    if (user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "schedule_interview") {
      window.location.href = "/technician/register_steps?t=schedule_interview";
    }
    if(user && user.userType === 'technician' && user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === 'interview_result' || user.technician.registrationStatus === "complete" || user.technician.registrationStatus === 'interview_reject' || user.technician.registrationStatus === 'send_test' || user.technician.registrationStatus === 'test_result' || user.technician.registrationStatus === 'send_interview')){
      setShowLoader(false)
    }
    if (user && user.userType === 'customer') {
      setShowLoader(false)
    }
    if (user && user.email === "guest@geeker.co") {
      console.log("removing token from dashboard", user, user.email)
      setShowLoader(true)
      localStorage.removeItem(SECRET_KEY)
      window.location.href = "/";
    }

    if (user &&
      user.userType === 'customer' &&
      !user.isBusinessTypeAccount &&
      !user.businessName &&
      user.businessName !== "" &&
      (!user.ownerId || user.ownerId === null)) {
      console.log("My console to chk businessName conditions", user.businessName === "", !user.businessName)
      setShowUpdateBusinessNameModal(true)
    }

  }, [])

  useEffect(() => {
    window.localStorage.setItem('CurrentStep', stepDeciderForDashboard)
  }, [stepDeciderForDashboard])

  useEffect(() => {
    console.log("openTechModal1 :::: ", openTechModal)
  }, [openTechModal])

  const handleScheduledJob = () => {
    if (scheduledJob !== {}) {
      setJobId(scheduledJob.id);
      setStepDeciderDashboard(6);
    }
  };

  const findReadable = (userNotifyArr) => {
    const onLyReadableItems = userNotifyArr.filter(item => item.read === false)
    setNotifyCount(onLyReadableItems.length)
  }

  useEffect(() => {
    if (openNotification) {
      setNotifyCount(0);
      setShowNotificationBadge(false);
      sethideBadge(true);
    }
  }, [openNotification]);

  useEffect(() => {
    if (hideBadge) {
      setNotifyCount(0);
      setShowNotificationBadge(false);
    }
  }, [hideBadge]);

  useEffect(() => {

    socket.on('scheduled-call-alert', (data) => {
      if (user && user.customer && data.receiver === user.customer.id) {
        setScheduledBadge(true);
        setScheduledJob(data.job);
      }
    });
  }, [socket, user]);

  useEffect(() => {
    console.log('Notifications changed');
    if (allNotifications && user) {
      const userNotifyArrTemp = allNotifications.filter(item => (item && user && item.user) && item.user.id === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const userNotifyArr = allNotifications

      findReadable(userNotifyArrTemp)
      for (let i = 0; i <= userNotifyArr.length - 1; i++) {
        let old_time = new Date(userNotifyArr[i]['createdAt'])
        let now_time = new Date();
        var diffMs = (now_time - old_time); // milliseconds between now & Christmas
        var diffDays = Math.floor(diffMs / 86400000); // days
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

        if (diffDays > 0) {
          userNotifyArr[i]['time'] = diffDays.toString() + ' days ago'
        } else if (diffHrs > 0) {
          userNotifyArr[i]['time'] = diffHrs.toString() + ' hours ago'
        } else if (diffMins > 0) {
          userNotifyArr[i]['time'] = diffMins.toString() + ' minutes ago'
        } else {
          userNotifyArr[i]['time'] = 'Few seconds ago'
        }
      }

      setNotificationsArr(userNotifyArr)
      initialLoad = false
      setShowNotificationBadge(true)

    } else {
      setNotifyCount(0);
    }

  }, [allNotifications]);

  useEffect(() => {
    console.log("stepDeciderForDashboard ::::::: ", stepDeciderForDashboard)
  }, [stepDeciderForDashboard])
  useEffect(() => {
    (async () => {
      if (user) {
        const res = await SoftwareApi.getSoftwareList();
        if (res && res.data) {
          setSoftwareList(res.data);

          if (res.data && res.data.length > 0) {
            const sidArr = (user.technician && user.technician.expertise ? user.technician.expertise.map(a => a.software_id) : []);
            let wTime = '';

            if (sidArr.length === 1) {
              const waitResult = res.data.filter(obj => obj.id === sidArr[0]);
              if (waitResult.length > 0 && waitResult[0].estimatedWait) {
                wTime = waitResult[0].estimatedWait.split('-')[0];
                setEstimatedWaitTime(wTime);
              }
            } else if (sidArr.length > 1) {
              let softwareWithMaxTime;
              softwareWithMaxTime = res.data.reduce((max, x) => {
                if (sidArr.indexOf(x.id) !== -1) {
                  const waitValX = (x && x.estimatedWait ? String(x.estimatedWait).split('-')[0] : 0);
                  const waitValM = (max && max.estimatedWait ? String(max.estimatedWait).split('-')[0] : 0);
                  return waitValX > waitValM ? x : max;
                }
                return false;
              });

              if (softwareWithMaxTime && softwareWithMaxTime.estimatedWait) {
                wTime = String(softwareWithMaxTime.estimatedWait).split('-')[0];
                setEstimatedWaitTime(wTime);
              }
            }
          }
        }
      } else {
        history.push('/login');
      }
    })();
  }, [history, user]);

  useEffect(() => {
    if (user) {
      if (initialLoad) {
        console.log('Notifications working  refetch ::::');
        fetchNotifications({ user: user.id });
      }
    }

  }, [fetchNotifications, user]);


  useEffect(() => {
    const ele = document.querySelector('.fb_reset .fb_iframe_widget .fb_customer_chat_bounce_out_v2');
    const openCss = 'width: 399px; padding: 0px; position: fixed; z-index: 2147483646; border-radius: 16px; top: auto; background: none; bottom: 84px; max-height: calc(100% - 84px); right: 4px; marginRight: 12px; visibility: visible; min-height: 300px; height: 438px;';
    // let closeCss = `width: 399px; padding: 0px; position: fixed; z-index: 2147483646; border-radius: 16px; top: auto; background: none; bottom: 84px; max-height: 0px; right: 4px; margin-right: 12px; visibility: visible; min-height: 0px; height: 438px;`
    if (user) {
      if (user.userType === 'technician') {
        FetchDetails({ to: user.id });
      } else {
        FetchDetails({ user: user.id });
      }
    }

    if (stepDeciderForDashboard === 4 || stepDeciderForDashboard === 5) {
      setActiveMenu('settings');
    }
    if (stepDeciderForDashboard === 2) {
      setActiveMenu('job-reports');
    }

    if (stepDeciderForDashboard === 7) {
      if (ele != null) {
        ele.style = '';
        ele.style = openCss;
      }
    }
  }, [stepDeciderForDashboard, user]);

  useEffect(() => {
    setHearAboutUsModal(false);
    handleNewCustomer();
  }, []);

  /**
   * This function handles the response of customer from modal of Hear About Us after new signup & saves it to database
   * @author : Kartik
   **/
  const handleWhereToCome = async () => {
    let theVar = '';
    if (customerFeedWhereToCome == false) {
      openNotificationWithIcon('error', 'Error', 'Please select an option');
      return;
    }
    if (customerFeedWhereToCome == 'Others' && otherComeFeedBack == '') {
      setShowWhereToFieldError(true);
      setWhereHeComeFrom('');
      return;
    }
    if (customerFeedWhereToCome == 'Others') {
      theVar = otherComeFeedBack;
      setWhereHeComeFrom(otherComeFeedBack);
    } else {
      theVar = customerFeedWhereToCome;
      setWhereHeComeFrom(customerFeedWhereToCome);
    }
    if (user && user.userType == 'customer') {
      const dataToSaveinSource = {
        user: user.id,
        source: theVar,
      };
      const apiCall = await customerSourceApi.createCustomerSource(dataToSaveinSource);
    }

    setHearAboutUsModal(false);
    handleRefModal()
  };

  const handleCustomerFeed = e => {
    setOtherComeFeedBack('');
    setShowWhereToFieldError(false);
    setCustomerFeedWhereToCome(e.target.value);
  };

  const handleNewCustomer = async () => {
    if (user && user.userType == 'customer') {
      const response = await customerSourceApi.isCustomerExist({ user_id: user.id });
      console.log('response :::::', response);
      if (!response.sourceAlreadyGiven) {
        setTimeout(setHearAboutUsModal(false), 3000);
      }
    }
  };
  useEffect(() => {
    socket.on('unread-messages-notification', (data) => {
      if (user && user?.userType == 'technician' && data) {
        if (data?.technician == user?.technician?.user) {
          console.log("unread-messages-notification technician", { data: data, user: user?.technician?.id })
          setNewMessageAlert(true);
        }
      }
      if (user && user?.userType == 'customer' && data) {
        if (data?.customer == user?.customer?.user) {
          console.log("unread-messages-notification customer", { data: data, user: user?.customer?.id })
          setNewMessageAlert(true);
        }
      }
    })

    socket.on('refresh-twilio-unread-messages-frontend', ({ customerUserId, technicianUserId }) => {
      console.log("customer's and technician's ids", { customerUserId, technicianUserId })
      if (user.id === customerUserId || user.id === technicianUserId) {
        socket.emit("calculate-unread-twiio-messages", { user })
      }
    })
  }, [socket])

  if (showLoader) return (<Loader />)
  return (

    <Container fluid>
      <Row className="newJs">

        <Col md="12" className="mobile-header-outer">
          <Link to="/" >
            <Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
          </Link>
          <button
            className="menu-toggle-bar"
            onClick={() => {
              menuSidebarHandle();
            }}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          {user && user.userType === 'technician' && (
            <button
              className="profile-toggle-bar"
              onClick={() => {
                profileSidebarHandle();
              }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
        </Col>
        {(sessionStorage.getItem("hideHearAboutUsModal"))
          ? <></>
          : <Modal title="How did you hear about us ?" visible={hearAboutUsModal} closable={false} destroyOnClose={false} className="change-feedback-modal title-bold" footer={<Button className="btn app-btn" key="submit" onClick={handleWhereToCome}>Submit</Button>}>
            <div className="section_three">
              <div className="section_sub_three">
                <Radio.Group onChange={handleCustomerFeed} className="radioBoxes" value={customerFeedWhereToCome}>
                  <Radio value="Facebook">
                    Facebook
                  </Radio>
                  <br />
                  <Radio value="Twitter">
                    Twitter
                  </Radio>
                  <br />
                  <Radio value="LinkedIn">
                    LinkedIn
                  </Radio>
                  <br />
                  <Radio value="friend">
                    Friend
                  </Radio>
                  <br />
                  <Radio value="Others">
                    Others please specify
                  </Radio>
                </Radio.Group>
              </div>
              {customerFeedWhereToCome == 'Others' && (
                <div className="section_five">
                  <div className="section_sub_five col-12 ml-0 p-0 mt-4 form-group">
                    <input spellCheck rows={4} className="form-control" onChange={(e) => { setShowWhereToFieldError(false); setOtherComeFeedBack(e.target.value); }} id="textarea" />
                    {showWhereToFieldError && <p className="m-0 p-0" style={{ color: 'red' }}> Required Field</p>}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        }
        <Col
          xl="2"
          className={
            menuSidebar ? 'sidebar-left-outer active' : 'sidebar-left-outer'
          }
        >
          <LeftSidebar
            user={user}
            toggle={menuSidebarHandle}
            setcurrentStep={setStepDeciderDashboard}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            newMessageAlert={newMessageAlert}
          />
          <p className='my-app-version'> V{VERSION}</p>

        </Col>

        {user && user.userType === 'technician' && (
          <Col xl="7">
            <DashboardData user={user} sethideBadge={sethideBadge} fromEmail={fromEmail} scheduledBadge={scheduledBadge} currentStep={stepDeciderForDashboard} setcurrentStep={setStepDeciderDashboard} allNotifications={allNotifications} softwareList={softwareList} setActiveMenu={setActiveMenu} initialLoad={initialLoad} scheduledJob={scheduledJob} handleScheduledJob={handleScheduledJob} showNotificationBadge={showNotificationBadge} setShowNotificationBadge={setShowNotificationBadge} notifyCount={notifyCount} setOpenNotification={setOpenNotification} hideBadge={hideBadge} setjobId={setJobId} openNotification={openNotification} estimatedWaitTime={estimatedWaitTime} setEstimatedWaitTime={setEstimatedWaitTime} jobId={jobId} type={typeForDetails} setType={setTypeForDetails} />
          </Col>
        )}
        {user && user.userType === 'customer' && (
          <Col xl="10">
            <DashboardData user={user} sethideBadge={sethideBadge} scheduledBadge={scheduledBadge} currentStep={stepDeciderForDashboard} setcurrentStep={setStepDeciderDashboard} allNotifications={notificationsArr} softwareList={softwareList} setActiveMenu={setActiveMenu} initialLoad={initialLoad} scheduledJob={scheduledJob} handleScheduledJob={handleScheduledJob} showNotificationBadge={showNotificationBadge} setShowNotificationBadge={setShowNotificationBadge} notifyCount={notifyCount} setOpenNotification={setOpenNotification} hideBadge={hideBadge} setjobId={setJobId} openNotification={openNotification} estimatedWaitTime={estimatedWaitTime} setEstimatedWaitTime={setEstimatedWaitTime} jobId={jobId} type={typeForDetails} setType={setTypeForDetails} />
          </Col>
        )}

        {user && user.userType === 'technician' && (
          <Col
            xl="3"
            className={
              profileSidebar
                ? 'sidebar-right-outer pt-4 px-4 px-md-5 active'
                : 'sidebar-right-outer pt-4 px-4 px-md-5'
            }
          >
            <RightSidebar
              user={user}
              toggle={profileSidebarHandle}
              sethideBadge={sethideBadge}
              openNotification={openNotification}
              setOpenNotification={setOpenNotification}
              setcurrentStep={setStepDeciderDashboard}
              setjobId={setJobId}
              setType={setTypeForDetails}
              setActiveMenu={setActiveMenu}
            />
          </Col>
        )}

      </Row>
      <BusinessModal showBusinessModal={showBusinessModal} setShowBusinessModal={setShowBusinessModal} user={user} />
      <AskIfBusinessAccountModal user={user} showUpdateBusinessNameModal={showUpdateBusinessNameModal} setShowUpdateBusinessNameModal={setShowUpdateBusinessNameModal} />
    </Container>
  );
};
const Image = style.img`
  	display: block;
  	width: 120px;
	margin:auto;
`;
export default MainPage;
