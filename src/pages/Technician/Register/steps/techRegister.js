import React, { useEffect, useState } from "react";
import { Row, Col, Form, Modal } from "antd";
import styled from "styled-components";
import FormItem from "../../../../components/FormItem";
import { Button } from "react-bootstrap";
import Link from "components/AuthLayout/Link";
import { privacyPolicy } from "../../../../policy-pages/privacy-policy";
import { cookiePolicy } from "../../../../policy-pages/cookie-policy";
import { TermsCondition } from "../../../../policy-pages/conditions";
import { useAuth } from "../../../../context/authContext";
import PhoneInput from 'react-phone-input-2'
import TextInput from "components/AuthComponents/TextInput";
import PasswordInput from "components/AuthComponents/PasswordInput";
import PasswordValidator from "components/AuthComponents/PasswordValidator";
import ValidatorModel from "components/AuthComponents/ValidatorModel";
import HeadingAndSubHeading from "components/HeadingAndSubHeading";
import * as AuthApi from '../../../../api/auth.api';
import { openNotificationWithIcon } from '../../../../utils';
import { Spin } from 'antd';
import ValidatorModelForEmail from "../../../../components/AuthComponents/ValidateModelForEMail";
import mixpanel from 'mixpanel-browser';
import { useGTMDispatch } from '@elgorditosalsero/react-gtm-hook'
import { useSocket } from '../../../../context/socketContext';

function TechRegister({ onNext, setShowProgress, setUserInfo, userInfo, setProgressBarPercentage, setRegister }) {
  const registerRes = null;
  const { setUserToken } = useAuth();
  const [alertMessageEmail, setAlertMessageEmail] = useState("");
  const [alertRefMessageEmail, setAlertRefMessageEmail] = useState("");
  const [alertMessageFName, setAlertMessageFName] = useState("");
  const [alertMessageLName, setAlertMessageLName] = useState("");
  const [alertMessagePassword, setAlertMessagePassword] = useState("");
  const [alertMessagePhoneNumber, setAlertMessagePhoneNumber] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPrivacyPolicyModalAvailable, setIsPrivacyPolicyModalAvaliable] =
    useState(false);
  const [isCookiesPolicyModalAvailable, setIsCookiesPolicyModalAvailable] =
    useState(false);
  const [pwModelVisible, setPwModelVisible] = useState(false);
  const [emModelVisible, setEmModelVisible] = useState(false);
  const [refModelVisible, setRefModelVisible] = useState(false);
  const [dialCode, setDialCode] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const sendDataToGTM = useGTMDispatch()
  const { socket } = useSocket();

  useEffect(() => {
    setShowProgress(false)
    setProgressBarPercentage(0)
  }, [])

  useEffect(() => {
    if (registerRes != null) {
      setUserToken(registerRes);
      window.location.reload();
    }
  }, [registerRes]);

  const layout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showPrivacyModal = () => {
    setIsPrivacyPolicyModalAvaliable(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleOkPrivacyModal = () => {
    setIsPrivacyPolicyModalAvaliable(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showCookiesModal = () => {
    setIsCookiesPolicyModalAvailable(true);
  };

  const handleCancelPrivacyModal = () => {
    setIsPrivacyPolicyModalAvaliable(false);
  };
  const handleCancelCookiesModal = () => {
    setIsCookiesPolicyModalAvailable(false);
  };

  const handleOkCookiesModal = () => {
    setIsCookiesPolicyModalAvailable(false);
  };

  const handleFirstName = async (e) => {
    const re = /^[a-zA-ZÀ-ÖØ-öø-ÿ-' ]*$/;
    if (!re.test(String(e.target.value)))
      setAlertMessageFName("No numbers or special characters are allowed.");
    else if (e.target.value && e.target.value.length > 30)
      setAlertMessageFName("Maximum length is 30 characters.");
    else setAlertMessageFName("");

    setUserInfo({ ...userInfo, firstName: e.target.value })
  };

  const handleLastName = async (e) => {
    const re = /^[a-zA-ZÀ-ÖØ-öø-ÿ-' ]*$/;
    if (!re.test(String(e.target.value)))
      setAlertMessageLName("No numbers or special characters are allowed.");
    else if (e.target.value && e.target.value.length > 30)
      setAlertMessageLName("Maximum length is 30 characters.");
    else setAlertMessageLName("");

    setUserInfo({ ...userInfo, lastName: e.target.value })
  };

  const handleEmail = async (e) => {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!re.test(e.target.value)) {
      setAlertMessageEmail("Invalid Email type")
      setEmModelVisible(true);
    }
    else if (re.test(e.target.value)) { setEmModelVisible(false); setAlertMessageEmail("") }
    else if (e.target.value && e.target.value.length > 70) setAlertMessageEmail("Maximum length is 70 characters.");
    else setAlertMessageEmail("");
    setUserInfo({ ...userInfo, email: e.target.value })
  };

  const handleEmailRefer = async (e) => {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!re.test(e.target.value)) {
      setRefModelVisible(true);
    }
    else if (re.test(e.target.value)) { setRefModelVisible(false); setAlertRefMessageEmail("") }
    else if (e.target.value && e.target.value.length > 70) setAlertRefMessageEmail("Maximum length is 70 characters.");
    else setAlertRefMessageEmail("");
    setUserInfo({ ...userInfo, referred_code: e.target.value })
  };

  /**
   * Following function is to handle change of phone number field in the form.
   * @author : Vinit
   */
  const handlePhoneNumber = (value, data) => {
    setDialCode(data.dialCode)
    setUserInfo({ ...userInfo, phoneNumber: value.includes("+") ? value : "+" + value })
  };

  const onSignUp = async (value) => {
    let trimmedFname = userInfo.firstName.trim()
    let trimmedLname = userInfo.lastName.trim();

    if (trimmedFname === "") {
      return setAlertMessageFName("First name is mandatory.");
    }

    if (trimmedFname.split(" ").length > 1) {
      return setAlertMessageFName("No empty space allowed in First Name.")
    }

    if (trimmedLname.split(" ").length > 1) {
      return setAlertMessageLName("No empty space allowed in Last Name.")
    }

    if (trimmedLname === "") {
      return setAlertMessageLName("Last name is mandatory.");
    }

    if (alertMessageEmail.length > 0 || alertMessagePassword.length > 0) return;

    if (userInfo.email === "") {
      return setAlertMessageEmail("Email is mandatory.");
    }

    if (userInfo.password === "") {
      return setAlertMessagePassword("Password is mandatory.");
    }

    if (userInfo.phoneNumber === "" || userInfo.phoneNumber.length === (dialCode.length + 1)) {
      return setAlertMessagePhoneNumber("Phone number is mandatory")
    } else if ((userInfo.phoneNumber.length) < (10 + dialCode.length)) {
      return setAlertMessagePhoneNumber("Invalid phone number!")
    } else setAlertMessagePhoneNumber("")
    const emailChecked = await AuthApi.checkEmail({ email: userInfo.email });

    if (emailChecked.success) {

      setIsLoading(true)

      let techRegisterRes = await AuthApi.register({
        firstName: userInfo.firstName.replace(/\s/g, ''),
        lastName: userInfo.lastName.replace(/\s/g, ''),
        email: userInfo.email,
        password: userInfo.password,
        confirm_password: userInfo.password,
        phoneNumber: userInfo.phoneNumber,
        userType: 'technician',
        referred_code: userInfo.referred_code
      })

      localStorage.setItem("tetch_token", techRegisterRes.token.accessToken)
      console.log("My console for techRegisterRes", techRegisterRes)
      if (techRegisterRes.user) {
        let dataToSend = {
          tagName: "techOnboard",
          technicianObject: techRegisterRes.user
        }
        socket.emit("send-GTM-tag-tech-onboard", dataToSend)
        // mixpanel code//
        mixpanel.identify(techRegisterRes.user.email);
        mixpanel.track('Technician - signup successfull');
        // mixpanel code//

        // Sending GA4 tag
        sendDataToGTM({
          event: 'tech_registration',
          tech_id: techRegisterRes.user.technician.id,
          environment: process.env.REACT_APP_URL.split("/")[2]
        })

        setRegister(techRegisterRes.user)
        openNotificationWithIcon('success', 'Success', 'Technician registered successfully.');
        setIsLoading(false)
        onNext()
      }

    } else {
      openNotificationWithIcon('error', 'Error', 'Email already registered.');
    }
  }


  return (
    <Container className="tech-signup-page">
      <Modal
        title="Terms & Conditions"
        className="app-confirm-modal"
        closable={false}
        footer={[
          <button
            className="btn app-btn"
            key="submit"
            type="primary"
            onClick={handleCancel}
          >
            Close
          </button>,
        ]}
        visible={isModalVisible}
        onOk={handleOk}
      >
        {TermsCondition()}
      </Modal>

      <Modal
        title="Privacy Policy"
        className="app-confirm-modal"
        closable={false}
        footer={[
          <button
            className="btn app-btn"
            key="submit"
            type="primary"
            onClick={handleCancelPrivacyModal}
          >
            Close
          </button>,
        ]}
        visible={isPrivacyPolicyModalAvailable}
        onOk={handleOkPrivacyModal}
      >
        {privacyPolicy()}
      </Modal>

      <Modal
        title="Cookies Policy"
        className="app-confirm-modal"
        closable={false}
        footer={[
          <button
            className="btn app-btn"
            key="submit"
            type="primary"
            onClick={handleCancelCookiesModal}
          >
            Close
          </button>,
        ]}
        visible={isCookiesPolicyModalAvailable}
        onOk={handleOkCookiesModal}
      >
        {cookiePolicy()}
      </Modal>

      <div>
        <HeadingAndSubHeading
          heading={"Apply to be a Geek!"}
          subHeading={"Imagine using your tech smarts to make a great salary, on your own terms. You’ll be your own boss, and work from wherever you are, whenever you want. At Geeker, we’re looking for talented technicians like you, to help you make this into your reality (while helping others too!)"}
        />
  
        <Form className="tech-signup-form" onFinish={onSignUp} {...layout}>
          <FormSectionContainer className="tech-signup-form-section-contaier tech-signup-name-container">
            <Col className="tech-signup-name-container-inside tech-signup-column">
              <FormItem
                name="firstName"
                label="First Name"
                className="mt-3 mb-1"
              >
                <TextInput
                  name="firstName"
                  placeholder="First Name"
                  value={userInfo.firstName}
                  type="text"
                  className="tech-signup-input-field"
                  onChange={handleFirstName}
                />
              </FormItem>
              {(alertMessageFName !== "" || alertMessageLName !== "") && (
                <div className="tech-signup-error-message">
                  {alertMessageFName !== "" && (
                    <div className="input-error-msg">{alertMessageFName}</div>
                  )}
                </div>
              )}
            </Col>
            <Col className="tech-signup-name-container-inside tech-signup-column">
              <FormItem
                name="lastName"
                label="Last Name"
                className="mt-3 mb-1"
              >
                <TextInput
                  name="lastName"
                  placeholder="Last Name"
                  type="text"
                  value={userInfo.lastName}
                  className="tech-signup-input-field"
                  onChange={handleLastName}
                />
              </FormItem>
              {(alertMessageFName !== "" || alertMessageLName !== "") && (
                <div className="tech-signup-error-message">
                  {alertMessageLName !== "" && (
                    <div className="input-error-msg">{alertMessageLName}</div>
                  )}
                </div>
              )}
            </Col>
          </FormSectionContainer>

          <FormSectionContainer className="tech-signup-form-section-contaier">
            <Col className="tech-signup-column tech-signup-other-container">
              <FormItem
                name="email"
                label="Email"
                className="mt-3 mb-1"
              >
                <TextInput
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={userInfo.email}
                  className="tech-signup-input-field"
                  onChange={handleEmail}
                  onBlur={() => setEmModelVisible(false)}
                />

                <ValidatorModelForEmail visible={emModelVisible} height="90px"  >
                  <p style={{ fontSize: "15px", margin: 0 }}>
                    Please enter a Valid email!
                  </p>
                </ValidatorModelForEmail>
              </FormItem>
              {alertMessageEmail !== "" && (
                <div className="input-error-msg">{alertMessageEmail}</div>
              )}

              <FormItem name="password" label="Password" className="mt-3 mb-1">
                <PasswordInput
                  name="Password"
                  placeholder="Password"
                  type="password"
                  className="tech-signup-input-field"
                  onFocus={() => setPwModelVisible(true)}
                  onBlur={() => setPwModelVisible(false)}
                  value={userInfo.password}
                  onChange={(e) => {
                    setUserInfo({ ...userInfo, password: e.target.value })
                  }}
                />
                <ValidatorModel visible={pwModelVisible}>
                  <PasswordValidator inputText={userInfo.password} setAlertMessagePassword={setAlertMessagePassword} />
                </ValidatorModel>
              </FormItem>
              {alertMessagePassword !== "" && (
                <div className="input-error-msg">{alertMessagePassword}</div>
              )}
              <Col className="mt-3">
                <FormItem
                  name="phonenumber"
                  label="Phone Number"
                  className="phn-num-font mb-1"
                >
                  <PhoneInput
                    value={userInfo.phoneNumber}
                    countryCodeEditable={false}
                    onChange={handlePhoneNumber}
                    country="us"
                    onlyCountries={['in', 'gr', 'us', 'ca', 'gb', 'ph', 'il']}
                    className="phn-input-tech-sign-up"
                  />
                </FormItem>
                {alertMessagePhoneNumber !== "" && (
                  <div className="input-error-msg">{alertMessagePhoneNumber}</div>
                )}
                <FormItem
                  name="refrred"
                  label="Referred By"
                  className="mt-3 mb-1"
                >
                  <TextInput
                    name="refrred"
                    placeholder="Referral's Email (optional)"
                    type="email"
                    value={userInfo.referred_code}
                    className="tech-signup-input-field"
                    onChange={handleEmailRefer}
                    onBlur={() => setRefModelVisible(false)}
                  />

                  <ValidatorModelForEmail visible={refModelVisible} height="90px"  >
                    <p style={{ fontSize: "15px", margin: 0 }}>
                      Please enter a Valid email!
                    </p>
                  </ValidatorModelForEmail>
                </FormItem>
                {alertRefMessageEmail !== "" && (
                  <div className="input-error-msg">{alertRefMessageEmail}</div>
                )}
              </Col>
            </Col>
          </FormSectionContainer>

          <FormSectionContainer className="tech-signup-form-section-contaier">
            <Col className="text-center mt-4">
              <TerminaryRow>
                <Col className="d-flex align-items-center mb-3">
                  <label
                    className="ml-2 tech-signup-check-container"
                    htmlFor="terms&condtion"
                    style={{ fontSize: "15px", fonrWeight: "400", margin: 0 }}
                  >
                    <span className="tech-signup-checkmark"></span>By Signing up I agree to
                    <a
                      style={{ color: "#01D4D5" }}
                      onClick={(e) => { e.preventDefault(); showModal(); }}
                    >
                      {" "}
                      Terms & Condtions
                    </a>
                    <a
                      style={{ color: "#01D4D5" }}
                      onClick={(e) => { e.preventDefault(); showPrivacyModal(); }}
                    >
                      {" "}
                      Privacy Policy
                    </a>{" "}
                    &{" "}
                    <a
                      style={{ color: "#01D4D5" }}
                      onClick={(e) => { e.preventDefault(); showCookiesModal(); }}
                    >
                      Cookies Policy
                    </a>
                  </label>
                </Col>
              </TerminaryRow>
            </Col>
          </FormSectionContainer>

          <FormSectionContainer className="tech-signup-form-section-contaier">
            <Col className="text-center mt-5 "></Col>
          </FormSectionContainer>

          <FormSectionContainer className="tech-signup-form-section-contaier tech-signup-btn-container">
            <Col>
              <label
                style={{ color: "#708390", fontSize: "15px", margin: 0 }}
                htmlFor="Signin"
              >
                {" "}
                Already have an account{" "}
                <Link to="/login" style={{ color: "#01D4D5" }}>
                  Sign In
                </Link>
              </label>
            </Col>
            <Col className="create-account-btn">
              <Button htmltype="submit" className="app-btn" type="primary" disabled={isLoading} >
                <span></span>
                {(isLoading
                  ?
                  <Spin className="spinner" />
                  :
                  <>Create Account</>
                )}
              </Button>
            </Col>
          </FormSectionContainer>
        </Form>
      </div>
    </Container>
  );
}

const Container = styled(Col)`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 20px;
`;

const FormSectionContainer = styled(Row)`
  width: 100%;
  margin-bottom: none;

  @media screen and (max-width: 763px) {
    //   display:block !important;
    .ant-col-12 {
      width: 100% !important;
      max-width: none !important;
    }
  }
`;

const TerminaryRow = styled(Row)`
  display: flex !important;
  flex-direction: column !important;
  align-items: baseline !important;
  align-content: center !important;
  @media screen and (max-width: 763px) {
    display: block !important;
    .ant-col-12 {
      width: 100% !important;
      max-width: none !important;
    }
  }
`;

export default TechRegister;
