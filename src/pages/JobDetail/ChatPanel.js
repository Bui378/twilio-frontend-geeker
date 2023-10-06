import React, { useEffect, useState } from 'react'
import {Collapse, Col, Spin} from 'antd';
import ChatPanelTwilio from 'components/ChatPanelTwilio';
import axios from 'axios';
const { Panel } = Collapse;

const ChatPanel = ({job,userType}) => {

	const [userEmail, setUserEmail] = useState('');
	useEffect(()=>{
		console.log("emailemailemailemailemailemail",userType)
		if(job && job?.user?.userType){
			// if(job?.userType == "customer"){
			// 	console.log("emailemailemailemailemailemail", job?.customer)
			// 	const email = job?.customer?.user?.email
			// 	setUserEmail(email)
			// }
			// if(job?.userType == "customer"){
			// 	const email = job?.technician?.user?.email
			// 	setUserEmail(email)
			// }
			
		}
	},[job]);


  return (
	  <>
		  <Col xs="12" className="ant-collapse-outer mt-4" >
			  <Collapse  defaultActiveKey={['1', '2', '3', '4', '5', '6', '7']}>
				  <Panel header="My Conversations" key="7" className="mb-4 py-3 px-2">
					<div className='d-flex justify-content-center'>
					<ChatPanelTwilio job={job} width={'700px'} height={'500px'} />
					</div>
				  </Panel>
			  </Collapse>
		  </Col>
	  </>
  )
}

export default ChatPanel
