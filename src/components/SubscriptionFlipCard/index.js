import CheckInCircle from "components/CheckInCircle";
import BasicButton from "components/common/Button/BasicButton";
import React, { useEffect, useState } from "react"
import ReactCardFlip from "react-card-flip";

const SubscriptionFlipCard = ({ popular, planData, onYes, user, setDisableBtn, disableBtn, showSubscriptionPlansModal }) => {

    const [flip, setFlip] = useState(false);
    const [planInfo, setPlanInfo] = useState([])
    const [currentSubscriptionId, setCurrentSubscriptionId] = useState("")
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("")
    const [showSpinner, setShowSpinner] = useState(false)

    useEffect(() => {
        if (!showSubscriptionPlansModal) {
            setFlip(false)
        }
    }, [showSubscriptionPlansModal])

    useEffect(() => {
        console.log("My console for planData in subscription flip card", planData)
        if (typeof planData['metadata']['key_features'] === 'string') {
            planData['metadata']['key_features'] = JSON.parse(planData['metadata']['key_features'])
        }
        setPlanInfo(planData.metadata.key_features)
        if (user && user.customer && user.customer.subscription) {
            setCurrentSubscriptionId(user.customer.subscription.plan_id)
        }
    }, [user])

    useEffect(() => {
        console.log("My console for currentSubscriptionId", currentSubscriptionId)
    }, [currentSubscriptionId])

    useEffect(() => {
        console.log("My console for selectedSubscriptionId", { selectedSubscriptionId, disableBtn, planid: planData.id })
        if (disableBtn && (planData.id === selectedSubscriptionId)) {
            console.log("My console for selectedSubscriptionId 2", { selectedSubscriptionId, disableBtn, planid: planData.id })
            setShowSpinner(true)
        } else {
            setShowSpinner(false)
        }
    }, [disableBtn, selectedSubscriptionId])

    const handleBuySubscription = (e) => {
        console.log("My console for e ", e.target.name)
        setSelectedSubscriptionId(e.target.name)
        onYes(planData)
        if (setDisableBtn) {
            setDisableBtn(true)
        }
    }

    return (<div className="subscription-flip-card-div">
        <ReactCardFlip isFlipped={flip} flipDirection="horizontal" >
            {/* Front Card Start */}
            <div className={"subscription-flip-card-front d-flex flex-column justify-content-between w-100p min-height-580px " + (currentSubscriptionId === planData.id ? "subscription-flip-card-selected-plan" : "")}>
                {popular && <div className="subscription-flip-card-popular-div">Popular</div>}
                <div className="d-flex flex-column">
                    <span className="subscription-flip-card-heading mb-30">{planData.name}</span>
                    <span className="subscription-flip-card-price">{planData?.metadata?.reg_price}</span>
                    <div className="mb-30">
                        <span className="subscription-flip-card-dollar">$</span>
                        <span className="subscription-flip-card-discounted-price">{planData?.price?.unit_amount / 100}</span>
                        <span className="subscription-flip-card-per-month">/month</span>
                    </div>
                    <div className="mb-10">
                        {planInfo && planInfo.map((ele) => {
                            return (<div className="d-flex align-items-center mb-20">
                                <CheckInCircle bgColor={"turcose"} style={{ height: "12px", width: "12px", marginRight: "8px" }} checkStyle={{ fontSize: "6px", color: "black" }} />
                                <span className="subscription-flip-card-features">{ele}</span>
                            </div>)
                        })}
                    </div>
                </div>
                <div className="w-100p">
                    <BasicButton btnTitle={currentSubscriptionId === planData.id ? "Current Plan" : "Select"} height={"60px"} width={"inherit"} background={"#01D4D5"} color={"white"} onClick={() => setFlip(!flip)} disable={currentSubscriptionId === planData.id || disableBtn} />
                </div>
            </div>
            {/* Front Card End */}

            {/* Back Card Start */}
            <div className={"subscription-flip-card-back d-flex flex-column justify-content-around text-center min-height-580px " + (currentSubscriptionId === planData.id ? "subscription-flip-card-selected-plan" : "")}>
                <span className="subscription-flip-card-heading mb-30">Are you sure you want to buy this plan ?</span>
                <div className="w-100p">
                    <div className="w-100p mb-20">
                        <BasicButton btnTitle={"Yes"} height={"60px"} width={"inherit"} background={"#01D4D5"} color={"white"} onClick={handleBuySubscription} disable={currentSubscriptionId === planData.id || disableBtn} showSpinner={showSpinner} name={planData.id} />
                    </div>
                    <div className="w-100p mb-20">
                        <BasicButton btnTitle={"No"} height={"60px"} width={"inherit"} background={"#92A9B8"} color={"white"} onClick={() => setFlip(!flip)} disable={disableBtn} />
                    </div>
                </div>
            </div>
            {/* Back Card End */}
        </ReactCardFlip>
    </div>
    )
}

export default SubscriptionFlipCard