import React, {
  memo, useEffect, useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import {Button, Alert} from 'react-bootstrap';
import * as Antd from 'antd';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LayoutMax } from '../../../components/Layout';
import Header from '../../../components/Header';
import FormItem from '../../../components/FormItem';
import Input from '../../../components/AuthLayout/Input';
import Footer from '../../../components/AuthLayout/Footer';
import Link from '../../../components/AuthLayout/Link';
import { useAuth } from '../../../context/authContext';
import { TECHNICIAN,LANDING_PAGE_URL } from '../../../constants';
// import StepButton from '../../../components/StepButton';
import DividerWrapper from '../../../components/AuthLayout/DividerWrapper';
import messages from './messages';
// import { openNotificationWithIcon } from '../../../utils';
function ForgotPassword() {
  // const [step, setStep] = useState(0);
  const step = 0;
  const [isOpen, setIsOpen] = useState(false);
  const [regType, setType] = useState('customer');
  const [alertMessageShow, setAlertMesasgeShow] = useState(false);
  const [alertMessage, setAlertMesasge] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  const [showLoader, setShowLoader] = useState(false);

  const history = useHistory();
  const { user ,resetPasswordHandler } = useAuth();

  useEffect(() => {
    if (user && user.isPayment) {
      history.push('/');
    }
    if (user && !user.isPayment) {
      history.push('/registration');
    }
    if (user && user.newTech && user.type === TECHNICIAN) {
      history.push('/welcome-technician');
    }
  }, [history, user]);

  const onSendResetRequest = async(value) => {
    // console.log("so this is the value")
    // openNotificationWithIcon('info', 'Info', "Email Sent with Reset Password link");
    setShowLoader(true);
    setAlertMesasgeShow(false);
    let res = await resetPasswordHandler(value)
    
    if(res && res.success){
      setAlertVariant('success')
      setAlertMesasge('Email Sent with Reset Password link');
      setAlertMesasgeShow(true);
    }else{
      setAlertVariant('danger')
      setAlertMesasge(res.message);
      setAlertMesasgeShow(true);
    }
    setShowLoader(false);
    // history.push("/")
  };

  const goToRegister = () => {
    if (regType === 'customer') {
      history.push('/customer/register');
    } else {
      history.push('/technician/register');
    }
  };
  
  return (
    <Container>
      <LayoutMax bg={"transparent"} className="background-transparent box-shadow-none">
       
        <LayoutMax.Content className="items-center forgot-password register-page background-transparent">
         <Header link={LANDING_PAGE_URL} />

          <DividerWrapper>
            <Antd.Divider className="div-login">Forgot Password</Antd.Divider>
          </DividerWrapper>
          {alertMessageShow &&
            <Alert variant={alertVariant} className="w-100">
                {alertMessage}
            </Alert>
          }

          <Antd.Form className="items-center" onFinish={onSendResetRequest}>
            <FormItem
              name="email"
              rules={[
                {
                  type: 'email',
                  message: <FormattedMessage {...messages.emailVail} />,
                },
                {
                  required: true,
                  message: <FormattedMessage {...messages.email} />,
                },
              ]}
            >
              <Input name="email" size="small" placeholder="Email" onChange={()=>{setAlertMesasgeShow(false)}} />
            </FormItem>


            <Button type="primary" htmlType="submit" className="btn app-btn app-btn-small" disabled={(showLoader ? true : false)}>
              <span></span>
              {showLoader 
                ?
                  <Antd.Spin/>
                :
                  "Submit"
              }
            </Button>

          </Antd.Form>
          {step === 1 && <FormattedMessage {...messages.confirmRequest} />}
          <div>
            <Footer>
              <span className="d-block">
                Need an Account?
                &nbsp;              
                <RegisterText onClick={() => setIsOpen(true)} title="Click to register new user." className="float-right">
                  Register here
                </RegisterText>
              </span>
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
                    loading={false}
                    onClick={goToRegister}

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
                    type={regType === 'customer' ? 'primary' : 'default'}
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

            <Link to="/login">
              <FormattedMessage {...messages.btnLogin} />
            </Link>
            </Footer>
            
          </div>
        </LayoutMax.Content>
        <div />
      </LayoutMax>
     </Container>
  );
}

const Container = styled.div`
  width:20%;
  margin: 0 auto;
  @media screen and (max-width: 763px) {
    width:80%
  }
`;
const RegisterText = styled.div`
  cursor: pointer;
  color: #1890ff;
`;


ForgotPassword.propTypes = {};

export default memo(ForgotPassword);
