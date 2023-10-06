import React, { useState, useRef, useEffect, useMemo } from 'react';
import './style.css';
import { useUser } from '../../context/useContext';
import geekerLogo from '../../assets/images/geek.png';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import * as TwilioChatApi from '../../api/twilioChat.api';
import { useSocket } from '../../context/socketContext';
import { Spin } from 'antd';
import { Client as ConversationsClient } from '@twilio/conversations';
import { formatDateOfTwilioMessage } from '../../utils';
import Loader from 'components/Loader';
import { openNotificationWithIcon } from '../../utils';
import document from '../../assets/images/document.png'
import * as JobApi from '../../api/job.api'
import * as UserApi from '../../api/users.api'
import { SERVER_URL } from '../../constants';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useLocation } from 'react-router';
// import { useTools } from '../../context/toolContext';

const ChatTextInput = ({ focusToInput, inputRef, disableChatButton, style, keyPress, mediaLoader }) => {
  useEffect(()=>{
    if (focusToInput) inputRef.current.focus();
  })
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder='Type Here....'
      disabled={disableChatButton || mediaLoader}
      style={style}
      onKeyPress={keyPress}
    />
  )
}

const ChatPanelTwilio = ({ width, height, job, style, chatUser, chatIdFromProp, setRefreshTechUseEffect ,setdisableDiv}) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const chatContainerRef = useRef(null);
  const chatContainerScrollRef = useRef(null);
  const [messages, setMessages] = useState([]);
  // const [textMessage, setTextMessage] = useState('')
  // const {setConversationProxyGlobal} = useTools()
  const fileInputRef = useRef(null);
  const [loadChat, setLoadChat] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);
  const [conversationProxy, setConversationProxy] = useState();
  const [chatStatus, setChatStatus] = useState({ statusString: "", status: "" })
  const [refreshSocket, setRefreshSocket] = useState(false);
  const [scrollToChat, setScrollToChat] = useState(false)
  const [prepareFileToSend, setPrepareFileToSend] = useState()
  const [mediaLoader, setMediaLoader] = useState(false)
  const [disableChatButton, setDisableChatButton] = useState(false)
  const [timeStampRefresh, setTimeStampRefresh] = useState(false)
  const [chatServiceSid, setChatServiceSid] = useState();
  const inputRef = useRef(null);
  const [shouldFocusInputRef, setShouldFocusInputRef] = useState(false);
  const [loadMoreChat, setLoadMoreChat] = useState(false)
  const [nextPageUrl, setNextPageUrl] = useState()
  const [userChatId, setUserChatId] = useState()
  const [TechData, setTechData] = useState()
  const [finalChatId, setFinalChatId] = useState(chatIdFromProp)
  const [userToken,setUserToken] = useState("")
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tech_id = queryParams.get('message') ? queryParams.get('message') : false;
  // const {stepDeciderForDashboard, setStepDeciderDashboard} = useTools();
  
  // useEffect(()=>{
  //   console.log("Debugging online/offline status", stepDeciderForDashboard)
  // },[])

  // This will resetChat Count When Chat Link is clicked on HelpIsOnTheWay Page ~Jagroop
  useEffect(() => {
    if (job?.id) {
      resetChatCount();
    }
  }, [job])

  const resetChatCount = () => {
    try {
      let resetCount = window.localStorage.getItem('pendingJobHaveChat');
      if (resetCount) {
        resetCount = JSON.parse(resetCount);
        if (resetCount && resetCount.jobId && resetCount.jobId == job?.id) {
          let dataToSave = {
            jobId: job?.id,
            count: 0
          }
          window.localStorage.setItem('pendingJobHaveChat', JSON.stringify(dataToSave));
        }
      }
      return;
    } catch (error) {
      console.error("error while resetting the chat count", error);
      return;
    }

  }

  useEffect(() => {
    if(finalChatId !== chatIdFromProp){
      setFinalChatId(chatIdFromProp)
    }
  }, [finalChatId])
  

  useEffect(() => {
    (async function () {
      try {
        if (tech_id) {
          let TechUserData = await UserApi.getUserById(tech_id)
          let data = { id: TechUserData.id, name: `${TechUserData.firstName} ${TechUserData.lastName}` }
          setTechData(data)
        }
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    })()
  }, [tech_id])

  useEffect(() => {
    setConversationProxy()
    setParticipantsList()
    setChatServiceSid()
    setShouldFocusInputRef(false)
    setMessages([])
  }, [chatIdFromProp])

  // useEffect(() => {
  //   fetchPreviousChat();
  // }, [userChatId, job])

  useEffect(() => {
    (async function () {
      const jobDetails = window.sessionStorage.getItem("chatScreen")
      if (jobDetails) {
        window.sessionStorage.removeItem("chatScreen");
      }
      if (job) {
        const data = { chatId: job?.id, alertAlreadySend: "notSent",new_message_alert: false }
        await TwilioChatApi.twilioChatTableUpdate(data);
      } 
      try {
        const sessionStorageChatId = window.sessionStorage.getItem("chatId");
        if (sessionStorageChatId) {
          const data = { chatId: sessionStorageChatId, alertAlreadySend: "notSent",new_message_alert: false }
          await TwilioChatApi.twilioChatTableUpdate(data);
        }else{
          const data = { chatId: chatIdFromProp, alertAlreadySend: "notSent" ,new_message_alert: false}
          await TwilioChatApi.twilioChatTableUpdate(data);
        }
      } catch (error) {
        console.error("Debugging wrong messages intial reset", error)
      }
    })();

  }, [job,chatIdFromProp])

  useEffect(() => {
    setInterval(() => {
      setTimeStampRefresh((prevValue) => !prevValue);
    }, 60000);
  }, [])

  useEffect(() => {
    fetchChatOrCreate()
  }, [job,chatIdFromProp])

  // This socket is used to notify another user to refesh twilio chat panel of another side
  useEffect(() => {
    socket.on("refresh-twilio-chat-panel-send", (data) => {
      if (data?.job === job?.id) {
        setRefreshSocket(true);
        // setTimeout(function () {
        //   setScrollToChat(true);
        // }, 500)
      }
    })
  }, [socket])

  // This will auto-scroll the chat to the current chat portion
  useEffect(() => {
    if (scrollToChat) {
      const chatContainer = chatContainerRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
      setScrollToChat(false)
    }
  }, [scrollToChat]);

  useEffect(() => {
    if (conversationProxy) {
      setTimeout(function () {
        setLoadChat(false);
        if(chatIdFromProp){
        setdisableDiv(false)
        }
        setScrollToChat(true);
      }, 1000)
    }
  }, [conversationProxy]);

  const handleChatScroll = async (e) => {
    if (!loadMoreChat && e.target.scrollTop < 1) {
      setLoadMoreChat(true)
      if(nextPageUrl !=null){
      await fetchPreviousChatOnScroll()
      }
      setLoadMoreChat(false)
    }
  }

  const handleChatScrollButton = async (e) => {
    setLoadMoreChat(true)
    if(nextPageUrl !=null){
    await fetchPreviousChatOnScroll()
    }
    setLoadMoreChat(false)
  }

  const createOrFetchChatId = async (e) => {
    console.log('tech_id :::::', tech_id)
    if (tech_id) {
      let customerId = chatUser.id
      let technicianId = tech_id
      let chatId = `${customerId}_${technicianId}`
      setUserChatId(chatId)
      return chatId
    } else {
      return false
    }
  }
  // Function Depricated by Jagroop and Karun.
  const getChatIdForUser = async () => {
    let chatId = ''
    if (!tech_id && chatIdFromProp) {
      chatId = chatIdFromProp
    } else {
      chatId = await createOrFetchChatId()
    }
    return chatId
  }

  /**
* @description : This function will firstly try to fetch conversation room if not available then we will create a new conversation
* @response : Returns chat pannel
* @author : kartar singh
*/
  const fetchChatOrCreate = async () => {
    try {
      setLoadChat(true)
      if(chatIdFromProp){
      setdisableDiv(true)
      }
      let chatId = await getChatIdForUser()
      let techdata
      let techUser ={}
      if (tech_id) {
        let TechUserData = await UserApi.getUserById(tech_id)
        techUser= TechUserData
        techdata = { id: TechUserData.id, name: `${TechUserData.firstName} ${TechUserData.lastName}` }
      }

      let twilioData = {
        chatId: chatId ? chatId : (job ? job.id : null),
        technician: tech_id ? techdata : null,
        customer: user.userType === 'customer' ? { id: user.id, name: `${user.firstName} ${user.lastName}` } : null,
      };
      const responceChat = await TwilioChatApi.fetchTwilioConversation(twilioData)
      if (responceChat.twilioData.success) {
        const sid = responceChat?.twilioData?.conversation?.sid;
        const chatServiceSid = responceChat?.twilioData?.conversation?.chatServiceSid;
        setChatServiceSid(chatServiceSid);

        if (sid && chatServiceSid) {
          const getLatMessage = await TwilioChatApi.getTwilioUnreadMessageResponse(sid)
          console.log('getLatMessage :::::::::::::::::',getLatMessage)
          const addParticipat = await TwilioChatApi.addTwilioParticiants({ conversationSid: sid, userDetails: user, chatServiceSid: chatServiceSid, id: chatId ? chatId : (job ? job.id : null)})
          if (tech_id) {
            await TwilioChatApi.addTwilioParticiants({ conversationSid: sid, userDetails: techUser, chatServiceSid: chatServiceSid, id: chatId ? chatId : (job ? job.id : null) })
          }
          // We will only re-run fetch chat api if messages state is empty

          /*if (messages.length <= 0) {
            await fetchPreviousChat();
          }*/          
          await fetchPreviousChat();
          // Get Participant List by Id
          ChatParticiantsList(sid)
          // This will update user Joined Status which is important to join the chat
          userChatStatus(addParticipat?.twilioData?.token)
          setUserToken(addParticipat?.twilioData?.token)
          
          if(tech_id){
          setRefreshTechUseEffect(true)
          }
          // setLoadChat(false)
        }
      }else{
        console.log('twilio chat out side the responceChat')
      }
      // setLoadChat(false)
      // setScrollToChat(true)
    }
    catch (err) {
      console.log("error in fetchChatOrCreate", err)
      setLoadChat(false)
      if(chatIdFromProp){
        setdisableDiv(false)
      }
      setScrollToChat(false)
    }
  }

  // This will fetch chat of user  on the basis of chat id that is stored in database
  const fetchPreviousChat = async () => {
    try {
      let chatId = await getChatIdForUser()
      let dataToSend = chatId ? { chat_id: chatId } : { chat_id: job?.id };
      const chatResponce = await TwilioChatApi.getTwilioChatDetails(dataToSend)
      console.log('chatResponce :::::::::',chatResponce)
      if (chatResponce.conversation.length > 0) {
        const chatDetails = await TwilioChatApi.getTwilioChat(chatResponce?.conversation[0].twilio_chat_service?.sid, chatResponce?.conversation[0]?.twilio_chat_service?.chatServiceSid);
        if (chatDetails.formattedResponse.length > 0) {
          setMessages(chatDetails.formattedResponse)
          setNextPageUrl(chatDetails.nextPageUrl)
        }
      }
    } catch (error) {
      // Handle any errors that occurred during the function execution
      console.error('Error fetching previous chat:', error);
      // Optionally, you can display an error message to the user or take appropriate actions.
    }
  }

  const fetchPreviousChatOnScroll = async () => {
    let chatId = await getChatIdForUser()
    const chatResponce = await TwilioChatApi.getTwilioChatDetails(chatId ? chatId : job.id)
    const chatDetails = await TwilioChatApi.getTwilioChat(null, chatResponce?.conversation[0].twilio_chat_service?.chatServiceSid, nextPageUrl);
    if (chatDetails.formattedResponse.length > 0) {
      let previousMessages = [...messages];
      previousMessages.push(...chatDetails.formattedResponse);
      setNextPageUrl(chatDetails.nextPageUrl)
      setMessages(previousMessages)
    }
  }

  // This will fetch participant list of particular conversation group by sid
  const ChatParticiantsList = async (sid) => {
    try {
      const particiantsList = await TwilioChatApi.twilioParticiantsList({ conversationSid: sid })
      let particiantsAttribute = []
      particiantsList.twilioData.participants.forEach(particiant => {
        if (JSON.parse(particiant.attributes).userId !== user.id) {
          particiantsAttribute.push(JSON.parse(particiant.attributes));
        }
        // if (JSON.parse(particiant.attributes).userId !== user.id) {
        //   conversationProxy.updateLastReadMessageIndex(updatedMessages.length)
        // }
      });
      console.log('particiantsList :::::2', particiantsList)
      setParticipantsList(particiantsAttribute)
    } catch (error) {
      console.log("error while fetching participantlist", error);
      return;
    }
  }

  // This function is used to track the status of connction of conversation and help user to join the conversation
  const userChatStatus = (token) => {
    try {
      // Initializing Conversation Client
      const conversationsClient = new ConversationsClient(token);
      // Connecting to the Conversation and track conversation status
      conversationsClient.on("connectionStateChanged", (state) => {
        if (state === "connecting")
          setChatStatus({
            statusString: "Connecting to Chat ...",
            status: "default"
          });
        if (state === "connected") {
          setChatStatus({
            statusString: "You are connected.",
            status: "success"
          });
        }
        if (state === "denied")
          setChatStatus({
            statusString: "Facing issue while connecting your chat. Please refresh the page and try again",
            status: "error"
          });
      });
      // Join the conversation  on the basis of JobId
      conversationsClient.on("conversationJoined", async (conversation) => {
        let chatId = await getChatIdForUser()
        const friendlyName = conversation.friendlyName;
        const isFriendlyNameMatchingJobId = friendlyName === job?.id;
        const isFriendlyNameMatchingUserChatId = friendlyName === chatId;
        let checkId = chatId ? isFriendlyNameMatchingUserChatId : isFriendlyNameMatchingJobId;
        if (checkId) {
          setConversationProxy(conversation);
          if(conversation?.sid){
            const response  = await getLastReadMessageDetails(conversation?.sid);
            let lastReadMessageId =  response != false ? response : conversation?._internalState?.lastMessage?.index
            if(lastReadMessageId != null && lastReadMessageId >=0){
              conversation.updateLastReadMessageIndex(lastReadMessageId)
            }
          }
          if(chatId && !chatId.includes("job_")){

            if (chatId && chatId.includes("Admin_")) {
              const splitString = chatId.split('_');
              const extractedString = splitString.slice(1).join('_');
              console.log('extractedString :::::', extractedString)
  
              if (user.userType === 'customer') {
                socket.emit("refresh-twilio-unread-messages", {
                  customerUserId: extractedString
                })
              } else {
                socket.emit("refresh-twilio-unread-messages", {
                  technicianUserId: extractedString
                })
              }
            } else {
  
              const splitChatIdFromProp = chatId.split("_")
              socket.emit("refresh-twilio-unread-messages", {
                customerUserId: `${splitChatIdFromProp[0]}_${splitChatIdFromProp[1]}`,
                technicianUserId: `${splitChatIdFromProp[2]}_${splitChatIdFromProp[3]}`
              })
            }
          }
          
          // setConversationProxyGlobal(conversation)
          //  conversationProxy.updateLastReadMessageIndex(lastReadMessageIndex);
        }

      });
    } catch (error) {
      setChatStatus({
        statusString: "Facing issue while connecting your chat. Please refresh the page and try again",
        status: "error"
      });
    }
  }

 

  const getFinalChatId =()=>{
    let chatId;
    try {
      // if (tech_id) {
      //   let customerId = chatUser.id
      //   let technicianId = tech_id
      //   let chatId = `${customerId}_${technicianId}`
      //   setUserChatId(chatId)
      //   return chatId
      // }
      // Works only in case of Chat regarding a job. Technician, Customers, SuperAdmin Geeker
      if (job?.id) {
        chatId = job?.id
        return chatId;
      }
      if (window.sessionStorage.getItem("chatId")) {
        chatId = window.sessionStorage.getItem("chatId");
        return chatId;
      } 
      if (chatIdFromProp) {
        chatId = chatIdFromProp;
        return chatId;
      }
    } catch (error) {
      console.error("Debugging wrong messages getFinalChatId catch error:",error)
      return false
    }


  }


  useEffect(() => {
    (async function () {
      try {
        
        if(conversationProxy){
          let updatedMessages = [...messages];
          // let updatedMessages = [];
          conversationProxy.on("messageAdded", async (data) => {
            let lastReadMessageIndex =  data?.state?.index
            let lastReadMessageId = data?.state?.sid
            console.log("Debugging wrong messages Twillio messageAdded res ::", {chatIdFromProp, data})
            console.log("Debugging wrong messages Twillio messageAdded conversationProxy ::", {chatIdFromProp, conversationProxy})
            
            let chatId = getFinalChatId();

            const author = data?.state?.author
            const receiverUser = data?.conversation?._entity?.syncDocumentImpl?.descriptor?.data?.lastMessage?.author
            if(receiverUser == author &&  conversationProxy?.friendlyName && conversationProxy?.friendlyName == chatId){
              console.log("Debugging wrong messages updateLastReadMessageIndex of reveiver",{author, userID :user?.id, lastReadMessageIndex, data})
              conversationProxy.updateLastReadMessageIndex(lastReadMessageIndex)
            }
            if(author == user?.id){
              console.log("Debugging wrong messages updateLastReadMessageIndex",{author, userID :user?.id, lastReadMessageIndex})
              conversationProxy.updateLastReadMessageIndex(lastReadMessageIndex)
            }
            // If we get response of getFinalChatId as false then we will use chatId  from conversationProxy
            if(!chatId){
               console.error("IF YOU SEE THIS ERROR REPORT TO JAGROOP::",{chatId, currentChatId :  conversationProxy.friendlyName})
               chatId = conversationProxy.friendlyName
            }
            
            // chatId = job?.id ? job?.id : window.sessionSorage.getItem("chatId")
            // console.log("Debugging wrong messages Twillio chatid",chatId)
            let condition = conversationProxy?.friendlyName
            // is_author_exists_in_selected_chat

            let checkCondition = ( ( condition === chatId || condition === job?.id));
            console.log("Debugging wrong messages checkCondition::", {chatId, condition, job, userId:user.id}, condition === chatIdFromProp, condition === chatId, condition === job?.id)

            if (checkCondition) {
              
              // let updatedMessages = [];
              console.log("Debugging wrong messages updatedMessages",{updatedMessages})
              
              let imageUrl = (data.state.body === 'file has been uploaded' && data.state.media) ? await data.state.media.getContentTemporaryUrl() : false
              let mediaDetails = (data.state.body === 'file has been uploaded' && data.state.media) ? { chatServiceSid: chatServiceSid, mediaSid: data.state.media?.state?.sid } : {}
              let content_type = (data.state.body === 'file has been uploaded' && data.state.media) ? data.state.media.contentType : false
              updatedMessages = [{ senderName: data.state.attributes.userName, text: data.state.body, author: data.state.author, timeStamp: data.state.attributes.timeStamp, imageUrl: imageUrl, content_type: content_type, mediaDetails: mediaDetails }, ...updatedMessages];
              setMediaLoader(false)
              setMessages(updatedMessages);
             
              
              if(lastReadMessageIndex > 5 && conversationProxy?.sid){
              console.log("Debugging wrong messages nextPageUrl",{lastReadMessageIndex,sid :conversationProxy?.sid})
                 const url = `https://conversations.twilio.com/v1/Conversations/${conversationProxy?.sid}/Messages?Order=desc&PageSize=5&Page=1&PageToken=PT15`
                 setNextPageUrl(url)
              }
              // if(stepDeciderForDashboard === 15){
              //   conversationProxy.updateLastReadMessageIndex(lastReadMessageIndex)
              // }
            }
          })
          
          // conversationProxy.on("isOnline", async () => {
          //   console.log("Participant is online")
          // })
          setRefreshSocket(false);
        }

      } catch (error) {
        console.error('Error Twillio messageAdded:', error);
      }
    })()
  }, [conversationProxy])
  // }, [conversationProxy, refreshSocket, timeStampRefresh])

  const getLastReadMessageDetails=async(chatId)=>{
    try {
      const response = await TwilioChatApi.lastMessageSenderDetails(chatId);
      if(response && response?.index){
        console.log("Debugging wrong messages getLastReadMessageDetails initial", response?.index)
        return response?.index

      }
      return false;
    } catch (error) {
       return false;
    }
  }
  


  useEffect(() => {
    if(conversationProxy){
    // conversationProxy.on("messageAdded", async(data) => {
    //    const object = {
    //      phoneNumber :'98762869405', sender : "Technician", receiver :"Jagroop", receiverEmail : 'jagroop@yopmail.com', userType : "customer"
    //    }
    //   //  await TwilioChatApi.sendTwilioChatAlerts()
    // })

      (async function () { 
        const response = await conversationProxy.getUnreadMessagesCount();
        console.log("getUnreadMessagesCount", response) })();
  }
  }, [conversationProxy])

  // This function is used to send message
  const handleSendMessage = async () => {
    let chatId = await getChatIdForUser()
    let textMessage = inputRef.current.value;
    if (textMessage.length > 1000) {
      openNotificationWithIcon("error", "Error", "Characters limit exceeds !")
      return;
    }

    if (conversationProxy && textMessage.trim().length > 0 && !prepareFileToSend) {
      setDisableChatButton(true)
      const attribues = {
        timeStamp: new Date(),
        userName: user?.firstName + " " + user?.lastName,
        email: user?.email,
        userType : user?.userType 
      }
      conversationProxy.sendMessage(textMessage, attribues).then((message) => {
        inputRef.current.value = "";
      })
      
      if (job) {
        if (user.userType === 'customer' && job.customer.id === user.customer.id) {
          socket.emit("talk-js-notification", job.id)
          socket.emit("user-twilioChat-notification", { chatId: job.id, userType: user.userType })
        } else {
          if ((job?.technician?.id === user?.technician?.id) || (job?.post_again_reference_technician === user?.technician?.user)) {
            socket.emit("talk-js-notification-to-customer", job.id)
          }
          // socket.emit("user-twilioChat-notification-to-customer", job.id)
        }
        socket.emit("refresh-twilio-chat-panel", { "job": job.id })
      }


      let chatId = getFinalChatId();
      if (chatId) {
        const splitChatIdFromProp = chatId.split("_")
          socket.emit("user-twilioChat-notification", { chatId, userType: user.userType })
          socket.emit("user-twilioChat-notification-admin", { chatId, userType: user.userType })
          // socket.emit("user-twilioChat-notification-to-customer", chatId)
        
        if (chatId && !chatId.includes("job_")) {
          if (chatId && chatId.includes("Admin_")) {
            const splitString = chatId.split('_');
            const extractedString = splitString.slice(1).join('_');
            console.log('extractedString :::::', extractedString)

            if (user.userType === 'customer') {
              socket.emit("refresh-twilio-unread-messages", {
                customerUserId: extractedString
              })
            } else {
              socket.emit("refresh-twilio-unread-messages", {
                technicianUserId: extractedString
              })
            }
          } else {
            console.log('chat socket ::::4', {
              customerUserId: `${splitChatIdFromProp[0]}_${splitChatIdFromProp[1]}`,
              technicianUserId: `${splitChatIdFromProp[2]}_${splitChatIdFromProp[3]}`
            })
            socket.emit("refresh-twilio-unread-messages", {
              customerUserId: `${splitChatIdFromProp[0]}_${splitChatIdFromProp[1]}`,
              technicianUserId: `${splitChatIdFromProp[2]}_${splitChatIdFromProp[3]}`
            })
          }
        }
        socket.emit("refresh-twilio-chat-panel", chatId)
      }

      setScrollToChat(true);
      setTimeout(function () {
        setDisableChatButton(false)
      }, 500)
    } else if (conversationProxy && prepareFileToSend) {
      setMediaLoader(true)

      const attribues = {
        timeStamp: new Date(),
        userName: user?.firstName + " " + user?.lastName,
        email: user?.email,
        userType : user?.userType 
      }

      await conversationProxy.prepareMessage()
        .setBody('file has been uploaded')
        .addMedia(prepareFileToSend)
        .setAttributes(attribues)
        .build()
        .send()

      inputRef.current.value = "";
      setPrepareFileToSend(null);
      // this will reset the file and with this one can upload same file in the chat
      fileInputRef.current.value = null;
      // if (job) {
      //   if (user.userType === 'customer') {
      //     socket.emit("talk-js-notification", job.id)
      //   } else {
      //     socket.emit("talk-js-notification-to-customer", job.id)
      //   }
      //   // here we are refetchning the chat as we want to show the names as well of uploaded docs
      // }
    }
    setShouldFocusInputRef(true)
  };

  const containerStyle = {
    width: width,
    minHeight: height,
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    boxShadow: '1px 1px 10px 1px rgb(136, 136, 136)',
  };

  const handleFileInputChange = async (event) => {
    setScrollToChat(true)
    const selectedFile = event.target.files[0];

    if (selectedFile.size > 15 * 1024 * 1024) {
      // File size exceeds 1MB
      openNotificationWithIcon("error", "Error", "File size exceeds 15MB!")
      return;
    }
    var formdata = new FormData();
    formdata.append("file", selectedFile);
    setPrepareFileToSend(formdata)
    inputRef.current.value = selectedFile.name;
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  if (loadChat) {
    return (
      <div className="loader-name-style" style={{ ...containerStyle, ...style }}>
        <h5 className="d-flex flex-column mb-3">
          {chatStatus.statusString ? chatStatus.statusString : 'Loading Chat'}
        </h5>
        <Spin style={{ fontSize: '20px' }} />
      </div>
    )
  }
  return (
    <div className="d-flex flex-column" style={{ ...containerStyle, ...style }}>
      <div className="chat-header d-flex align-items-center pl-3">
        <img src={geekerLogo} width={'50px'} height={'50px'} className="geek-icon-style" alt="bellIcon" />
        <div className="d-flex flex-column">
          <div className='d-flex row names-style'>
            {participantsList?.length > 0 && participantsList.map((item, index) => {
             return(
              item.userType && item.userType !="SuperAdmin"  ? 
              <span key={index}><b>{item.name}{index !== participantsList.length - 1 ? `${" "} \u00A0` : " "}</b></span> :""
             );
})}
          </div>
          <span style={{ fontSize: '13px' }}>{job?.software?.name}</span>
        </div>
      </div>

      <div id='scrollToChat' onScroll={handleChatScroll} ref={chatContainerRef} className="chat-display-box chat-container justify-content-end" style={{ height: `calc(${height} - 110px)`, overflowY: 'scroll' }}>
        {loadMoreChat && <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>}
        {nextPageUrl &&
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button onClick={handleChatScrollButton} >load more</Button>
          </Box>
        }
        <div className="d-flex flex-column-reverse justify-content-start" style={{ height: "auto", minHeight: '100%' }}>
          {mediaLoader &&
            <div className="d-flex align-self-end " style={{ marginRight: '20px' }}>
              <Loader height="50%" />
            </div>
          }
          {messages.map((message, index) => (
            message.author === user.id ? (
              <div key={index} className="message-div d-flex flex-column align-self-end align-items-end">
                <div className='row' style={{ margin: 0, display: 'flex', justifyContent: 'end' }}>
                  <h6 className="chat-customer-name">{message?.senderName}</h6>
                </div>
                {message.imageUrl ? (
                  <a href={`${SERVER_URL}/api/twilio-chat/get-media-link-updated?chatServiceSid=${message?.mediaDetails?.chatServiceSid}&mediaSid=${message?.mediaDetails?.mediaSid}`} target="_blank" >
                    {(message.imageUrl && message.content_type.includes('image/')) ?
                      <img src={message.imageUrl} style={{ maxHeight: '160px', }} /> : <img src={document} style={{ maxHeight: '80px', }} />}
                    <p className='media-name-style'>{message.mediaName}</p>
                  </a>
                )
                  : (
                    <div className="me-chat-div" style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: "column" }}>
                      <div dangerouslySetInnerHTML={{ __html: message.text }} />

                      <span className='chat-time-style'>{message.timeStamp && formatDateOfTwilioMessage(message.timeStamp)}</span>
                    </div>

                  )
                }
              </div>
            ) : (
              <div key={index} className="message-div d-flex flex-column">
                <h6 className="chat-customer-name">{message?.senderName}</h6>
                {
                  message.imageUrl ? (
                    <a href={`${SERVER_URL}/api/twilio-chat/get-media-link-updated?chatServiceSid=${message?.mediaDetails?.chatServiceSid}&mediaSid=${message?.mediaDetails?.mediaSid}`} target="_blank" >
                      {(message.imageUrl && message.content_type.includes('image/')) ?
                        <img src={message.imageUrl} style={{ maxHeight: '160px', }} /> : <img src={document} style={{ maxHeight: '80px', }} />}
                      <p className='media-name-style'>{message.mediaName}</p>
                    </a>)
                    :
                    (
                      <div className="me-chat-div-reverse" style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: "column" }}>
                        <div dangerouslySetInnerHTML={{ __html: message.text }} />
                        <span className='chat-time-style'>{message.timeStamp && formatDateOfTwilioMessage(message.timeStamp)}</span>
                      </div>
                    )
                }
              </div>
            )
          ))}
        </div>
      </div>

      <div className="chat-input-box d-flex align-items-center">
        <ChatTextInput
          inputRef={inputRef}
          mediaLoader={mediaLoader}
          disableChatButton={disableChatButton}
          focusToInput={shouldFocusInputRef}
          style={{
            width: '90%',
            height: '100%',
            padding: '10px',
            border: 'none',
            outline: 'none',
          }}
          keyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }} />

        <input
          type="file"
          id="attach-file"
          disabled={mediaLoader}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          ref={fileInputRef}
        />
        <IconButton aria-label="attach-file" component="span" onClick={handleIconClick} disabled={mediaLoader} style={{ transform: 'rotate(45deg)', marginRight: '10px' }}
        >
          <AttachFileIcon />
        </IconButton>

        <IconButton
          style={{ backgroundColor: '#1bd4d5', color: 'white', marginRight: '15px' }}
          onClick={handleSendMessage}
          disabled={disableChatButton || mediaLoader}
        >
          <SendIcon />
        </IconButton>

      </div>
    </div>
  );
};

export default React.memo(ChatPanelTwilio);
