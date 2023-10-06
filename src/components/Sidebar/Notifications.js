import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useJob } from '../../context/jobContext';
import { Row, Col, Card } from 'react-bootstrap';
import { Modal, Button } from 'antd';
import mixpanel from 'mixpanel-browser';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import { faBell, faUser, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { handleStartCall, sendCustomerToMeeting } from '../../utils';
import { useSocket } from '../../context/socketContext';
import { useMediaQuery } from 'react-responsive';
import * as JobApi from '../../api/job.api';

const notificationStrLength = 50;
function Notifications({ user, handleDropDown, notificationCount, userNotifications, displayList, setDisplayList, setcurrentStep, setjobId, setType, setActiveMenu }) {

    const { logout } = useAuth();
    const history = useHistory();
    const componentRef = useRef();
    const { fetchJob } = useJob()
    const { socket } = useSocket();
    const isMobile = useMediaQuery({ maxWidth: 480 });
    const isTablet = useMediaQuery({ minWidth: 481, maxWidth: 1024 });
    const isiPad = useMediaQuery({ minWidth: 768 });
    const isComputer = useMediaQuery({ minWidth: 1367 });
    const [showPopup, setShowPopup] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    const [transferReason, setTransferReason] = useState('');

    const handleMouseOver = () => {
        console.log('handleMouseOver')
        setShowPopup(true);
    };

    const handleMouseOut = () => {
        console.log('handleMouseOut')
        setShowPopup(false);
    };


    useEffect(() => {
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
        function handleClick(e) {
            if (componentRef && componentRef.current) {
                const ref = componentRef.current
                if (!ref.contains(e.target)) {
                    // put your action here
                    if (e.target.classList.contains('fa-bell') || e.target.classList.contains('total-notification') || e.target.classList.contains('bell-icon') || e.target.classList.length === 0) {
                        //bell clicked no hide of notification list
                    } else {
                        setDisplayList(false)
                    }
                }
            }
        }
    }, []);

    const closeDropdown = () => {
        setDisplayList(false)
    }

    const Logout = useCallback(() => {
        Modal.confirm({
            title: 'Logout Now?',
            okText: 'Logout',
            cancelText: 'Cancel',
            className: "logout-modal",
            okButtonProps: {
                id: 'confirm-logout-btn',
            },
            onOk() {
                logout();
            },
        });
    }, [logout]);

    const handleAccept = (item) => {
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Technician - clicked on new job notification', { 'JobId': item.id });
        // mixpanel code//
        history.push(`/technician/new-job/${item.id}`, { userIds: [user.id], appendedJob: item.id });
    }
    const handleTechnicianAccept = (item) => {
        setjobId(item.id)
        history.push(`/customer/accept-job/${item.id}`);
    }

    const handleProfilePageRedirect = () => {
        if (user) {
            mixpanel.identify(user.email);
            if (user.userType === 'technician') {
                mixpanel.track('Technician - Profile settings');
                setcurrentStep(4)
            } else {
                mixpanel.track('Customer - Profile settings');
                setcurrentStep(5)
            }
        }
    }
    const push_to_job_detail = (item, type = "details") => {
        const jobid = item.id;
        fetchJob(jobid)
        setjobId(jobid)
        console.log("type:::", type)
        if (type === "Scheduled Job" && (item.technician === undefined || item.technician === "")) {
            setType("apply")
        }
        else {
            setType("details")
        }

        if (user.userType === 'technician') {
            mixpanel.identify(user.email);
            mixpanel.track('Technician  - Click Job details', { 'JobId': jobid });
        } else {
            mixpanel.identify(user.email);
            mixpanel.track('Customer -Click Job details', { 'JobId': jobid });
        }
        setActiveMenu('home')
        setcurrentStep(6)
    };

    const handleTransferReason = async (jobId) => {
        console.log("handleTransferReason :::", jobId)
        let updateJob = await JobApi.retrieveJob(jobId)
        console.log("UpdateJob :::", updateJob.reasons[0])
        setTransferReason(updateJob.reasons[0])
        setTransferModal(true)
    }

    return (
        <>
            <Modal
                style={{ top: 40 }}
                closable={false}
                title={<span className="customModalTitle">Transfer Job Reason</span>}
                destroyOnClose={false}
                visible={transferModal}
                maskStyle={{ backgroundColor: "#DCE6EDCF" }}
                maskClosable={true}
                width={615}
                footer={
                    [
                        <button
                            className="btn app-btn job-accept-btn modal-footer-btn btn btn-primary"
                            onClick={() => {
                                setTransferModal(false);
                            }}
                            key='Cancel'
                        >
                            Cancel
                        </button>,
                    ]}
            >
                <div className="">
                    <span className="divsize">{transferReason}</span>
                </div>
            </Modal>
            <Row>
                <Col md="8" xs="7" className="d-flex justify-content-left align-items-left">
                    <a href="#" id="notify-jobs-btn" onClick={handleDropDown} className="icons-outer pr-2 bell-icon" title="Notifications">
                        {userNotifications != null && userNotifications.length > 0 && notificationCount > 0 ? <span className="total-notification">{notificationCount}</span> : <></>}
                        <FontAwesomeIcon icon={faBell} />
                    </a>
                    <a href="#" onClick={handleProfilePageRedirect} className="icons-outer pl-0" title="Profile Settings">
                        <FontAwesomeIcon icon={faUser} />
                    </a>
                    <div className='firstNameTechCust ml-2'>
                        {user.userType === 'customer' ? (
                            <span onClick={handleProfilePageRedirect} role="button" onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut} className="hoverable-name"
                                onTouchStart={handleMouseOver}
                                onTouchEnd={handleMouseOut}>
                                {showPopup && (
                                    <span className="name-popup">{user.firstName}</span>
                                )}
                                Hi,{' '}
                                {isiPad
                                    ? user.firstName.length > 9
                                        ? user.firstName.slice(0, 9) + '...'
                                        : user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                                    : isMobile
                                        ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                                        : isTablet
                                            ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()

                                            : isComputer
                                                ? user.firstName.length > 9
                                                    ? user.firstName.slice(0, 9) + '...'
                                                    : user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                                                : isiPad
                                                    ? user.firstName.length > 9
                                                        ? user.firstName.slice(0, 9) + '...'
                                                        : user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                                                    : user.firstName.length > 9
                                                        ? user.firstName.slice(0, 9) + '...'
                                                        : user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()}
                            </span>
                        ) : user.userType === 'technician' ? (
                            <span onClick={handleProfilePageRedirect} role="button" onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut} className="hoverable-name" onTouchStart={handleMouseOver}
                                onTouchEnd={handleMouseOut}>
                                {showPopup && (
                                    <span className="name-popup">{user.firstName}</span>
                                )}
                                Hi,{' '}
                                {
                                    isMobile
                                        ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                                        : isTablet
                                            ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()

                                            : isComputer
                                                ? user.firstName.length > 9
                                                    ? user.firstName.slice(0, 9) + '...'
                                                    : user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                                                : isiPad
                                                    ? user.firstName.length > 9
                                                        ? user.firstName.slice(0, 9) + '...'
                                                        : user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                                                    : user.firstName.length > 9
                                                        ? user.firstName.slice(0, 9) + '...'
                                                        : user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()}
                            </span>
                        ) : null}
                    </div>
                </Col>

                <Col md="4" xs="5" className="text-right">
                    <a href="#" onClick={Logout} className="logout-btn">
                        Logout
                    </a>
                </Col>

                {displayList &&
                    <Col md="12" className="notification-container" ref={componentRef}>
                        <div className="arrow-up"></div>
                        <div className="notification-list ">
                            <Card>
                                <Card.Header className="font-weight-bold cardHeader">
                                    <span className="d-block float-left pt-1">Notifications </span>
                                    <span className="float-right cross-btn-notification" onClick={closeDropdown}>
                                        <FontAwesomeIcon icon={faTimesCircle} />
                                    </span>

                                </Card.Header>

                                <Card.Body>
                                    <ul>
                                        {userNotifications != null && userNotifications.length > 0
                                            ?
                                            userNotifications.map((item, idx) => {

                                                return (
                                                    <React.Fragment key={idx}>
                                                        {((item?.job?.tech_declined_ids?.includes(user?.technician?.id)) && item?.job?.is_transferred_notification_sent === true) ? null :

                                                            <li key={idx}>
                                                                <Col xs="12" className="notification-title">
                                                                    {(item.title ? item.title : "")}
                                                                    {item && item.job && item.job.subOption &&
                                                                        <>
                                                                            {" " + item.job.subOption}
                                                                        </>
                                                                    }
                                                                </Col>
                                                                <Col xs="12" className="notification-description pt-2">
                                                                    {item.job && item.job !== '' ? <p className="" title={item.job.issueDescription}>
                                                                        {(item.job.issueDescription.length > notificationStrLength ? item.job.issueDescription.substring(0, notificationStrLength) + '...' : item.job.issueDescription)}
                                                                    </p>
                                                                        :
                                                                        <></>
                                                                    }
                                                                </Col>
                                                                <Col xs="12" className="notification-bottom pt-0">
                                                                    <Row>

                                                                        <Col md="10" className="notification-other-info">
                                                                            {item && item.user && item.user.userType === "technician" && ((item.type === "new_job") || (item.type === "Scheduled Job")) &&
                                                                                <span className="" ><b>Job Type: </b>{item.type === "new_job" ? "Normal" : "Scheduled"}</span>
                                                                            }

                                                                            {item && item.job && item.job.customer && item.job.customer.user &&
                                                                                <span className="" ><b>Posted by: </b>{item.job.customer.user.firstName + ' '}{item.job.customer.user.lastName}<strong>{item.businessName ? `, ${item.businessName}` : ""}</strong></span>
                                                                            }
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                                                            </div>
                                                                            {user && user.userType === "technician" && (item?.job?.status === 'Pending' || item?.job?.status === 'Waiting') && item?.job?.is_transferred && (
                                                                                <button className="btn notification-btn app-btn app-btn-super-small "
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                        /* Add responsive styles here */
                                                                                        fontSize: '16px',       // Default font size for medium-sized screens
                                                                                        padding: '8px 16px',    // Default padding for medium-sized screens
                                                                                        marginRight: '0px',
                                                                                        '@media screen and (max-width: 768px)': {
                                                                                            fontSize: '14px',     // Adjust font size for smaller screens
                                                                                            padding: '6px 12px',  // Adjust padding for smaller screens
                                                                                        },
                                                                                        '@media screen and (max-width: 480px)': {
                                                                                            fontSize: '12px',     // Adjust font size for even smaller screens
                                                                                            padding: '4px 8px',   // Adjust padding for even smaller screens
                                                                                        },
                                                                                    }}
                                                                                    onClick={() => handleTransferReason(item?.job?.id)}
                                                                                >
                                                                                    <span></span>More Details
                                                                                </button>
                                                                            )}

                                                                            {item && item.job && item.job.customer_approved_long_job === 'yes' && item.type === 'long_job_notifcation' && (item.job.long_job_with_minutes === 'undefined' || item.job.long_job_with_minutes === 'no') &&
                                                                                <>
                                                                                    {(user?.userType === "customer") && <span className="" ><b>Job Cost: </b>${item.job.long_job_cost}</span>}
                                                                                    <span className="" ><b>Job Hours: </b> {item.job.long_job_hours}</span>
                                                                                </>

                                                                            }
                                                                            {item && item.job && item.job.customer_approved_long_job === 'yes' && item.job.long_job_with_minutes !== undefined && item.job.long_job_with_minutes === 'yes' && item.type === 'long_job_notifcation' &&
                                                                                <>
                                                                                    <span className="" >This Job has been converted to long job. Charges will be applied on per 6 minutes basis.</span>
                                                                                </>
                                                                            }
                                                                            <p className="notify-time"> {item.time}</p>
                                                                        </Col>
                                                                        <Col md="2" className="text-right notification-bottom-right">
                                                                            {user.userType === "technician" && item.job &&
                                                                                <ToggleMsg job={item.job} handleAccept={handleAccept} user={user} push_to_job_detail={push_to_job_detail} item={item} socket={socket} />
                                                                            }
                                                                            {user.userType === "customer" && item.job &&
                                                                                <CustomerList key={item.job.jobId} push_to_job_detail={push_to_job_detail} handleTechnicianAccept={handleTechnicianAccept} sendCustomerToMeeting={sendCustomerToMeeting} job={item.job} user={user} item={item} />
                                                                            }
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </li>
                                                        }
                                                    </React.Fragment>
                                                )
                                            })
                                            :
                                            <li>
                                                <Col md="12" className=" p-0 m-0">
                                                    <p className="font-weight-bold text-center p-0 m-0"> No Notifications</p>
                                                </Col>
                                            </li>
                                        }
                                    </ul>

                                </Card.Body>
                            </Card>
                        </div>

                    </Col>
                }
            </Row>
        </>

    );
}

const ToggleMsg = (props) => {

    if (props.user.technician && props.job.declinedByCustomer.includes(props.user.technician.id)) {
        return <span className="LabelVal text-danger" >Declined by customer</span>
    }

    if (props.job.status === "Declined") {
        return <span className="LabelVal text-info"> Job removed </span>
    }
    if (props.job.status === "Expired") {
        return <span className="LabelVal text-danger">Job expired </span>
    }

    if (props.job.status === "Accepted" && props.job.technician === props.user.technician.id) {
        return <button onClick={(e) => { handleStartCall(e, props.job.id, props.socket) }} className="btn notification-btn app-btn app-btn-super-small">
            <span></span>Start Call
        </button>
    }
    if (props.user.technician && props.job.tech_declined_ids.includes(props.user.technician.id)) {
        return <span className="LabelVal text-danger" >Declined</span>
    }

    if ((props.job.status === "Pending" || props.job.status === "Waiting") && !props.job.tech_declined_ids.includes(props.user.technician.id)) {
        return (
            <button onClick={() => { props.handleAccept(props.job) }} className="btn notification-btn app-btn app-btn-super-small notification-details-bell-icon">
                <span></span>Details
            </button>
        )
    }
    if (props.job.status === "Completed") {
        return <span className="LabelVal text-success" >Completed</span>
    }
    if (props.job.status === "Accepted") {
        return <span className="LabelVal text-info" >Not available</span>
    }

    if (props.item.type === "Scheduled Job" && props.job.technician && props.user.technician && props.job.technician !== props.user.technician.id) {
        return <span className="LabelVal text-danger">Job Taken </span>
    }

    if (props.item.type === "Scheduled Job") {
        return <button onClick={() => { props.push_to_job_detail(props.job, props.item.type) }} className="btn notification-btn app-btn app-btn-super-small">
            <span></span>Details
        </button>
    }

    if (props.job.status === "Scheduled" && props.job.technician && props.user.technician && props.job.technician === props.user.technician.id) {
        return (
            <button onClick={() => { props.push_to_job_detail(props.job) }} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Details
            </button>
        )
    }

    return <></>
}


const CustomerList = (props) => {

    if (props.item.type === "Scheduled Job Accepted") {
        return <button onClick={() => { props.push_to_job_detail(props.job) }} className="btn notification-btn app-btn app-btn-super-small">
            <span></span>Click here
        </button>
    }

    if (props.job.status === "Accepted" && props.job.customer && props.user.customer && props.job.customer.id === props.user.customer.id) {
        return <button onClick={() => { props.handleTechnicianAccept(props.job) }} className="btn notification-btn app-btn app-btn-super-small">
            <span></span>Click here
        </button>
    }

    if (props.job.status === "Inprogress" && props.job.customer && props.user.customer && props.job.customer.id === props.user.customer.id) {
        return <button onClick={() => { props.sendCustomerToMeeting(props.job, props.user, 'Customer - Join meeting from notification button') }} className="btn notification-btn app-btn app-btn-super-small">
            <span></span>Join
        </button>
    }

    if (props.job.status === "Completed") {
        return <span className="LabelVal text-success" >Completed</span>
    }

    if (props.job.status === "Scheduled") {
        return (
            <button onClick={() => { props.push_to_job_detail(props.job) }} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Details
            </button>
        )
    }

    if (props.job.status === "ScheduledExpired") {
        return <span className="LabelVal text-danger" >Expired</span>
    }

    return <span></span>
}



export default Notifications;