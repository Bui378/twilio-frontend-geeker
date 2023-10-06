import React from 'react'
import { Modal, Checkbox } from 'antd';
import { Row, Col, Container} from 'react-bootstrap';
import BasicButton from "../../../../components/common/Button/BasicButton"

const BuySubscriptionConfirmationModal = ({showbuySubscriptionConfirmationModal, 
                                           setShowbuySubscriptionConfirmationModal,
                                           productDetails,
                                           buyPlanInit
                                        }) => {
    
    const buySubscriptionPlan = () => {
        if(productDetails){
            buyPlanInit(productDetails.id, productDetails.name, productDetails.price.id, productDetails.metadata.total_minutes, productDetails.metadata.discount)
            setShowbuySubscriptionConfirmationModal(false)
        }
    }

    return(<>
        <Modal  
               closable={false} 
               visible={showbuySubscriptionConfirmationModal} 
               footer={null}
               width={800}
        >
            <Container>
                <Row>
                    <Col md = "1" className='d-flex justify-content-end buy-subscription-confirmation-modal-checkbox-col p-4-0'>
                        <Checkbox defaultChecked />
                    </Col>
                    <Col md = "11">
                        <Row className='mb-3'>
                            <Col>
                                <span className='buy-subscription-confirmation-modal-text'>
                                Thanks! Please note that our Premium {productDetails?.name} plan gives {productDetails?.metadata?.total_minutes} minutes for a month.
                                    <b>After all your minutes are used, jobs will continue at our usual pricing.</b>
                                     All jobs are billed in 6-minute increments.
                                </span>
                            </Col>
                        </Row>
                        <Row className='d-flex justify-content-end'>
                            <Col className='d-flex justify-content-end'>
                                <BasicButton btnTitle={"Cancel"} height={"40px"} width={"80px"} background={"#DCE6ED"} onClick={()=>setShowbuySubscriptionConfirmationModal(false)} />
                                <BasicButton btnTitle={"OK"} height={"40px"} width={"100px"} background={"#01D4D5"} color={"white"} marginLeft={"10px"} onClick={buySubscriptionPlan} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </Modal>
    </>)
}

export default BuySubscriptionConfirmationModal