import {chatApiClient,talkChatApiClient} from './index';
import axios from 'axios';
import {CHAT_URL,CHAT_PROJECT_PRIVATE_KEY,CHAT_APP_PASS,CHAT_PROJECT_KEY,TALK_PROJECT_ID } from '../constants';
import Talk from 'talkjs';
let chats_url = CHAT_URL+"/chats/"
export async function createChatUser(data) {

	/**
	 * Creates a chat user with the given data
	 * @params = data (Type:Object)
	 * @response : it returns an object which have chat user details in it.
	 * @author : Sahil
	*/

	try{
		return chatApiClient
		.post('/users', data)
		.then(response => {
			// console.log("response billing-details :::",response)
			if (response) {
				// console.log("response of createChatUser :::::::::::",response)
				return response.data;
			}
			return Promise.reject();
		})
		.catch((err)=>{
			console.log("error in createChatUser api ::::::",err)
		})
	}
	catch(err){
		console.log("error in createChatUser :::::",err)
	}
}

/**
	 * Get Chat user from api according to id
	 * @params = id (Type:Number)
	 * @response : it returns an Object which consist of chat user details in it.
	 * @author : Sahil
*/
export async function getChatUser(id) {
	
	try{
		return chatApiClient
		.get(`/users/${id}`)
		.then(response => {
			// console.log("response billing-details :::",response)
			if (response) {
				// console.log("response of createChatUser :::::::::::",response)
				return response.data;
			}
			return Promise.reject();
		})
		.catch((err)=>{
			console.log("error in getChatUser api ::::::",err)
		})

	}
	catch(err){
		console.log("error in getChatUser :::::::",err)
	}
		
}

/**
	 * Get all users in the api
	 * @params = id (Type:Number)
	 * @response : it returns an Object which consist of all chat users details in it.
	 * @author : Sahil
*/
export async function getUsers(){
	try{
		return chatApiClient
		.get('/users')
		.then(response => {
			if (response) {
				console.log("response of creating a chat  :::::::::::",response)
				return response.data;
			}
			return Promise.reject();
		})
		.catch((err)=>{
			console.log("error in createChatUser api ::::::",err)
		})
	}
	catch(err){
		console.log("error in getUsers ::::",err)
	}
	
}
/**
	 * Creates a chat in api with the given details
	 * @params = data (Type:Object) , userData (Type:Object)
	 * @response : it returns an Object which consist of created chat details in it.
	 * @author : Sahil
*/
export async function createChat(data,userData){
	//Data Example
	// {
	 // "title": "Chat name",
 	// 	"is_direct_chat": false
	// }

	try{
		const res = await axios.put(chats_url,data,{
			headers:{
				'Project-ID':CHAT_PROJECT_PRIVATE_KEY,
				'PUBLIC-KEY':CHAT_PROJECT_KEY,
				'USER-NAME':userData.username,
				'USER-SECRET':CHAT_APP_PASS
			}
		}
		)
		return res.data
	}	
	catch(err){
		console.log("error in createChat :::::",err)
	}

	
}


/**
	 * Get Chat details according to data
	 * @params = data (Type:Object) , userData (Type:Object)
	 * @response : it returns an Object which consist of  chat details in it.
	 * @author : Sahil
*/

export async function getChatDetails(data,userData){
	try{
		axios.post(chats_url+data.ChatId,{
		headers:{
			'Project-ID':CHAT_PROJECT_PRIVATE_KEY,
			'User-Name':userData.username,
			'User-Secret':CHAT_APP_PASS
			},
		},
		{"data":data}
		)
	}
	catch(err){
		console.log("error in getChatDetails ::::::::",err)
	}
}

/**
	 * delete chat according to data
	 * @params = data (Type:Object) , userData (Type:Object)
	 * @response : This api is used to delete the already created chats
	 * @author : Sahil
*/
export async function deleteChat(data,userData){
	
	try{
		axios.delete(chats_url+data.ChatId,{
		headers:{
			'Project-ID':CHAT_PROJECT_PRIVATE_KEY,
			'User-Name':userData.username,
			'User-Secret':CHAT_APP_PASS
			}
		},
		{"data":data}
		)
	}
	catch(err){
		console.log("error in deleteChat :::::",err)
	}
}


/**
	 * Add members in existing chat 
	 * @params = data (Type:Object) , userData (Type:Object),memberData: (Type:Object)
	 * @response : This api is used to add members in already created chats
	 * @author : Sahil
*/
export async function addMembersInChat(data,userData,memberData){
	try{
		axios.post(chats_url+data.chatId+'/people/',{
		headers:{
			'Project-ID':CHAT_PROJECT_PRIVATE_KEY,
			'User-Name':userData.username,
			'User-Secret':CHAT_APP_PASS
			},
		},
		{"data":{"username":memberData.username}}
		)
	}
	catch(err){
		console.log("error in addMembersInChat ::::",err)
	}
	
}


/**
	 * Delete members in existing chat 
	 * @params = data (Type:Object) , userData (Type:Object),memberData: (Type:Object)
	 * @response : This api is used to delete members in already created chats
	 * @author : Sahil
*/
export async function deleteMembersFromChat(data,userData,memberData){
	try{
		axios.put(chats_url+data.chatId+'/people',{
		headers:{
			'Project-ID':CHAT_PROJECT_PRIVATE_KEY,
			'User-Name':userData.username,
			'User-Secret':CHAT_APP_PASS
			}
		},
		{"data":{"username":memberData.username}}
		)
	}

	catch(err){
		console.log("error in deleteMembersFromChat::::::",err)
	}
}


/**
	 * Create new chat user 
	 * @params = data (Type:Object) 
	 * @response : This api is used to create new chat user
	 * @author : Sahil
*/
export async function addNewTalkChatUser(data){

	try{
		 let res = await talkChatApiClient.put(`/users/${data.chatId}`,data)
		 if (res.status == 200){
		 	return res
		 }
		 else{
		 	return false
		 }
	}

	catch(err){
		console.log("error in addNewTalkChatUser::::::",err)
		return false
	}
}


/**
	 * Create Session for current user 
	 * @params = user (Type:Object) 
	 * @response : This api is used to create a user session
	 * @author : Sahil
*/

export async function createUserSession(user){
	try{
		let talkUser = new Talk.User(user)
		window.talkSession = new Talk.Session({
		  appId: TALK_PROJECT_ID,
		  me: talkUser,
		});
		return true
	}
	catch(err){
		console.log("error in createUserSession >>>",err)
		return false
	}
}


/**
	 * get talk chat user 
	 * @params = id (Type:Number) 
	 * @response : This api is used to get talk chat user with id
	 * @author : Sahil
*/
export async function getTalkChatUser(data){
	try{
		 let res = await talkChatApiClient.get(`/users/${data.id}`)
		 if (res.status == 200){
		 	return res.data
		 }
		 else{
		 	return false
		 }
		 
	}

	catch(err){
		return false
		console.log("error in addNewTalkChatUser::::::",err)
	}
}

    /**
\		* this function find the chat user from talkjs with id 
		* @params : user(Type:id),
		* @response : user data
		* @author : kartar singh
	**/

export async function getTalkGroupChatUser(data){
	try{
		 let res = await talkChatApiClient.get(`/users/${data.id}`)
		 if (res.status == 200){
		 	return res.data
		 }
		 else{
		 	return false
		 }
		 
	}

	catch(err){
		return false
		console.log("error in addNewTalkChatUser::::::",err)
	}
}



/**
	 * Create Chat users for client  
	 * @params = user (Type:Number) 
	 * @response : Create Talk session users for client
	 * @author : Sahil
*/
export async function createTalkChatUser(user){
	try{
		await Talk.ready.then(()=>{
			let me = new Talk.User({
				id:user.id,
				name:user.name,
				role:user.role
			})
			return me
		})
	}
	catch(err){
		return false
		console.log("error in createTalkChatUser::::::",err)
	}
}


/**
	 * Creates a conversation for in Talk Chat
	 * @params = data (Type:Object) 
	 * @response : creates a new conversation for the job
	 * @author : Sahil
*/
export async function createTalkChatConversation(data){
	try{
		 console.log("data<<<<<<<<<",data)
		 let res = await talkChatApiClient.put(`/conversations/${data.jobId}`,data)
		 if (res.status == 200){
		 	return true
		 }
		 else{
		 	return false
		 }
		 
	}

	catch(err){
		return false
		console.log("error in addNewTalkChatUser::::::",err)
	}
}

/**
	 * gets a conversation for in Talk Chat
	 * @params = data (Type:Object) 
	 * @response :get a created conversation for the job
	 * @author : Sahil
*/
export async function getTalkChatConversation(data){
	try{
		 let res = await talkChatApiClient.get(`/conversations/${data.jobId}`)
		 console.log("response for getTalkChatConversation >>>>>>>>>>>",res)
		 if (res.status == 200){
		 	return res.data
		 }
		 else{
		 	return false
		 }
		 
	}

	catch(err){
		console.log("error in getTalkChatConversation :::" ,err)
		return false
	}
}

/**
	 * set participants in Talk Chat
	 * @params = data (Type:Object) 
	 * @response : joins participants for the job
	 * @author : Kartar Singh
*/
export async function joinTalkChatConversationPending(data){
	try{
		console.log("joinTalkChatConversation >>>>>>",data)
		let me = new Talk.User(data.customer)
		// let other = new Talk.User(data.technician)
		console.log("data.conversationId >>>>>>>>",data.conversationId)
		let conversation = window.talkSession.getOrCreateConversation(JSON.stringify(data.conversationId));
	
		conversation.setParticipant(me);
		// conversation.setParticipant(other);
	
		var chatbox = window.talkSession.createChatbox();
		chatbox.select(conversation);
		return chatbox
		 
	}

	catch(err){
		console.log("error in addNewTalkChatUser::::::",err)
		return false
	}
}


/**
	 * set participants in Talk Chat
	 * @params = data (Type:Object) 
	 * @response : joins participants for the job
	 * @author : Sahil
*/
export async function joinTalkChatConversation(data){
	try{
		console.log("joinTalkChatConversation >>>>>>",data)
		let me = new Talk.User(data.customer)
		let other = new Talk.User(data.technician)
		console.log("data.conversationId >>>>>>>>",data.conversationId)
		let conversation = window.talkSession.getOrCreateConversation(JSON.stringify(data.conversationId));
	
		conversation.setParticipant(me);
		conversation.setParticipant(other);
	
		var chatbox = window.talkSession.createChatbox();
		chatbox.select(conversation);
		return chatbox
		 
	}

	catch(err){
		console.log("error in addNewTalkChatUser::::::",err)
		return false
	}
}

/**
	 * set participants in Talk Chat
	 * @params = data (Type:Object) 
	 * @response : joins participants for the job
	 * @author : Sahil
*/
export async function joinTalkChatConversationGroup(data){
	try{
		let me = new Talk.User(data.customer)
		let conversation = window.talkSession.getOrCreateConversation(JSON.stringify(data.conversationId));
		conversation.setParticipant(me);

		data.technicians.map((ele,index)=>{
			let other = new Talk.User(ele)
			conversation.setParticipant(other);
		})

		// let other = new Talk.User(data.technician)
		var chatbox = window.talkSession.createChatbox();
		chatbox.select(conversation);
		return chatbox
		 
	}

	catch(err){
		console.log("error in addNewTalkChatUser::::::",err)
		return false
	}
}