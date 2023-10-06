import React , {useState, useEffect} from "react"
import RoundSelectorBtn from "components/RoundSelectorBtn"
import SoftwareStrength from "components/SoftwareStrength"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import FooterBtns from "components/FooterBtns"
import * as SoftwareApi from '../../../../api/software.api';
import * as TechnicianApi from '../../../../api/technician.api';
import { openNotificationWithIcon } from "utils"
import Loader from '../../../../components/Loader';
import mixpanel from 'mixpanel-browser';
import {EmailOutlook} from "../../../../constants"

const WhatIsYourSpeciality2 = ({onNext, onPrev, setShowProgress, setProgressBarPercentage, setExpertiseArrselected, expertiseArrselected, register, expertiseLevel, setExpertiseLevel, user, refetch }) => {

    const [selectedsoftwareList, setSelectedSoftwareList] = useState([]);
    const [showLoader, setShowLoader] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false)

    useEffect(()=>{
        (async () => {
            const softwareListResponse = await SoftwareApi.getSoftwareList()
            let selectedSoftware = []
            if(softwareListResponse && softwareListResponse.data){
                for (var x in expertiseArrselected){
                    for (var y in softwareListResponse.data){
                        let temp = {}
                        if(softwareListResponse.data[y].id === expertiseArrselected[x].id){
                            temp = softwareListResponse.data[y]
                            selectedSoftware.push(temp)
                        }
                    }
                }
                setSelectedSoftwareList(selectedSoftware)
                setShowLoader(false)
            }
        })();
        setShowProgress(true)
        setProgressBarPercentage(45)
        refetch()
        setExpertiseLevel(user.technician.expertise)
        setExpertiseArrselected(user.technician.expertise)
    },[])

    useEffect(()=>{
        (async ()=>{
            setShowLoader(true)
            const softwareListResponse = await SoftwareApi.getSoftwareList()
            let selectedSoftware = []
            if(softwareListResponse && softwareListResponse.data){
                for (var x in user.technician.expertise){
                    for (var y in softwareListResponse.data){
                        let temp = {}
                        if(softwareListResponse.data[y].id === user.technician.expertise[x].software_id){
                            temp = softwareListResponse.data[y]
                            selectedSoftware.push(temp)
                        }
                    }
                }
                setSelectedSoftwareList(selectedSoftware)
                setShowLoader(false)
            }
        })();
        setExpertiseLevel(user.technician.expertise)
        setExpertiseArrselected(user.technician.expertise)
    },[user])

    /**
	 * Following function is used to handle change for experience between "1-5 Years" & "5-10 Years".
     * @params =  event and software
	 * @response : expertiseLevel[]
	 * @author : Vinit
	 */
    const handleYearsOfExpBtn = (event, software) =>{
        let experience = [...expertiseLevel]
        let temp = {software_id: software.id, experience: event.currentTarget.innerText, parent: software.parent}
        if(experience.length > 0){
            let elementExists = experience.find((item)=> item.software_id === software.id)
            if(elementExists){
                let elementIndex = experience.findIndex(item => item.software_id === software.id)
                let currentEle = experience[elementIndex]
                if(/[\n]/.test(event.currentTarget.innerText)){
                    currentEle.experience = event.currentTarget.innerText.slice(0, event.currentTarget.innerText.length-1);
                }else{
                    currentEle.experience = event.currentTarget.innerText
                }
                experience.push(currentEle)
                experience.splice(elementIndex, 1)
                setExpertiseLevel(experience)
            }else{
                experience.push(temp)
                setExpertiseLevel(experience)    
            }
        }else{
            experience.push(temp)
            setExpertiseLevel(experience)
        }
    }

    /**
	 * Following function is used to handle change for level of expertise for sub options.
     * @params =  event and software
	 * @response : expertiseLevel[]
	 * @author : Vinit
	 */
    const handleStrengthLevel = (event, software) =>{
        let sub_option = ""
        if(/[\n]/.test(event.currentTarget.children[0].innerText)){
            sub_option = event.currentTarget.children[0].innerText.slice(0, event.currentTarget.children[0].innerText.length-1)
        }else{
            sub_option = event.currentTarget.children[0].innerText
        }
        let experience = [...expertiseLevel]
        let temp = []
        let temp2 ={option: sub_option, current_num: event.target.innerText, parent: software.parent}
        if(experience.length > 0){
            let elementExists = experience.find(item => item.software_id === software.id)
            if(elementExists){
                let elementIndex = experience.findIndex(item => item.software_id === software.id)
                let currentEle = experience[elementIndex]
                let optionExists = currentEle.sub_options && currentEle.sub_options.find(item => item.option === sub_option)
                if(optionExists){
                    let optionIndex = currentEle.sub_options.findIndex(item => item.option === sub_option)
                    let currentoption = currentEle.sub_options[optionIndex]
                    currentoption.current_num = event.target.innerText
                    experience.push(currentEle)
                    experience.splice(elementIndex,1)
                    setExpertiseLevel(experience)
                }else{
                    !currentEle.sub_options ? currentEle.sub_options = [] : currentEle.sub_options = currentEle.sub_options
                    currentEle.sub_options.push(temp2)
                    experience.push(currentEle)
                    experience.splice(elementIndex,1)
                    setExpertiseLevel(experience)
                }
            }else{
                temp.push(temp2)
                let temp3 = {
                            software_id: software.id,
                            sub_options: temp
                            }
                experience.push(temp3)
                setExpertiseLevel(experience)
            }
        }else{
            temp.push(temp2)
            let temp3 = {
                        software_id: software.id,
                        sub_options: temp
                        }
            experience.push(temp3)
            setExpertiseLevel(experience)
        }
    }

    const saveForLater = async ()=>{
        if(register){
            const expertiseResponse = await TechnicianApi.updateTechnician(register.technician.id, {expertise:expertiseLevel})
            if(expertiseResponse){
                openNotificationWithIcon('success', 'Success', "Softwares experience(s) saved for later.")
                // mixpanel code//
                mixpanel.identify(user.email);
                mixpanel.track('Technician - saved software expertise level (if any) for later');
                // mixpanel code//
            }
        }
    }

    const handleNextBtn = async ()=>{
        if(expertiseLevel.length !== 0 && expertiseLevel.length === expertiseArrselected.length){
            for(let x in expertiseLevel){
                if(expertiseLevel[x].software_id !== EmailOutlook)//Excluding Email / Outlook software
                {
                    if(!expertiseLevel[x].experience && expertiseLevel[x].sub_options.length === 0){
                        openNotificationWithIcon('error', 'Error', "Please provide your experience for all the selected softwares.")
                        return
                    }
                }
            }
            setShowSpinner(true)
            if(register){
                const expertiseResponse = await TechnicianApi.updateTechnician(register.technician.id, {expertise:expertiseLevel, registrationStatus:"availability"})
                if(expertiseResponse){
                    openNotificationWithIcon('success', 'Success', "Softwares experience updated.")
                    // mixpanel code//
                    mixpanel.identify(user.email);
                    mixpanel.track('Technician - submitted software expertise level and proceeded to next form');
                    // mixpanel code//
                }
            }
            onNext()
        }else{
            openNotificationWithIcon('error', 'Error', "Please provide your experience for all the selected softwares.")
        }
    }

  if(showLoader) return(<Loader />)
    return(
    <div className="d-flex justify-content-center align-items-center flex-column">
            <HeadingAndSubHeading heading={"How familiar are you with this?"} subHeading={"“1” is “I'm not very familiar” and “5” is “I do this in my sleep!” (kidding, kidding.)"} />

        {selectedsoftwareList.map((software)=>{
            if(software.id !== EmailOutlook){
                return(
                    <React.Fragment key={software.id}>
                    <div className="software-name-div d-flex align-items-center specilaity-two-div">
                        <img src={software.blob_image} className="sw-img" alt="speciality"/>
                        <span className="software-name-span">{software.name}</span>
                    </div>

                    <div className="d-flex flex-wrap align-items-center w-60p mt-15 align-baseline specilaity-two-div">
                        <span className="tech-on-boarding-sub-heading mr-15">Years of experience</span>
                        <div className="d-flex flex-wrap">
                            <div className="mr-20">
                                <RoundSelectorBtn expertiseLevel={expertiseLevel} software={software} btnTitle={"1-5 Years"} clickHandler={(event)=>{handleYearsOfExpBtn(event,software)}} btnName={"experience"}/> 
                            </div>
                            <RoundSelectorBtn expertiseLevel={expertiseLevel} software={software} btnTitle={"5-10 Years"}  clickHandler={(event)=>{handleYearsOfExpBtn(event,software)}} btnName={"experience"}/> 
                        </div>
                    </div>
                    
                    <div className="d-flex align-items-center w-60p mt-10 specilaity-two-div">
                        <span className="tech-on-boarding-sub-heading">What are your strength?</span>
                    </div>

                    <div className="strength-outer-div w-60p mt-20 d-flex flex-column specilaity-two-div">
                        {software.sub_option.map((sub_option, index)=>{
                            return <SoftwareStrength title={sub_option} expertiseLevel={expertiseLevel} software={software} key={index} callBack={(event)=>{handleStrengthLevel(event, software)}} />
                        })}
                    </div>
                    </React.Fragment>)
            }
        })}

            
            

        {/* Buttons */}
        <FooterBtns onPrev={onPrev} onNext={handleNextBtn} saveForLater={saveForLater} showSpinner={showSpinner} />
    </div>)
}

export default WhatIsYourSpeciality2