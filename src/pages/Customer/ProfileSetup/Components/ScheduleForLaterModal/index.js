import React, { useState} from "react"
import {Modal} from 'antd';
import BasicButton from "components/common/Button/BasicButton";
import ScheduleForLater from "../ScheduleForLater";
import { useJob } from '../../../../../context/jobContext';
import { openNotificationWithIcon } from '../../../../../utils';
import { klaviyoTrack } from '../../../../../api/typeService.api';
import mixpanel from 'mixpanel-browser';
import { useNotifications } from '../../../../../context/notificationContext';
import { useSocket } from '../../../../../context/socketContext';  
import * as JobApi from '../../../../../api/job.api';
import { getPrimaryTime,isWorkingHours} from "../../../../../utils/index";
const ScheduleForLaterModal = ({showScheduleForLaterModal, setShowScheduleForLaterModal,scheduleJobTime,setScheduleJobTime ,keepForSearching,setKeepForSearching, user, jobInfo, job, isDashboardSide,setShowKeepSearchingModal, searchTimesUp}) => {

    const { updateJob } = useJob();
    const { createNotification, fetchNotifications } = useNotifications();
    const { socket } = useSocket();
	const [showSpinner, setShowSpinner] = useState(false)
	const [disableButtonClick , setDisableButtonClick] = useState(false)
    // const handleConfirmButton = () => {
    //     setShowScheduleForLaterModal(false)
    // }

	/**
	 * emit send-schedule-alerts socket and create / fetch notification customer notifications
	 * @params : jobStats(Type:Object): Have job details
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	 const emitSocketCreateFetchNotification = async (jobStats) =>{
		try{

			let timeToSend = getPrimaryTime(scheduleJobTime)
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
				primaryTime: timeToSend,
				phoneNumber:user.customer.phoneNumber,
				customerName:user.firstName,
				customerEmail:user.email,
				technicianId:(job && job?.post_again_reference_technician ? job.post_again_reference_technician : false)
			});
		}catch(err){
			mixpanel.identify(user.email);
			mixpanel.track('There is catch error while create/fetch notification', { jobStats: jobStats, errMessage: err.message });
			console.log('There is catch error while create/fetch notification  :::: '+ err.message)
		}
	}
	const scheduleForLater = async (e) => {
		e.preventDefault()
		const isWithinWorkingHours = isWorkingHours(scheduleJobTime);
		if (!isWithinWorkingHours) {
			openNotificationWithIcon('error', 'Error', "Our techs are mostly available between 9am-9pm EST Mon-Fri. Please schedule a good time during these business hours. ");
			return;
		}
		setDisableButtonClick(true)
		setShowSpinner(true)
	    const scheduleJobData = {};
		let scheduleDetails = {
			'primaryTimeAvailable':true,
			'primaryTimeExpiredAt':null,
			'secondaryTimeAvailable':false,
			'secondaryTimeExpiredAt':null,
			'scheduleExpired':false,
			'scheduleExpiredAt':null
		}
        const klaviyoData = {
            email: user.email,
            event: 'Scheduled Job Created from tech searching page',
            properties: {
                $first_name: user.firstName,
                $last_name: user.lastName,
            },
        };
        await klaviyoTrack(klaviyoData);

        console.log('job changed to schedule>>>>>>>>>>>>>>>>>>>>>>>>', job.id);
        
		let scheduleTimeNew = getPrimaryTime(scheduleJobTime);
		console.log("time please",scheduleTimeNew)
		const hourDifferenceFromNow = scheduleTimeNew - new Date().getTime()
		if(hourDifferenceFromNow < 3600000){
			openNotificationWithIcon("error", "Error", "Please select time atleast 1 hour from now!")
			setShowSpinner(false)
			setDisableButtonClick(false)
			return
		}
		
		setScheduleJobTime((prevState => ({...prevState, date:scheduleTimeNew  })))

		scheduleJobData.primarySchedule = scheduleTimeNew;
		scheduleJobData.status = "Scheduled";
		scheduleJobData.scheduleDetails = scheduleDetails;
        scheduleJobData.scheduleDetails.scheduleExpiredAt = new Date(scheduleTimeNew - 1200000)
		// updateJob(job.id, {status:"Scheduled", primarySchedule:scheduleTimeNew})
		// updateJob(job.id, scheduleJobData)
		const updatedJob = await JobApi.updateJob(job.id,scheduleJobData)

        await emitSocketCreateFetchNotification(updatedJob)
        setShowScheduleForLaterModal(false)
		setTimeout(() => {
			window.location.href = isDashboardSide ? '/dashboard' :'/dashboard?&scheduleJobId='+job.id;
		}, 2000);
	}
	
    const handleClickNo =()=>{
    	setShowScheduleForLaterModal(false) 
    	if(searchTimesUp) setShowKeepSearchingModal(true)
    }

    return(<div className="schedule-for-later-modal-outer-div">
        <Modal
            className="schedule-modal"
            footer={null}
            closable={false}
            visible={showScheduleForLaterModal} 
            maskStyle={{backgroundColor:"#DCE6EDCF"}}
            maskClosable={false}
            width={766}
			onCancel={()=>{setShowScheduleForLaterModal(false)
						  if(searchTimesUp) setShowKeepSearchingModal(true) //open up keep searching modal if times up
					  }}
			wrapClassName="vertical-center-modal"
        >
           <div className="d-flex flex-column justify-content-center align-items-center schedule-for-later-modal">
				<div className="mt-3 text-center  text-wrap" style={{ fontSize: "16px" }}>
					Please note, if you don't show up to the call on scheduled time after a Geek accepted the call
				</div>
				<div className="mb-3 text-center text-wrap" style={{ fontSize: "16px" }}>
					a fee of $24.99 will be applied. Are you sure you want to continue?
				</div>
				<div className="schedule-for-later-modal-heading mt-3">Schedule for later</div>
				<ScheduleForLater
					setScheduleJobTime={setScheduleJobTime}
					scheduleJobTime={scheduleJobTime}
					setKeepForSearching={setKeepForSearching}
					keepForSearching={keepForSearching}
				/>
			</div>

                <div className="mb-75 mt-45 d-flex justify-content-around">
					<BasicButton  onClick={handleClickNo} btnTitle={"No"} height={"60px"} width={"138px"} background={"rgb(151 171 182)"} color={"#fff"} />
                    <BasicButton disable={disableButtonClick} onClick={scheduleForLater} btnTitle={"Yes"} height={"60px"} width={"138px"} background={"#01D4D5"} color={"#fff"} showSpinner={showSpinner} />
                </div>
        </Modal>
    </div>)
}

export default ScheduleForLaterModal