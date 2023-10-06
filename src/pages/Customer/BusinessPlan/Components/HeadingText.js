import React from "react"

const HeadingText = ({firstBlackText, secondGreenText, secondBlackText}) => {
    return <>

        <span className="headingText-span-font dark-color">{firstBlackText}</span> 
        <span className="headingText-span-font turquiose-color">{secondGreenText}</span> 
        <span className="headingText-span-font dark-color">{secondBlackText}</span> 

    </>
}

export default HeadingText