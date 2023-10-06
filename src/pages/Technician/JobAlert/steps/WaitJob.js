import React, { useEffect,useState ,useRef} from 'react';
import styled from 'styled-components';
import { Row,Col, Progress,Modal } from 'antd';
import { useHistory } from 'react-router';
import { useSocket } from '../../../../context/socketContext';
import Loader from '../../../../components/Loader';
import { useUser } from '../../../../context/useContext';
// import {useNotifications} from '../../../../context/notificationContext';
import * as WebSocket from '../../../../api/webSocket.api';
import * as JobApi from '../../../../api/job.api';
import moment from 'moment';
// import { getTalkChatUser,getTalkGroupChatUser } from '../../../../api/chat.api';
// import { useChatEngineTools } from '../../../../context/chatContext';
import mixpanel from 'mixpanel-browser';
import { openNotificationWithIcon,get_or_set_cookie } from '../../../../utils';
// import ChatPanel from '../../../JobDetail/ChatPanel';
// import ChatPanelAccpetJob from 'components/ChatPanelAccpetJob';
// import { createOrGetUserChat } from '../../../../utils';
import  notifySound from '../../../../assets/sounds/notification.mp3'
import Box from '../../../../components/common/Box';
import Badge from '@mui/material/Badge';
import ChatPanelTwilio from 'components/ChatPanelTwilio';
import BasicButton from "components/common/Button/BasicButton";



let progress = 0
function WaitJob({ jobId, abc, setStep,webSocketId,handleStartCall, isDisabled, setIsDisabled }) {
  const { socket } = useSocket();
  const history = useHistory();
  const inboxRef = useRef();
  const { user }   = useUser();
  const [notify,setNotifyTimes] = useState(0)
  const [percent,setPercent] = useState(0)
  const [jobEnded,setJobEnded] = useState(false)
  const [isLoading,setIsloading] = useState(true)
  const [duration, setDuration] = useState('')
  const [showLoader, setShowLoader] = useState(null)
  const [showChat, setShowChat] = useState(false)
  // const { createChatUsers,createGroupChatUsers, createTalkUserSession, joinTalkChatConversation, createOrGetTalkChatConversation,joinTalkChatConversationGroup,createOrGetTalkChatConversationGroup,handleTalkChatUser } = useChatEngineTools();
  const now_time = moment();
  const [refetchChat,setRefetchChat] = useState(false)
  const [activeKey,setActiveKey] = useState(false)
  const [buttonKeyForChat,setButtonKeyForChat] = useState(false)
  const [socketHits, setSocketHits] = useState(0);
  const [showLoaderForChat, setShowLoaderForChat] = useState(null)
  const [chatPanelHasOpen,setChatPanelHasOpen] = useState(true)
  const [showChatPanel,setShowChatPanel] = useState(false)
  const [jobFromApi, setJobFromApi] = useState()
  const [safariBrowser,setSafariBrowser] = useState(false)
	const [isBrowserTypeSafari, setIsBrowserTypeSafari] = useState(false);



	let audio = new Audio(notifySound)
  // useEffect(()=>{
  //   const res =  JobApi.retrieveJob(jobId);
  //   console.log(res)
  //   try{
  //     res.then((result)=>{
  //     console.log(result)
  //     if(result.technician.id != user.technician.id)
  //     {
  //     console.log(user.technician,">>>>>>>>>>>")
  //     openNotificationWithIcon("info",'Info',"Job has been already taken")
  //         // history.push("/")
  //     }
  //     })
  //   }
  //   catch(err){
  //     history.push("/")
  //   }
    
    
    
  //   },[])

  // useEffect(() => {
  //   // setTimeout(() => {
  //     // fetchSingleJob()
  //     // }, 2000)
	// }, [user,refetchChat])

  const handleSendMessage = (message) => {
		socket.emit("talk-js-notification-to-customer",jobId)
  };

  const StyledBadge = styled(Badge)(({ theme }) => ({
		'& .MuiBadge-badge': {
		  right: -3,
		  top: 13,
		  backgroundColor:'red',
		  padding: '0 4px',
		},
	  }));

  const handelShowChat = () =>{
		setChatPanelHasOpen(false)
    setShowChatPanel(true)
		setSocketHits(0)
		// fetchSingleJob()
	}

  useEffect(() => {
    const fetchJobData = async () => {
      let response = await JobApi.retrieveJob(jobId);
      setJobFromApi(response)
      // Process the response or update state here
    };
  
    fetchJobData();
  }, []);
  
  


  // 	const fetchSingleJob = async()=>{
	// 	try{
	// 		let response = await JobApi.retrieveJob(jobId)
	// 		setDuration(moment.duration(moment(response.primarySchedule).diff(now_time)))
	// 		if(response.is_long_job || response.schedule_accepted || response.status === 'Inprogress' || response.status === 'Completed' || response.status === 'Accepted'){
	// 			setShowLoaderForChat(true)

				
	// 			let customerDataObject = {...response.customer.user} 
	// 			let technicianDataObject = { ...response.technician.user }

	// 			let customerChatUser = await handleTalkChatUser(customerDataObject)
	// 			let technicianChatUser = await handleTalkChatUser(technicianDataObject)

	// 			if (user.userType == 'technician') {
	// 				createTalkUserSession(technicianChatUser)
	// 			}
	// 			else {
	// 				createTalkUserSession(customerChatUser)
	// 			}
	// 			let conversationData = await createOrGetUserChat([JSON.stringify(customerDataObject.id), JSON.stringify(technicianDataObject.id)], response.id, response.software.name, response)
	// 			let conversation = await createOrGetTalkChatConversation(conversationData)
	// 			let userInbox = await joinTalkChatConversation({ "customer": customerChatUser, "technician": technicianChatUser, "conversationId": response.chatRoomId ? response.chatRoomId : conversationData.jobId })
	// 			setTimeout(() => {
	// 				try {
	// 				  if (userInbox) {
	// 					setShowLoaderForChat(false);
	// 					setTimeout(() => {
	// 					  if (inboxRef.current != undefined) {
	// 						userInbox.mount(inboxRef.current);
	// 						userInbox.onSendMessage(handleSendMessage);
	// 					  }
	// 					  if (user.userType === 'technician') {
	// 						setShowChat(true);
	// 					  }
	// 					}, 1000);
	// 				  }
	// 				} catch (err) {
	// 				  console.log('error in fetchSingleJob (inner setTimeout) >>', err);
					  
	// 				}
	// 			  }, 1000);
	// 		}



	// 	}
	// 	catch (err) {
	// 		console.log("error in fetchSingleJob >>")
	// 	}
	// }


  const counter = ()=>{
    if(progress === 100){
      progress = 0
    }
    progress = progress +1
    setPercent(progress)
  }

  useEffect(()=>{
    socket.emit("join",jobId)
    setTimeout(()=>{
      setIsloading(false)
    },8000)
     let timer = setInterval(counter,1000)
     setTimeout(()=>{
      setJobEnded(true)
      clearInterval(counter)
    },1800000)
   // 1800000
  },[])

 const callApi = async(data_to_send)=>{
    try{
          let webRes =  await WebSocket.technician_polling(data_to_send)
          if (webRes.meetingStarted && webRes.technician_id === user.technician.id && webRes.job_id === jobId){
            clearInterval(counter)
            get_or_set_cookie(user)
            window.location.href =  process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
          }
        }
        catch(Err){
          console.log("api error ")
        }
    
 }

 const handelCallBackPanel = (e) => {
  e.length === 2 ? setRefetchChat(true) : setRefetchChat(false)
  setSocketHits(0)
}


useEffect(() => {
  let userAgent = navigator.userAgent;
  let browserInfo = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  let browserName = browserInfo[1];
  if (browserName === 'Safari') {
    setIsBrowserTypeSafari(true)
  } else {
    setIsBrowserTypeSafari(false)
  }
}, []);

  useEffect(()=>{
    console.log('percent :::',percent)
    if(percent > 20 && percent%25 === 0 && !jobEnded){
      let data_to_send = {
        "job_id" :jobId,
        "socket_id":webSocketId
      }
      callApi(data_to_send)
    }

    if(percent === 100 && !jobEnded){      
      setTimeout(()=>{
        progress = 0
        setPercent(0)
        setNotifyTimes(notify + 1)
        openNotificationWithIcon("info","Sending Alert",`Notifying client to start the meeting for ${notify +1} time`)
      },1000)
      
    }

  },[percent])

  useEffect(() => {
    socket.emit('join', jobId);
      socket.on('accept-job', (job) => {

        console.log("accept-job socket received on technician side to change the page to meeting")
        if(job.technician && user ){
          try {
                 WebSocket.updateSocket(job['web_socket_id'],{'hitFromTechnicianSide':true})
                
              }
          catch(err) {
              console.log('accept-job error in Waitjob page>>>',err)
          }


          const res =  JobApi.retrieveJob(jobId);
          res.then((data)=>{
            if(data.technician.user.id === user.id){
                clearInterval(counter)
                get_or_set_cookie(user)
                window.location.href =  process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
            }
          })
        }
       
      });
      
      if(user){
        mixpanel.track('Technician - On Waiting For Client Confirmation Page ', { 'Email': user.email });
      }
  }, [jobId, setStep, socket, history, user]);

  const handleSocketEvent = () => {
		// Increase the socket hits count
		setSocketHits((prevHits) => prevHits + 1);
	
		// Perform other actions
    audio.play()
    setButtonKeyForChat(true);
	  };

  useEffect(()=>{
		socket.on("open-chat-panel-talkjs",(data)=>{
      if(data === jobId){
        handleSocketEvent()
      }
		  })
	},[])

  return (
  <>
  <Modal
							footer={null}
							closable={false}
							visible={isBrowserTypeSafari}
							maskStyle={{ backgroundColor: "#DCE6EDCF" }}
							maskClosable={false}
							width={616}
						>
							<div className="">
								<span style={{ fontSize: '18px' }}>To fully experience our share screen and remote access features, Geeker recommends switching to <span style={{ fontWeight: "bold" }}>Google Chrome</span> browser.</span>
							</div>

							<div className="d-flex justify-content-end">
								<BasicButton onClick={() => setIsBrowserTypeSafari(false)} btnTitle={"Close"} height={"40px"} width={"100px"} background={"#1bd4d5"} color={"#fff"} />
							</div>
						</Modal>
    <Container span={15}>
    <Loader height="100%" className={(isLoading ? "loader-outer" : "d-none")}  />
      <StepContainer>
        <NewJobContainer>
          <Div>
            <Row span={24} style={{ marginBottom: '30px' }}>
              <AlertTileBox>
                <Title>Waiting for client confirmation</Title>
              </AlertTileBox>
            </Row>
            <Row span={24}>
              <ProgressStyled percent={percent} showInfo={false} />
            </Row>
          </Div>
          <Col xs={24} md={24} lg={24} xl={12} style={{ marginTop: 10 ,float:"right"}}>
              <ButtonContainer style={{ marginTop: 0 }} className="new-job-btn" >
                  <button id="start-call-tech-btn" onClick={handleStartCall} type="button" disabled={isDisabled} className={(isDisabled ? "disabled-btn" : "") +"btn app-btn  btn btn-primary"}>Start Call</button>
              </ButtonContainer>
            </Col>
            <Box display="flex" style={{marginLeft:'-7px'}} justifyContent="right" marginTop={20} className="float-right invite-tech-btn">
                        {chatPanelHasOpen ? (
													<StyledBadge badgeContent={socketHits} color="secondary">
														<span style={{ display:  "flex", justifyContent: "center", fontWeight: "bold", color: "#97abb6", cursor: "pointer", pointerEvents: chatPanelHasOpen ? " " : "none", border:'none', textDecoration:'underline' }} className='bell-icon-class' onClick={handelShowChat}>Start chat with customer</span>
													</StyledBadge>
													) : (
													<span></span>
												)}	                       	
					  </Box>
        </NewJobContainer>
        
      </StepContainer>
      
    </Container>
    {showChatPanel && jobFromApi &&
    <div className='d-flex justify-content-center mb-5'>
      <ChatPanelTwilio job={jobFromApi} width={'700px'} height={'500px'} />
    </div>
      // <ChatPanelAccpetJob
      //   showLoaderForChat={showLoaderForChat}
      //   socketHits={socketHits}
      //   activeKey={activeKey}
      //   setActiveKey={setActiveKey}
      //   refetchChat ={refetchChat} 
      //   setRefetchChat={setRefetchChat}
      //   buttonKeyForChat={buttonKeyForChat}
      //   techStyle={'fromTech'} 
      //   inboxRef={inboxRef} 
      //   handelCallBackPanel={handelCallBackPanel}
      //   showLoader={showLoader}/>
      }
  </>
  );
}

const Div = styled.div`
  width: 100%;
`;
const AlertTileBox = styled.div`
    width:100%;
    display: flex;
    position: relative;
    img{
        position: absolute;
        left: 0;
        top: -3px;
        padding:4px 4px 4px 0px;
    }
}
`;
const Title = styled.p`
  margin-bottom: 0.5em;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  font-size: 22px;
  line-height: 1.4;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NewJobContainer = styled.div`
  background: #fff;
  margin: 80px 0;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 90px 70px;
  box-shadow: 0px 15px 50px 0px #d5d5d566;
  flex: 1;
  @media screen and (max-width: 763px) {
  padding: 40px 20px;
  }
`;

const StepContainer = styled.div`
  width: 60%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media screen and (max-width: 991px) {
    width: 80%;
  }
  @media screen and (max-width: 763px) {
    width: 100%;
  }
`;

const ProgressStyled = styled(Progress)`
  .ant-progress-success-bg,
  .ant-progress-bg {
    background-color: #60E1E2;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  @media (max-width: 1366px) {
    justify-content: space-between;
  }
  @media screen and (max-width: 763px) {
    flex-direction:column;
  }
`;

export default WaitJob;
