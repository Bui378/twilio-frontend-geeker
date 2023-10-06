import axios from 'axios';
import jwtDecode from 'jwt-decode';

import { SECRET_KEY, SERVER_MEETING_URL,SERVER_URL ,CHAT_URL,CHAT_PROJECT_PRIVATE_KEY,TALK_SECRET_CHAT_KEY,TALK_PROJECT_URL,TALK_PROJECT_ID,AMBASSODOR_USERNAME,AMBASSODOR_TOKEN,AMBASSODOR_URL} from '../constants';


export const meetingApiClient = axios.create({
  baseURL : `${SERVER_MEETING_URL}/api`
})

const apiClient = axios.create({
  baseURL: `${SERVER_URL}/api`,
});

apiClient.interceptors.request.use(async (request) => {
  const accessToken = localStorage.getItem(SECRET_KEY);

  if (accessToken) {
    // Check if the token is expired
    const expiresAt = localStorage.getItem('expiresAt');
    if (expiresAt) {
      const currentTime = new Date().getTime();
      const expirationTime = new Date(expiresAt).getTime();
      console.log('Access token',currentTime,expirationTime)
      if (currentTime > expirationTime) {
        // Token has expired, redirect to login
        console.log('token expired going to login page');
        localStorage.removeItem(SECRET_KEY); // Clear the expired token
        localStorage.removeItem('expiresAt'); // Clear the expiration time
        window.location.href = '/login'; // Replace with your login route
        return Promise.reject("Token expired"); // Reject the request
      }
    }

    // Token is valid, set the Authorization header
    request.headers.Authorization = `Bearer ${accessToken}`;

    // Decode the JWT token to check expiration
    const decodedToken = jwtDecode(accessToken);
    // console.log("decoded token",decodedToken);
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem(SECRET_KEY); // Clear the expired token 
        window.location.href = '/login';
    }

  }

  return request;
});

export const apiClientJitsi = axios.create({
  baseURL: `https://winkit.ml`,
});



apiClientJitsi.interceptors.request.use((request) => {
  return request;
});

export const chatApiClient = axios.create({
  baseURL:`${CHAT_URL}`
});
chatApiClient.interceptors.request.use((request) => {
  request.headers['PRIVATE-KEY'] = CHAT_PROJECT_PRIVATE_KEY;
  return request;
});

export const talkChatApiClient = axios.create({
  baseURL : `${TALK_PROJECT_URL}/v1/${TALK_PROJECT_ID}`
})

talkChatApiClient.interceptors.request.use((request) => {
  request.headers.Authorization= `Bearer ${TALK_SECRET_CHAT_KEY}`;
  return request;
});


export const ambassdorApiClient = axios.create({
  baseURL : `${AMBASSODOR_URL}/${AMBASSODOR_USERNAME}/${AMBASSODOR_TOKEN}`
})



export default apiClient;