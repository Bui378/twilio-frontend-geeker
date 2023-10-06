import React,{useEffect} from 'react';
import { Modal,Typography } from 'antd';
import styled from 'styled-components';
import BasicButton from 'components/common/Button/BasicButton'
const { Title } = Typography;
const AfterBusinessHrsPopUpModal = ({ showAfterBusinessHrs, setShowAfterBusinessHrs }) => {
    /**
   * Continue Search a job by click on button
   * @params = 
   * @response : it redirects the customer at the page where countdown timer run .
   * @author : Mritunjay
  */
 useEffect(()=>{
    console.log(">>>>>>>>>>showAfterBusinessHrs>>>>>>>>>>",showAfterBusinessHrs)
 },[showAfterBusinessHrs])

 const clickForContinueSearch = () =>{
    setShowAfterBusinessHrs(false)
    localStorage.setItem('showAfterBusinessHrs', 'false');
 };
    return (
        <>
            <Modal
                style={{ top: 183 }}
                closable={false}
                visible={showAfterBusinessHrs}
                maskStyle={{ backgroundColor: "#DCE6EDCF" }}
                maskClosable={true}
                width={720}
                footer={null}
            >
                <div className="afterBusinessHrs">
                    {/* <span className="afterBusinessHrs-heading">😴 Geeker Off-Peak Time</span>
                    <div className='afterBusinessHrs-subheading'>
                    <span>Hey! Just a quick FYI that our techs are mostly available between 9am-9pm EST Mon-Fri. </span>
                    <span>Please continue to search or feel free to schedule a good time during business hours.</span>
                    </div> */}
                    <PageTitle>Hold tight! 💨 Your Geek is on the way!</PageTitle>
                    <div className='afterBusinessHrs-descriptionText d-flex flex-column justify-content-center align-items-center'>
                        <span className='pt-3'> We're experiencing high demand right now. But your Geek is getting to you as fast as they can!</span>
                        <span className='text-center py-4'>Please wait a few more moments.You'll be connected asap.</span>
                    </div>
                    <BasicButton id="off-peek-time-btn" onClick={clickForContinueSearch} holdTight={'holdTight'}   btnTitle={"Okay!"} height={"73px"} width={"420px"} background={"#01D4D5"} color={"#fff"}/>
                </div>
            </Modal>
        </>
    )
};

const PageTitle = styled(Title)`
font-size: 41px !important;
text-align: center;
color: black;
font-weight: bold;
`;

export default AfterBusinessHrsPopUpModal;
