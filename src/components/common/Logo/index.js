import React, { useEffect } from "react"
import logo from "../../../assets/images/newLogoSmaller.png"
import { useTools } from "../../../context/toolContext";
import { LANDING_PAGE_URL, APP_URL } from '../../../constants';

const Logo = ({ user, fromJobFlow }) => {
    const { useTimer, jobFlowStep } = useTools();
    
    // This useEffect will reset the LeftSidebar Tab to Home when the user clicks on the logo
    useEffect(() => {
        window.localStorage.setItem('CurrentStep',7)
    },[]);
    return (<div style={{ backgroundColor: useTimer === 0 && jobFlowStep === 3 ? "#DCE6ED" : "transparent" }}>
        <a href={user ? APP_URL : LANDING_PAGE_URL}>
            <img src={logo} className={"logo-class max-width-1750-and-min-width-575-resize-logo " + (fromJobFlow ? "resizeLogo" : "")} alt="logoImage" />
        </a>
    </div>);
};

export default Logo;