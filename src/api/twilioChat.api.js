import apiClient from './index';
import axios from 'axios';
import { TWILIO_CHAT_USERNAME, TWILIO_CHAT_PASSWORD } from '../constants/index';

/**
 * 
 * @param {*} conversationId 
 * @returns array of objects
 * @description : This API will get conversation if available returned it else create.
 * @author : Kartar Singh
 */
export async function fetchTwilioConversation(twilioData) {
    console.log('twilioData :::112:',twilioData)
    try {
        let response = await apiClient.post(`/twilio-chat/fetchConversation`,twilioData);
        if (response) {
            const twilioData = response?.data
            if (twilioData != '') {
                return { twilioData: twilioData }
            } else {
                return { twilioData: response }
            }
        }
    }
    catch (err) {
        console.log("error in getTwilioAuthToken ::: ", err)
        return false
    }
}

/**
 * 
 * @param {*} conversationId 
 * @returns array of objects
 * @description : This API will update conversation if available  .
 * @author : Kartar Singh
 */
export async function createTwilioConversation(jobId) {
    try {
        let response = await apiClient.post(`/twilio-chat/createConversation/${jobId}`);
        if (response) {
            const twilioData = response?.data
            if (twilioData != '') {
                return { twilioData: twilioData }
            } else {
                return { twilioData: response }
            }
        }
    }
    catch (err) {
        console.log("error in createTwilioConversation ::: ", err)
        return false
    }
}

/**
 * 
 * @param {*} data 
 * @returns array of objects
 * @description : This API will add participant in the conversation  .
 * @author : Kartar Singh
 */
export async function addTwilioParticiants(data) {
    try {
        let response = await apiClient.post(`/twilio-chat/addParticipat`, data);
        if (response) {
            const twilioData = response?.data
            if (twilioData != '') {
                return { twilioData: twilioData }
            } else {
                return { twilioData: response }
            }
        }
    }
    catch (err) {
        console.log("error in getTwilioAuthToken ::: ", err)
        return false
    }
}

/**
 * 
 * @param {*} data 
 * @returns image url
 * @description : This API will return image url if any media file is uploaded.
 * @author : Jagroop
 */
export async function geTwilioChatMediaDetails(data) {
    try {
        let response = await apiClient.post(`/twilio-chat/get-media-link`, data);

        // console.log("geTwilioChatMediaDetails", response?.data?.response?.links?.content_direct_temporary)
        if (response) {
            const twilioData = response?.data
            const temporaryImage = twilioData?.response?.links?.content_direct_temporary
            if (twilioData != '' && temporaryImage) {
                return temporaryImage
            } else {
                return ''
            }
        }
    }
    catch (err) {
        console.log("error in getTwilioAuthToken ::: ", err)
        return false
    }
}

/**
 * 
 * @param {*} data 
 * @returns array of objects
 * @description : This API will return the list of all participant in conversation   .
 * @author : Kartar Singh
 */
export async function twilioParticiantsList(data) {
    try {
        let response = await apiClient.post(`/twilio-chat/ParticipatList`, data);
        if (response) {
            const twilioData = response?.data
            if (twilioData != '') {
                return { twilioData: twilioData }
            } else {
                return { twilioData: response }
            }
        }
    }
    catch (err) {
        console.log("error in getTwilioAuthToken ::: ", err)
        return false
    }
}


/**
 * 
 * @param {*} chatId 
 * @returns array of objects
 * @description : This API will get all the messages if available returned it in the required format.
 * @author : Jagroop
 */
export async function getTwilioChat(chatId, chatServiceSid, nextPageUrls) {
    try {
        if (chatId !== null  || nextPageUrls) {
            const URL = nextPageUrls ? nextPageUrls : `https://conversations.twilio.com/v1/Conversations/${chatId}/Messages?Order=desc&PageSize=5`;
            const basicAuth = 'Basic ' + btoa(TWILIO_CHAT_USERNAME + ':' + TWILIO_CHAT_PASSWORD);
            const twilioChatResponse = await axios.get(URL, {
                headers: { 'Authorization': basicAuth },
            });
            const twilioHistoryMessages = twilioChatResponse?.data && twilioChatResponse?.data?.messages?.length > 0
            const nextPageUrl = twilioChatResponse.data.meta.next_page_url
            if (twilioHistoryMessages) {
                const formattedResponse = await formatMessages(twilioChatResponse?.data?.messages, chatServiceSid);
                return { formattedResponse: formattedResponse, nextPageUrl: nextPageUrl };
            } else {
                return { formattedResponse: [], nextPageUrl: null };
            }
        }else{
            console.log('Chat ID is null. API call skipped.');
            return { formattedResponse: [], nextPageUrl: null };
        }
    } catch (error) {
        console.error("Error retrieving Twilio chat:", error);
        return { formattedResponse: [], nextPageUrl: null };
    }
}

/**
 * 
 * @param {*} chatId 
 * @returns array of objects
 * @description : This API will update the conversation.
 * @author : Kartar Singh
 */
export async function updateTwilioConversation(sid) {
    const URL = `https://conversations.twilio.com/v1/Conversations/${sid}`;
    const basicAuth = 'Basic ' + btoa(TWILIO_CHAT_USERNAME + ':' + TWILIO_CHAT_PASSWORD);
    try {
        const twilioChatResponse = await axios.delete(URL, {
            headers: { 'Authorization': basicAuth },
        });
    } catch (error) {
        console.error("Error retrieving Twilio chat:", error);
        return [];
    }
}

export const deleteParticipantFromChat =async(Chid,participantId)=>{
    const URL = `https://conversations.twilio.com/v1/Conversations/${Chid}/Participants/${participantId}`;
    const basicAuth = 'Basic ' + btoa(TWILIO_CHAT_USERNAME + ':' + TWILIO_CHAT_PASSWORD);
    try {
        const twilioChatResponse = await axios.delete(URL, {
            headers: { 'Authorization': basicAuth },
        });
        return twilioChatResponse;
    } catch (error) {
        console.error("Error retrieving Twilio chat:", error);
        return false;
    }
}

// This function will format raw data of messages in the required format to show previous chat on screen
async function formatMessages(response, chatServiceSid) {
    const formattedMessages = [];
    for (const message of response) {
        const { body, author, attributes, media } = message;
        const { timeStamp, userName } = JSON.parse(attributes);
        let mediaImage = '';
        let content_type = '';
        let mediaName = ''
        let mediaDetails = {}
        if (media && media.length >= 0) {
            mediaDetails['chatServiceSid'] = chatServiceSid;
            mediaDetails['mediaSid'] = media[0].sid;
            console.log('mediaImage :::::1',chatServiceSid)
            console.log('mediaImage :::::2',media[0].sid)
            mediaImage = await geTwilioChatMediaDetails({ chatServiceSid, mediaSid: media[0].sid })
            content_type = media[0].content_type
            mediaName = media[0].filename
        }
        console.log('mediaImage :::::3',mediaImage)
        formattedMessages.push({
            text: urlifyTheMessage(body),
            author,
            timeStamp,
            senderName: userName,
            imageUrl: mediaImage,
            content_type: content_type,
            mediaName: mediaName,
            mediaDetails: mediaDetails,
        });
    }

    return formattedMessages;
}

// This function will convert urls to clickable if available in message
function urlifyTheMessage(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '">' + url + '</a>';
    })
  }
  


  export async function twilioChatTableUpdate(data) {
    try {
        let response = await apiClient.post(`/twilio-chat/update-twilio-details`, data);
        if (response) {
            const twilioData = response?.data
            if (twilioData != '') {
                return { twilioData: twilioData }
            } else {
                return { twilioData: response }
            }
        }
    }
    catch (err) {
        console.log("error in getTwilioAuthToken ::: ", err)
        return false
    }
}

export async function getTwilioUnreadMessageResponse(twilioChatId){
    try {
        console.log('twilioChatId :::::',twilioChatId)
        const URL = `https://conversations.twilio.com/v1/Conversations/${twilioChatId}/Participants`;
        const basicAuth = 'Basic ' + btoa(TWILIO_CHAT_USERNAME + ':' + TWILIO_CHAT_PASSWORD);

        const twilioChatResponse = await axios.get(URL, {
            headers: { 'Authorization': basicAuth },
        });
        console.log('twilioChatResponse ::::::::::::::::::::',twilioChatResponse)
        return twilioChatResponse
    } catch (error) {
        console.error("Error retrieving Twilio chat:", error);
        return false;
    }	
}

export async function getTwilioChatDetails(params) {
	return apiClient
	.post(`/twilio-chat/getTwilioChatDetails/`,params)
		.then(response => {
			if (response) {
				console.log('response ::::::::::getTwilioChatDetails:',response)
				return response.data;
			}
			return Promise.reject();
		})
}


export const lastMessageSenderDetails = async (twilioChatId) => {
    try {
        const URL = `https://conversations.twilio.com/v1/Conversations/${twilioChatId}/Messages?Order=desc&PageSize=1`;
        const basicAuth = 'Basic ' + Buffer.from(TWILIO_CHAT_USERNAME + ':' + TWILIO_CHAT_PASSWORD).toString('base64');
        const twilioChatResponse = await axios.get(URL, {
            headers: { 'Authorization': basicAuth },
        });
        if (twilioChatResponse.data.messages && twilioChatResponse.data.messages.length > 0) {
            const twilioChatMessage = twilioChatResponse.data.messages[0];
            return twilioChatMessage;

        } else {
            return false
        }
    } catch (error) {
        console.log("error while getting lastMessageSenderDetails", error);
        return false;
    }
}
