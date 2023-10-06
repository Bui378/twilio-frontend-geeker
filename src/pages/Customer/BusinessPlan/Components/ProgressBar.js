import React from "react"
import CheckInCircle from "components/CheckInCircle"

const ProgressBar = ({currentStep,jobIdFromUrl}) => {
    return <div className="progress-bar-div w-full d-flex justify-content-center align-items-start max-width-768-mb-40px">
                <div className="progress-point d-flex flex-column justify-content-center align-items-center">
                    <CheckInCircle bgColor={"turcose"} style={{height:"30px", width:"30px"}} checkStyle={{color:"black", fontSize: "12px"}} />
                    <span className="progress-bar-text">Email</span>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&gt;&nbsp;&nbsp;&nbsp;&nbsp;
                <div className="progress-point d-flex flex-column justify-content-center align-items-center">
                    <CheckInCircle bgColor={
                                            currentStep > 2 ? "turcose" : "grey" 
                                            } style={{height:"30px", width:"30px"}} checkStyle={{color:"black", fontSize: "12px"}} />
                                            <div className="d-flex flex-column align-items-center">
                                                <span className="progress-bar-text">Account</span>
                                                <span className="progress-bar-text line-height-1 mb-3">Details</span>
                                            </div>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&gt;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div className="progress-point d-flex flex-column justify-content-center align-items-center">
                    <CheckInCircle bgColor={
                                            currentStep > 3 ? "turcose" : "grey" 
                                            } style={{height:"30px", width:"30px"}} checkStyle={{color:"black", fontSize: "12px"}} />
                    <span className="progress-bar-text">Purchase</span>
                </div>
            </div>
}

export default ProgressBar