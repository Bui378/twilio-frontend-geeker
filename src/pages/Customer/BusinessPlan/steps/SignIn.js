/** @format */

import BasicButton from "components/common/Button/BasicButton";
import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import HeadingText from "../Components/HeadingText";
import InputField from "../Components/InputField";
import SubHeadingText from "../Components/SubHeadeingText";
import McAfeeLogo from "../../../../assets/images/McAfee.png";
import stripeLogo from "../../../../assets/images/stripe.png";
import psbaLogo from "../../../../assets/images/pbsa.png";
import ChosenPlanSummary from "../Components/ChosenPlanSummary";
import Testimony from "../Components/Testimony";
import { openNotificationWithIcon } from "utils";
import * as UserApi from "../../../../api/users.api";
import { useAuth } from "../../../../context/authContext";
import { useLocation } from "react-router";
import JobInfoRightSideBar from "components/JobInfoRightSideBar";
// import { GooleLogin } from '@react-oauth/google';

const SignIn = ({
  setbusinessPlanStepNumber,
  jobFlowStepsObj,
  setUserInfo,
  setGivenEmail,
  setchosenProdId,
  setShowSubscriptionPlanModal,
  setShowtwentyPercentModal,
  user,
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get("planId") ? queryParams.get("planId") : false;
  const jobIdFromUrl = queryParams.get("jobId")
    ? queryParams.get("jobId")
    : false;
  // const emailRegExp = /^[a-zA-Z0-9]+[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+?\.[a-zA-Z]{2,3}$/
  const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [inputEmail, setinputEmail] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const { getGuestUser } = useAuth();
  const [showSubscriptionPlanModalTime, setShowSubscriptionPlanModalTime] =
    useState(150000);
  const [discountModalShown, setDiscountModalShown] = useState(false);

  useEffect(() => {
    if (!discountModalShown && planId) {
      setTimeout(() => {
        setShowtwentyPercentModal(true);
        setDiscountModalShown(true);
      }, showSubscriptionPlanModalTime);
    }
  }, [showSubscriptionPlanModalTime]);

  /**
   * Following function will handle email input field change
   * @params = event
   * @response : null
   * @author : Vinit
   */
  const emailInputOnChange = (e) => {
    setinputEmail(e.target.value.trim());
    setShowSubscriptionPlanModalTime(150000);
  };

  /**
   * Following function will check if user entered valid email or not
   * @params = null
   * @response : null
   * @author : Vinit
   */
  const emailValidation = () => {
    if (!emailRegExp.test(String(inputEmail))) {
      return false;
    } else {
      setGivenEmail(inputEmail);
      return true;
    }
  };

  /**
   * Following function will handle whether to ask user to sign-up or log-in
   * @params = null
   * @response : null
   * @author : Vinit
   */
  const handleBtnClick = async (e) => {
    e.preventDefault();
    setShowSubscriptionPlanModalTime(150000);
    setDisableBtn(true);
    if (inputEmail === "") {
      openNotificationWithIcon("info", "info", `Please enter your email!`);
      setDisableBtn(false);
      return;
    }
    const isValidEmail = emailValidation();
    if (isValidEmail) {
      const guestUserRes = await getGuestUser();
      let user = null;
      if (guestUserRes)
        user = await UserApi.getUserByParamAsGuest(
          { email: inputEmail },
          guestUserRes.token.accessToken
        );
      if (user) {
        if (user.userType === "customer") {
          setUserInfo(user);
          setbusinessPlanStepNumber(jobFlowStepsObj["LogIn"]);
        } else {
          window.location.href = "/";
        }
      } else {
        setbusinessPlanStepNumber(jobFlowStepsObj["ChooseYourPassWord"]);
      }
    } else {
      openNotificationWithIcon("info", "info", `Please check email format!`);
      setDisableBtn(false);
    }
  };

  return (
    <div className='custom-container d-flex justify-content-center min-height-inherit'>
      <Row className='d-flex justify-content-center  align-items-center min-height-inherit w-full parent-row'>
        <Col
          md={9}
          className='d-flex flex-column justify-content-center align-items-center min-height-inherit w-full'>
          <div>
            <HeadingText firstBlackText={"Alright!"} />
          </div>
          <div className='mb-10 text-center'>
            <HeadingText
              firstBlackText={"Let's get "}
              secondGreenText={" your Geeks "}
              secondBlackText={"on board."}
            />
          </div>
          <div className='mb-50 text-center'>
            <SubHeadingText
              text={
                "You're seconds away from having our Geeks, on your side. ;) "
              }
            />
          </div>
          <form onSubmit={handleBtnClick}>
            <div className='mb-20 w-full d-flex justify-content-center '>
              <div className='max-width-768-w-100per'>
                <SubHeadingText text={"Email"} />
                <InputField id='email-input' onChange={emailInputOnChange} />
              </div>
            </div>
            <div className='business-plan-sign-in-button mb-50 w-full'>
              <BasicButton
                id='continue-btn'
                btnTitle={"Continue"}
                height={"inherit"}
                width={"inherit"}
                background={"#01D4D5"}
                color={"white"}
                btnIcon={"arrow"}
                faFontSize={"18px"}
                arrowDirection={"right"}
                disable={disableBtn}
                showSpinner={disableBtn}
                btnType={"submit"}
                onClick={handleBtnClick}
              />
            </div>
            <div className='d-flex max-w-420px justify-content-around w-full'>
              <img src={stripeLogo} className='h-41px' />
              <img src={psbaLogo} />
              <img src={McAfeeLogo} />
            </div>
          </form>
        </Col>
        <Col md={3} className='sign-in-side-column'>
          {planId && (
            <ChosenPlanSummary
              setchosenProdId={setchosenProdId}
              setShowSubscriptionPlanModal={setShowSubscriptionPlanModal}
            />
          )}
          {jobIdFromUrl && <JobInfoRightSideBar user={user} />}
          <Testimony testimonyBy={"brian"} />
        </Col>
      </Row>
    </div>
  );
};

export default SignIn;
