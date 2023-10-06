import React from "react"

const HeadingAndSubHeading = ({ heading, subHeading, incSubHeadingFontSize }) => {
    return <>
        <div className="d-flex justify-content-center align-items-center flex-column mt-15 mb-30">
            <span className="tech-on-boarding-heading">{heading}</span>
            <span className={"tech-on-boarding-sub-heading mt-10 " + (incSubHeadingFontSize ? "font-size-imp" : "")}>{subHeading}</span>
        </div>
    </>
}

export default HeadingAndSubHeading