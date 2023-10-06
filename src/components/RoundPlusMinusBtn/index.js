import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

const RoundPlusMinusBtn = ({ sign, showBtn, otherStyles }) => {
    let styleObj = { background: sign === "plus" ? '#2F3F4C' : sign === "minus" ? "#92A9B8" : "" }
    if (sign === 'plus') {
        styleObj["visibility"] = showBtn ? "visible" : "hidden"
    }
    if (sign === 'minus') {
        styleObj["display"] = showBtn ? "" : "none"
    }
    return <>
        <button className="black-round-btn"
            style={{ ...styleObj, ...otherStyles }}>
            <FontAwesomeIcon
                className="sign-font-size"
                icon={sign === "plus" ? faPlus : sign === "minus" ? faMinus : ""}
            />
        </button>
    </>
}

export default RoundPlusMinusBtn