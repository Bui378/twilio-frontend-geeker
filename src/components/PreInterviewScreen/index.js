import React from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import FooterBtns from "components/FooterBtns"
import mixpanel from 'mixpanel-browser';

const PreInterviewScreen = ({ onPrev, setShowPreInterview, user }) => {

    const handleStartExam = () => {
        setShowPreInterview(false)
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Technician - started exam');
        // mixpanel code//
    }

    return <div className="mt-50">
        <HeadingAndSubHeading heading={""} subHeading={"You’ll now begin this 10-question quiz to review your skills. It’s nothing major. We’re just verifying your skills :)"} incSubHeadingFontSize={true} />
        <p>You’ll do great!</p>
        <div className="d-flex justify-content-center align-items-center w-75p flex-column">
            <div className="details-div justify-content-start instructions-text" style={{ minHeight: '100px' }}>
                <header>
                    <p style={{ fontSize: '15px' }}>
                        On this page, you'll have the ability to answer a 10 question exam. This exam is a brief overview of your general capabilities, and once completed successfully, will give you the ability to move forward in the process.
                    </p>
                    <p style={{ fontSize: '25px' }} className='text-center mt-2'>
                        <b>Good luck! </b>
                    </p>
                </header>
            </div>
        </div>
        <FooterBtns onPrev={onPrev} hideSaveForLater={true} onNext={handleStartExam} />
    </div>
}

export default PreInterviewScreen

