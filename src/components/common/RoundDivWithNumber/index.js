import React from "react"
import { FaCheck } from "react-icons/fa";

const RoundDivWithNumber = ({number, showCheck, backgroundColor, color, display}) => {

    const divStyleFromProps ={backgroundColor, display}
    const spanStyleFromProps ={color}

    return(
        <div 
            style={divStyleFromProps}
            className={"fa-Check-acc-details-div " + (showCheck ? "fa-Check-acc-details-div-check" : "")} 
        >
                {showCheck  ? <FaCheck className="fa-Check-acc-details"/>  
                            : <span className="acc-details-sr-no" style={spanStyleFromProps}>{number}</span>}
        </div>
    )
}

export default RoundDivWithNumber