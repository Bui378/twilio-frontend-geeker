import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import BasicButton from "components/common/Button/BasicButton";

const SubscriptionPlanCard = ({singlePlanInfo, chosenProdId, setShowSubscriptionPlanModal, userLoggedIn}) => {

    const [keyFeatures, setKeyFeatures] =useState()

    useEffect(()=>{
        console.log("singlePlanInfo ------------------- ", singlePlanInfo)
        setKeyFeatures(singlePlanInfo.metadata.key_features.replace("[", "").replace("]","").replaceAll(`"`,"").split(","))
    },[])

    const handleSelect = (e) => {
        if(userLoggedIn){
            window.location.search = `?planId=${e.target.name}&page=CompleteYourPurchase`
        }else{
            window.location.search = `?planId=${e.target.name}`
        }
    }

    return(<>
        <div className="subscription-plan-card">
            <div className="d-flex justify-content-start align-items-center flex-column">
                <span className="subscription-plan-card-name">{singlePlanInfo?.name}</span>
                <div className="d-flex justify-content-center align-items-center">
                    <span className="subscription-plan-card-discount-price" >${singlePlanInfo?.metadata?.reg_price}</span>
                    <span className="subscription-plan-card-actual-price" >${singlePlanInfo?.price?.unit_amount/100}</span>
                </div>
                {keyFeatures && keyFeatures.map((ele)=>{
                    return(<div>
                        <FontAwesomeIcon icon={faCheck} className="subscription-plan-card-check-icon" />
                        <span className="subscription-plan-card-info">{ele}</span>
                    </div>)
                })}
            </div>
            <div className="mt-30">
                <BasicButton btnTitle={chosenProdId === singlePlanInfo.id ? "Selected" :"Select"} height={"35px"} width={"100px"} background={"#01D4D5"} color={"white"} onClick={(e)=>handleSelect(e)} disable={chosenProdId === singlePlanInfo.id} name={singlePlanInfo.id} />
            </div>
        </div>
    </>)
}

export default SubscriptionPlanCard