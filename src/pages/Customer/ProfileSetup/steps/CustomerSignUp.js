import React, { useEffect, useState, useMemo } from "react";
import SignIn from "../../BusinessPlan/steps/SignIn";
import ChooseYourPassWord from "../../BusinessPlan/steps/ChooseYourPassword";
import CompleteYourPurchase from "../../BusinessPlan/steps/CompleteYourPurchase";
import LogIn from "../../BusinessPlan/steps/LogIn";
import ResetPasswordLink from "../../BusinessPlan/steps/ResetPasswordLink";
import { Elements } from "@stripe/react-stripe-js";
import { isGuestLiveUser } from "../../../../utils";
import { STRIPE_KEY, STRIPE_TEST_KEY, SECRET_KEY } from '../../../../constants';
import { loadStripe } from '@stripe/stripe-js';
import Header from "../../BusinessPlan/Components/Header";
import { useLocation } from 'react-router';
import Loader from '../../../../components/Loader';

const CustomerSignUp = ({ userInfo, setUserInfo, setUser, setToken, user, isScheduleJob, job, givenEmail, setGivenEmail, isFirsJob, showLoader, setShowLoader }) => {
    let searchParams = useMemo(() => { return new URLSearchParams(window.location.search) }, [location])
    let stripePromise = loadStripe(isGuestLiveUser(user) ? STRIPE_KEY : STRIPE_TEST_KEY)
    const location = useLocation();
    const [showCCForm, setShowCCForm] = useState(false)
    const [businessPlanStepNumber, setbusinessPlanStepNumber] = useState();
    const [userLoggedIn, setUserLoggedIn] = useState(false)

    const jobFlowStepsObj = {
        "SignIn": 0,
        "ChooseYourPassWord": 1,
        "CompleteYourPurchase": 2,
        "GotOurGeeks": 3,
        "LogIn": 4,
        "ResetPasswordLink": 5,
    }

    useEffect(() => {
        if (job) {
            console.log("job>>>>>>>>>>>>.....", job)
            if (user && user.email === "guest@geeker.co") {
                if (job?.guestJob) localStorage.removeItem(SECRET_KEY);
            }
        }
    }, [job])

    useEffect(() => {
        (async () => {
            if (user) {
                stripePromise = await loadStripe(isGuestLiveUser(user) ? STRIPE_KEY : STRIPE_TEST_KEY)
                console.log("stripePromise<><><><>", stripePromise)
            };
        })();
    }, [user]);

    useEffect(() => {
        if (searchParams.get('page') === 'registration') {
            setShowLoader(false)
        }
        if (searchParams.get('page') === 'registration' && !user) {
            setbusinessPlanStepNumber(jobFlowStepsObj['SignIn'])
        }
        if (user) {
            setShowCCForm(true)
        };
    }, [])

    useEffect(() => {
        if (showCCForm) {
            setbusinessPlanStepNumber(jobFlowStepsObj["CompleteYourPurchase"])
            setShowLoader(false)
        }
    }, [showCCForm])

    if (showLoader) return <Loader height="100%" />;

    return (<>

        <Header />

        {
            businessPlanStepNumber === 0 && <SignIn
                user={user}
                setUser={setUser}
                setbusinessPlanStepNumber={setbusinessPlanStepNumber}
                jobFlowStepsObj={jobFlowStepsObj}
                setUserInfo={setUserInfo}
                setGivenEmail={setGivenEmail}
                setShowLoader={setShowLoader}
            />
        }
        {
            businessPlanStepNumber === 1 && <ChooseYourPassWord
                user={user}
                givenEmail={givenEmail}
                setToken={setToken}
            />
        }
        {
            businessPlanStepNumber === 2 && <Elements stripe={stripePromise} >
                <CompleteYourPurchase
                    user={user}
                    setbusinessPlanStepNumber={setbusinessPlanStepNumber}
                    jobFlowStepsObj={jobFlowStepsObj}
                    job={job}
                    isScheduleJob={isScheduleJob}
                    isFirsJob={isFirsJob}
                    setShowLoader={setShowLoader}
                />
            </Elements>
        }
        {

            businessPlanStepNumber === 4 && <LogIn
                userInfo={userInfo}
                setUser={setUser}
                setToken={setToken}
                setbusinessPlanStepNumber={setbusinessPlanStepNumber}
                jobFlowStepsObj={jobFlowStepsObj}
                user={user}
                job={job}
            />
        }
        {
            businessPlanStepNumber === 5 && <ResetPasswordLink
                userInfo={userInfo}
                setbusinessPlanStepNumber={setbusinessPlanStepNumber}
                jobFlowStepsObj={jobFlowStepsObj}
            />
        }


    </>)
}

export default CustomerSignUp