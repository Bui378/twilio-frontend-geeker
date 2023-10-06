import React, { useState } from 'react';
import * as EarningDetailsApi from '../api/earningDetails.api';
import * as transactionApi from '../api/transactions.api'
import { openNotificationWithIcon } from '../utils';
import { useServices } from './ServiceContext';
import * as StripeApi from '../api/stripeAccount.api';
const EarningDetailsContext = React.createContext({});

function EarningDetailsProvider(props) {
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)
  const [balanceAmount, setBalanceAmount] = useState(0)
  const [transactionData, setTransactionData] = useState([])
  const { unFormattedEarnings } = useServices();

  async function createEarningDetails(data) {
    try {
      const res = await EarningDetailsApi.createEarningDetails(data);
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Details could not be created.Please try again later.');
    }
  }

  async function earningDetailsList(data) {
    try {
      const res = await EarningDetailsApi.earningDetailsList(data);
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Details could not be fetched.Please try again later.');
    }
  }

  async function getDetailsOfPaycycles(userId, techId) {
    try {
      const res = await StripeApi.getEarningDetailsByPaycycle(userId, techId)
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Details could not be fetched.Please try again later.');
    }
  }

  async function getEarningDetails(id) {
    try {
      const res = await EarningDetailsApi.getEarningDetails(id);
      return res;
    } catch (err) {
    }
  }

  /**
   * function will call transaction get api and stores the value in state variable for use
   * @params : data(Type:Object)
   * @response : will update the state variable 
   * @author Sahil
   */
  async function fetchTransactions(data) {
    try {
      let res = await transactionApi.getTransactions(data)
      if (res) {
        setTransactionData(res.data)
        let paid_amounts = res.data.map(item => item.paidAmount)
        let sumOfPaidAmounts = paid_amounts.reduce((a, b) => parseInt(a) + parseInt(b))
        setTotalPaidAmount(sumOfPaidAmounts)
        let balance = unFormattedEarnings - sumOfPaidAmounts
        if (balance > 0) {
          setBalanceAmount(balance)
        }
        else {
          setBalanceAmount(0)
        }
      }
    }
    catch (err) {
      console.log("error in fetch Transactions ::: ", err)
    }
  }


  return (
    <EarningDetailsContext.Provider
      value={{
        createEarningDetails,
        earningDetailsList,
        getEarningDetails,
        fetchTransactions,
        totalPaidAmount,
        balanceAmount,
        transactionData,
        getDetailsOfPaycycles
      }}
      {...props}
    />
  );
}

function useEarningDetails() {
  const context = React.useContext(EarningDetailsContext);
  if (context === undefined) {
    throw new Error('useJitsiMeet must be used within a JobProvider');
  }
  return context;
}

export { EarningDetailsProvider, useEarningDetails };
