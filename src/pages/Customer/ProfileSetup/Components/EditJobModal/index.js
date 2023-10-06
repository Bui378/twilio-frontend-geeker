import React, { useEffect, useState } from "react"
import {Modal} from 'antd';
import BasicButton from "components/common/Button/BasicButton";
import SignUpHeading from "../../../../../components/common/SignUpHeading";
import SoftwareDropDown from 'components/common/SoftwareDropDown';
import { useAuth } from '../../../../../context/authContext';
import { useJob } from '../../../../../context/jobContext';
import { SECRET_KEY } from '../../../../../constants';
import * as JobApi from '../../../../../api/job.api';
import { openNotificationWithIcon } from "../../../../../utils";

const EditJobModal = ({softwareList, jobData,showEditJobModal,setIsJobSummaryUpdate, setShowEditJobModal, user}) => {

    const [softwareId, setSoftwareId] = useState(jobData?.software?.id)
    const [subSoftwareName, setSubSoftwareName] = useState(jobData?.subOption)
    const [textarea, setTextarea] = useState(jobData.issueDescription);
    const [currentSoftware, setCurrentSoftware] = useState()
    const [showSpinner, setShowSpinner] = useState(false)
    const { getGuestUser } = useAuth();
    const { updateJobAsGuest } = useJob();
    const [count,setCount] = useState(500);
	const [characterCount,setCharacterCount] = useState(textarea.length);

    useEffect(()=>{
        console.log("Job data from edit job modal", jobData)
    },[])

    /**
     * Following function will handle change of software dropdown menu
     * @params = softwareId
     * @response : update few state var
     * @author : Vinit
     */
    const onSoftwareSelection = (softwareId) => {
        console.log("My conosle for softwareId", softwareId)
        setSoftwareId(softwareId)
        const currSoftware = softwareList.find(item => item.id === softwareId)
        setCurrentSoftware(currSoftware)
        setSubSoftwareName("Select")
        setTextarea("")
    }
    
    /**
     * Following function will handle change of sub-software dropdown menu
     * @params = value : name of the selected option
     * @response : update subSoftwareName state var
     * @author : Vinit
     */
    const onSubSoftwareSelection = (value) => {
        setSubSoftwareName(value)
    }

    useEffect(() => {
      setCharacterCount(textarea.length);
    }, [textarea]);

    /**
     * Following function will handle change of issue description / more details textbox
     * @params = e
     * @response : update textarea state var
     * @author : Vinit
     */
    const handleTextareaChange = (e) => {
        const data = e.target.value.trim();
	   if (data === "") {
	          setTextarea("");
	          setCharacterCount(0);
	        } else if (data.length > 500) {
	          e.preventDefault();
	          return;
	   } else {
	          setTextarea(e.target.value);
	          setCharacterCount(e.target.value.length);
	        }
      }

    /**
     * Following function will check if user made any changes  in the existing job data
     * @params = none
     * @response : Boolean
     * @author : Vinit
     */
    const checkIfDataChanged = () => {
        if (softwareId === jobData.software.id && 
            subSoftwareName === jobData.subOption &&
            textarea === jobData.issueDescription){
                return false
        }else{
            return true
        }
    }

    /**
     * Following function will update the job object with the new information.
     * @params = none
     * @response : none
     * @author : Vinit
     */
    const updateBtnHandler = async () => {
        try {
            console.log("Data to be updated update click", {softwareId, subSoftwareName, textarea})
            const dataChanged = checkIfDataChanged()
            if(dataChanged){
                console.log("My console to check textarea", textarea.length)
                
                if(subSoftwareName === "Select"){
                    openNotificationWithIcon('info', 'Info', "Please select sub option")
                    return
                }
                if(textarea.length < 1 ){
                    openNotificationWithIcon('info', 'Info', "Please provide more details.")
                    return
                }
                
                console.log("The data is changed")
                setShowSpinner(true)
                if(!user){
                    console.log("No user found at edit job modal")
                    const guestUserRes = await getGuestUser();
                    console.log("guest user at edit job modal", guestUserRes)
                    localStorage.setItem(SECRET_KEY, guestUserRes.token.accessToken)
                    const updateJobRes = await updateJobAsGuest(jobData.id,{software:softwareId, subOption:subSoftwareName, issueDescription:textarea})
                    console.log("update job response at edit job modal", updateJobRes)
                    if(updateJobRes){
                            console.log("tetch token removed from EditJobModal/index")
                            localStorage.removeItem(SECRET_KEY)
                            // window.location.reload()
                            setIsJobSummaryUpdate(true);
                            setShowSpinner(false);
                            setShowEditJobModal(false);  
                    }else{
                        setShowSpinner(false)
                        openNotificationWithIcon('error', 'Error', "Please try again.")
                    }
                }else{
                    console.log("user found at edit job modal")
                    const updateJobRes = await JobApi.updateJob(jobData.id,{software:softwareId, subOption:subSoftwareName, issueDescription:textarea})
                    if(updateJobRes){
                        // window.location.reload()
                        setIsJobSummaryUpdate(true);
                        setShowSpinner(false)
                        setShowEditJobModal(false)  
                    }else{
                        setShowSpinner(false)
                        openNotificationWithIcon('error', 'Error', "Please try again.")
                    }
                }
            }else{
                console.log("The data is not changed")
                setShowEditJobModal(false)    
            }
        } catch (error) {
            console.log("Error occured in updateBtnHandler function", error)
        }
    }

    /**
     * Following function will handle click on cancel button
     * @params = none
     * @response : none
     * @author : Vinit
     */
    const cancelBtnHandler = () => {
        setShowEditJobModal(false)
        setSoftwareId(jobData.software.id)
        setSubSoftwareName(jobData.subOption)
        setTextarea(jobData.issueDescription)
    }

    return (<div className="edit-job-modal-outer-div">
        <Modal
            className=""
            footer={null}
            closable={false}
            visible={showEditJobModal} 
            maskStyle={{backgroundColor:"#DCE6EDCF"}}
            maskClosable={true}
        >
            <div className="edit-job-modal-inner-div">
                <div className="d-flex justify-content-center">
                    <SignUpHeading heading={"Edit Job Summary"} fontSize={"20px"} color={"#01D4D5"} boldText={true} />
                </div>
                <span className='softare-label' >I'm using:</span>
                <SoftwareDropDown
                    dropDownOptions={softwareList}
                    onSoftwareSelection={onSoftwareSelection}
                    value={ jobData.software.id }
                    name={'softwares'}
                    job={jobData}
                    softwareId={softwareId}
                />
                <span className='softare-label' >and I need help with :</span>
                <SoftwareDropDown 
                    dropDownOptions={currentSoftware?.sub_option ?  currentSoftware.sub_option : jobData?.software?.sub_option }
                    onSubSoftwareSelection={onSubSoftwareSelection}
                    name={`subsoftwares`}
                    value ={ jobData.subOption }
                    job={jobData}
                    subSoftwareName={subSoftwareName}
                />
                <span className='softare-label' >More details :</span>
                <textarea 
                   maxLength='500'
                    type="text"
                    className="software-more-details-input"
                    value={textarea} 
                    onChange={handleTextareaChange}
                />
                <div style={{ width: "100%", maxWidth: "600px",textAlign:'end' }}>
					<span style={(`${count - characterCount}` == 0)  ? {color:"red"} : {color:""}}> ({`${count - characterCount} character left`}) </span>
				</div>
                <div className="edit-job-btn-div">
                    <BasicButton onClick={cancelBtnHandler} btnTitle={"Cancel"} height={"60px"} width={"158px"} background={"#92A9B8"} color={"#fff"} disable={showSpinner} />
                    <BasicButton onClick={updateBtnHandler} btnTitle={"Update"} height={"60px"} width={"158px"} background={"#01D4D5"} color={"#fff"} showSpinner={showSpinner} disable={showSpinner} marginLeft={"10px"} />
                </div>
            </div>
        </Modal>
    </div>)
}

export default EditJobModal