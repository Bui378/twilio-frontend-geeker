import React from "react"

const SignUpHeading = ({heading, fontSize, color, marginLeft, boldText}) => {

    const styleFromProps = {fontSize, color, marginLeft}

    return(<span className={"font-nova signUpHeadingSpan " + (boldText ? "boldHeading" : "")} style={styleFromProps}>{heading}</span>)
}

export default SignUpHeading