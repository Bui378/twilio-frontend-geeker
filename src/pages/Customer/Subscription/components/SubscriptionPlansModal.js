import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import { Row, Col, Container} from 'react-bootstrap';
import SubscriptionFlipCard from 'components/SubscriptionFlipCard';
import {getAllPlans} from "../../../../api/subscription.api";
import { isLiveUser } from '../../../../utils';
import Loader from '../../../../components/Loader';
import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const SubscriptionPlansModal = ({buyPlanInit, user, showSubscriptionPlansModal, setShowSubscriptionPlansModal}) => {

    const [allPlans, setAllPlans] = useState()

    useEffect(()=>{
        (async()=>{
            let liveUser = await isLiveUser(user)
            const allPlandata = await getAllPlans({"liveUser":liveUser});
            console.log("My console for allPlanData in subscription modal", allPlandata)
            setAllPlans(allPlandata.data)
        })()
    },[])
    
    const buySubscriptionPlan = (singlePlanDetails) => {
        console.log("My console for buying singlePlanDetails", singlePlanDetails)
        if(singlePlanDetails){
            buyPlanInit(singlePlanDetails.id, singlePlanDetails.name, singlePlanDetails.price.id, singlePlanDetails.metadata.total_minutes, singlePlanDetails.metadata.discount)
            setShowSubscriptionPlansModal(false)
        }
    }

    return(<>
        <Modal  
               closable={false} 
               visible={showSubscriptionPlansModal} 
               footer={null}
               width={1500}
               className="subscription-plan-modal"
        >
            <div className='position-absolute subscription-modal-close-btn-div'>
                <IconButton className='subscription-modal-close-btn' onClick={()=>setShowSubscriptionPlansModal(false)}>
                    <Close />
                </IconButton>
            </div>
            <Container>
                <Row className='d-flex justify-content-center align-items-center'>
                    
                    {allPlans ? 
                        /* Show data when exist */
                        allPlans.map((ele)=>{
                            return  <Col>
                                        <SubscriptionFlipCard planData={ele} user={user} onYes={buySubscriptionPlan} showSubscriptionPlansModal={showSubscriptionPlansModal} />
                                    </Col>
                        })

                        /* Show loader untill data is available */
                        :
                        <Loader height="100%" className="mt-5" />
                    }
                </Row>
            </Container>
        </Modal>
    </>)
}

export default SubscriptionPlansModal