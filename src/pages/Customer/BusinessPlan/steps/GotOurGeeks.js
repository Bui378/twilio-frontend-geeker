import React, { useEffect } from "react"
import { Row, Col } from "react-bootstrap";
import HeadingText from "../Components/HeadingText";
import ProgressBar from "../Components/ProgressBar";
import SubHeadingText from "../Components/SubHeadeingText";
import { Player } from '@lottiefiles/react-lottie-player';
import fireWorksAnimation from "../../../../assets/animations/FireworkB.json"
import BasicButton from "components/common/Button/BasicButton";
import Testimony from "../Components/Testimony";
import AvgInfo from "../Components/AvgInfo";

const GotOurGeeks = ({user}) => {

    useEffect(()=>{
        console.log("My console for user at got our geeks", user)
    },[])

    /**
     * Following function will redirect user to dashboard
     * @params = null
     * @response : null
     * @author : Vinit
     */
    const goToDashBoard = () => {
        console.log("My console for goToDashBoard")
        window.location.href = "/"
    }

    return <div className="custom-container  min-height-inherit">
        <Row className=" min-height-inherit d-flex justify-content-center  align-items-center parent-row">
            <Col md={9} xs={12} className="d-flex flex-column min-height-inherit">
                <ProgressBar currentStep={4} />
                <div className="d-flex flex-column justify-content-center align-items-center min-height-inherit">
                    <div className="mb-1 text-center">
                        <HeadingText firstBlackText={"You've got our Geeks!"} />
                    </div>
                    <div className="mb-neg50 text-center">
                        {user?.isBusinessTypeAccount ?  <SubHeadingText text={"You're going to love having on-demand support for your whole business."} />
                                               :  <SubHeadingText text={"You're going to love having on-demand support for your personal use."} />}
                    </div>
                    <Player
                        autoplay
                        keepLastFrame={true}
                        src={fireWorksAnimation}
                        loop={true}
                        className="fireworksAnimation"
                    >
                    </Player>
                    <div className="max-w-500px w-100p d-flex flex-column justify-content-center align-items-center">
                        <BasicButton btnTitle={"Go to Account"} height={"60px"} width={"inherit"} background={"#01D4D5"} color={"white"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"right"} onClick={goToDashBoard} /> 
                        <div className="mt-2">
                            {user?.isBusinessTypeAccount ? <span className="business-plan-contract-text">* We can't wait to serve you & your team</span>
                                                   : <span className="business-plan-contract-text">* We can't wait to serve you</span>}
                        </div>
                    </div>
                </div>
            </Col>
            
            <Col md={3} xs={12} className="sign-in-side-column">
                <AvgInfo />
                <Testimony testimonyBy={"brian"} />
            </Col>
        </Row>
    </div>
}

export default GotOurGeeks