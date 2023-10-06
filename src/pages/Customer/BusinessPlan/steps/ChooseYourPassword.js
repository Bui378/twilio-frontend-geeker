/** @format */

import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ChosenPlanSummary from "../Components/ChosenPlanSummary";
import Testimony from "../Components/Testimony";
import ProgressBar from "../Components/ProgressBar";
import HeadingText from "../Components/HeadingText";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SubHeadingText from "../Components/SubHeadeingText";
import InputField from "../Components/InputField";
import BasicButton from "components/common/Button/BasicButton";
import PhoneInput from "react-phone-input-2";
import PasswordInput from "components/AuthComponents/PasswordInput";
import ValidatorModel from "components/AuthComponents/ValidatorModel";
import PasswordValidator from "components/AuthComponents/PasswordValidator";
import { openNotificationWithIcon } from "utils";
import * as AuthApi from "../../../../api/auth.api";
import { useLocation } from "react-router";
import { privacyPolicy } from "../../../../policy-pages/privacy-policy";
import { cookiePolicy } from "../../../../policy-pages/cookie-policy";
import { TermsCondition } from "../../../../policy-pages/conditions";
import { Modal, Checkbox } from "antd";
import JobInfoRightSideBar from "components/JobInfoRightSideBar";
import * as JobApi from "../../../../api/job.api";
import { useFetchInvite } from "../../../../api/invite.api";

const ChooseYourPassWord = ({
  setGivenEmail,
  givenEmail,
  setUser,
  setToken,
  setchosenProdId,
  setShowSubscriptionPlanModal,
  setShowtwentyPercentModal,
  setShowLoader,
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get("planId") ? queryParams.get("planId") : false;
  const jobId = queryParams.get("jobId") ? queryParams.get("jobId") : false;
  const customerTypeParam = queryParams.get("customer-type");
  const customerType = customerTypeParam !== null ? customerTypeParam : "live";
  const couponCode = queryParams.get("couponCode")
    ? queryParams.get("couponCode")
    : false;
  const inviteCode = queryParams.get("inviteCode") || "nothing";
  const { data: inviteData } = useFetchInvite(inviteCode);
  const [dialCode, setDialCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pwModelVisible, setPwModelVisible] = useState();
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: givenEmail,
    password: "",
  });
  const [alertMessagePassword, setAlertMessagePassword] = useState();
  const [disableBtn, setDisableBtn] = useState(false);
  const [showSubscriptionPlanModalTime, setShowSubscriptionPlanModalTime] =
    useState(150000);
  const [discountModalShown, setDiscountModalShown] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPrivacyPolicyModalAvailable, setIsPrivacyPolicyModalAvaliable] =
    useState(false);
  const [isCookiesPolicyModalAvailable, setIsCookiesPolicyModalAvailable] =
    useState(false);
  const [isBusinessTypeAccount, setIsBusinessTypeAccount] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [inputEmail, setinputEmail] = useState("");
  // const emailRegExp = /^[a-zA-Z0-9]+[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+?\.[a-zA-Z]{2,3}$/
  const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const technicianId = queryParams.get("technicianId")
    ? queryParams.get("technicianId")
    : false;
  const [hideRefer, setHideRefer] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (givenEmail) {
      setUserInfo((prevState) => ({
        ...prevState,
        email: givenEmail,
      }));
    }
  }, [givenEmail]);

  useEffect(() => {
    if (inviteData) {
      if (inviteData.status === "completed") {
        window.location.href = "/";
      }
      setGivenEmail(inviteData?.email);
      if (inviteData?.inviteCode) {
        setHideRefer(true);
        setinputEmail(inviteData?.ownerEmail);
      }
      console.log("inviteDatainviteData", inviteData, inviteCode);
    }
  }, [inviteData]);

  useEffect(() => {
    if (!discountModalShown && planId) {
      setTimeout(() => {
        setShowtwentyPercentModal(true);
        setDiscountModalShown(true);
      }, showSubscriptionPlanModalTime);
    }
  }, [showSubscriptionPlanModalTime]);

  useEffect(() => {
    if (!isBusinessTypeAccount) setBusinessName("");
  }, [isBusinessTypeAccount]);

  const reValidationObject = {
    firstName: /^\s*[a-zA-Z\s]*\s*$/,
    lastName: /^\s*[a-zA-Z\s]*\s*$/,
    // email: /^[a-zA-Z0-9]+[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+?\.[a-zA-Z]{2,3}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
  };

  const validationMessages = {
    firstName: "No numbers or special characters are allowed",
    lastName: "No numbers or special characters are allowed",
    email: "Check the format of the email you entered",
  };

  const nameForValidationMessage = {
    firstName: "in First Name",
    lastName: "in Last Name",
    email: "",
  };

  let sixChar = false;
  let letter = false;
  let specialChar = false;
  let number = false;

  /**
   * Following function is to handle change for user personal info.
   * @author : Vinit
   */
  const handleChange = (e) => {
    setShowSubscriptionPlanModalTime(150000);
    const { name, value } = e.target;
    console.log("handleChange function called ", { name, value, userInfo });
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value.trim(),
      email: givenEmail,
    }));
  };

  /**
   * Following function is to handle change of phone number field in the form.
   * @author : Vinit
   */
  const handlePhoneNumber = (value, data) => {
    setShowSubscriptionPlanModalTime(150000);
    setPhoneNumber(`+${value}`);
    setDialCode(data.dialCode);
  };

  const regularExpressionTesting = (fieldName) => {
    console.log(
      "Running regularExpressionTesting for fieldName",
      fieldName,
      reValidationObject[fieldName].test(fieldName)
    );
    if (!reValidationObject[fieldName].test(String(userInfo[fieldName]))) {
      setDisableBtn(false);
      openNotificationWithIcon(
        "info",
        "info",
        `${validationMessages[fieldName]} ${nameForValidationMessage[fieldName]}`
      );
      return false;
    } else {
      return true;
    }
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showPrivacyModal = () => {
    setIsPrivacyPolicyModalAvaliable(true);
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setShowSubscriptionPlanModalTime(150000);
    setDisableBtn(true);
    const firstNameValidation = regularExpressionTesting("firstName");
    const lastNameValidation = regularExpressionTesting("lastName");

    if (userInfo.firstName === "") {
      setDisableBtn(false);
      openNotificationWithIcon("info", "info", "Please enter your first name.");
      return;
    }
    if (userInfo.lastName === "") {
      setDisableBtn(false);
      openNotificationWithIcon("info", "info", "Please enter your last name.");
      return;
    }

    if (phoneNumber.length - dialCode.length - 1 !== 10) {
      setDisableBtn(false);
      openNotificationWithIcon(
        "info",
        "info",
        "Phone number must be of 10 digits (excluding country code)."
      );
      return;
    }

    if (!firstNameValidation || !lastNameValidation) return;

    // Password validation :-
    if (userInfo.password.indexOf(" ") >= 0) {
      setDisableBtn(false);
      openNotificationWithIcon(
        "info",
        "info",
        "Password should not contain any empty space."
      );
      return;
    }

    if (userInfo.firstName.indexOf(" ") >= 0) {
      setDisableBtn(false);
      openNotificationWithIcon(
        "info",
        "info",
        "First name should not contain any empty space."
      );
      return;
    }

    if (userInfo.lastName.indexOf(" ") >= 0) {
      setDisableBtn(false);
      openNotificationWithIcon(
        "info",
        "info",
        "Last name should not contain any empty space."
      );
      return;
    }

    if (inputEmail && inputEmail !== "") {
      const isValidEmail = emailValidation();
      console.log("isValidEmail ", isValidEmail);
      if (!isValidEmail) {
        setDisableBtn(false);
        return;
      }
    }

    if (isBusinessTypeAccount && businessName === "") {
      setDisableBtn(false);
      openNotificationWithIcon(
        "info",
        "info",
        "Please enter your business name."
      );
      return;
    }

    if (userInfo.password.length > 5) sixChar = true;
    if (/[a-zA-Z]/.test(userInfo.password)) letter = true;
    if (reValidationObject["password"].test(userInfo.password))
      specialChar = true;
    if (/[0-9]/.test(userInfo.password)) number = true;

    if (sixChar && letter && specialChar && number) {
      // registering user's data to DB
      let res = await AuthApi.register({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        firstName: userInfo.firstName.replace(/\s/g, ""),
        lastName: userInfo.lastName.replace(/\s/g, ""),
        email: userInfo.email ? userInfo.email : givenEmail,
        password: userInfo.password,
        confirm_password: userInfo.password,
        phoneNumber: phoneNumber,
        language: "English",
        userType: "customer",
        status: "completed",
        inviteCode: inviteCode,
        isBusinessTypeAccount: isBusinessTypeAccount,
        businessName: businessName,
        customerType: customerType,
        referred_code: inputEmail,
      });

      console.log(
        "This is register test >>>>>>>>>>>>>>>",
        res.user,
        res.token,
        planId,
        jobId,
        inviteCode
      );

      if (res.user) {
        openNotificationWithIcon(
          "success",
          "Success",
          "User registered successfully!"
        );
        setToken(res.token.accessToken);

        if (planId) {
          if (couponCode) {
            window.location.href = `/buy-business-plan?planId=${planId}&page=CompleteYourPurchase&couponCode=${couponCode}`;
          } else {
            window.location.href = `/buy-business-plan?planId=${planId}&page=CompleteYourPurchase`;
          }
        } else if (jobId) {
          await JobApi.updateJob(jobId, {
            customer: res.user.customer.id,
            guestJob: false,
            tech_search_start_at: new Date(),
          }).then((testingRes) => {
            if (technicianId) {
              window.location.href = `/customer/profile-setup?page=add-card&jobId=${jobId}&technicianId=${technicianId}`;
            } else {
              window.location.href = `/customer/profile-setup?page=add-card&jobId=${jobId}`;
            }
          });
        } else if (inviteCode && inviteCode != "nothing") {
          window.location.href = "/";
        } else {
          window.location.href = `/customer/registered`;
        }
      } else if (res.success === false && res.message) {
        setDisableBtn(false);
        openNotificationWithIcon("error", "Error", res.message);
      }
    } else {
      setDisableBtn(false);
      openNotificationWithIcon(
        "info",
        "Info",
        "For your security, we need your password to be a minimum of 6 characters, a number, and a special character."
      );
    }
  };

  const emailValidation = () => {
    if (!emailRegExp.test(String(inputEmail))) {
      console.log("Inside else part, email is not not valid", inputEmail);
      openNotificationWithIcon("info", "info", `Please check email format!`);
      return false;
    } else {
      console.log("Inside else part, email is valid", inputEmail);
      setinputEmail(inputEmail);
      return true;
    }
  };

  const handleCheckboxChange = (e) => {
    setIsBusinessTypeAccount(e.target.checked);
  };

  const handleBusinessNameOnChange = (e) => {
    setBusinessName(e.target.value);
  };

  const emailInputOnChange = (e) => {
    const newEmail = e.target.value;
    setinputEmail(newEmail);
  };
  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };
  return (
    <div className='custom-container min-height-inherit'>
      <Modal
        title='Terms & Conditions'
        className='app-confirm-modal TncIdentifier'
        closable={false}
        footer={[
          <button
            className='btn app-btn'
            key='submit'
            type='primary'
            onClick={handleCancel}>
            Close
          </button>,
        ]}
        visible={isModalVisible}
        onOk={handleOk}>
        {TermsCondition()}
      </Modal>

      <Modal
        title='Privacy Policy'
        className='app-confirm-modal TncIdentifier'
        closable={false}
        footer={[
          <button
            className='btn app-btn'
            key='submit'
            type='primary'
            onClick={handleCancelPrivacyModal}>
            Close
          </button>,
        ]}
        visible={isPrivacyPolicyModalAvailable}
        onOk={handleOkPrivacyModal}>
        {privacyPolicy()}
      </Modal>

      <Modal
        title='Cookies Policy'
        className='app-confirm-modal TncIdentifier'
        closable={false}
        footer={[
          <button
            className='btn app-btn'
            key='submit'
            type='primary'
            onClick={handleCancelCookiesModal}>
            Close
          </button>,
        ]}
        visible={isCookiesPolicyModalAvailable}
        onOk={handleOkCookiesModal}>
        {cookiePolicy()}
      </Modal>

      <Row className='min-height-inherit d-flex justify-content-center align-items-center parent-row'>
        <Col md={9} xs={12} className='d-flex flex-column min-height-inherit'>
          {planId && <ProgressBar currentStep={2} />}
          <div className='d-flex flex-column justify-content-center align-items-center min-height-inherit'>
            <div className='mb-50 text-center'>
              <HeadingText
                firstBlackText={"Create Your "}
                secondGreenText={" Geeker Account "}
              />
            </div>
            <div className='mb-50'>
              <SubHeadingText
                text={" Access on-demand tech support, whenever you need it. "}
              />
            </div>
            <div className='choose-password-email-div d-flex justify-content-center align-items-center mb-20'>
              <span className='choose-password-email'>{givenEmail}</span>
            </div>
            <form onSubmit={handleSignUp}>
              <div className='mb-20 d-flex flex-wrap justify-content-between w-428px max-width-768-w-100per '>
                <div className='min-width-200px max-width-768-w-100per max-width-768-mb-20px'>
                  <SubHeadingText text={"First Name"} />
                  <InputField
                    id='firstName'
                    propClass={"w-200px max-width-768-w-100per"}
                    onChange={handleChange}
                    name={"firstName"}
                  />
                </div>
                <div className='min-width-200px max-width-768-w-100per'>
                  <SubHeadingText text={"Last Name"} />
                  <InputField
                    id='lastName'
                    propClass={"w-200px max-width-768-w-100per"}
                    onChange={handleChange}
                    name={"lastName"}
                  />
                </div>
              </div>
              <div className='mb-20 w-428 max-width-768-w-100per position-relative'>
                <SubHeadingText text={"Create Pasword"} />
                <PasswordInput
                  id='password-input'
                  name='password'
                  placeholder='Password'
                  type='password'
                  onFocus={() => setPwModelVisible(true)}
                  onBlur={() => setPwModelVisible(false)}
                  value={userInfo.password}
                  onChange={handleChange}
                />
                <ValidatorModel visible={pwModelVisible}>
                  <PasswordValidator
                    inputText={userInfo.password}
                    setAlertMessagePassword={setAlertMessagePassword}
                  />
                </ValidatorModel>
              </div>
              <div className='mb-20'>
                <div className='d-flex flex-row align-items-center justify-content-start mb-1'>
                  <SubHeadingText text={"Phone Number"} />
                  <span
                    className='phone-info-round-div ml-1 position-relative'
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    role='button'
                    onTouchStart={handleMouseOver}
                    onFocus={() => setIsHovering(true)}
                    onBlur={() => setIsHovering(false)}>
                    <FontAwesomeIcon icon={faInfo} className='i-info-icon' />
                    {isHovering ? (
                      <div className='phoneNumberInfo-div'>
                        <div className='phoneNumberInfo-triangle'></div>
                        <div className='phoneNumberInfo-inner-div'>
                          <p>
                            We need your phone in case you have problems
                            connecting. You'll never get spam
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </span>
                </div>
                <PhoneInput
                  countryCodeEditable={false}
                  name={"phoneNumber"}
                  country='us'
                  onlyCountries={["in", "gr", "us", "ca", "gb"]}
                  className={"p-0 choose-your-password-phone-input"}
                  dropdownClass='phoneInputDropdownClass'
                  inputClass='business-plan-phone-input country-code-textarea'
                  value={phoneNumber}
                  onChange={handlePhoneNumber}
                />
              </div>
              {inviteCode && inviteCode != "nothing" ? (
                <></>
              ) : (
                <div className='mb-20'>
                  <div className='max-width-768-w-100per'>
                    <Checkbox
                      onChange={handleCheckboxChange}
                      className='personalUseCheckbox mb-2'
                      id='business-check-btn'>
                      <span>I’m using this account for business use</span>
                    </Checkbox>
                    <InputField
                      id='business-input'
                      placeholder={"Business Name"}
                      onChange={handleBusinessNameOnChange}
                      propClass={isBusinessTypeAccount ? "" : "disableElement"}
                      value={businessName}
                    />
                  </div>
                </div>
              )}

              {!hideRefer && (
                <div className='mb-20 w-full d-flex justify-content-center '>
                  <div className='max-width-768-w-100per'>
                    <SubHeadingText text={"Referred By"} />
                    <InputField
                      placeholder="Referral's Email (optional)"
                      onChange={emailInputOnChange}
                      value={inputEmail}
                    />
                  </div>
                </div>
              )}
              <div className='business-plan-sign-in-button mb-15'>
                <BasicButton
                  id='create-account-btn'
                  btnTitle={"Create your Account"}
                  height={"inherit"}
                  width={"inherit"}
                  background={"#01D4D5"}
                  color={"white"}
                  btnIcon={"arrow"}
                  faFontSize={"18px"}
                  arrowDirection={"right"}
                  onClick={handleSignUp}
                  disable={disableBtn}
                  showSpinner={disableBtn}
                  btnType={"submit"}
                />
              </div>
            </form>
            <div className='TnCDiv max-width-768-mb-20px'>
              <span className='tAndc-text grey-color-text'>
                By Signing up I agree to{" "}
              </span>
              l
              <span className='tAndc-text turcose-color-text'>
                <a onClick={showModal}>Terms & Conditions</a>,{" "}
                <a onClick={showPrivacyModal}>Privacy Policy</a>
              </span>
              <span className='tAndc-text grey-color-text'> & </span>
              <span className='tAndc-text turcose-color-text max-width-768-mb-20px linne-height'>
                <a onClick={showCookiesModal}>Cookies Policy</a>
              </span>
            </div>
          </div>
        </Col>
        <Col md={3} xs={12} className='sign-in-side-column'>
          {planId && (
            <ChosenPlanSummary
              setchosenProdId={setchosenProdId}
              setShowSubscriptionPlanModal={setShowSubscriptionPlanModal}
            />
          )}
          {jobId && <JobInfoRightSideBar />}
          <Testimony testimonyBy={"jennifer"} />
        </Col>
      </Row>
    </div>
  );
};

export default ChooseYourPassWord;
