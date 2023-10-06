import React, {useState,useRef,useEffect} from 'react';
import styled from 'styled-components';
// import GoogleLogin from 'react-google-login';
// import FacebookLogin from 'react-facebook-login';
// import { FaFacebook } from 'react-icons/fa';
import { Col } from 'antd';
import PhoneInput from 'react-phone-input-2';
import { Form } from 'antd';
// import { FB_APP_ID, GOOGLE_CLIENT_ID } from 'constants/social';
// import Header from 'components/Header/UnAuthHeader';
import FormItem from 'components/FormItem';
// import InputPassword from 'components/AuthLayout/InputPassword';
import Input from 'components/AuthLayout/Input';
// import Link from 'components/AuthLayout/Link';
import { useAuth } from 'context/authContext';
// import { useHistory } from 'react-router-dom';
import * as TechnicianService from '../../../api/technician.api'
import {Button} from 'react-bootstrap';
import { openNotificationWithIcon } from '../../../utils';
import { Select,Typography } from 'antd'; 
import {languages} from   '../../../constants';
import mixpanel from 'mixpanel-browser';

const { Option } = Select;

const {p} = Typography;


const  EditTech =  () => {
  const {user} = useAuth();
  const formRef = useRef();
  const technician = user.technician
  const [showError,SetshowError] = useState(false)
  // const history = useHistory()
  useEffect(()=>{
    formRef.current.setFieldsValue({
      firstName : user.firstName,
      lastName : user.lastName
    })

    setLanguage(technician.language)
    setPhoneNumber(technician.profile.confirmId.phoneNumber)

  },[])


  const { updateUserInfo } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  // const [extension, setExtension] = useState('');
  const [language,setLanguage] = useState('')
  

  const HandlePhoneNumber = (e) => {
    setPhoneNumber(`+${e}`);
  };

  /*const handleExtension = e => {
    setExtension(e.target.value);
  };*/

  const onSignUp = async (values) => {  

    if(phoneNumber && language !== ''){
      SetshowError(false)
      updateUserInfo({"userId":user.id,"firstName":values.firstName,"lastName":values.lastName})
      TechnicianService.updateTechnician(technician.id,
        {
          confirmId:{phoneNumber:phoneNumber},
          language:language,
          profileImage:{imageUrl:false}
        })


    // mixpanel code//
    mixpanel.identify(user.email);
    mixpanel.track('Technician - User profile updated');
    // mixpanel code//

    openNotificationWithIcon("success","Success","Details Successfully changed")
    setTimeout(()=>{window.location.href="/technician/profile"},1000)

    }
    else{
      SetshowError(true)
    }
  
  };

  return (
    <div>
        <SectionEmail>     
         <Col span={24}>
            <Col span={12}>  
              <Title className="subtitle">Edit Account</Title>         
            </Col>
          </Col>     
          <Form  onFinish={onSignUp} layout="vertical" ref={formRef}>
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
                    <RegInput  name="lastName" size="large" placeholder="Last Name" />
                  </RegForm>
            </Col>
             <Col span={24}>
                <FormItem

                  name="phonenumber"
                  label="PHONE NUMBER" >
                  <InputWithLabel>
                    <PhoneInput value={phoneNumber} countryCodeEditable={false} onChange={HandlePhoneNumber} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} />
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
                     defaultValue={technician.language}
                    filterOption={(input, option) =>
                    
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange = {(value,option)=>{
                      setLanguage(option.children)
                    }}



                  >
                  {languages.map((item,index)=>{
                    if(index === 2){
                      return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                    }
                    else{
                      return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                    }
                  })}
                  </LanguageSelect>  
                  
                </FormItem>
                {showError ? <p className="error-msg">Language Required </p> :"" }
               


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
       {/* <SectionEmail>
        <div>
          <Row>
           <Col span={24}>         
              <Link to='/' className="signin-btn-link">   
                  Already have an account? Sign In.
              </Link>
          </Col>
           </Row>
        </div>
        </SectionEmail>*/}
       
    </div>
  );
};

const Title = styled.p`

  font-size:40px;
  font-weight:400;
`


const SectionEmail = styled.section`
  width:50%
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

EditTech.propTypes = {};

export default EditTech;
