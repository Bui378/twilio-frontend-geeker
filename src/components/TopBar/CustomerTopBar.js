import React, { useState } from 'react';
import { Col, Button } from 'react-bootstrap';
import { Modal } from 'antd';
import mixpanel from 'mixpanel-browser';
import { useUser } from '../../context/useContext';
import { openNotificationWithIcon } from '../../utils';
import { klaviyoTrack } from '../../api/typeService.api';
import * as JobApi from '../../../src/api/job.api';
import { checkPendingStatus } from '../../utils';
import { JOB_STATUS } from '../../constants/index';
import { useJob } from "../../context/jobContext";

const CustomerTopBar = ({ setcurrentStep, setActiveMenu }) => {

  const { user } = useUser();
  const [customerConfirm, setCustomerConfirm] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState(false);
  const [lastPendingSoftware, setLastPendingSoftware] = useState('');
  const { updateJob } = useJob();
  const [isDisabled, setIsDisabled] = useState(false)
  const [latestPendingJobToUpdate, setLatestPendingJobToUpdate] = useState()
  const message = scheduleMsg
    ? <span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
      One of your previous job of <b style={{ fontWeight: 'bold' }}>{lastPendingSoftware}</b> is already scheduled with a technician. Are you sure you want to create a new job post?if yes, then your previous job will be <b style={{ fontWeight: 'bold' }}>Cancelled</b>
    </span>
    : <span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
      We are still looking for a technician for your existing job of <b style={{ fontWeight: 'bold' }}>{lastPendingSoftware}</b>. Are you sure you want to create a new job post? if yes, then your previous job will be <b style={{ fontWeight: 'bold' }}>Cancelled</b>
    </span>;

  const klaviyoTrackFunction = async () => {
    if (user?.customer?.customerType === 'live') {
      console.log('klaviyoTrackFunction ::::')
      const klaviyoData = {
        email: user?.email,
        event: 'Job Post Button Click',
        properties: {
          $first_name: user?.firstName,
          $last_name: user?.lastName,
        },
      };
      await klaviyoTrack(klaviyoData);
    };

    if (window.localStorage.getItem('extraMin')) {
      window.localStorage.removeItem('extraMin');
    }
    if (window.localStorage.getItem('secs')) {
      window.localStorage.removeItem('secs');
    }
  }

  const push_to_profile_setup = async (e) => {
    console.log('>>>>>>>>>>>>push_to_profile_setup ::::::: TopBar');
    try {
      if (user) {
        // mixpanel code//
        mixpanel.identify(user?.email);
        mixpanel.track('Customer - Post a job');
        mixpanel.people.set({
          $first_name: user?.firstName,
          $last_name: user?.lastName,
        });
        // mixpanel code//
      }

      if (user) {
        console.log('inside the latestJob:::: 1');

        if (latestPendingJobToUpdate && latestPendingJobToUpdate.total_pending_jobs > 0) {
          console.log('inside the latestJob::: 3:', latestPendingJobToUpdate);

          const lastPendingJob = latestPendingJobToUpdate.last_pending_job;

          if (lastPendingJob && (lastPendingJob.status === JOB_STATUS.PENDING || lastPendingJob.status === JOB_STATUS.WAITING || lastPendingJob.status === JOB_STATUS.SCHEDULED)) {
            console.log('inside the latestJob updateJob job :::::');
            const updatedJob = await updateJob(lastPendingJob.id, { status: "Declined" })
            console.log('inside the latestJob updateJob job ::::: 2', updatedJob)
            await klaviyoTrackFunction()
            window.location.href = '/customer/profile-setup?page=select-software';
          } else {
            await klaviyoTrackFunction()
            window.location.href = '/customer/profile-setup?page=select-software';
          }
        } else {
          await klaviyoTrackFunction()
          window.location.href = '/customer/profile-setup?page=select-software';
        }
      } else {
        openNotificationWithIcon('error', 'Error', 'Something went wrong. Please logout and login again.');
      }
    } catch (e) {
      console.log("Err in catch block in push_to_profile_setup()", e)
    }
  };

  /**
   * Function will check if there are any pending jobs of the customer else it will call push_to_profile_setup function to find technician.
   * @author : Nafees
   */
  const checkPendingJobs = async () => {
    try {
      setIsDisabled(true)
      if (user && user?.customer) {
        const latestpendingJobs = await JobApi.latestpendingJobs({ "customer": user.customer.id });
        console.log('latest pending pob ::', latestpendingJobs)
        setLatestPendingJobToUpdate(latestpendingJobs)
        let pendingJobs = await checkPendingStatus(user);

        if (pendingJobs.schedule_accepted) {
          setScheduleMsg(true)
        }

        if (pendingJobs.success) {
          setLastPendingSoftware(pendingJobs.name)
          setCustomerConfirm(true);
        }
        else {
          push_to_profile_setup()
        }

      }
      setTimeout(() => {
        setIsDisabled(false);
      }, 2000);
    } catch (e) {
      console.log("Error in checkPendingJobs ", e);
    }
  };

  const closePendingModal = () => {
    setCustomerConfirm(false);
  };
  return (
    <>
      <Col className="text-left pt-4 pr-0">
        <Button id="dash-get-help-now" onClick={checkPendingJobs} disabled={isDisabled} className={(isDisabled ? "disabled-btn" : "") + "btn app-btn app-btn-large"}>
          <span />
          Get Help Now
        </Button>
      </Col>
      <Modal
        className='get-help-now-modal'
        closable={true}
        onCancel={closePendingModal}
        visible={customerConfirm}
        maskStyle={{ backgroundColor: "#DCE6EDCF" }}
        maskClosable={true}
        width={800}
        footer={
          [
            <div className='modal-flex-get-help-now'>

              <Button
                className="btn app-btn app-btn-light-blue modal-footer-btn"
                onClick={() => {
                  setCustomerConfirm(false);
                }}
                key='no'
              >
                <span></span>Back To Dashbord
              </Button>

              <Button
                id="confirm-create-new"
                className="btn app-btn job-accept-btn modal-footer-btn"
                onClick={push_to_profile_setup}
                key='yes'
              >
                <span></span>Create New
              </Button>
            </div>
          ]}
      >
        <div className="">
          <span className="div-font" style={{ fontSize: 20, paddingTop: '40px' }}>
            {message}
          </span>
        </div>
      </Modal>
    </>

  );
};
export default CustomerTopBar;
