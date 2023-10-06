import React from "react"
import Logo from "../Logo"
// import { Container, Row, Col } from "react-bootstrap";
import LogoWithoutClick from "../Logo/LogoWithoutClickability";

const LogoWithHeading = ({ heading, user, jobFlowStepNumber, currentTab }) => {
    return (<>
        <div className="container w-90 justify-content-center">
            <div className="row mb-5">
                <div className="col-md-2 col-sm-2">
                    {jobFlowStepNumber && jobFlowStepNumber == 1 ?
                        <LogoWithoutClick fromJobFlow={true} /> :
                        <Logo fromJobFlow={true} user={user} />
                    }
                </div>
                <div className="col-md-8 col-sm-8 grid-center">
                    <span className={"headingWithLogo headingWithLogo-max-width-600 " + (heading === "Help is on the way!" || heading === "Job Summary" ? "font-size-32-imp" : "")}>{heading}</span>
                </div>
                {jobFlowStepNumber === 2 && currentTab === "createYourAccount" && <div className="d-flex justify-content-center w-100p">
                    <span className={"headingWithLogo headingWithLogo-max-width-600 color-turcose-imp"}>Reminder! First 6 minutes are free</span>
                </div>}
            </div>
        </div>
    </>)
}

export default LogoWithHeading