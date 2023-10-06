import CheckInCircle from "components/CheckInCircle"
import RightArrow from "components/rightArrow"
import React from "react"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ProgressBarTechOnboarding = ({ progressBarPercentage, currentStep }) => {

    return (<div className="d-flex justify-content-center align-items-center mb-20 position-relative progress-container">
        <div className="progressbar-container">
            <CheckInCircle bgColor={currentStep && currentStep > 0 ? "turcose" : "grey"} />
            <RightArrow />
            <CheckInCircle bgColor={currentStep && currentStep > 1 ? "turcose" : "grey"} />
            <RightArrow />
            <CheckInCircle bgColor={currentStep && currentStep > 2 ? "turcose" : "grey"} />
            <RightArrow />
            <CheckInCircle bgColor={currentStep && currentStep > 3 ? "turcose" : "grey"} />
            <RightArrow />
            <CheckInCircle bgColor={currentStep && currentStep > 4 ? "turcose" : "grey"} />
            <RightArrow />
            <CheckInCircle bgColor={currentStep && currentStep > 5 ? "turcose" : "grey"} />
            <RightArrow />
            <CheckInCircle bgColor={currentStep && currentStep > 6 ? "turcose" : "grey"} />
            <RightArrow />
            <CheckInCircle bgColor={currentStep && currentStep > 7 ? "turcose" : "grey"} />
        </div>
        <div className="circular-progress-container">
            <CircularProgressbar className="circular-progress-2" value={progressBarPercentage} text={`${progressBarPercentage}%`} />
            <p className="circular-progress-p">complete</p>
        </div>
    </div>)
}

export default ProgressBarTechOnboarding