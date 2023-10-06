import React, { useEffect, useState } from "react"
import { Modal } from 'antd';
import { ReactSVG } from "react-svg";
import winkSvg from "../../../../assets/images/wink.svg"
import BasicButton from "components/common/Button/BasicButton";
import { useSocket } from '../../../../context/socketContext';
import { openNotificationWithIcon } from "utils";

const TwentyFivePercentOffModal = ({showtwentyPercentModal, setShowtwentyPercentModal}) => {

    const { socket } = useSocket();
    const [customerEmail, setCustomerEmail] = useState("")
    // const emailRegExp = /^[a-zA-Z0-9]+[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+?\.[a-zA-Z]{2,3}$/
    const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    useEffect(()=>{
        console.log("My console for customerEmail", customerEmail)
    },[customerEmail])

    /**
     * Following function handles the onClick on next button
     * @params = null
     * @response : null
     * @author : Vinit
     */
    const handleOnClick = () => {
        if(customerEmail === ""){
            openNotificationWithIcon("info", "Info", "Please enter an email.")
            return
        }
        const emailValidationRes = emailValidation()
        console.log("My console for emailValidationRes", emailValidationRes)
        if(emailValidationRes){
            socket.emit('send-user-left-email-to-admin', {customerEmail:customerEmail});
            setShowtwentyPercentModal(false)
        }else{
            openNotificationWithIcon("error", "Error", "Please check your email format")
        }
    }

    /**
     * Following function will check if user entered valid email or not
     * @params = null
     * @response : null
     * @author : Vinit
     */
     const emailValidation = () => {
        if(emailRegExp.test(String(customerEmail))){
            return true
        }else{
            return false
        }
    }

    return <div className="twenty-five-percent-off-modal-outer-div">
        <Modal 
            visible={showtwentyPercentModal} 
            closable={false} 
            destroyOnClose={false} 
            className="twenty-five-percent-off-modal"
            footer={[]}
            width={550}
        >
           <div className="twenty-five-percent-off-modal-div d-flex flex-column justify content-center align-items-center">
                <span className="twenty-five-percent-off-heading" >We get it!</span>
                <span className="twenty-five-percent-off-heading mb-30" >You're not ready yet. So...</span>
                <div className="twenty-five-percent-off-email-div mb-30">
                    <span className="twenty-five-percent-off-inner-text color-black">Here's 25% off,</span>
                    <div className="d-flex justify content-center align-items-center mb-15">
                        <span className="twenty-five-percent-off-inner-text color-turcose">for later.</span>
                        <ReactSVG src={winkSvg} className="twenty-five-percent-off-wink-svg" />
                    </div>
                    <div className="twenty-five-percent-off-input-btn-group mb-1">
                        <input type="text" className="twenty-five-percent-off-email-input" placeholder="Email" value={customerEmail} onChange={(e)=>setCustomerEmail(e.target.value)}/>
                        <div className="twenty-five-percent-off-btn-div">
                            <BasicButton height={"60px"} width={"60px"} background={"#01D4D5"} color={"white"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"right"} onClick={handleOnClick} />    
                        </div>
                    </div>
                    <div className="w-100p">
                        <span className="twenty-five-percent-off-last-text">*we'll use this to send your coupon</span>
                    </div>
                </div>
                <span className="twenty-five-percent-off-no-text" onClick={()=>setShowtwentyPercentModal(false)}>No thank you</span>
            </div> 
        </Modal>
    </div>
}

export default TwentyFivePercentOffModal