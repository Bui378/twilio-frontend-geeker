import React from 'react';
import * as FeedbackApi from '../api/feedback.api';
import { openNotificationWithIcon } from '../utils';

const FeedbackContext = React.createContext({});

function FeedbackProvider(props) {

  async function createFeedback(data) {
    try {
      const res = await FeedbackApi.createFeedback(data);
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Feedback could not be created.Please try again later.');
    }
  }

  async function checkForFeedback(data) {
    try {
      let response = await FeedbackApi.getFeedbackForParticularJob(data)
      return response.haveFeedback
    }
    catch (err) {
      console.log("error in checkForFeedback")
      return false
    }
  }

  async function checkForFeedbackCustomer(data) {
    try {
      let response = await FeedbackApi.getFeedbackForParticularJobforCustomer(data)
      return response
    }
    catch (err) {
      console.log("error in checkForFeedback")
      return false
    }
  }
  /*
    Description not using this function in get feedback form to get all the data in feedback page
  */
  async function getFeedback(jobId) {
    try {
      const res = await FeedbackApi.getFeedback(jobId);
      return res;
    } catch (err) {
      console.log('feedback not fetched', err)
      return true
    }
  }

  // Update feedback data
  async function updateFeedback(feedbackId, data) {
    try {
      let r = await FeedbackApi.updateFeedback(feedbackId, data);
      return r;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Failed to update feedback.');
    }
  }

  return (
    <FeedbackContext.Provider
      value={{
        createFeedback,
        getFeedback,
        updateFeedback,
        checkForFeedback,
        checkForFeedbackCustomer,
      }}
      {...props}
    />
  );
}

function useFeedback() {
  const context = React.useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useJitsiMeet must be used within a JobProvider');
  }
  return context;
}

export { FeedbackProvider, useFeedback };
