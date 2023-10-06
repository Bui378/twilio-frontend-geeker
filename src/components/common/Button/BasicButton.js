import React from "react"
import { FaCalendar } from "react-icons/fa";
import { faArrowRight,faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Spin} from 'antd';
import '../../../style.css'

const BasicButton = ({id,btnTitle, height, width, background, color, onClick, btnIcon, faFontSize, border, disable, showSpinner, marginLeft, arrowDirection, name, btnType,holdTight, moreClasses, style }) => {
    const buttonStyle ={height, width,background: disable ? "#97ABB6" : background, color, border, marginLeft, ...style}
    const faCalenderStyleFromProps = {fontSize:faFontSize}

    return(<>
        <button id={id} type={btnType} name={name} className={"basicBtn " + moreClasses + ' ' + (disable ? "opacity-point-5 cursor-alias" : "") + (holdTight === 'holdTight' ? "holdTight-css" : "")} style={buttonStyle} onClick={onClick} disabled={disable}>
            {!showSpinner ?  <>
                                {btnIcon === "schedule" ? <FaCalendar className="mr-15 mtn-5" style={faCalenderStyleFromProps} /> 
                                                        : btnIcon === "arrow" ? 
                                                                                <FontAwesomeIcon className="arrow-font-size"
                                                                                icon={arrowDirection === "left" ? faArrowLeft : ""}
                                                                                />
                                                                              :  ""
                                }
                                {btnTitle}
                                {btnIcon === "arrow" ? <FontAwesomeIcon className="arrow-font-size"
                                                    icon={arrowDirection === "right" ? faArrowRight : ""}
                                                    />
                                                    :  ""
                                }
                            </>
                         : 
                            <Spin className="spinner spinner-pos" />
            }
        </button>
    </>)
}

export default BasicButton