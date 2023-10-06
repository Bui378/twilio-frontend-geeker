import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Col } from 'antd';
import PhoneInput from 'react-phone-input-2';
import { Form } from 'antd';
import FormItem from 'components/FormItem';
import Input from 'components/AuthLayout/Input';
import { useAuth } from 'context/authContext';
import * as CustomerService from '../../../../api/customers.api';
import { Button } from 'react-bootstrap';
import { openNotificationWithIcon } from '../../../../utils';
import { Select } from 'antd';
import { languages } from '../../../../constants';
import mixpanel from 'mixpanel-browser';

const { Option } = Select;
const EditCustomer = ({ user, value, onNext, onPrev }) => {
  const formRef = useRef();
  const customer = user.customer
  useEffect(() => {
    formRef.current.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName
    })
    setLanguage(customer.language)
    setPhoneNumber(customer.phoneNumber)

  }, [])

  const { updateUserInfo } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [language, setLanguage] = useState('')

  const HandlePhoneNumber = (e) => {
    setPhoneNumber(`+${e}`);
  };

  const onSignUp = async (values) => {
    if (phoneNumber && language !== '') {
      updateUserInfo({ "userId": user.id, "firstName": values.firstName, "lastName": values.lastName })
      CustomerService.updateCustomer(customer.id, { phoneNumber: phoneNumber, language: language })
      // mixpanel code//
      mixpanel.identify(user.email);
      mixpanel.track('Customer - User profile updated');
      // mixpanel code//
      openNotificationWithIcon("success", "Success", "Details Successfully changed")
      setTimeout(() => { window.location.reload() }, 1000)
    }
  };

  return (
    <div>
      <SectionEmail>

        <Form onFinish={onSignUp} layout="vertical" ref={formRef}>
          <Col span={24}>
            <RegForm
              name="firstName"

              label="FIRST NAME"
              rules={[
                {
                  required: true,
                  message: 'Please input your First Name!',
                },
                () => ({
                  validator(_, value) {
                    const re = /^[a-zA-Z ]*$/;
                    if (!re.test(String(value))) {
                      return Promise.reject(
                        'No numbers or special characters are allowed',
                      );
                    }
                    if (value && value.length > 30) {
                      return Promise.reject('Maximum length is 30 characters');
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >

              <RegInput
                name="firstName"
                size="large"

                placeholder={user.firstName}
              />

            </RegForm>
            <RegForm
              name="lastName"
              label="LAST NAME"
              rules={[
                {
                  required: true,
                  message: 'Please input your Last Name!',
                },
                () => ({
                  validator(_, value) {
                    const re = /^[a-zA-Z ]*$/;
                    if (!re.test(String(value))) {
                      return Promise.reject(
                        'No numbers or special characters are allowed',
                      );
                    }
                    if (value && value.length > 30) {
                      return Promise.reject('Maximum length is 30 characters');
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <RegInput name="lastName" size="large" placeholder="Last Name" />
            </RegForm>
          </Col>
          <Col span={24}>
            <FormItem

              name="phonenumber"
              label="PHONE NUMBER" >
              <InputWithLabel>
                <PhoneInput value={customer.phoneNumber} countryCodeEditable={false} onChange={HandlePhoneNumber} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} />
              </InputWithLabel>
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem
              name="language"
              label="Language" >
              <LanguageSelect
                showSearch
                optionFilterProp="children"
                defaultValue={customer.language}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(value, option) => {
                  setLanguage(option.children)
                }}
              >

                {languages.map((item, index) => {
                  if (index === 2) {
                    return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                  }
                  else {
                    return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                  }
                })}
              </LanguageSelect>
            </FormItem>
          </Col>

          <Col span={20}>
            <Button
              type="primary"
              size="large"
              className="app-btn"
            >
              <span></span>
              Update
            </Button>
          </Col>

        </Form>
      </SectionEmail>
    </div>
  );
};

const SectionEmail = styled.section`
  width:100%
  margin: auto;

  & .ant-col-12{
    display:inline-block;
    width: 40%;
    margin-left: 15px;
    padding:30px;
    margin-top:20px;
  }

  & .ant-col-20{
    padding-left: 20px;
  }
`;

const RegForm = styled(FormItem)`
  &.ant-form-item-has-error {
    margin-bottom: 6px;
  }
`;

const RegInput = styled(Input)`
  border : 0px none !important;
  border-radius:0px none !important;
  border-bottom : 1px solid black  !important;
  padding: 15px 20px;
  width:30%;
   background:transparent !important;
  border-radius: initial;
  font-family: 'Open-Sans', sans-serif;
`;

const LanguageSelect = styled(Select)`
  border:0px none;
  color:black;
  border-bottom : 1px solid black !important;
`

export const InputWithLabel = styled.div`
  display: flex;
  flex-direction: column;
  &:last-child {
    marginRight: 0;
  }
  & input{
    height:50px;
    padding:10px;
    padding: 15px 20px;
    width:30%;
    border-radius: 10px;
    margin-top: 15px;
    border : 0px none !important;
    border-radius:0px none !important;
    border-bottom : 1px solid black !important;
     padding: 15px 20px;
      width:30%;
    background:transparent !important;
    margin-top:15px;
    margin-left:20px;
  }
  & .react-tel-input .form-control {
    height:50px;  
    border : 0px none !important;
    border-radius:0px none !important;
    width:100%;
    border-bottom : 1px solid black !important;
 }
  & .react-tel-input .flag-dropdown {
    background:transparent;
    border : 0px none !important;
    border-radius: 0px none !important;
    border-bottom : 1px solid black !important;
  }
`;
EditCustomer.propTypes = {};

export default EditCustomer;
