import CheckInCircle from "components/CheckInCircle"
import React, { useEffect, useState } from "react"
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import wave from "../../../../assets/images/wave.png"
import {getAllPlans} from "../../../../api/subscription.api";
import { useLocation } from 'react-router';
import Loader from '../../../../components/Loader';
import * as PublicApi from "../../../../api/public.api"

const ChosenPlanSummary = ({setchosenProdId, setShowSubscriptionPlanModal}) => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const planId = queryParams.get('planId') ? queryParams.get('planId') : false;
    const [planData, setPlanData] = useState()
    const [planInfo, setPlanInfo] = useState()
    const [totalCustomerWithThisSubscrition, setTotalCustomerWithThisSubscrition] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(()=>{
        console.log("Updated state var planData", planData)
        console.log("Updated state var planInfo", planInfo)
    },[planData, planInfo])

    useEffect(()=>{
        (async ()=>{
            console.log("My console for allPlans 1", planId)
            if(planId){
                const totalCusotmer = await PublicApi.getTotalCustomerCount({"subscription.plan_id":planId})
                console.log("totalCusotmer with current subscription plan ", totalCusotmer)
                setTotalCustomerWithThisSubscrition(totalCusotmer.totalCount)
                let allPlans = await getAllPlans({"liveUser":true})
                const currentPlan = allPlans.data.filter(item => item.id === planId)
                const keyFeatures = currentPlan[0].metadata.key_features.replace("[", "").replace("]","").replaceAll(`"`,"").split(",")
                setchosenProdId(planId)
                setPlanInfo(keyFeatures)
                setPlanData(currentPlan[0])
                setIsLoading(false)
            }
        })()
    },[])

    const handleChange = () => {
        setShowSubscriptionPlanModal(true)
    }

    if (isLoading) return <Loader height="50%" />;

    return<div className="chosen-plan-summary-div">
        {/* <div className="chosen-plan-summary-cross">
            <FontAwesomeIcon icon={faPlus}/>
        </div> */}
        <div className="mb-25">
            <span className="chosen-plan-summary-head">Your Chosen Plan</span>
        </div>
        <div>
            <span className="small-team-text">{planData?.name}</span>
        </div>
        {/* <div className="mb-25">
            <span className="purchase-number">{totalCustomerWithThisSubscrition > 30 ? totalCustomerWithThisSubscrition : "30"} Purchased this plan!</span>
            <img src={wave} className="wave-img" />
        </div> */}
        <div className="mb-25">
            <span className="actual-price">${planData?.metadata?.reg_price}</span>&nbsp;&nbsp;
            <span className="discounted-price">${planData?.price?.unit_amount/100}</span>
        </div>
        <div className="mb-25">
            {planInfo && planInfo.map((ele)=>{
                return(<div className="d-flex align-items-center mb-1">
                            <CheckInCircle bgColor={"turcose"} style={{height:"13px", width:"13px"}} checkStyle={{color:"black"}} />
                            &nbsp;&nbsp;
                            <span className="text-with-check">{ele}</span>
                        </div>)
            })}
        </div>
        <span className="change-text" onClick={handleChange}>
                Change
        </span>
    </div>
}

export default ChosenPlanSummary