import React from "react"
import {Modal} from 'antd';
import { Button } from 'react-bootstrap';
import * as JobApi from '../../../../../api/job.api';
import * as CustomerApi from '../../../../../api/customers.api';
import * as UserApi from '../../../../../api/users.api';
import mixpanel from 'mixpanel-browser';
import { useSocket } from '../../../../../context/socketContext';
import { openNotificationWithIcon } from '../../../../../utils';

const CancelJobConfirmationModal = ({showCancelJobModal, setShowCancelJobModal,job}) => {
  const { socket } = useSocket();
  /**
   * Cancel a job by click on button
   * @params = 
   * @response : it redirects the customer to Dashboard.
   * @author : Nafees
  */
	const cancelJobByCustomer = async() =>{
		// mixpanel code//

		mixpanel.track('Customer - Cancel Job by customer',{'JobId':job.id});
		// updating job cancelled by customer into DB
    await JobApi.updateJob(job.id, { status: 'Declined' });
    let updateJob = await JobApi.retrieveJob(job.id);
    // This will refund the hold money from customer account
    if (job && job?.customer_holded_payments && job?.customer_holded_payments.length >0) {
      console.log('job from stratipekfe',job.customer.user.ownerId)
      let ownerStripeId = '';
      const ownerId =job?.customer?.user?.ownerId;
      if(ownerId){
         const ownerStripeRes = await UserApi.getUserById(ownerId)
         if(ownerStripeRes?.customer?.stripe_id){
          ownerStripeId = ownerStripeRes?.customer?.stripe_id 
      }
      }
      
      // getStripeIdOfOwner()
      const stripeId = ownerId ? ownerStripeId : job?.customer?.stripe_id
      // Here payment_hold_id is not-applicable-here because we want to send only when we are Adding card as in that case of card no payment_hold_id is stored somewhere  but in normal cases like this all the data is stored in the form of object and may have more than one stripe id 
      const obj = {
        payment_hold_id: "not-applicable-here",
        isDeduct: false,
        jobId: job?.id,
        stripe_id : stripeId
      }
      await CustomerApi.deductOrRefundHoldMoney(obj)
    }
  
    socket.emit('job-cancel-by-customer', updateJob)
    console.log("window.location.href from cancelJobModalconfirmation", updateJob)
		 window.location.href=  "/"
	} 
  const handleCancel = () => {
    setShowCancelJobModal(false);
  };

    return<Modal
    style={{ top: 40 }}
    closable={false}
    onCancel={handleCancel}
    visible={showCancelJobModal} 
    maskStyle={{backgroundColor:"#DCE6EDCF"}}
    maskClosable={true}
    width={615}
    footer={
        [
          <Button
            className="btn app-btn app-btn-light-blue modal-footer-btn"
            onClick={() => {
              setShowCancelJobModal(false);
            }}
            key='no'
          >
            <span></span>No
          </Button>,

          <Button
              className="btn app-btn job-accept-btn modal-footer-btn"
              onClick={cancelJobByCustomer}
              key='yes'
          >
            <span></span>Yes
          </Button>,

        ]}
>
   <div className="">
      <span className="divsize">Are you sure you want to cancel search process?</span>
    </div> 
</Modal>
}

export default CancelJobConfirmationModal;