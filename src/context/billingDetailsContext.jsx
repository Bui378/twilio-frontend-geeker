import React from 'react';
import * as BillingDetailsApi from '../api/billingDetails.api';
import { openNotificationWithIcon } from '../utils';

const BillingDetailsContext = React.createContext({});

function BillingDetailsProvider(props) {

  async function createBillingDetails(data) {
    try {
      const res = await BillingDetailsApi.createBillingDetails(data);
      console.log("res in context", res)
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Details could not be created.Please try again later.');
    }
  }

  async function billingDetailsList(data) {
    try {
      const res = await BillingDetailsApi.billingDetailsList(data);
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Details could not be fetched.Please try again later.');
    }
  }

  async function getBillingDetails(id) {
    try {
      const res = await BillingDetailsApi.getBillingDetails(id);
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Details could not be fetched.Please try again later.');
    }
  }

  return (
    <BillingDetailsContext.Provider
      value={{
        createBillingDetails,
        billingDetailsList,
        getBillingDetails,
      }}
      {...props}
    />
  );
}

function useBillingDetails() {
  const context = React.useContext(BillingDetailsContext);
  if (context === undefined) {
    throw new Error('useJitsiMeet must be used within a JobProvider');
  }
  return context;
}

export { BillingDetailsProvider, useBillingDetails };