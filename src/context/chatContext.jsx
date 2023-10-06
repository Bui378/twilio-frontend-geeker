import React,{useState} from 'react';
import * as ChatServiceApi from '../api/chat.api';
import {useAuth} from './authContext';
import {useJob} from './jobContext';
import {TALK_PROJECT_ID} from '../constants'
import * as JobApi from '../api/job.api';
const ChatEngineContext = React.createContext({})

function ChatEngineProvider(props){
	const {updateUserInfo,chatUser,setChatUser} = useAuth();
	const [chatDetails,setChatDetails] = useState(null);
	const {updateJob} = useJob()
	async function newChatUser(data,id){
		try{
			let createdUser = await ChatServiceApi.createChatUser(data)
			if (createdUser?.id){
				setChatUser(createdUser)
				let dataToupdate = {"userChatId":createdUser.id,userId:id,userChatUsername:createdUser.username}
				await updateUserInfo(dataToupdate)
				return createdUser.username
			}
			else{
				// return {"success":false,"message":createdUser.message}
				console.log("user is not created::::")
			}
		}
		catch(err){
			console.log("error in context newChatUser::::",err)
		}


	}
	async function createNewChat(data,id){
		// {
	 // "title": "Chat name",
 	// 	"is_direct_chat": false
	// }
		try{
			let createdChat = await ChatServiceApi.createChat(data,chatUser)
			if(createdChat?.id){
				setChatDetails(createdChat)
				let dataToupdate = {"chatRoomId":createdChat.id}
				updateJob(id,dataToupdate)	
			}
			return createdChat
		}
		catch(err){
			console.log("error in context createNewChat ::::",err)
		}
	}

	async function getChatUser(id){
		try{
			let existingChatUser = await ChatServiceApi.getChatUser(id)
			if(existingChatUser?.id){
				setChatUser(existingChatUser)
			}

		}
		catch(err){
			console.log("error in context getChatUser ::::::",err)
		}
	}

	async function createChatUsers(data){
		try{
			let createdChatUser = await ChatServiceApi.addNewTalkChatUser(data)
			if (createdChatUser){
				let dataToupdate = {"userChatId":data.id,userId:data.id,userChatUsername:data.firstName}
				await updateUserInfo(dataToupdate)
				console.log("Talk user created successfully and user table updated")
				return true
			}
			else{
				console.log("Talk user not created :::")
				return false
			}

		}
		catch(err){
			console.log("error in createChatUsers >>>",err)
			return false
		}
	}

	/**
		* this function creates chat user if not created and update to database 
		* @params : user(Type:Object),
		* @response : Returns Boolean
		* @author : kartar singh
	**/
	async function createGroupChatUsers(data){
		try{
			let createdChatUser = await ChatServiceApi.addNewTalkChatUser(data)
			if (createdChatUser){
				let dataToupdate = {"userChatId":data.id,userId:data.id,userChatUsername:data.firstName}
				await updateUserInfo(dataToupdate)
				return true
			}
			else{
				return false
			}

		}
		catch(err){
			console.log("error in createChatUsers >>>",err)
			return false
		}
	}
	async function getTalkChatUser(data){
		try{
			let talkChatUser = await ChatServiceApi.getTalkChatUser(data)
			if(talkChatUser){
				return talkChatUser
			}
			else{
				return false
			}
		}
		catch(err){
			console.log("error in getChatUser ::",err)
		}
	}

	/**
		* this function Create Session for current user   
		* @params : user(Type:Object),
		* @response : Returns Boolean
		* @author : kartar singh
	**/

	async function createTalkUserSession(talkChatUser){
		try{
			let sessionCreated = await ChatServiceApi.createUserSession(talkChatUser)
			if(sessionCreated){
				return sessionCreated
			}
			else{
				console.log("Session Not Created")
				return false
			}
		}
		catch(err){
			console.log("error in getTalkChatUsersAndCreateSession >>>",err)
			return false
		}
	}

	async function createOrGetTalkChatConversation(data){
		try{
			let conversation = await ChatServiceApi.getTalkChatConversation(data)
			if(!conversation){
				let conversationCreated = await ChatServiceApi.createTalkChatConversation(data)
				if(conversationCreated){
					let newConversation = await ChatServiceApi.getTalkChatConversation(data)
					let dataToupdate = {"chatRoomId":newConversation.id}
					await updateJob(data.id,dataToupdate)
					return newConversation
				}
			}
			console.log("conversation found")
			return conversation
		}
		catch(err){
			console.log("error in createOrGetTalkChatConversation :::",err)
			return false
		}
	}

	/**
		* this function get  ConversationGroup if not then creates it  ConversationGroup
		* @params : user(Type:Object),
		* @response : Returns Boolean
		* @author : kartar singh
	**/

	async function createOrGetTalkChatConversationGroup(data){
		try{
			let conversation = await ChatServiceApi.getTalkChatConversation(data)
			if(!conversation){
				let conversationCreated = await ChatServiceApi.createTalkChatConversation(data)
				if(conversationCreated){
					let newConversation = await ChatServiceApi.getTalkChatConversation(data)
					let dataToupdate = {"groupRoomId":newConversation.id}
					await updateJob(data.id,dataToupdate)
					return newConversation
				}
				else{
					console.log("conversationCreated >>>>>>>>>",conversationCreated)
				}
			}
			return conversation
		}
		catch(err){
			console.log("error in createOrGetTalkChatConversation :::",err)
			return false
		}
	}


	async function joinTalkChatConversation(data){
		try{
			let conversationInbox =  await ChatServiceApi.joinTalkChatConversation(data)
			return conversationInbox
		}
		catch(err){
			console.log("error in joinTalkChatConversation")
			return false
		}
	}

	async function joinTalkChatConversationPending(data){
		try{
			let conversationInbox =  await ChatServiceApi.joinTalkChatConversationPending(data)
			console.log("joinTalkChatConversationPending kkk >>>>",conversationInbox)
			return conversationInbox
		}
		catch(err){
			console.log("error in joinTalkChatConversationPending")
			return false
		}
	}

	/**
	 * join  participants to  group Chat
	 * @params = data (Type:Object) 
	 * @response : data
	 * @author : kartar
    */

	async function joinTalkChatConversationGroup(data){
		try{
			let conversationInbox =  await ChatServiceApi.joinTalkChatConversationGroup(data)
			return conversationInbox
		}
		catch(err){
			console.log("error in joinTalkChatConversationGroup")
			return false
		}
	}

	/**
		* getOrCreates a chat user and create session for chat user
		* @params : user(Type:Object),
		* @response : Returns user and create a talk chat session for user
		* @author : Sahil
	**/

    async function handleTalkChatUser(user){
		try {		
			let chatUser =  await ChatServiceApi.getTalkChatUser(user)
			if (!chatUser) {
				let dataToCreateUser = {
					"name": user.firstName,
					"id": user.id,
					"chatId": user.id,
					"role": user.userType
				}
				let createChatUser = await createChatUsers(dataToCreateUser)
				if (createChatUser) {
					let userCreated = await ChatServiceApi.getTalkChatUser(user)
					return userCreated
				}
			}
			else {
				return chatUser
			}

		}
		catch (err) {
			console.log("error in handleTalkChat ::: ", err)
			return false
		}
	}

	

	return (
		<ChatEngineContext.Provider 
		value={{
				newChatUser,
				createNewChat,
				getChatUser,
				createChatUsers,
				createGroupChatUsers,
				getChatUser,
				createTalkUserSession,
				joinTalkChatConversation,
				joinTalkChatConversationPending,
				createOrGetTalkChatConversation,
                joinTalkChatConversationGroup,
	            createOrGetTalkChatConversationGroup,
				handleTalkChatUser

			}}
			{...props} 
		/>
	);
}

function useChatEngineTools(){
	const context = React.useContext(ChatEngineContext)
	if (context === undefined) {
    	throw new Error('useChatEngineTools must be used within a chatEngineProvider');
  	}
  return context;
}

export {ChatEngineProvider,useChatEngineTools};