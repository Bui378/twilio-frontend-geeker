import React, { useState, useEffect } from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import NewSquareBtn from "components/NewSquareBtn"
import { CALENDLY_EVENT_URL_TEST, CALENDLY_EVENT_URL_LIVE } from '../../../../constants/index';
import { useCalendlyEventListener, InlineWidget } from "react-calendly";
import mixpanel from 'mixpanel-browser';
import { useUser } from '../../../../context/useContext';
import * as TechnicianApi from '../../../../api/technician.api';
import { Spin } from 'antd';
import { useSocket } from '../../../../context/socketContext';

const ScheduleInterview = ({ onPrev, setShowProgress, setProgressBarPercentage, register, setCheckScheduleInterview }) => {
    const { user } = useUser()
    const [calendly, setCalendly] = useState('');
    const [disableCompleteBtn, setDisableCompleteBtn] = useState(true)
    const [showSpinner, setShowspinner] = useState(false)
    const { socket } = useSocket();

    useEffect(() => {
        setShowProgress(true)
        setProgressBarPercentage(100)
        if (user.userType == 'technician' && user?.technician?.technicianType == 'live') {
            setCalendly(CALENDLY_EVENT_URL_LIVE)
        }
        else {
            setCalendly(CALENDLY_EVENT_URL_TEST)
        }
    }, [])

    useCalendlyEventListener({
        onEventScheduled: (e) => {
            setDisableCompleteBtn(false)
            setCheckScheduleInterview(true)
        },
    });

    const handleComplete = async () => {
        setShowspinner(true)
        if (user) {
            let dataToSend = {
                tagName: "techRegistered",
                technicianObject: user
            }
            socket.emit("send-GTM-tag-tech-onboard", dataToSend)
            mixpanel.identify(user.email);
            mixpanel.track('Technician- Click Next button from Schedule interview page', { 'Email': user.email });
        }
        await TechnicianApi.updateTechnicianWithParams(register.technician.id, { registrationStatus: 'interview_result' })
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Technician - scheduled interview');
        // mixpanel code//
        window.location.href = "/"
    }

    return <div className="d-flex justify-content-center align-items-center flex-column">
        <HeadingAndSubHeading heading={"Schedule Interview"} subHeading={"Set up your meeting with HR at Geeker! We’ll discuss you, your goals, and how you’re going to succeed at Geeker! We’re very excited to meet you and greet you."} />

        {calendly !== '' && <InlineWidget
            url={calendly}
            rootElement={document.getElementById("root")}
            text="Schedule"
            prefill={{
                email: user.email,
                name: user.firstName + '' + user.lastName,
                customAnswers: {
                    a2: user.technician.profile.confirmId.phoneNumber,
                }
            }}
        />}

        <div className="btn-footer d-flex justify-content-between align-items-center">
            <NewSquareBtn type={"previous"} onPrev={onPrev} />


            <button
                className={"green-btn"}
                style={{ opacity: disableCompleteBtn ? "0.3" : "1" }}
                disabled={disableCompleteBtn}
                onClick={handleComplete}
            >
                <span></span>
                {(showSpinner
                    ?
                    <Spin className="spinner" />
                    :
                    <span className="green-btn-span">Complete</span>
                )}
            </button>
        </div>
    </div>
}

export default ScheduleInterview