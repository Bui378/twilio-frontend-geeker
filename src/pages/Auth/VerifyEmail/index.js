import React ,{useEffect} from 'react';
// import styled from 'styled-components';
// import { LayoutMax } from '../../../components/Layout';
// import Success from '../../../assets/images/circle-tick.jpg';
 import { useLocation  } from 'react-router';
 // import { useHistory } from 'react-router-dom';
 import { openNotificationWithIcon } from '../../../utils';
 import {useAuth} from '../../../context/authContext'
const EmailVerification = ()=>{
	let tk = ''
	const {user,updateUserInfo } = useAuth()
	const location = useLocation()
	// const history = useHistory();

	const handleVerificationEmail = async()=>{

		if(location.search){
    	let params = new URLSearchParams(location.search)
	   	tk = params.get('t')

	   		if(user.emailVerifyToken === tk){
	   		await updateUserInfo({"userId":user.id,"verified":true})
	   		openNotificationWithIcon('success', 'Success', "Email Verified");
	   	}
	   	else{
	   		openNotificationWithIcon('error', 'Error', "Link Expired");
	   	}
	   	
	   	
	   	// history.push("/")
	   	setTimeout(()=>{
	   		window.location.href = "/"
	   	},1000)

   }


	}

	useEffect(()=>{
			handleVerificationEmail()
	},[user])

	return(<></>)
}

/*const Container = styled.div`
  width:40%;
  margin: 0 auto;
  margin-top:30px;
  box-shadow: 5px 4px 13px 1px rgba(0,0,0,0.75);
-webkit-box-shadow: 5px 4px 13px 1px rgba(0,0,0,0.75);
-moz-box-shadow: 5px 4px 13px 1px rgba(0,0,0,0.75);
`;*/


export default EmailVerification;