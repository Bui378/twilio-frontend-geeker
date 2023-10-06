import ChatPanelTwilio from 'components/ChatPanelTwilio'
import React, { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import { useEffect } from 'react';
import * as JobApi from '../../../api/job.api'
import { useSocket } from 'context/socketContext';
import Badge from '@mui/material/Badge';
import './style.css';
import { Spin } from 'antd';
import Alert from '@mui/material/Alert';
import { useHistory, useLocation } from 'react-router';
import * as TwilioChatApi from '../../../api/twilioChat.api';

function MessageTab({ user }) {
    const { socket } = useSocket();
    const [userTwilioData, setUserTwilioData] = useState([])
    const [chatId, setChatId] = useState('')
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [refreshTechUseEffect, setRefreshTechUseEffect] = useState(false)
    const [notificationDot, setNotificationDot] = useState([])
    const [loadChat, setLoadChat] = useState(false);
    const [disableDiv, setdisableDiv] = useState(false)
    const [noConversationLoad, setNoConversationLoad] = useState(false)
    const [refreshTechChat, setrefreshTechChat] = useState(false)
    const location = useLocation();
    const history = useHistory() 
    const queryParams = new URLSearchParams(location.search);
    const tech_id = queryParams.get('message') ? queryParams.get('message') : false;
    function stringToColor(string) {
        let hash = 0;
        let i;

        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';
        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    }
    function stringAvatar(name) {
        const initials = name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase(); // Convert the initials to uppercase
    
        return {
            sx: {
                bgcolor: stringToColor(name), // You need to define the stringToColor function
            },
            children: initials,
        };
    }

    const dynamicClassName = user.userType === 'technician' ? 'col-md-9' : 'col-md-9';

    useEffect(() => {
        console.log("Debug new message twillio userType :::", user.userType)
        if(!tech_id){
            if (user.userType === 'technician') {
                socket.on("user-twilioChat-notification-tech", (activeChatId) => {
                    console.log('twilio chat data :::1',userTwilioData)
                    showNotificationDot(activeChatId)
                    
                    SortListOfUsersById(activeChatId)
                })
            }else{
                socket.on("user-twilioChat-notification-to-customer", (activeChatId) => {
                    console.log('twilio chat data :::3',userTwilioData)
                    console.log('inside the customer ::',activeChatId)
                    showNotificationDot(activeChatId)
                    SortListOfUsersById(activeChatId)
                })
            }
            socket.on("user-twilioChat-notification-admin", (activeChatId) => {
                console.log('twilio chat data :::2',userTwilioData)
                showNotificationDot(activeChatId)
                SortListOfUsersById(activeChatId)
            })
                socket.on("user-twilioChat-refresh-tech", (activeChatId) => {
                    if (activeChatId === chatId) {
                        setrefreshTechChat(true)
                    }
                })
        }
    }, [socket, chatId])


    // This function will put recent messages on top : ~ Jagroop
    const SortListOfUsersById = (activeChatId) => {

        if (userTwilioData && userTwilioData.length > 0) {
            // Create a new array to store the rearranged results.
            let sortedResult = [];

            // Loop through the original array and add the elements to the new array, keeping the input id first.
            for (let i = 0; i < userTwilioData.length; i++) {
                if (userTwilioData[i].chat_id == activeChatId) {
                    sortedResult.push(userTwilioData[i]);
                }
            }

            // Loop through the original array again and add the remaining elements to the new array, sorted by id.
            for (let i = 0; i < userTwilioData.length; i++) {
                if (userTwilioData[i].chat_id !== activeChatId) {
                    sortedResult.push(userTwilioData[i]);
                }
            }
            if (userTwilioData.length == sortedResult.length) {
                setUserTwilioData(sortedResult)
            }


        }
    }

    const showNotificationDot = (activeChatId) => {
        let finalChatId = getChatId();
        console.log('Debug new message twillio socket :::', { activeChatId, finalChatId, comparison: activeChatId !== finalChatId })
        if (finalChatId !== '' && activeChatId !== finalChatId) {
            console.log('Debug new message twillio message from not active tab.', { notificationDot, activeChatId })
            setNotificationDot(prevNotificationDot => {
                if (!prevNotificationDot.includes(activeChatId)) {
                    return [...prevNotificationDot, activeChatId];
                } else {
                    return prevNotificationDot;
                }
            });
        } else {
            if (notificationDot.includes(activeChatId)) {
                console.log("Debug new message twillio  activeTab", { activeChatId })
                const filteredResult   = notificationDot.filter(item => item !== activeChatId)
                setNotificationDot(filteredResult)
            }
        }
    }

    const getChatId = () => {
        try {
            const finalChatId = window.sessionStorage.getItem("chatId")
            if (finalChatId) {
                return finalChatId;
            } else {
                return chatId
            }
        } catch (error) {
            return chatId
        }
    }
    

    useEffect(() => {
        console.log("My console to chk 5", notificationDot)
    }, [notificationDot])

    useEffect(() => {
        if(userTwilioData && userTwilioData.length > 0){
            console.log("My console to chk userTwilioData", userTwilioData)
            for (let i = 0; i < userTwilioData.length; i++) {
                if(userTwilioData[i].new_message_alert){
                    console.log("My console for userTwilioData", userTwilioData[i].new_message_alert)
                    console.log("My console for userTwilioData 2", userTwilioData[i])
                    setNotificationDot(prevNotificationDot => {
                        if (!prevNotificationDot.includes(userTwilioData[i].chat_id)) {
                            return [...prevNotificationDot, userTwilioData[i].chat_id];
                        } else {
                            return prevNotificationDot;
                        }
                    });
                }
            }
        }
    }, [userTwilioData])

    useEffect(() => {
        (async function () {
            if (refreshTechUseEffect) {
                setLoadChat(false)
                setNoConversationLoad(false)
                socket.emit("user-twilioChat-refresh-chat", chatId)
            }
            await fetchTwilioChatDetails()
        })()
    }, [refreshTechUseEffect, refreshTechChat, socket]); // Add

    const fetchTwilioChatDetails = async () => {
        try {
            setLoadChat(true)
            let queryParam;
            if (user.userType === 'technician') {
                queryParam = { 'technician.id': user.id };
            } else {
                queryParam = { 'customer.id': user.id };
            }
            const chatResponse = await JobApi.getTwilioChatUserDetails(queryParam);
            console.log('chat responce ::::::', chatResponse)

            if (chatResponse.conversation.length > 0) {
                setUserTwilioData(chatResponse.conversation)

                if (chatId === '') {
                    const chatId = chatResponse.conversation[0].chat_id
                    console.log("Debugging wrong messages setChatId",chatId)
                    window.sessionStorage.setItem('chatId',chatId)
                    setChatId(chatId)
                    setSelectedChatId(chatId)
                }
                if (tech_id){
                    let customerId = user.id
                    let technicianId = tech_id
                    let chatId = `${customerId}_${technicianId}`
                    window.sessionStorage.setItem('chatId',chatId)
                    setChatId(chatId)
                    setSelectedChatId(chatId)
                }
                setLoadChat(false)
            }
            else {
                if (!tech_id) {
                    setLoadChat(false)
                    setNoConversationLoad(true)
                }
            }
        } catch (error) {
            setLoadChat(false)
            setNoConversationLoad(false)
            console.error('Error fetching chat details:', error);
        }
    }

  

    const handelChatId = async (id) => {
        if(tech_id){
            deleteParams();
        }
        if (id !== chatId) {
            console.log("Debugging wrong messages setChatId", id)
            window.sessionStorage.setItem('chatId', id)
            setChatId(id)
            setSelectedChatId(id)
            const indexToRemove = notificationDot.indexOf(id);
            if (indexToRemove !== -1) {
                notificationDot.splice(indexToRemove, 1);
            }
            socket.emit("calculate-unread-twiio-messages", { user })
        }
    }

    const deleteParams = () => {
        try {
            if (queryParams.has('message')) {
                queryParams.delete('message')
                history.replace({
                    search: queryParams.toString(),
                })
            }
            return;
        } catch (error) {
            return;
        }
    }

    if (loadChat) {
        return (
            <div className="d-flex container h-100  justify-content-center align-items-center "
                style={{ minHeight: "60vh" }} >
                <div className='d-flex flex-column'>
                    <Alert severity="info">Loading — conversations!</Alert>
                    <Spin size="large" className='mt-5' />
                </div>
            </div>
        );
    }
    if (noConversationLoad) {
        return (
            <div className="col-12 text-center mt-2 py-5">
                <h4 className="bg-level-1 w-80 py-5 radius-4 border">Currently you didn't have any chat message.</h4>
            </div>
        );
    }

    return (
        <div className='col-12'>
            <div className="row h-100 main-outer-container mt-4">

                {/* {userTwilioData && userTwilioData.length > 0 && */}
                <>
                    <div className="col-md-3 chat-participants-container" >
                        <div className="tech-container">
                            <div className=''>
                                <p className='tech-name-heading'>Message Center</p>
                            </div>
                            {user.userType === 'technician' &&
                                // userTwilioData.length > 0 && userTwilioData.map((item, index) => (
                                userTwilioData && userTwilioData.length > 0 && userTwilioData.map((item, index) => {
                                    console.log('userTwilioData012 555:::::', selectedChatId === item.chat_id)

                                    return (
                                        <div onClick={() => { handelChatId(item.chat_id) }} className={`tech-name-div-1 mb-3 ${selectedChatId === item.chat_id ? 'selected' : ''}  ${disableDiv ? 'disabled-state' : ''}`} key={index}>
                                            <div className='d-flex justify-content-between align-items-center pr-2'>
                                                <div className='d-flex align-items-center'>
                                                <Avatar
                                                        style={{ fontSize: '14px', width: '30px', height: '30px', marginRight: '10px' }}
                                                        {...stringAvatar(`${item?.customer ? item?.customer.name :'Admin'}`)}
                                                    />
                                                    <span style={{ fontWeight: 'bold' }}>{`${item?.customer ? item?.customer.name :'Admin'}`}</span>
                                               </div>
                                                <Badge className='badge-notification-style' sx={{ "& .MuiBadge-badge": { zIndex: 100, backgroundColor: `${(notificationDot.includes(item.chat_id)) && !(selectedChatId === item.chat_id) ? 'red' : ''} ` } }} variant="dot">
                                                {/* <Badge className='badge-notification-style' sx={{ "& .MuiBadge-badge": { zIndex: 100, backgroundColor: `${(item.new_message_alert || notificationDot.includes(item.chat_id)) && !(selectedChatId === item.chat_id) ? 'red' : ''} ` } }} variant="dot"> */}
                                                </Badge>
                                            </div>

                                        </div>
                                    )
                                })
                            }
                            {user.userType === 'customer' &&
                                userTwilioData && userTwilioData.length > 0 && userTwilioData.map((item, index) => {
                                    return (
                                        <div onClick={() => { handelChatId(item.chat_id) }} className={`tech-name-div-1 mb-3 ${selectedChatId === item.chat_id ? 'selected' : ''} ${disableDiv ? 'disabled-state' : ''}`} key={index}>
                                            <div className='d-flex justify-content-between align-items-center pr-2'>
                                                <div className='d-flex align-items-center'>
                                                <Avatar
                                                        style={{ fontSize: '14px', width: '30px', height: '30px', marginRight: '10px' }}
                                                        {...stringAvatar(`${item.technician ? item.technician.name : 'Admin'}`)}
                                                    />
                                                    <span style={{ fontWeight: 'bold' }}>{`${item.technician ? item.technician.name :'Admin'}`}</span>
                                                    {/* <span style={{ fontWeight: 'bold' }}>{item.firstName} {item.lastName}</span> */}
                                                </div>
                                                <Badge className='badge-notification-style' sx={{ "& .MuiBadge-badge": { zIndex: 100, backgroundColor: `${(notificationDot.includes(item.chat_id)) && !(selectedChatId === item.chat_id) ? 'red' : ''} ` } }} variant="dot">
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                        </div>
                    </div>

                    <div className={`${dynamicClassName} new-mb-chat`} >
                        {user.userType === 'technician' && chatId !== '' &&
                            <ChatPanelTwilio setdisableDiv={setdisableDiv} chatIdFromProp={chatId} setRefreshTechUseEffect={setRefreshTechUseEffect} chatUser={user} width={'100%'} height={'500px'} job={null} />
                        }
                        {user.userType === 'customer' &&
                            <ChatPanelTwilio setdisableDiv={setdisableDiv} chatIdFromProp={chatId} setRefreshTechUseEffect={setRefreshTechUseEffect} chatUser={user} width={'100%'} height={'500px'} job={null} />
                        }
                    </div>
                </>
            </div>
        </div>
    )
}

export default React.memo(MessageTab)