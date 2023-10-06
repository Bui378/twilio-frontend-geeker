import React from "react"
import logo from "../../../../assets/images/newLogoSmaller.png";
import { useTools } from "../../../../context/toolContext";

const LogoWithoutClick = ({ fromJobFlow }) => {
    const { useTimer, jobFlowStep } = useTools();
    return (<div style={{ backgroundColor: useTimer === 0 && jobFlowStep == 3 ? "#DCE6ED" : "transparent" }}>
        <a>
            <img src={logo} className={"logo-class max-width-1750-and-min-width-575-resize-logo " + (fromJobFlow ? "resizeLogo" : "")} />
        </a>
    </div>);
};

export default LogoWithoutClick;