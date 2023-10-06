import React, { useMemo, useState } from 'react';
import jwtDecode from 'jwt-decode';
import {Button, Alert} from "react-bootstrap";
import * as Antd from 'antd';
// import GoogleLogin from 'react-google-login';
// import FacebookLogin from 'react-facebook-login';
import styled from 'styled-components';
// import { FaFacebook } from 'react-icons/fa';
import { useHistory,useLocation } from 'react-router';
import { LayoutMax } from '../../../components/Layout';
import { LANDING_PAGE_URL } from '../../../constants';
import DividerWrapper from '../../../components/AuthLayout/DividerWrapper';
import FormItem from '../../../components/FormItem';
import InputPassword from '../../../components/AuthLayout/InputPassword';
import Input from '../../../components/AuthLayout/Input';
// import Header from '../../../components/Header';
import Footer from '../../../components/AuthLayout/Footer';
import Link from '../../../components/AuthLayout/Link';
import { useAuth } from '../../../context/authContext';
// import logo from '../../../assets/images/logo.png';
// import GoogleLogin from 'react-google-login';
// import {useTools} from '../../../context/toolContext';
import { useGoogleLogin, CredentialResponse } from '@react-oauth/google';
import { openNotificationWithIcon } from '../../../utils';
import { SESSION_EXPIRE_MESSAGE } from '../../../constants';
import google from "../../../assets/images/google.svg";
let shown = false
function LoginPage() {
  const location = useLocation()

  const [isOpen, setIsOpen] = useState(false);
  const [regType, setType] = useState('defaultSelect');
  const [alertMessageShow, setAlertMesasgeShow] = useState(false);
  const [alertMessage, setAlertMesasge] = useState('');
  const [invalidUser, setInvalidUser] = useState(false);
  // const {userDetails,setUserDetails} = useTools();
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  // const [forSocial,setForSocial] = useState(false)
  // const [socialData,setSocialData] =  useState(false)
  const [codeResponse, setCodeResponse] = useState();
  let posTedJobId = false
  let isMobilePost = false
  let detailsJobId  = false
  let jobStatus  = false
  let slackJobid = false
  let message = false
  let customerId = false
  let params = new URLSearchParams(location.search)
  if(params.get("job-id")){
    posTedJobId = params.get("job-id")
    isMobilePost = params.get("isMobilePost")
  }

  if(params.get("slackJobid")){
    slackJobid = params.get("slackJobid")
  }

  if(params.get("message")){
    message = params.get("message")
  }

  if(params.get("customerId")){
    customerId = params.get("customerId")
  }

  if(params.get("jobId")){
    detailsJobId = params.get("jobId")
  }
  if(params.get("status")){
    jobStatus = params.get("status")
  }
  const { login} = useAuth();
  const history = useHistory();

  if(params.get("session_expire")){
    if(!shown){
      console.log('session_expire yessssss')
      openNotificationWithIcon('error', 'Error', SESSION_EXPIRE_MESSAGE); 
      shown = true
    }

  }

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async codeResponse => {
      setCodeResponse(codeResponse);
    },
    onError: errorResponse => console.log(errorResponse)
  })


  
  const onSubmit = async (values) => {
    setShowLoader(true)
    setAlertMesasgeShow(false)
    setInvalidUser(false);
    setInvalidPassword(false); 
    values['jobId'] = detailsJobId
    values['status']= jobStatus
    values['slackJobid']=slackJobid
    values['message']=message
    values['customerId']=customerId
    let res = await login(values,posTedJobId, isMobilePost);
    if(res && !res.success){
      if(res.inputError){
        if(res.userError){
          setInvalidUser(true);
        }
        if(res.passwordError){
          setInvalidPassword(true); 
        }
        setAlertMesasge(res.error)
        setShowLoader(false);
      }else{
        setAlertMesasgeShow(true)
        setAlertMesasge(res.error)
        setShowLoader(false);
      }
    }
    if(res === undefined){
      setAlertMesasgeShow(true)
      setAlertMesasge("Something went wrong. Please Reload your page.")
      setShowLoader(false);
    }
  };
  /*const handleSocialLogin = ()=>{
    setIsOpen(false)
  }*/
  const goToRegister = () => {
    if (regType === 'customer' || regType === "defaultSelect") {
      history.push('/customer/register');
    } else {
      history.push('/technician/register');
    }
  };

  return (
    <Container>

      <a href={LANDING_PAGE_URL}>
        <Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="Geeker" />

      </a>
      <LayoutMax bg={"transparent"} style={{backgroundColor:"transparent"}} className="box-shadow-none">
        
        <LayoutMax.Content className="items-center login-page-outer register-page" style={{backgroundColor:"transparent"}}>
          <Antd.Form className="items-center" onFinish={onSubmit}>
            <DividerWrapper>
              <Antd.Divider className="div-login">Login</Antd.Divider>
            </DividerWrapper>
            {alertMessageShow &&
              <Alert variant="danger" className="w-100">
                  {alertMessage}
              </Alert>
            }
            <FormItem
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail.',
                },
              ]}
            >
              <Input 
                name="email" 
                size="large" 
                placeholder="Email" 
                className={"email-login-class" + (invalidUser ? ' red-border-bottom' : '')}
                onChange={()=>{
                  setAlertMesasgeShow(false)
                  setInvalidUser(false);
                  setInvalidPassword(false); 
              }}/>
            </FormItem>
            {invalidUser && 
              <div className="input-error-msg">{alertMessage}</div>
            }
            <FormItem
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your Password!',
                },
              ]}
            >
              <InputPassword
                name="password"
                size="large"
                placeholder="Password" 
                className={(invalidPassword ? ' red-border-bottom-input' : '')}
                onChange={()=>{
                  setAlertMesasgeShow(false)
                  setInvalidUser(false);
                  setInvalidPassword(false); 
                }}
              />
            </FormItem>
            {invalidPassword &&
              <div className="input-error-msg">{alertMessage}</div>
            }
            <Button
             id='login-btn'
              type="primary"
              size="large"
              className="btn app-btn btn-login"
              disabled={(showLoader ? true : false)}
            >
              <span></span>
              
              {showLoader 
                ?
                  <Antd.Spin/>
                :
                  "Log In"
              }
            </Button>

            <Button className="btn google-login-btn btn-login" onClick={() => googleLogin()}>
            <img src={google} />
              Sign in with Google
            </Button>


          </Antd.Form>
          <div>
            <Footer>
              <span className="d-block">
                Need an Account?
                &nbsp;              
                <RegisterText id='register-new-btn' onClick={() => setIsOpen(true)} title="Click to register new user." className="float-right">
                  Register here
                </RegisterText>
              </span>
            </Footer>
            <Link to="/forgot-password" title="Click to set new password for your account.">
              Forgot password
            </Link>
          </div>
        </LayoutMax.Content>
      </LayoutMax>
      <Antd.Modal
        title="Pick Registration Type"
        visible={isOpen}
        onOk={() => {}}
        onCancel={() => setIsOpen(false)}
        closable={false}
        footer={[
          <Button key="back" onClick={() => setIsOpen(false)} className="btn btn-default app-btn app-btn-light-blue modal-footer-btn">
            <span></span>
            Close
          </Button>,
          <Button
            id="start-register-btn"
            loading={'false'}
            onClick={goToRegister}
            key="start"
            className="btn app-btn btn-small modal-footer-btn"
          >
            <span></span>
            Start
          </Button>,
        ]}
      >
        <div
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <Antd.Button
            type={(regType === 'defaultSelect' || regType === 'customer')   ? 'primary' : 'default'}
            size="large"
            onClick={() => setType('customer')}
            className="switch-btn-registration switch-btn-left"
          >
            Customer
          </Antd.Button>
          <Antd.Button
            type={regType === 'developer' ? 'primary' : 'default'}
            size="large"
            onClick={() => setType('developer')}
            className="switch-btn-registration switch-btn-right"
          >
            Technician
          </Antd.Button>
        </div>
      </Antd.Modal>
    </Container>
  );
}

const RegisterText = styled.div`
  cursor: pointer;
  color: #1890ff;
  @media screen and (max-width: 295px) {
    text-align: center;
    width:100%
  }
`;

const Container = styled.div`
  width:20%;
  margin: 0 auto;
  @media screen and (max-width: 991px) {
    width:35%
  }
  @media screen and (max-width: 763px) {
    width:80%
  }
   & .ant-input-suffix {
  margin-left:0px !important;
  border-bottom: 2px #d0d0d0 solid;
 }
`;
const Image = styled.img`
  display: block;
  margin: auto;
  margin-top:10%
`;


LoginPage.propTypes = {};

export default LoginPage;
