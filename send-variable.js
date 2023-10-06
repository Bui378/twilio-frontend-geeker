// send-variable.js
const axios = require('axios');
require('dotenv').config({path: __dirname + '/.env'});
const myVariable = 'some value'; // Your variable value
REACT_APP_API_BASE_URL='https://api.geeker.co'
const backendURL = `${REACT_APP_API_BASE_URL}/api/receive-variable`;
console.log("url checking: ", backendURL);

axios.post(backendURL, { variable: myVariable })
  .then(response => {
    console.log('Variable sent to backend:', response.data);
    
    // Start the build process
    const { exec } = require('child_process');
    console.log('Starting build process');
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error('Error running npm run build:', error);
        return;
      }
      console.log('Build process complete:', stdout);
      axios.post(`${REACT_APP_API_BASE_URL}/api/build-complete`)
        .then(() => {
          console.log('Build marked as complete on backend');
        })
        .catch(error => {
          console.error('Error marking build as complete:', error);
        });
    });
  })
  .catch(error => {
    console.error('Error sending variable to backend:', error);
  });
