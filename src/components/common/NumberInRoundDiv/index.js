import React from "react"
import { FaCheck } from "react-icons/fa";

const NumberInRounddiv = ({title, showCheck, height, width, backgroundColor, borderColor, fontSize, faColor, color, fontWeight}) => {

    const divStyleFromProps = {height, width, backgroundColor, borderColor}
    const spanStyleFromProps = {fontSize, color, fontWeight}
    const faCheckStyleFromProps = {fontSize, color:faColor}

    return(<>
        <div style={divStyleFromProps} className="border-circle" >
            {showCheck  ? <FaCheck style={faCheckStyleFromProps} /> 
                        : <span style={spanStyleFromProps} >{title}</span>}
        </div>
    </>)
}

export default NumberInRounddiv