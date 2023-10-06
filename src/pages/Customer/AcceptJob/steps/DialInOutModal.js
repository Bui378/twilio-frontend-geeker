import React, { useState } from 'react';
import { Modal as AntModal, Typography, Form, Input } from 'antd';
import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Box from '../../../../components/common/Box';
import PhoneInput from 'react-phone-input-2';
import { JITSI_URL } from '../../../../constants';
import {DashboardTab,DashboardTabPane} from '../../../../components/Dashboard/Tabs';
import * as TypeServiceApi from '../../../../api/typeService.api';
import { openNotificationWithIcon } from 'utils';
import { useUser } from '../../../../context/useContext';
import mixpanel from 'mixpanel-browser';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';

const DialInOutModal = ({ isOpen, onClose, enableComputerAudio, disableComputerAudio,setInvitation,setInvitedNumber,JobId,setIsDialInOutModalOpen}) => {
  // const [isPhoneSelected, setIsPhoneSelected] = useState(false);
  const isPhoneSelected = false;
  // const [selectedBtn, setSelectedBtn] = useState('computerAudio');
  const [editPhone,setEditPhone] = useState(false)
  const [form] = Form.useForm();
  const {user} = useUser();

  const modalBtnClicked=(btnType)=>{
  	// console.log('editPhone>>>>>>>>>>',editPhone)
	
	if(editPhone){
		
		if (isPossiblePhoneNumber(editPhone) === false && isValidPhoneNumber(editPhone) === false) {
				// return 
				openNotificationWithIcon('error', 'Error', 'Not a valid Phone Number');
				return false;
		}
		setInvitedNumber(editPhone)
		setInvitation(true)
		let tempEditPhone = editPhone.substring(0, editPhone.length-10)
		setEditPhone(tempEditPhone)
		setIsDialInOutModalOpen(false)
		openNotificationWithIcon('success', 'Success', 'User has been invited on phone.');
		if(user.userType  === 'technician'){
           // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Technician - Phone invited',{'JobId':JobId});
          // mixpanel code//

      }else{
          // mixpanel code//
          mixpanel.identify(user.email);
          mixpanel.track('Customer -  Phone invited',{'JobId':JobId});
          // mixpanel code//
      }      
	}else{
		openNotificationWithIcon('error', 'Error', 'Please input a number.');
	}

  }



  const onFinish = async (values) => {

	// console.log('Success:', values,JobId);
    if(values && values['email']){
      const jobIdSplit = JobId.split("_");
      let link = JITSI_URL.FULL_URL+jobIdSplit[1]
      await TypeServiceApi.sendJitsiInvitation({'email':values['email'],'link':link});
      setIsDialInOutModalOpen(false)
      openNotificationWithIcon('success', 'Success', 'Meeting link has been sent!.');
      if(user.userType  === 'technician'){
               // mixpanel code//
                mixpanel.identify(user.email);
                mixpanel.track('Technician - Email invited',{'JobId':JobId});
              // mixpanel code//

          }else{
              // mixpanel code//
              mixpanel.identify(user.email);
              mixpanel.track('Customer -  Email invited',{'JobId':JobId});
              // mixpanel code//
       }    
      }else{
		openNotificationWithIcon('error', 'Error', 'Please input a email.');
	}


  };

  const onFinishFailed = (errorInfo) => {
	console.log('Failed:', errorInfo);
  };


  return (
	<div>
	  <Modal visible={isOpen} onCancel={onClose} footer={false} bodyStyle={{height:290}} maskClosable={false} width={400} title="Invite more people" className="invite_user_modal">
	  <DashboardTab>
		<DashboardTabPane tab="Phone" key="1">
		  <Box>
			<Label className="steplable">Invite your contacts</Label>
			<CallDiv>
			<div className="d-flex justify-content-between w-100">
			  <PhoneInput
						country="us"
						countryCodeEditable={false}
						onlyCountries={['gr', 'fr', 'us', 'in', 'ca', 'pk']}
						value={editPhone}
						placeholder=""
						onChange={(e) => {
						  setEditPhone('+' + e);
						}}
						className="h-30"
					  />
			  </div>             
			  </CallDiv>              
		  </Box>
		   <div style={{ marginTop: "24px"}} className=""> 
			  <Button className={(isPhoneSelected ? 'd-none' : '')+" app-btn invite-pin-btn app-btn-small"} onClick={()=>modalBtnClicked('go')}>
				Invite<span></span>
			  </Button>
			</div>
		</DashboardTabPane >
		<DashboardTabPane tab="Email" key="2">
		   <Form
				name="basic"
				form={form}         
				  labelCol={{
					span: 8,
				  }}               
				  initialValues={{
					remember: true,
				  }}
				  autoComplete="off"
				  onFinish={onFinish}
				  onFinishFailed={onFinishFailed}
			>
			  <Box>
				  <Label className="steplable">Invite user by mail</Label>
				  <CallDiv>
   
					  <Form.Item
						name="email"
					  >
						<Input className="h-30"/>
					  </Form.Item>

					 
				  </CallDiv>
			  </Box>
			  <div className=""> 
				<Button htmlType="submit" className={(isPhoneSelected ? 'd-none' : '')+" app-btn invite-pin-btn app-btn-small"}  onClick={() => form.submit()}>
				  <span></span>Invite
				</Button>
			  </div>
			</Form>
		</DashboardTabPane >
	  </DashboardTab>
	  </Modal>
	</div>
  );
};

const Modal = styled(AntModal)`
  
  .steplable{
	font-size: 18px;
  }
  .ant-modal-content {
	border-radius: 10px;
   
  }
  .ant-typography{
	margin-bottom:8px;
  }
  .pin-modal-btn{    
	background: #464646 !important;
	color: #fff !important;
	border-color: #464646 !important;
	padding:5px 30px;
	border-radius:8px;
	cursor:pointer;
  }
  

  .pin-message{
	font-weight:600;
	padding:10px 2px;
	height:120px;
	text-align:center;
  }
  .d-none{
	display:none;
  }
  .dial-in-options{
	margin-top:30px;
  }
  .footer-btns{


	display: block;
	text-align: right;
	top: 15px;
  }
  .footer-btns .pin-modal-btn{
	margin-left:15px;
  }
  .footer-btns .back-btn{
	background: none !important;
	color: #464646 !important;
	border: solid 2px;
  }
  .
  .pin-modal-btn.selected-btn{
	background: #464646 !important;
	color: #fff !important;
	border-color: #464646 !important;
	opacity:1;
  }
`;

const Label = styled(Typography)`
  font-size: 14px;
`;

const CallDiv =styled.div`
  display:flex;
  justify-content :space-between
`;

DialInOutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DialInOutModal;
