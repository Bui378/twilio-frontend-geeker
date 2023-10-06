import React, { useState, useEffect } from "react"
import { Modal } from 'antd';
import BasicButton from "components/common/Button/BasicButton";
import { ReactSVG } from "react-svg";
import TimeDropDown from "../TimeDropDown";
import { useJob } from '../../../../../context/jobContext';
import { useSocket } from '../../../../../context/socketContext';
import * as TwilioApi from '../../../../../api/twilioChat.api';
import { AiOutlineMinus } from "react-icons/ai";
const KeepSearchingModal = ({ showKeepSearchingModal, setShowKeepSearchingModal, setShowScheduleForLaterModal, jobInfo, setKeepSearchingFor, keepSearchingFor, useTimer, setUseTimer, job, setSearchTimesUp ,setSameTechIdAvailable,sameTechIdAvailable,sameTechIdAvailableSched, showModalFooterOffPeak}) => {

    // let smiley = require("../../../../../assets/images/frown.svg")
    const { updateJob } = useJob();
    const { socket } = useSocket();

    const handleScheduleForLaterClick = () => {
        setShowScheduleForLaterModal(true);
        setShowKeepSearchingModal(false);
        localStorage.removeItem('postAgainJobModal')
    }

    const hrArray = ["1 hours", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours"];

    const handleGoButtonClick = async () => {
        if(job){
        // await TwilioApi.updateTwilioConversation(job?.twilio_chat_service?.sid)
        updateJob(job.id, { tech_search_time: Number(keepSearchingFor.substring(0, 2)) * 3600000, tech_search_start_at: new Date(), 'post_again_reference_technician':'',twilio_chat_service:undefined})
        setUseTimer(Number(keepSearchingFor.substring(0, 2)) * 3600000)
        setShowKeepSearchingModal(false)
        setSearchTimesUp(false)
        socket.emit('search-for-tech', {
            jobData: job,
            searchSameTech: false,
            technicianId: false,
            keepSearching: true
            // posted: true,
            // status: "Pending",
            // postedTime: new Date(),
            // useTimer: useTimer
        });
    }
    }
    return (<div className="keep-searching-modal-outer-div" >
        <Modal
            className=""
            footer={null}
            closable={false}
            visible={showKeepSearchingModal}
            maskStyle={{ backgroundColor: "#DCE6EDCF" }}
            maskClosable={true}
            width={615}
        >
            <div className="d-flex justify-content-center align-items-center flex-column keep-searching-modal">
            {sameTechIdAvailable ? (
                <span className="findSameTech">
                Previous technician you are trying to reach is currently not available.
                Either create schedule job with him for later or choose keep searching for another technicians.
                </span>
            ) : sameTechIdAvailableSched ? (
                <span className="findSameTech">
                Please schedule a call or search for another technician using following option.
                </span>
            ) :   (
                <>
                {/* <ReactSVG src={smiley} />
                <div className="keep-searching-modal-heading mt-27">
                    Sorry, we’re currently experiencing
                </div>
                <div className="keep-searching-modal-heading">
                    a higher-than-average demand
                </div>
                <div className="keep-searching-modal-heading-2 mt-27">
                    Looks like you’re not the only one
                </div>
                <div className="keep-searching-modal-heading-2 mb-50">
                    struggling with {job?.software?.name}.
                </div> */}
                <div style={{fontSize:'48px'}}>😊</div>
                <div className="keep-searching-modal-heading mt-2 text-center">
                    We're happy  to keep searching for you!
                </div>
                <div className="keep-searching-modal-heading-1 my-4">
                    <div>We can keep searching if you need help now.</div>
                   <div> Otherwise,please schedule a time during normal working hours.</div>
                </div>
                <div className="keep-searching-modal-heading-2 my-3">
                    What would you like to do? 
                </div>
                </>
            )}

                <div className="mb-32">
                    <BasicButton onClick={handleScheduleForLaterClick} btnTitle={"Schedule for later"} height={"60px"} width={"277px"} background={"#01D4D5"} color={"#fff"} btnIcon={"schedule"} faFontSize={"16px"} />
                </div>
                <div className="text-fr-or mb-30">OR</div>
                
                <>
                {/* <div className="keep-searching-for-text">Keep Searching for:</div> */}
                <div className="keep-searching-modal-heading-2 my-3">
                Keep Searching for:
                </div>
                <div className="d-flex justify-content-center align-items-center">
                    <div className="keep-searching-drop-down d-flex justify-content-around align-items-center">
                        <TimeDropDown
                            dropdownValues={hrArray}
                            name={"hrArray"}
                            setKeepSearchingFor={setKeepSearchingFor}
                            keepSearchingFor={keepSearchingFor}
                        />
                    </div>
                    <BasicButton onClick={handleGoButtonClick} btnTitle={"Go"} height={"60px"} width={"67px"} color={"#293742"} background={"#fff"} border={"solid 1px #01D4D5"} />
                </div>
                
                    <div className="keep-searching-modal-heading-1 my-4">
                        {showModalFooterOffPeak &&
                            <>
                            <div className="d-flex justify-content-center flex-row align-items-center">
                            <div style={{fontSize:'30px'}}>🤗</div>
                                <span className="ml-2"> FYI <AiOutlineMinus/> Our Geeks often come to rescue</span>
                            </div>
                            <div className="">
                                customers during their time off.<span className="font-weight-bolder">But please remain </span>
                            </div>
                            <div className="">
                            <span className="font-weight-bolder">near your computer</span>. There's an automatic
                            </div>
                            <div className="">
                            "no-show" charge of $24.99
                            </div>
                            </>
                        }
                    </div>
                </> 

            </div>
        </Modal>
    </div>)
}

export default KeepSearchingModal
