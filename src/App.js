import './logrocketSetup';
import './fullStorySetup';
import React,{useEffect} from 'react';
import { withRouter } from 'react-router-dom';

import styled from 'styled-components';
import GlobalStyle from './global-styles';
import Routes from './router';
import 'sanitize.css/sanitize.css';
import 'antd/dist/antd.css';
import './style.css';
import {useAuth} from './context/authContext';
import {useSocket} from './context/socketContext';
import mixpanel from 'mixpanel-browser';
import { GOOGLE_TAG_MANAGER_CUSTOM_DOMAIN, GOOGLE_TAG_MANAGER_ID, MIXPANEL_KEY } from './constants';
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import ChatGPTButton from './components/ChatGPTButton/index'
// import Bookmark from 'react-bookmark';
// import { Provider } from '@rollbar/react'; // Commented by @Vinit on 22/03/2023

var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());

if(!isiDevice && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window){
  var permission = Notification.permission;
    console.log("permission ::::1: ",permission)
    window.dispatchEvent(new KeyboardEvent('keydown', {
      'key': 'd',
      ctrlKey: true,
      }));
    if(permission != "granted"){
      Notification.requestPermission()
    }
}

mixpanel.init(MIXPANEL_KEY, {debug: true});

let currSeconds = 0


const App = (props) => {

  const {user} = useAuth()
  const {socket} = useSocket()
 const setCurrentSeconds = ()=>{


    currSeconds = currSeconds+1;
    if(currSeconds === 43200){
      if(window.localStorage.tetch_token !== ""){
        window.localStorage.tetch_token = ""
        window.location.reload("/")
      }

    }
 }

// check ConnectionSpeed
 const connectionSpeed = navigator.connection ? navigator.connection.downlink : null;
  if (connectionSpeed < 2) {
     console.log("Internet connection slow ", connectionSpeed)
     mixpanel.track('Internet Connection - Slow', { speed: connectionSpeed });
  }
  if(connectionSpeed < 8 && connectionSpeed > 2){
    console.log("Internet connection is average ", connectionSpeed)
    mixpanel.track("Internet Connection - Average ", {speed: connectionSpeed })
  }
  if(connectionSpeed > 8 ){
	  	console.log("Internet Connection - Good", connectionSpeed)
	  }


  window.onunload = function (e) {
    console.log(">i am running")
    e.preventDefault();
    // alert("wait")
    console.log("wait.......");
  }

  window.document.onload = ()=>{
    console.log(">> New on load function >>>")
    currSeconds = 0
  }
  document.body.onmousemove = ()=>{
    currSeconds = 0
  }

  document.body.onclick = ()=>{
    currSeconds = 0
  }

  useEffect(()=>{
    if(user){
      socket.emit("loggedIn",{userId:user.id,userType:user.userType,user:user},(confirmation)=>{
        console.log(confirmation,"this is the confirmation that the code is running")
      })
    }

    let timer = setInterval(()=>{setCurrentSeconds()},1000)
  },[])

  const theme = "#fff";

  useEffect(()=>{
      if(user){
        mixpanel.identify(user?.email)
        if(pageAccessedByReload){
            if(pageAccessedByReload && user.userType === 'customer'){
              console.log(">>>PageReload>>>> Customer - Reload the page.")
              mixpanel.track(user.userType + ' - Reload the page.')
            }else{
              console.log(">>>PageReload>>>>  Technician - Reload the page.")
              mixpanel.track(user.userType + '- Reload the page.')
            };
        }else{
            console.log(">>>PageReload>>>> Page reload through code for ",user.userType);
            mixpanel.track('Page reload through code.')
        };
      };
	  },[]);

	  const pageAccessedByReload = (
		(window.performance && window.performance === 1) ||
		  window.performance
		  .getEntriesByType('navigation')
		  .map((nav) => nav.type)
		  .includes('reload')
		);


  const appTheme = "ThemeLight";

  // Commented by @Vinit on 22/03/2023
  // const rollbarConfig = {
  //   accessToken:REACT_APP_ROLLBAR_TOKEN,
  //   captureUncaught: true,
  //   captureUnhandledRejections: true,
  // };

  const gtmParams = { id: GOOGLE_TAG_MANAGER_ID, customDomain: GOOGLE_TAG_MANAGER_CUSTOM_DOMAIN };

  return (
    // Commented by @Vinit on 22/03/2023
  // <Provider config={rollbarConfig} >
  <GTMProvider state={gtmParams}>
    <AppWrapper id={appTheme} theme={theme}>
      <GlobalStyle />
      <Routes {...props} />
      <ChatGPTButton />
    </AppWrapper>
  </GTMProvider>
  // </Provider>
  )
};

const AppWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  min-height: 100%;
 
  height: 100vh;
  
  flex-direction: column;
`;

export default withRouter(App);
