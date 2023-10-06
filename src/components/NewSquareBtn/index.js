import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Spin } from 'antd';

const NewSquareBtn = ({ type, onNext, onPrev, showSpinner, disableNextBtn }) => {

    const turcoseBgColor = { backgroundColor: "#01D4D5" }
    const greyBgColor = { backgroundColor: "#92A9B8" }
    const [disableBtn, setDisableBtn] = useState(false)

    useEffect(() => {
        if (showSpinner) setDisableBtn(true)
    }, [showSpinner])

    return (<>
        <button
            className={`new-square-btn ${disableNextBtn ? "disableElement" : ""}`}
            style={type === "next" ? turcoseBgColor : type === "previous" ? greyBgColor : ""}
            onClick={() => { (type === "next") ? onNext() : (type === "previous") ? onPrev() : console.log("") }}
            disabled={disableBtn || disableNextBtn}
        >
            <span></span>
            {(disableBtn
                ?
                <Spin className="spinner" />
                :
                <FontAwesomeIcon
                    className="arrow-font-size"
                    icon={type === "next" ? faArrowRight : type === "previous" ? faArrowLeft : ""}
                />
            )}
        </button>
    </>)
}

export default NewSquareBtn