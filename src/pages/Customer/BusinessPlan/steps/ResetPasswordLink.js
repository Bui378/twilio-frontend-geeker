import React, { useEffect } from "react"
import { Player } from '@lottiefiles/react-lottie-player';
import Pass from "../../../../assets/animations/Pass.json"
import HeadingText from "../Components/HeadingText";
import BasicButton from "components/common/Button/BasicButton";
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../../../context/authContext';

const ResetPasswordLink = ({ userInfo, setbusinessPlanStepNumber, jobFlowStepsObj }) => {

    const { resetPasswordHandler } = useAuth();

    useEffect(() => {
        if (userInfo && userInfo.email) {
            console.log("user email", userInfo.email)
            let res = resetPasswordHandler({ email: userInfo.email })
            console.log("res from resetPasswordHandler", res)
        }
    }, [])

    return <div className="reset-password-link-main-div d-flex flex-column justify-content-center align-items-center min-height-inherit">
        <Player
            autoplay
            keepLastFrame={true}
            src={Pass}
            // loop={true}
            className="reset-password-link-sent"
        >
        </Player>
        <div className="mb-30 d-flex justify-content-center align-items-center reset-password-heading-div text-center">
            <HeadingText firstBlackText={"We have sent a reset password link to your email."} />
        </div>
        <div className="d-flex justify-content-center flex-wrap align-items-center mb-30" >
            <div className="open-btn mr-10">
                <a href="https://www.google.com/gmail" target="_blank" className="height-width-inherit">
                    <BasicButton btnTitle={"Open Gmail"} height={"inherit"} width={"inherit"} background={"#01D4D5"} color={"white"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"right"} />
                </a>
            </div>
            <div className="open-btn">
                <a href="https://outlook.live.com/mail" target="_blank" className="height-width-inherit">
                    <BasicButton btnTitle={"Open Outlook"} height={"inherit"} width={"inherit"} background={"#01D4D5"} color={"white"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"right"} />
                </a>
            </div>
        </div>
        <div className="d-flex align-items-center">
            <div className="login-info-round-div mr-10">
                <FontAwesomeIcon icon={faInfo} className="business-plan-info-icon" />
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center">
                <div className="lh-16">
                    <a onClick={() => setbusinessPlanStepNumber(jobFlowStepsObj['LogIn'])}>
                        <span className="reset-pass-bottom-text grey-color-text">Don't need a password reset?</span>&nbsp;<span className="reset-pass-bottom-text turcose-color-text">Login</span>
                    </a>
                </div>
                <div className="lh-16">
                    <a onClick={() => setbusinessPlanStepNumber(jobFlowStepsObj['SignIn'])}>
                        <span className="reset-pass-bottom-text grey-color-text">Don't have an account-</span>&nbsp;<span className="reset-pass-bottom-text turcose-color-text">Sign up</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
}

export default ResetPasswordLink