import React, {useEffect ,useState} from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import FooterBtns from "components/FooterBtns"
import ReactPlayer from 'react-player/lazy';
import { FaPlay } from "react-icons/fa";
import { openNotificationWithIcon } from "../../../../utils"
import * as TechnicianApi from '../../../../api/technician.api';
import mixpanel from 'mixpanel-browser';
import { EmailOutlook } from "../../../../constants"

const DemoVideo = ({onPrev, onNext, setShowProgress, setProgressBarPercentage, register, user, setCurrentStep}) => {

    const[playBtn,setPlayBtn] = useState(false);
    const[playButton,setPlayButton] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false)
    const [firstVideoComplete, setFirstVideoComplete] = useState(false)
    const [secondVideoComplete, setSecondVideoComplete] = useState(false)
    const [disableNextBtn, setDisableNextBtn] = useState(true)

    useEffect(()=>{
        console.log("videos watched", {firstVideoComplete, secondVideoComplete})
        if(firstVideoComplete && secondVideoComplete){
            setDisableNextBtn(false)
        }
    },[firstVideoComplete, secondVideoComplete])

    useEffect(()=>{
        setShowProgress(true)
        setProgressBarPercentage(70)
    },[])

    const handleOnNext = async () => {

        let temp =[]
        for (let x in user.technician.expertise){
            if(user.technician.expertise[x].software_id !== EmailOutlook){
                temp.push(user.technician.expertise[x].result)
            }
        }
        if(temp.includes(undefined)){
            setShowSpinner(true)
            await TechnicianApi.updateTechnician(register.technician.id, {registrationStatus:"exam"})
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Technician - watched video and proceeded to next form');
            // mixpanel code//
            onNext()
        }else{   
            setShowSpinner(true)
            await TechnicianApi.updateTechnician(register.technician.id, {registrationStatus:"finalize_profile"})
            setCurrentStep(7)
        }
    }

    return<div className="d-flex justify-content-center align-items-center flex-column">
    <HeadingAndSubHeading heading={"Please watch the video's below. 🔑"} subHeading={"These video's shows you how the system works, it’s very important."} />

    <div className="d-flex justify-content-center align-items-center flex-wrap">
        <div className="d-flex mr-20 media-mr">
        <div className="demo-video mb-50 mt-20">
           <div className={!playBtn ? "demoDivContainer" : "demoDivContainer2"}>
                <div className="react-demoDiv">
                { !playBtn &&
                     <button onClick={()=>{setPlayBtn(true) }} className="play-button">
                      <FaPlay className="play-btn" />
                    </button>
                } 
                </div>
            </div>
                <ReactPlayer  
                     url='https://www.youtube.com/watch?v=vDn5vaDfIek' 
                     className="react-player"
                     playing={playBtn}
                     controls
                     onEnded={()=>setFirstVideoComplete(true)}
                />
                
        </div>
        </div>

        <div className="">
        <div className="demo-video mb-50 mt-20">
           <div className={!playButton ? "demoDivContainer" : "demoDivContainer2"}>
                <div className="react-demoDiv">
                { !playButton &&
                     <button onClick={()=>{setPlayButton(true) }} className="play-button">
                      <FaPlay className="play-btn" />
                    </button>
                } 
                </div>
            </div>
                <ReactPlayer  
                     url='https://www.youtube.com/watch?v=r5QDWtxBtSo' 
                     className="react-player"
                     playing={playButton}
                     controls
                     onEnded={()=>setSecondVideoComplete(true)}
                />
                
        </div>
        </div>
    </div>
        <span className="video-span">Do you want to know on how it looks on the user's end? <a href="https://www.youtube.com/watch?v=vDn5vaDfIek" target="_blank">Watch this</a></span>

    <FooterBtns onPrev={onPrev} showSpinner={showSpinner} hideSaveForLater={true} onNext={playBtn && playButton ? handleOnNext : ()=>{ openNotificationWithIcon('error', 'Error', 'Please Play Video') ; }} disableNextBtn={disableNextBtn} />

</div>
}

export default DemoVideo