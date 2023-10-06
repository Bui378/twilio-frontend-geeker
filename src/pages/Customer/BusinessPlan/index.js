import Header from "./Components/Header";
import React, {useEffect, useState} from "react"
import SignIn from "./steps/SignIn";
import ChooseYourPassWord from "./steps/ChooseYourPassword";
import CompleteYourPurchase from "./steps/CompleteYourPurchase";
import GotOurGeeks from "./steps/GotOurGeeks";
import LogIn from "./steps/LogIn";
import ResetPasswordLink from "./steps/ResetPasswordLink";
import TwentyFivePercentOffModal from "./Components/TwentyFivePercentOffModal";
import { useUser } from '../../../context/useContext';
import { useLocation } from 'react-router';
import {Elements} from "@stripe/react-stripe-js";
import { loadStripe } from '@stripe/stripe-js';
import {STRIPE_TEST_KEY, STRIPE_KEY} from '../../../constants';
import SubscriptionPlanModal from "./Components/SubscriptionPlanModal";
import { isLiveUser } from '../../../utils';

const BusinessPlan = () => {

    let liveUser;
    const { user, setUser, setToken } = useUser();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const CompleteYourPurchasePage = queryParams.get('page') && queryParams.get('page') === 'CompleteYourPurchase' ? true : false;
    const inviteCode = queryParams.get('inviteCode') || 'nothing';
    const [businessPlanStepNumber, setbusinessPlanStepNumber] = useState(0);
    const jobFlowStepsObj = {
      "SignIn": 0,
      "ChooseYourPassWord": 1,
      "CompleteYourPurchase": 2,
      "GotOurGeeks": 3,
      "LogIn": 4,
      "ResetPasswordLink": 5,
    }
    const [userInfo, setUserInfo] = useState()
    const [givenEmail, setGivenEmail] = useState()
    const [chosenProdId, setchosenProdId] = useState()
    const [showSubscriptionPlanModal, setShowSubscriptionPlanModal] = useState(false)
    const [showtwentyPercentModal, setShowtwentyPercentModal] = useState(false)
    const [userLoggedIn, setUserLoggedIn] = useState(false)
    const [stripePromise, setStripePromise] = useState(loadStripe(STRIPE_KEY))

    useEffect(()=>{
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", CompleteYourPurchasePage, inviteCode, businessPlanStepNumber)
        if(CompleteYourPurchasePage){
            setbusinessPlanStepNumber(jobFlowStepsObj['CompleteYourPurchase'])
        }
        if(inviteCode && inviteCode != 'nothing'){
            setbusinessPlanStepNumber(jobFlowStepsObj['ChooseYourPassWord'])
        }
    },[])

    useEffect(()=>{
        (async()=>{
            if(user){
                liveUser = await isLiveUser(user)
                let stripePromiseToSet = await loadStripe(liveUser ? STRIPE_KEY : STRIPE_TEST_KEY)
                if(stripePromiseToSet){
                    setStripePromise(stripePromiseToSet)
                }
                setbusinessPlanStepNumber(jobFlowStepsObj["CompleteYourPurchase"])
            }
        })()
    },[])

    return <div className="gradientBackground business-plan-parent-div">
        <Header/>
        <div className="business-plan-common-div">
            {
                businessPlanStepNumber === 0 && <SignIn 
                                                    setbusinessPlanStepNumber={setbusinessPlanStepNumber} 
                                                    jobFlowStepsObj={jobFlowStepsObj}
                                                    setUserInfo={setUserInfo}
                                                    setGivenEmail={setGivenEmail}
                                                    user={user}
                                                    setchosenProdId={setchosenProdId}
                                                    setShowSubscriptionPlanModal={setShowSubscriptionPlanModal}
                                                    setShowtwentyPercentModal={setShowtwentyPercentModal}
                                                />
            }
            {
                businessPlanStepNumber === 1 && <ChooseYourPassWord 
                                                    givenEmail={givenEmail}
                                                    setGivenEmail={setGivenEmail}
                                                    setToken={setToken}
                                                    setchosenProdId={setchosenProdId}
                                                    setShowSubscriptionPlanModal={setShowSubscriptionPlanModal}  
                                                    setShowtwentyPercentModal={setShowtwentyPercentModal}
                                                />
            }
            {
                businessPlanStepNumber === 2 && stripePromise !== '' && <Elements stripe={stripePromise} > 
                                                    <CompleteYourPurchase
                                                        user={user}
                                                        setbusinessPlanStepNumber={setbusinessPlanStepNumber} 
                                                        jobFlowStepsObj={jobFlowStepsObj}
                                                        setShowSubscriptionPlanModal={setShowSubscriptionPlanModal}
                                                        setShowtwentyPercentModal={setShowtwentyPercentModal}
                                                    />
                                                </Elements>
            }
            {
                businessPlanStepNumber === 3 && <GotOurGeeks user={user} />
            }
            {
                businessPlanStepNumber === 4 && <LogIn
                                                    userInfo={userInfo}
                                                    setUser={setUser}
                                                    setToken={setToken}
                                                    setbusinessPlanStepNumber={setbusinessPlanStepNumber} 
                                                    jobFlowStepsObj={jobFlowStepsObj}
                                                    setchosenProdId={setchosenProdId}
                                                    setShowSubscriptionPlanModal={setShowSubscriptionPlanModal}
                                                    setShowtwentyPercentModal={setShowtwentyPercentModal}
                                                />
            }
            {
                businessPlanStepNumber === 5 && <ResetPasswordLink
                                                    userInfo={userInfo}
                                                    setbusinessPlanStepNumber={setbusinessPlanStepNumber} 
                                                    jobFlowStepsObj={jobFlowStepsObj}
                                                 />
            }
        </div>
        <TwentyFivePercentOffModal showtwentyPercentModal={showtwentyPercentModal} setShowtwentyPercentModal={setShowtwentyPercentModal} />
        <SubscriptionPlanModal chosenProdId={chosenProdId} showSubscriptionPlanModal={showSubscriptionPlanModal} setShowSubscriptionPlanModal={setShowSubscriptionPlanModal} userLoggedIn={userLoggedIn} user={user} />
    </div>
}

export default BusinessPlan