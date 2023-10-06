
import React,{useEffect, useState } from 'react';
import { Col,Button} from 'react-bootstrap';
import {useAuth} from '../../../context/authContext';
import {APP_URL} from '../../../constants';
import {Modal,Form,Input,Typography} from 'antd';
// import { Col, Button} from 'react-bootstrap';

import Box from '../../../components/common/Box';
import styled from 'styled-components';
import { openNotificationWithIcon } from 'utils';
import * as TypeServiceApi from '../../../api/typeService.api';
import * as ReferPeopleApi from '../../../api/refer.api';
import * as UserApi from '../../../api/users.api';

const ReferPeople = ()=>{	
	const {user} = useAuth();
	const [referLink,setReferLink] = useState('');
	const [isModalVisible, setIsModalVisible] = useState(true);
	const [form] = Form.useForm();

	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleRefModal = ()=>{
		window.refdCode = 'open'
		setTimeout(()=>{
			window.refdCode = 'false'
		},2000)
	}
	const onFinish = async (values) => {
		if(values && values['email']){
			const user_data = await UserApi.getUserByParam({'email':values['email']})
			if(user_data == null){
				await TypeServiceApi.ReferpeopleThroughEmail({'email':values['email'],'link':referLink});
				await ReferPeopleApi.createRefer({'user':user.id,'email':values['email']})
				setIsModalVisible(false)
				form.resetFields();
				openNotificationWithIcon('success', 'Success', 'Reference has been sent!.');
			}else{
				form.resetFields();
				openNotificationWithIcon('error', 'Error', 'Email suggested is already a user on Geeker.');
			}
				        
		 }else{
			openNotificationWithIcon('error', 'Error', 'Please input an email.');
		}

	};

	const onFinishFailed = () => {
		setIsModalVisible(true);
	};
	 
	useEffect(()=>{
		if(user){
			let  user_id  = user.id
			let split_id = user_id.split('_')
			setReferLink(APP_URL+"/customer/register?referred_by="+split_id[1])
		}
	},[user])

	const onClose = () => {
		form.resetFields();
		setIsModalVisible(false);
  	};


  	const copy_link = ()=>{
		navigator.clipboard.writeText(referLink)
		openNotificationWithIcon('success', 'Success', 'Link has been copied.');
  	}

	return (
		  
		<Col xs="12" className="mt-5">
			{/* <div>
			  <Col span={24} align="middle">      
				  <Box>
					  
					  <div className="divarea">  
						  <p>Refer your friend by clicking on the following button.</p>    
							<Button onClick={handleRefModal} className="btn app-btn">
												<span></span> Refer person
										  </Button>
					  </div>
				  </Box>  
			  </Col>
		 	</div> */}
				
			 <Modal title="Refer Modal" visible={isModalVisible}  onCancel={onClose} footer={false} bodyStyle={{height:300}} maskClosable={false} width={400} className="selectCallTypeModal referModal">
						<p> You can copy the link or enter email and press Refer button</p>
						<Button type="button" className="app-btn invite-pin-btn app-btn-small" 	onClick={copy_link}>
						<span></span>Copy link
						</Button>

						<div style={{paddingTop:"1rem"}}>
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
								<Label className="steplable">Refer user by mail</Label>							  
									<CallDiv>
										<Form.Item
										name="email"
										rules={[
									      {
									        type: 'email',
									        message: 'The input is not valid E-mail!',
									      },
									      {
									        required: true,
									        message: 'Please input your E-mail!',
									      },
									    ]}
										>
										<Input className="h-30"/>
									</Form.Item>
								</CallDiv>								 							
							</Box>
							  <div style={{paddingBottom:"2rem"}}> 
								<Button htmlType="submit" className="app-btn invite-pin-btn app-btn-small" onClick={() => form.submit()}>
								  <span></span>Refer
								</Button>
							  </div>
							</Form>

						</div>							
					
			</Modal>
		</Col>
		
		)

};
const Label = styled(Typography)`
  font-size: 14px;
`;

const CallDiv =styled.div`
  display:flex;
  justify-content :space-between
`;

export default ReferPeople;