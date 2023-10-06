
import React,{useState,useEffect} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ThemeProvider } from 'styled-components';
import * as History from 'history';
import LanguageProvider from './components/LanguageProvider';

import App from './App';
import axios from 'axios'; 
import * as serviceWorker from './serviceWorker';

import translations from './i18n';
import AppProviders from './context/AppProviders';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
// import { Provider} from '@rollbar/react'; // Commented by @Vinit on 22/03/2023
import ErrorBoundary from 'components/ErrorBoundary';
import MaintenancePage from 'MaintenancePage';
import {SERVER_URL} from './constants/index'
const queryClient = new QueryClient();
export const history = History.createBrowserHistory();


const theme = {
  primary: '#464646',
  secondary: '#908d8d',
  light: '#eaeaea',
   bg: "#2F3F4C"
};

function checkTimeRange(currentTime, startHour, endHour) {
  const currentHour = currentTime.getHours();
  return currentHour >= startHour && currentHour < endHour;
}

function checkAsiaKolkataTimezone(userTimezone) {
  console.log("checkAsiaKolkataTimezone", userTimezone);
  return userTimezone === 'Asia/Kolkata' || userTimezone === 'Asia/Calcutta';
}
function isWeekday(currentTime) {
  const day = currentTime.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  return day >= 1 && day <= 5; // Monday to Friday
}

const RootApp = () => {
  const [isBuildInProgress, setIsBuildInProgress] = useState(false);

  useEffect(() => {
    // Get the user's current timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('User timezone:', userTimezone);

    // Check if the timezone is Asia/Kolkata or Asia/Calcutta
    if (checkAsiaKolkataTimezone(userTimezone)) {

      // Get the current time in the user's timezone
      const currentTime = new Date();

      // Check if the current day is a weekday (Monday to Friday)
      if (isWeekday(currentTime)) {

        // Define the time range: 10 AM to 6 PM
        const startHour = 10;
        const endHour = 18;

        // Check if the current hour is within the desired range
        if (checkTimeRange(currentTime, startHour, endHour)) {
          // Make an API call to check if the build process is in progress
          axios.get(`${SERVER_URL}/api/check-build-status`)
            .then(response => {
              console.log("response>>>>>>>>>>>.", response);
              setIsBuildInProgress(response?.data?.message);
            })
            .catch(error => {
              console.error('Error checking build status:', error);
              setIsBuildInProgress(false);
            });
        } else {
          console.log("Not yet time to run the code.");
        }
      } else {
        console.log("It's a weekend, not running the code.");
      }
    } else {
      console.log("Timezone is not Asia/Kolkata or Asia/Calcutta.");
    }
  }, [isBuildInProgress]);


  const renderPage = () => {
    if (isBuildInProgress) {
      return <MaintenancePage />;
    }
    return (
      <Router>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <GoogleOAuthProvider clientId="304531247476-58f940f3b0dgrupg95cdo8b51fspupdv.apps.googleusercontent.com">
              <AppProviders>
                <App />
              </AppProviders>
            </GoogleOAuthProvider>            
          </ThemeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  return (renderPage());
};

ReactDOM.render(<RootApp />, document.getElementById('root'));

serviceWorker.register();
