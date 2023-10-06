import React, { memo, useState, useEffect } from "react";
import { Row, Typography, Select, Col, Modal, Spin, notification } from "antd";
// import HeadingAndSubHeading from "components/HeadingAndSubHeading";
// import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import {Button,InputGroup,Form} from  'react-bootstrap';
import styled from "styled-components";
import { openNotificationWithIcon } from "../../../../utils";
// import { faEye } from "@fortawesome/free-regular-svg-icons";
import { ItemContainer, ItemTitle } from "./style";
import PhoneInput from "react-phone-input-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckCircle,faCopy} from "@fortawesome/free-solid-svg-icons";
// import TechImages from "../../../../components/TechImages";
import H4 from "../../../../components/common/H4";
import { getFullName } from "../../../../utils";
import editIcon from "../../../../assets/images/edit.png";
import Input from "../../../../components/AuthLayout/Input";
import { languages,QUICKBOOK_SOFTWARE_ID,APP_URL } from "../../../../constants";
import { useAuth } from "../../../../context/authContext";
// import Checkbox from "../../../../components/common/CheckBox";
import * as TechnicianService from "../../../../api/technician.api";
import ItemLabel from "../../../../components/ItemLabel";
// import * as ExperienceService from "../../../../api/experience.api";
import * as SoftwareApi from '../../../../api/software.api';
import CheckBox from '../../../../components/common/CheckBox';
import {useSocket} from '../../../../context/socketContext';
import Loader from '../../../../components/Loader';
import { Steps } from "antd";
// import { ConsoleSqlOutlined, InfoCircleOutlined, WindowsFilled } from '@ant-design/icons';
import {EmailOutlook} from "../../../../constants"
import * as InterviewQuestionApi from '../../../../api/interview.api';
import MCQ from "components/MCQ"
import ExamLoader from "../../Register/steps/ExamLoader"
// let count =  1 ;

const { Step } = Steps;
const { Text } = Typography;
const { Option } = Select;
const ratingScale = [
	"1Beginner",
	"2Basic knowledge but never used professionally",
	"3Pretty fluent & limited use professionally",
	"4Very fluent and a lot of use professionally",
	"5Complete mastery with extensive professional use",
];

function SoftwareDetailSection({
	software,
	title,
	experience,
	setExperience,
	parent,
	touchPointsList,
	softwareExperienceList,
	user,
	activeSoftwareIds,
	savedSoftwareExperience,
	savedCheckboxOptions,
	savedTouchPoints,
	preSavedOjectFormat,
	refetch,
	softwareSwitchChecked,
	setSoftwareSwitchChecked,
	socket

}){
	// console.log("software",software)
	// console.log("parent",parent)
	// console.log("touchPointsList",touchPointsList)
	// console.log("softwareExperienceList",softwareExperienceList)
	// console.log("title",title)
	// console.log("experience",experience)
	// console.log('activeSoftwareIds',activeSoftwareIds)
	// console.log('savedSoftwareExperience',savedSoftwareExperience)

	// const [experienceYearArea, setExperienceYearArea] = useState('');
	// const [expertises, setExpertises] = useState([]);
	// const [dataToSave, setDataToSave] = useState([])
	const [softwareExperience, setSoftwareExperience] = useState(savedSoftwareExperience)
	const [touchPoints, setTouchPoints] = useState(preSavedOjectFormat)
	const [touchPointsSelected, setTouchPointsSelected] = useState(savedTouchPoints)
	const [checkboxOptions, setCheckboxOptions] = useState(savedCheckboxOptions);
	const [saveSoftwareProgress,setSaveSoftwareProgress] = useState([]);
	// const [alertMessageAdditionalLanguage, setAlertMessageAdditionalLanguage] = useState('')
	// const [submittedAdditionalLanguage,setAdditionalLanguage] = useState([])
	
	const experiencesYearAreas = softwareExperienceList.map((d) => {
		if(d.status.toLowerCase() === 'active'){
			return (
				<Option key={`others-${d['id']}`} style={{ textAlign: 'left' }} value={`${d['id']}`}>
					{d['expr_from']} - {d['expr_to']}
				</Option>
			)
		}
		return null;
	});

	// useEffect(() => {
    //     (async () => {
    //         let ques = [];
    //             const quest = await InterviewQuestionApi.getQuestionList(s.testId);
           	 	
    //     })();
    // }, []);
	useEffect(() => {
		if (experience) {
			// setExperienceYearArea(experience.experienceYearArea);
			// setExpertises(experience.expertises);
		}
	}, [experience]);


	useEffect(() => {
		setSoftwareExperience(savedSoftwareExperience)
		setCheckboxOptions(savedCheckboxOptions)
	}, [savedSoftwareExperience,savedCheckboxOptions]);

	/*const isExist = (expertise) => {
		if(expertises !==  undefined){
			return !!expertises.find(item => item.expertise === expertise.id)
		}
		else{
			return false
		}
	

	};*/
	// const findExpertise = (expertise) => expertises.find(item => item.expertise === expertise.id);
   
	/*const handleChangeLevel = (expertise, rate) => {
		const newExpertises = isExist(expertise)
		? expertises.map(item => item.expertise === expertise.id ? { ...item, rate } : item)
		: [...expertises, { expertise: expertise.id, rate }];

		setExpertises(newExpertises);
		setExperience({
			software: software.id,
			experienceYearArea,
			expertises: newExpertises,
		});
	};*/

	const handleCheckBoxStatus = (sid, e) => {
		let checkOptions = {...checkboxOptions};
		if(!e.target.checked){
			let idxItem = checkOptions[sid].indexOf(e.target.value)
			if(idxItem !== -1){
				checkOptions[sid].splice(idxItem,1)
			}
			setCheckboxOptions(checkOptions);

			let temp_selected = {...touchPointsSelected};
			temp_selected[software.id+'_'+e.target.value] = -1
			setTouchPointsSelected(temp_selected)
		}else{
			if(checkOptions[sid] === undefined){
				checkOptions[sid] = [];
			}
			checkOptions[sid].push(e.target.value)
			setCheckboxOptions(checkOptions);

		}
	};

	const handleTouchPoints = (current, optionName) => {
		// console.log('current',current)
		if(touchPointsList[current]){

			let sid = software.id;
			
			let temp_selected = {...touchPointsSelected};
			temp_selected[sid+'_'+optionName] = current
			setTouchPointsSelected(temp_selected)

			let t_obj = touchPoints;
			let t_arr = (t_obj[sid] ? t_obj[sid] : [])

			if(t_arr.length > 0){
				let idx = t_arr.findIndex(o => o.option === optionName);
				if(idx !== -1){
					t_arr.splice(idx,1)
				}

			}

			let temp_obj = {
				'option':optionName,
				'touch_point': touchPointsList[current].level,
				'touch_point_id': touchPointsList[current].id,
				'current_num':current
			}
			temp_obj[optionName] = current
			t_arr.push(temp_obj)
			t_obj[sid] = t_arr;
			setTouchPoints(t_obj);
			// console.log('tc',touchPoints)
			
		}
	}
	const saveSoftwareData = async(s)=> {
		// console.log("s",s)
		let sp = [...saveSoftwareProgress]
		sp.push(s.id)
		setSaveSoftwareProgress(sp)

		let techData = await TechnicianService.retrieveTechnician(user.technician.id)
		// console.log("techData",techData)
		let dataToSave = {}
		dataToSave['software_id'] = s.id
		dataToSave['experience'] = (softwareExperience[s.id] ? softwareExperience[s.id] : '')
		dataToSave['sub_options'] = (touchPoints[s.id] ? touchPoints[s.id] : [])
		dataToSave['parent'] = (s.parent ? s.parent : '')
		// console.log("dataToSave",dataToSave)

		var dataArr = [];
		if(techData && techData.expertise){
			dataArr = [...techData.expertise];
			// console.log("Before data arr::",dataArr)
			let idx = dataArr.findIndex(o => o.software_id === s.id);
			// console.log("idx ::: ",idx)
			if(idx !== -1){
				dataArr.splice(idx,1)
			}
			
			dataArr.push(dataToSave)
			// console.log("After data arr::",dataArr)
		}else{
			dataArr.push(dataToSave)
		}
		let res = await TechnicianService.updateTechnician(techData.id,{
		  expertise:dataArr,
		  profileImage:{imageUrl:false}
		})

		if(res && res.id){
			notification.success({
				message: 'Experience saved successfully.',
			});
			let checkedIds = [...softwareSwitchChecked]
			checkedIds.push(s.id)
			setSoftwareSwitchChecked(checkedIds)

		}else{
			notification.error({
				message: 'Faild to save data. Please reload your page and try again.',
			});
		}
		sp = [...saveSoftwareProgress]
		sp.splice(sp.indexOf(s.id),1)
		setSaveSoftwareProgress(sp)

		refetch()

		setTimeout(function(){
			socket.emit("loggedOut",{userId:user.id, userType:user.userType})
			setTimeout(function(){
				socket.emit("loggedIn",{userId:user.id,userType:user.userType,user:user})                    
			},1000)
		},1000)

	};

	return (
		<SoftwareContainer className={(activeSoftwareIds.indexOf(software.id) !== -1 ? "" : "d-none")}>
			{/*<SectionImage src={TechImages[software.name]} />*/}
			<SectionTitle >{`How many years of experience do you have with ${(software.parent === undefined || software.parent === '0' ? title : software.name+' ('+parent.name+')')}?`}</SectionTitle>
			<SelectYearContainer>
				<ItemLabel className="Tech-label" style={{ textAlign: 'initial' }}>Select the years</ItemLabel>
				<TechSelect
					id="select_year"
					showSearch
					className = "select-boxes-tech"
					placeholder="Select the years"
					showArrow
					style={{ width: '100%' }}
					optionFilterProp="children"
					filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
					value={softwareExperience[software.id]}
					onChange={(value,e) => {
						let d = {...softwareExperience}
						d[software.id] = value
						setSoftwareExperience(d)
					}}
				>
					{experiencesYearAreas}
				</TechSelect>
			</SelectYearContainer>

			{software.sub_option && 
				software.sub_option.map(item => (
				<AreaContainer key={`areaCheck-${item}`}>
					<CheckBox
						id={item}
						checked={ (checkboxOptions[software.id] && checkboxOptions[software.id].indexOf(item) !== -1 ? true : false) }
						onChange={(e) => handleCheckBoxStatus(software.id, e)}
						value={item}
					>
						{item}
					</CheckBox>
					{ checkboxOptions[software.id] && checkboxOptions[software.id].indexOf(item) !== -1 && (
						<RateSelectBody span={24}>
							<ItemLabel>Please rate your level of experience</ItemLabel>
							<RateTabContainer>
								<RateStepsTab
									progressDot
									current={(touchPointsSelected[software.id+'_'+item] >= 0 ? touchPointsSelected[software.id+'_'+item] : -1)}
									onChange={(current) => {
										handleTouchPoints(current,item)
									}}
								>
									{
										touchPointsList.map((rItem) => {
											if(rItem.status && rItem.status.toLowerCase() === 'active'){
												return (
													<RateStep
														key={`${rItem.id}`}
														description={rItem.level}
													/>
												)
											}
											return null;
										})
									}
								</RateStepsTab>
							</RateTabContainer>
						</RateSelectBody>
					)}
				</AreaContainer>
			))}
			<Col className="w-100 text-right mt-4">
				{(saveSoftwareProgress.indexOf(software.id) === -1 
					? 
						<Button 
							className="btn app-btn"
							onClick={()=>saveSoftwareData(software)}
						>
							<span></span>Save
						</Button>
					:
						<Button 
							className="btn app-btn app-btn-transparent"
						>
							<span/><Spin/>
						</Button>   
				)}
			</Col>
		</SoftwareContainer>
	)};



	function ProfileReview({ user, estimatedWaitTime, setEstimatedWaitTime}) {

		let count =  1 ;
		console.log('user>>>>>>>>>>>>ProfileReview',user)
		const [isLoading, setIsLoading] = useState(true);
		const { updateUserInfo,refetch } = useAuth();
		const {socket} = useSocket()
		// const [showPassword, setShowPassword] = useState(false);
		const [newdisplayInput, setdisplayInput] = useState(false);
		const [expInput, setexpInput] = useState(false);
		const [showLanguageInput, setshowLanguageInput] = useState(false);
		const [showAddLanguageInput, setshowAddLanguageInput] = useState(false);

		const [showLevelEditor, setShowLevelEditor] = useState(false);
		const [experienceNum, setExperience] = useState("5");
		const [showNameEditor, setshowNameEditor] = useState(false);
		const [phoneNumber, setPhoneNumber] = useState("");
		const [otherSoftwareList,setOtherSoftwareList] = useState([])
		const [selectedOtherSoftwareList,setSelectedOtherSoftwareList] = useState([])
		// const [extension, setExtension] = useState("");
		// const [current, setcurrent] = useState(1);
		const [displaySoftwareEditor, setdisplaySoftwareEditor] = useState({});
		// const [subSoftware, setSubSoftware] = useState([]);
		const [softwareList, setSoftwareList] = useState([]);
		const [touchPointsList, setTouchPointsList] = useState([]);
		const [softwareExperienceList, setSoftwareExperienceList] = useState([]);
		const [currentSoftware, setcurrentSoftware] = useState({});
		const [editexperiences, setEditexperiences] = useState([]);
		const [certifiedSoftwares,setCertifiedSoftwares] = useState([])
		const [certifiedStatus,setCertifiedStatus] = useState(false);
		const demoArr = []; //user.technician.experiences.map((item) => item.software.id);
		const demoArr2 = []; /*user.technician.experiences.map((item) => {
			return { software: item.software.id, rate: item.rating };
		});*/
		let questions 
		// const experienceYearsList = ["5 - 10", "10 - 15", "15 - 20", "20 - 25"];
		// const [softwareActive, setSoftwareActive] = useState(false);
		const [activeSoftwareIds, setActiveSoftwareIds] = useState([])
		const [softwareSwitchChecked, setSoftwareSwitchChecked] = useState([])
		const [savedSoftwareExperience, setSavedSoftwareExperience] = useState({})
		const [savedCheckboxOptions, setSavedCheckboxOptions] = useState({});
		const [savedTouchPoints, setSavedTouchPoints] = useState({});
		const [preSavedOjectFormat, setPreSavedObjectFormat] = useState({});
		const [emailAlertStatus, setEmailAlertStatus] = useState(false)
		const [showEmailAlertEditor, setShowEmailAlertEditor] = useState(false);
		const [showOtherSoftwareEditor,setShowOtherSoftwareEditor] = useState(false);
		const [updateCertification,setUpdateCertification] = useState(false)
		const [softwareUpdate,setSoftwareUpdate] = useState(false)
		// const [marks, setMarks] = useState(0);
		const [testId,setTestId] = useState();
		const [result, setResult] = useState('loader');
		const [progressBarPercentage,setProgressBarPercentage] = useState();
		const [previousTestSubmit, setPreviousTestSubmit] = useState(0);
		const [showProgress,setShowProgress] = useState(false);
		const [showFooter,setShowFooter] = useState(true)
		const [showResultPage, setShowResultPage] = useState(false);
		const [callHandleComplete, setCallHandleComplete] = useState(false)
		const [handleNextButton,setHandleNextButton] = useState(true)
		// const [disableButton,setDisableButton] = useState(false)
		const [question, setQuestion] = useState();
		const [selectedSoftwares, setSelectedSoftwares] = useState({});
		const [softSelected, setSoftSelected] = useState(false);
		const [techProfileLink,setTechProfileLink] = useState('');

		// const [inputs, setInputs] = useState(false);
		
		const [dialCode, setDialCode] =useState("")
		useEffect(() => {
			if (user.technician.certifiedIn.length > 0){
				setCertifiedStatus(true)
			}
			else{
				setCertifiedStatus(false)
			}
			setPhoneNumber(user.technician.profile.confirmId.phoneNumber)
			setTechProfileLink(`${APP_URL}/technician-details-setup?technicianId=${user.id}&medium=technician-profile`)
		}, [user]);

		const HandlePhoneNumber = (e, data) => {
			setPhoneNumber(`+${e}`);
			setDialCode(data.dialCode)
		};

		useEffect(()=>{
			if(updateCertification){
				if (!certifiedStatus){
					let certifiedIn = [...certifiedSoftwares]
					certifiedIn = certifiedIn.filter(item => item.id != QUICKBOOK_SOFTWARE_ID)
					TechnicianService.updateTechnician(user.technician.id, {
					certifiedIn: certifiedIn,
					profileImage: { imageUrl: false },
					});
				}
				else{
					let softwares = [...softwareList]
					let certifiedIn = softwares.filter(item => item.id == QUICKBOOK_SOFTWARE_ID)
					certifiedIn = certifiedIn.map(item => item.id)
					TechnicianService.updateTechnician(user.technician.id, {
					certifiedIn: certifiedIn,
					profileImage: { imageUrl: false },
					});
				}
				
			}
			setUpdateCertification(!setUpdateCertification)
		},[updateCertification])

		const updateCertifiedStatus = async(e)=>{
				setCertifiedStatus(!certifiedStatus)
				setUpdateCertification(true)		
		}
		useEffect(() => {

			(async () => {
				if(user && user.technician && user.technician.profile && user.technician.profile.confirmId){
					setPhoneNumber(user.technician.profile.confirmId.phoneNumber)
				}
				
				if(user && user.technician && user.technician.expertise){
					let activeSoftwares = []
					let savedExperience = {};
					let savedCheckboxOptions = {};
					let savedTouchPointsOptions = {}
					let t_obj = {}

					if(user.technician.expertise){
						console.log('111 user technicianexpertise',user.technician)

						user.technician.expertise.map((v,i)=>{
							let t_arr = []
							activeSoftwares.push(v.software_id)
							savedExperience[v.software_id] = (v.experience ? v.experience : '')
							// console.log("idx::::",i+1, user.technician.expertise.length)

							if(savedCheckboxOptions[v.software_id] === undefined){
								savedCheckboxOptions[v.software_id] = []
							}

							if(v.sub_options){
								savedCheckboxOptions[v.software_id] = v.sub_options.map(a => a.option);
								
								v.sub_options.map((so,si)=>{
									savedTouchPointsOptions[v.software_id+'_'+so.option] = (so.current_num ? so.current_num : -1)

									let temp_obj = {}
									temp_obj['option'] = so.option
									temp_obj['touch_point'] = so.touch_point
									temp_obj['touch_point_id'] = so.touch_point_id
									temp_obj['current_num'] = so.current_num
									t_arr.push(temp_obj)
									t_obj[v.software_id] = t_arr;
									
									if(v.sub_options.length === si+1){
										setTimeout(function(){
											setPreSavedObjectFormat(t_obj)
											setSavedTouchPoints(savedTouchPointsOptions);
										},10)                            
									}
									return true;
								})
							}else{
								savedCheckboxOptions[v.software_id] = []
							}

							if(user.technician.expertise.length === i+1){
								setTimeout(function(){
									console.log('1111 active software',activeSoftwares)
									setSoftwareSwitchChecked(activeSoftwares);
									setSavedSoftwareExperience(savedExperience);
									setSavedCheckboxOptions(savedCheckboxOptions);
									
								},10)                            
							}
							return true;
						})
					}
				}
				if(user && user.technician && user.technician.general){
					seteditedEnglishLevel((user.technician.general.englishLevel ? user.technician.general.englishLevel : 0))
				}
				if(user && user.technician && user.technician.emailAlertsWithoutLogin){
					setEmailAlertStatus(user.technician.emailAlertsWithoutLogin)
				}
				const res = await SoftwareApi.getSoftwareList();

				if (res && res.data) {
					console.log("res.data",res.data)
					setSoftwareList(res.data);
					const resTouchPoints = await SoftwareApi.getTouchPointsList();
					// console.log("resTouchPoints",resTouchPoints)
					if (resTouchPoints && resTouchPoints.data) {
						resTouchPoints.data.sort(function(a, b) {
							return a.order - b.order;
						});
						setTouchPointsList(resTouchPoints.data)
					}

					const resSoftwareExperience = await SoftwareApi.getSoftwareExperiencesList();
					// console.log("resSoftwareExperience",resSoftwareExperience)
					if (resSoftwareExperience && resSoftwareExperience.data) {
						resSoftwareExperience.data.sort(function(a, b) {
							return a.expr_from - b.expr_from;
						});
						setSoftwareExperienceList(resSoftwareExperience.data)
					}

					setTimeout(function(){
						setIsLoading(false)   
					},800)
				}else{
					setIsLoading(false)                       
				}
			})();
		}, [user]);

		useEffect(() => {
			// console.log("softwareList >>>",softwareList)
			// console.log("currentSoftware >>>",currentSoftware)
			if (softwareList.length !== 0) {
				Object.keys(currentSoftware).forEach((e) => {
					// console.log("e ::",e)
					let index = softwareList.findIndex((i) => i.id === e);
					// console.log("index ::",index)
					// setSubSoftware(softwareList[index]);
				})
			}
		}, [softwareList]);
		const fetchOtherSoftwareList = async()=>{
			const software_response = await SoftwareApi.getOtherSoftwareList()
			let temp_arr = software_response.data
			let software_arr = []
			let user_selected_softwareIds = user.technician.otherSoftwares
			if(temp_arr.length > 0){
				software_arr = temp_arr.filter(item=> user_selected_softwareIds.includes(item.id))
				software_arr = software_arr.map((item) => {return {"name":item.name,"value":item.id}})
			}
			setSelectedOtherSoftwareList(software_arr)
			setOtherSoftwareList(temp_arr)
		}
		useEffect(()=>{
			fetchOtherSoftwareList()
		},[])
		// const handleChangeLevel = (expertise, rate) => {};
		
			
		useEffect(() => {
			let demoOb1 = {};
			let demoOb2 = {};
			// console.log("demoArr :::",demoArr)

			for (var k in demoArr) {
				if (demoArr2[k].rate === undefined) {
					demoOb1[String(demoArr[k])] = 0;
					demoOb2[String(demoArr[k])] = false;
				} else {
					demoOb1[String(demoArr[k])] = demoArr2[k].rate;
				}
			}
			// console.log("demoOb1 :::",demoOb1)
			setcurrentSoftware(demoOb1);
			setdisplaySoftwareEditor(demoOb1);
		}, []);
		
		const EditHandler = (value) => {
			if (value === "experience") {
				setexpInput(!expInput);
			}
			if (value === "language") {
				setLanguage(user.technician.language)
				setshowLanguageInput(!showLanguageInput);
			}
			if (value === "phoneNumber") {
				setPhoneNumber(user.technician.profile.confirmId.phoneNumber)
				setdisplayInput(!newdisplayInput);
			}
			if (value === "name") {
				setfirstName(user.firstName)
				setlastName(user.lastName)
				setshowNameEditor(!showNameEditor);
			}
			if(value === "add_language"){
				setAddLanguage(user.technician.additionalLanguage)
				setshowAddLanguageInput(!showAddLanguageInput)
			}
			if(value === 'emailAlert'){
				setShowEmailAlertEditor(!showEmailAlertEditor)
			}
			if(value === 'other_softwares'){
				setShowOtherSoftwareEditor(true)
			}
			if (value === "level") {
				setShowLevelEditor(!showLevelEditor);
			} else {
				let temp = { ...displaySoftwareEditor };
				temp[value] = !temp[value];
				setdisplaySoftwareEditor(temp);
			}
				refetch()
		};
	
       
       
		const handleNameEdit = () => {
	    let valid =	/^[a-zA-Z ]*$/;
	    if(!valid.test(String(firstName))){
	    	return openNotificationWithIcon("error","Error", "No numbers & special characters are allowed.")
	    }
	    if(!valid.test(String(lastName))){
	    	return openNotificationWithIcon("error","Error", "No numbers & special characters are allowed.")
	    }
		const trimmedValue1 = firstName.trim()
		if(trimmedValue1.split(" ").length > 1){
			return openNotificationWithIcon("error", "Error", "No empty space allowed in First Name.")
		}
		const trimmedValue2 = lastName.trim()
		if(trimmedValue2.split(" ").length > 1){
			return openNotificationWithIcon("error", "Error", "No empty space allowed in Last Name.")
		}	
	   
	    if(trimmedValue1 !== "" && trimmedValue2 !== ""){
	    		updateUserInfo({
				userId: user.id,
				firstName: firstName.replace(/\s/g, ''),
				lastName: lastName.replace(/\s/g, ''),
			});
			setshowNameEditor(!showNameEditor);
			openNotificationWithIcon(
				"success",
				"Success",
				"Name Changed Successfully."
			);
	    }else{
	    	return openNotificationWithIcon("error","Error","Please input your name.");
	    }
		};

	  	const handleOtherSoftwareEdit = ()=>{
	  		console.log("setSelectedOtherSoftwareList :::",selectedOtherSoftwareList)
	  		let temp_arr = [...selectedOtherSoftwareList]
	  		let softwareIdList = temp_arr.map(item => item.value)
	  		TechnicianService.updateTechnician(user.technician.id, {
				otherSoftwares: softwareIdList,
				profileImage: { imageUrl: false },
			});
			setShowOtherSoftwareEditor(false)
	  		console.log("software edit func working")
	  	}
	 
	  	
		const handleLanguageEdit = () => {
			TechnicianService.updateTechnician(user.technician.id, {
				language: editlanguage,
				profileImage: { imageUrl: false },
			});
			openNotificationWithIcon(
				"success",
				"Success",
				"Language Changed Successfully."
			);
			setshowLanguageInput(!showLanguageInput);
		};

		const handleAddLanguageEdit = () => {
			console.log("additonalLanguage :::::::: ",additonalLanguage)
			TechnicianService.updateTechnician(user.technician.id, {
				additionalLanguage: additonalLanguage,
				profileImage: { imageUrl: false },
			});
			openNotificationWithIcon(
				"success",
				"Success",
				"Additional Language Changed Successfully."
			);
			setshowAddLanguageInput(!showAddLanguageInput);
		};


		const handlePhoneEdit = () => {
			if(phoneNumber ===  "" || phoneNumber.length === (dialCode.length+1)){
				return openNotificationWithIcon('error', 'Error', "Phone Number is required" )
			}else if(phoneNumber.length < (11 + dialCode.length)){
				return openNotificationWithIcon('error', 'Error', "Phone Number is invalid" )                
			}
			TechnicianService.updateTechnician(user.technician.id, {
				confirmId: { phoneNumber: phoneNumber },
				profileImage: { imageUrl: false },
			});
			openNotificationWithIcon(
				"success",
				"Success",
				"Phone Number Changed Successfully."
			);
			setdisplayInput(!newdisplayInput);
		};

		const handleFirstName = (e) => {
			setfirstName(e.target.value);
		};

		const handleLastName = (e) => {
			setlastName(e.target.value);
		};

		const handleProgressChange = (value) => {
			seteditedEnglishLevel(value);
			TechnicianService.updateTechnician(user.technician.id, {
				general: { englishLevel: value },
				profileImage: { imageUrl: false },
			});
			openNotificationWithIcon(
				"success",
				"Success",
				"English level Changed Successfully."
			);
			setShowLevelEditor(!showLevelEditor);
		};

		/*const handleSoftwareYears = (e, software) => {
			let softwareId = software.software;
			ExperienceService.updateExperience(software.experience, {
				software: softwareId,
				experienceYearArea: e,
				rating: currentSoftware[softwareId],
			});
			openNotificationWithIcon(
				"success",
				"Success",
				"Experience changed Successfully."
			);
		};*/
		/*const handleFormulas = (e) => {
			openNotificationWithIcon(
				"success",
				"Success",
				"Experience changed Successfully."
			);
		};*/

		/*const handleSoftwareStepChange = (e, value) => {
			let d = { ...currentSoftware };
			if (demoArr.indexOf(value.soft) != -1) {
				let ind = demoArr.indexOf(value.soft);
				d[value.soft] = e;
				setcurrentSoftware(d);
			}
			ExperienceService.updateExperience(value.exp, {
				rating: e,
			});
			openNotificationWithIcon(
				"success",
				"Success",
				"Experience changed Successfully."
			);
		};*/
		const {
			email,
			technician: {
				experiences,
				language,
				additionalLanguage,
				general: {
					otherLangList,
					certifications,
				} = {},

				// profile: { confirmId } = {},
			} = {},
		} = user;

		useEffect(() => {
			// console.log("All experiences are",experiences)
			setEditexperiences(experiences);
		}, [experiences]);

		useEffect(() => {
			console.log("000 All experiences are useeffect ",softwareSwitchChecked)
			
		}, [softwareSwitchChecked]);

		const averageLevel = (experience) => {
			// const sum = 1;
		};

		/*const isExist = (expertise) => {
			if (editexperiences.expertises) {
				return !!editexperiences.expertises.find(
					(item) => item.expertise === expertise.id
				);
			} else {
				return false;
			}
		};*/

		const [editedEnglishLevel, seteditedEnglishLevel] = useState(
			user?.technician?.general?.englishLevel
		);
		const [editlanguage, setLanguage] = useState(language);
		const [additonalLanguage, setAddLanguage] = useState(additionalLanguage);
		const [firstName, setfirstName] = useState(user.firstName);
		const [lastName, setlastName] = useState(user.lastName);
		const user1 = { firstName: firstName, lastName: lastName };
		const onChangeExperience = (data) => {
			const editexperiencesSet = editexperiences;
			const isExist = !!editexperiencesSet.find(item => item.software === data.software);
			if (isExist) {
				const newOne = editexperiencesSet.map(item => item.software === data.software ? data : item);
				setEditexperiences(newOne);
			} else {
				setEditexperiences([...editexperiences, data]);
			}
		};

		/*const handlesoftwareEdit = () => {
			let editexperiencesSet = editexperiences;
			editexperiences.forEach((e) => {
				if (typeof e.software === 'string') {
					editexperiences.forEach((ee, index) => {
						if (ee.software.id === e.software) {
							editexperiencesSet[index] = Object.assign(ee, e);
						}
					});
				}
			});
		  
			const fineData = [];
			experiences.forEach((set) => {
				fineData.push(set);
			});
			ExperienceService.updateSoftware(fineData);
			setEditexperiences(editexperiencesSet);    
		}*/

		/**
		 * Check if technician already passed the exam or not
		 * @param techTestHistory (Type:Object)
		 * @param softid (Type:string) 
		 * @returns boolean
		 * @author Nafees
		 */
		const isTechSoftwareHave = async(techTestHistory,softid)=> {
			console.log('isTechSoftwareHave',techTestHistory,softid)
			let alreadyPassed = techTestHistory.find(e=>e.software_id === softid && e.result === 'Pass')
			console.log('check filter data>>',alreadyPassed);
			return alreadyPassed ? true : false;
		}
		

		/**
		 * Save data in technician expertise column
		 * @param software (Type:Object)
		 * @returns boolean
		 * @author Nafees
		 */
		const saveExpertiseData = async(software)=> {
			try{
				let techData = await TechnicianService.retrieveTechnician(user.technician.id);
				let dataArr = [];
				let dataToSave = {}
				dataToSave['software_id'] = software.id
				dataToSave['experience'] = ''
				dataToSave['sub_options'] = []
				dataToSave['parent'] = (software.parent ? software.parent : '')

				if(techData && techData.expertise){
					dataArr = [...techData.expertise];					
					dataArr.push(dataToSave)
				}else{
					dataArr.push(dataToSave)
				}

				TechnicianService.updateTechnician(techData.id,{
					expertise:dataArr,
				})
				reloadData(software.id);
				// notification.success({
				// 	message: 'Software active successfully.',
				// });

			}catch(err){
				console.log("error in saveExpertiseData ",err)
			}
		}
		
		const softwareSwtichChange = async(s) => {
			setSoftSelected(true);
			setTimeout(() => {
				setSoftSelected(false);
			},1000)
			console.log("softwaresss:::",s)
			let softObj = []
			softObj.push(s)
			setTestId(s.test)
			console.log('softwareData',selectedSoftwares);
			let alreadyPassed = await isTechSoftwareHave(user.technician.testHistory,s.id) 
			console.log('check alreadyPassed',alreadyPassed);
			if(!alreadyPassed){
				console.log("My console to check test history arr", user.technician.testHistory)
				const currentSoftwareInTestHistory = user.technician.testHistory.filter(item => item.software_id === s.id)
				console.log("My console to check test history arr 2", currentSoftwareInTestHistory)
				if(currentSoftwareInTestHistory.length > 0 && currentSoftwareInTestHistory[0].result === "Fail"){
					Modal.confirm({
						title: 'You already failed this exam. Unfortunately, you cannot try again!',
						className:'app-confirm-modal',
						onOk : () => {
							setSoftSelected(false);
						},
						onCancel : ()=>{
							setSoftSelected(false);
						},
					})
				}else{
					 questions = await InterviewQuestionApi.getQuestionList(s.test);
					 console.log('111queastion>>>>',questions)
					 setSelectedSoftwares(softObj)
					 setQuestion(questions)
					 setSoftwareUpdate(true)
				}
			}else{
				let techData = await TechnicianService.retrieveTechnician(user.technician.id);
				console.log('techdata inside softwareSwtichChange',softwareSwitchChecked);
				let dataArr = [];
				let dataToSave = {}
				dataToSave['software_id'] = s.id
				dataToSave['experience'] = ''
				dataToSave['sub_options'] = []
				dataToSave['parent'] = (s.parent ? s.parent : '')

				if(softwareSwitchChecked.indexOf(s.id) !== -1){
					Modal.confirm({
						title: 'Your saved options will be removed, if you disable this software.',
						okText :"Proceed",
						onCancel : ()=>{
							setSoftSelected(false);
						},
						cancelText:"Cancel",
						className:'app-confirm-modal',
						onOk : ()=>{ 
							setSoftSelected(false);
							let check_if_another_soft_exist = 0
							let ids = [...softwareSwitchChecked];
							let idIdx = ids.indexOf(s.id)
							if(idIdx != -1){
								ids.splice(idIdx,1)
								setSoftwareSwitchChecked(ids)
							}
							
							updateHeaderOptions(s, ids)
							if(techData.expertise && s.parent !== "0"){
								// checking if another software exist of same parent of selected software or not.(MJ)
								let newsoftArr = [...techData.expertise];
								for(let i=0; i < newsoftArr.length ; i++){
									// console.log('newsoftArr[i].>>>>>>>>',newsoftArr[i])
									if(newsoftArr[i].parent !== "0" && newsoftArr[i].parent === s.parent){
										check_if_another_soft_exist++
									}
								}
								// console.log('check_if_another_soft_exist.>>>>>>>>',check_if_another_soft_exist)
							}


							if(techData && techData.expertise){
								dataArr = [...techData.expertise];
								let idx = dataArr.findIndex(o => o.software_id === s.id);
								if(idx !== -1){
									dataArr.splice(idx,1)
								}
								if(check_if_another_soft_exist === 1){
									// checking if another software does not exist of same parent then remove parent also.(MJ)
									let idx = dataArr.findIndex(o => o.software_id === s.parent);
									if(idx !== -1){
										dataArr.splice(idx,1)
									}
								}
								// console.log('dataArr>>>>>>>>>',dataArr)
								TechnicianService.updateTechnician(techData.id,{
									expertise:dataArr
								})
								reloadData(s.id);
								let activeIds = [...activeSoftwareIds]
								if(activeIds.indexOf(s.id) != -1){
									activeIds.splice(activeIds.indexOf(s.id),1)
									setActiveSoftwareIds(activeIds)
								}

								ids = (ids && ids.length > 0 ? ids : [...softwareSwitchChecked]);
								idx = ids.findIndex(o => o.software_id === s.id);
								if(idx != -1){
									ids.splice(idx,1);
									console.log("000 ids 33>> ",ids)
									setSoftwareSwitchChecked(ids);
								}
								updateHeaderOptions(s, ids)
								notification.success({
									message: 'Software inactive successfully.',
								});
								
							}
							
						}
						
					})
				}
				else{
					
					// setSoftwareUpdate(true)
					let ids = [...softwareSwitchChecked];
					ids.push(s.id);
					setSoftwareSwitchChecked(ids);
					updateHeaderOptions(s, ids)

					if(techData && techData.expertise){
						dataArr = [...techData.expertise];
						let idx = dataArr.findIndex(o => o.software_id === s.id);
						if(idx !== -1){
							dataArr.splice(idx,1)
						}
						
						dataArr.push(dataToSave)
					}else{
						dataArr.push(dataToSave)
					}

				// 	if(dataToSave['parent'] !== ''){
				// 		 // adding its parent if subsofware added and its parent does not exist
				// 		let shouldAddParent = true
				// 		let newsoftArr = [...techData.expertise];
				// 		for(let i=0; i < newsoftArr.length ; i++){
				// 			// console.log('newsoftArr[i].>>>>>>>>',newsoftArr[i])
				// 			if(newsoftArr[i].software_id === dataToSave['parent']){
				// 				shouldAddParent = false
				// 			}
				// 		}


				// 		if(shouldAddParent){
				// 			let dataToSave = {}
				// 			dataToSave['software_id'] = s.parent
				// 			dataToSave['parent'] = 0
				// 			dataToSave['sub_options'] = []
				// 			dataArr.push(dataToSave)
				// 		}
				// 	}

					console.log('dataArr :::',dataArr)
					TechnicianService.updateTechnician(techData.id,{
						expertise:dataArr,
					})
					reloadData(s.id);
					notification.success({
						message: 'Software active successfully.',
					});
					setSoftSelected(false);
				}
			}
			
		}

		const EditSoftwareHandler = (sid) => {
			let ids = [...activeSoftwareIds];
			if(ids.indexOf(sid) === -1){
				ids.push(sid)
			}else{
				ids.splice(ids.indexOf(sid),1)
			}
			setActiveSoftwareIds(ids)
		}
		/*const handleBlobImage =(blob)=>{
			// let base64ToString = Buffer.from(base64data, "base64").toString()
			const file =blob;
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = () => {
				let image = URL.createObjectURL(file)
				return image
			};


		}*/
		const reloadData = async(sid) => {
			let savedExperience = {};
			let savedCheckboxOptions = {};            

			savedExperience[sid] = '';
			savedCheckboxOptions[sid] = [];
			setSavedSoftwareExperience(savedExperience);
			setSavedCheckboxOptions(savedCheckboxOptions);
			setTimeout(function(){
				socket.emit("loggedOut",{userId:user.id,userType:user.userType})
				setTimeout(function(){
					socket.emit("loggedIn",{userId:user.id,userType:user.userType,user:user})                    
				},1000)
			},1000)

		}

		const updateHeaderOptions = (s, checkedSoftwares) => {
			if(checkedSoftwares.length > 0){
				if(s && s.estimatedWait){
					let sTime = s.estimatedWait.split('-')[0]
					if(estimatedWaitTime === 'NA' || sTime > estimatedWaitTime){
						setEstimatedWaitTime(sTime)                    
					}
				}
			}else{
				setEstimatedWaitTime('NA');
			}
		}

		const copiedTechLink = async () => {
			try {
				await navigator.clipboard.writeText(techProfileLink)
				openNotificationWithIcon('success', 'Link copied.', 'You can share this technician profile link with anybody.');
			} catch (err) {
				openNotificationWithIcon('error', 'Copy Failed', 'Sorry, there was an error copying the link.');
			}
		};

		// const updateTechnicianEmailAlertStatus = () => {
		// 	TechnicianService.updateTechnician(user.technician.id, {
		// 		emailAlertsWithoutLogin: !emailAlertStatus
		// 	});
		// 	openNotificationWithIcon(
		// 		"success",
		// 		"Success",
		// 		(emailAlertStatus ? 'Email alert disabled successfully.' : 'Email alert active successfully.')
		// 	);
		// 	setEmailAlertStatus(!emailAlertStatus);
		// }

	if (isLoading) return <Col md="12" className="px-4 py-5"> 
		<Row>
			<Loader height="100%" className={"mt-5 "+(isLoading ? "loader-outer" : "d-none")} />
		</Row>   

	</Col>;
	
	return (
		<>
		<Container className="settings-screen">
			<BodyContainer>
				<Section>
					<ItemContainer className="editContainer">
						<ItemTitle>NAME</ItemTitle>
						<Row>
							{showNameEditor ? (
								<React.Fragment key="info">
									<div className="d-flex">
										<RegInput
											name="first Name"
											size="large"
											className=" ml-2 p-0"
											value={firstName}
											onChange={handleFirstName}
										/>

										<RegInput
											name="last Name"
											size="large"
											className=" ml-2 p-0"
											value={lastName}
											onChange={handleLastName}
										/>

										<button
											className="mt-2 small-btn btn "
											onClick={handleNameEdit}
										>
											<FontAwesomeIcon icon={faCheck} />
										</button>
									</div>
									</React.Fragment>
							) : (
								<H4>{getFullName(user1)}</H4>
							)}

							<div className="EditIcons">
								<img
									alt=""
									onClick={() => EditHandler("name")}
									src={editIcon}
									width="20px"
									height="20px"
								/>
							</div>
						</Row>
					</ItemContainer>

					<ItemContainer className="editContainer">
						<ItemTitle>EMAIL</ItemTitle>
						<Row>
							<H4>{email}</H4>
						</Row>
					</ItemContainer>
				</Section>
				<Section>
					<ItemContainer className="editContainer">
						<ItemTitle>SHARE YOUR PROFILE</ItemTitle>
						<Row className="w-100">
								<div className="col-12 input-group mb-3">
									<input type="text" className=" form-control" readOnly value={techProfileLink} aria-label="Recipient's username" aria-describedby="basic-addon2"/>
										<div className="input-group-append">
											<span className="input-group-text copiedLink" title='Copy' id="basic-addon2" onClick={copiedTechLink}><FontAwesomeIcon icon={faCopy}/></span>
										</div>
								</div>
						</Row>
					</ItemContainer>
				</Section>

				{softwareList 

					? softwareList.map((experience, index) => {						

						if((experience.subSoftware.length > 0 || experience.parent !== "0")){
						
							return (
								experience.subSoftware.map((subSoft)=>{

									return (
										<Section>
											<ItemContainer
												key={subSoft.id}
												className="editContainer"
											>
												<ItemTitle>
													  SOFTWARE {count++}                                          
												</ItemTitle>
												
												
												<Row className="card-view-software">
													
													<SoftwareImage
														src={subSoft.blob_image}
													/>
													

													<SoftwareRightSection>
														<H4>
															{subSoft.name}
														</H4>

														<LevelDescription>
															{ratingScale[averageLevel(subSoft)]}
														</LevelDescription>
													</SoftwareRightSection>

													<div className="EditIcons software-switch">
														{/*<Switch
														  checkedChildren={<CheckOutlined />}
														  unCheckedChildren={<CloseOutlined />}
														  defaultChecked={(softwareSwitchChecked.indexOf(subSoft.id) != -1 ? true : false)}
															className="mr-3"
															onChange={(checked)=>{
																softwareSwtichChange(subSoft.id,checked)
															}}
														/>*/}
														{console.log('softSelected if ',softSelected)} 
														<span                                                           
															onClick={()=>softwareSwtichChange(subSoft)}  
															className={"tech-software-edit "+(softwareSwitchChecked.indexOf(subSoft.id) !== -1 ? 'active-software ' : '')+(softSelected ? 'disabledButton' :'')}
															title={(softwareSwitchChecked.indexOf(subSoft.id) !== -1 ? 'Active' : 'Inactive')}
														>
															<FontAwesomeIcon icon={faCheckCircle} />
														</span>
														

														<img
															alt="edit-icon"
															onClick={() => {
																EditSoftwareHandler(`${subSoft.id}`);
															}}
															src={editIcon}
															width="20px"
															height="20px"
														/>
													</div>

													{/*<div className="EditIcons" style={{ top: '15px', right: '50px' }}>
														<button
															className="mt-2 small-btn btn "
															onClick={handlesoftwareEdit}
														>
															<FontAwesomeIcon icon={faCheck} />
														</button>       
													</div>*/}
													
													
													<SoftwareDetailSection
														key={`software-${index}`}
														software={subSoft}
														title={subSoft.name}
														experience={editexperiences.find(exp => exp.software === subSoft.id)}
														setExperience={onChangeExperience}
														parent={experience}
														touchPointsList={touchPointsList}
														softwareExperienceList={softwareExperienceList}
														user={user}
														activeSoftwareIds={activeSoftwareIds}
														savedSoftwareExperience={savedSoftwareExperience}
														savedCheckboxOptions={savedCheckboxOptions}
														savedTouchPoints={savedTouchPoints}
														preSavedOjectFormat={preSavedOjectFormat}
														refetch = {refetch}
														softwareSwitchChecked={softwareSwitchChecked}
														setSoftwareSwitchChecked={setSoftwareSwitchChecked}
														socket={socket}

													/>
													
													{/***/}
												</Row>
												
											</ItemContainer>
										</Section>
									);
								})
							)
						}else{
							if(experience.id !== EmailOutlook){

							return (
								<Section key={experience.id}>
									<ItemContainer
										key={experience.id}
										className="editContainer"
									>
										<ItemTitle>
											SOFTWARE {count++}                                          
										</ItemTitle>
										
										
										<Row className="card-view-software">
											
											<SoftwareImage 
												src={experience.blob_image}
											/>
											

											<SoftwareRightSection>
												<H4>
													{experience.name}
												</H4>

												<LevelDescription>
													{ratingScale[averageLevel(experience)]}
												</LevelDescription>
											</SoftwareRightSection>

											<div className="EditIcons software-switch">
												{/*<Switch
												  checkedChildren={<CheckOutlined />}
												  unCheckedChildren={<CloseOutlined />}
												  defaultChecked={(softwareSwitchChecked.indexOf(experience.id) != -1 ? true : false)}
												  className="mr-3"
												  onChange={(checked)=>{
														softwareSwtichChange(experience.id,checked)
													}}
												/>*/}
												{console.log('softSelected else',softSelected)} 
												<span                                                      
													onClick={()=>softwareSwtichChange(experience)} 
													className={"tech-software-edit "+((softwareSwitchChecked.indexOf(experience.id) !== -1) ? 'active-software ' : '')+(softSelected ? 'disabledButton' : '')}	
													title={((softwareSwitchChecked.indexOf(experience.id) !== -1) ? 'Active' : 'Inactive')}

													// className={"tech-software-edit "+(softwareSwitchChecked.indexOf(experience.id) !== -1 ? 'active-software' : '')}
													// title={(softwareSwitchChecked.indexOf(experience.id) !== -1 ? 'Active' : 'Inactive')}
												>
													<FontAwesomeIcon icon={faCheckCircle} />
												</span>
												{(softwareSwitchChecked.indexOf(experience.id) !== -1) &&
													<img
														alt="edit-icon"
														onClick={() => {
															EditSoftwareHandler(`${experience.id}`);
														}}
														src={editIcon}
														width="20px"
														height="20px"
													/>
												}
											</div>
											 {/*

												<div className="EditIcons" style={{ top: '15px', right: '50px' }}>
													<button
														className="mt-2 small-btn btn "
														onClick={handlesoftwareEdit}
													>
														<FontAwesomeIcon icon={faCheck} />
													</button>       
												</div>
											*/}
							
											<SoftwareDetailSection
												key={`software-${index}`}
												software={experience}
												title={experience.name}
												experience={editexperiences.find(exp => exp.software === experience.id)}
												setExperience={onChangeExperience}
												parent={false}
												touchPointsList={touchPointsList}
												softwareExperienceList={softwareExperienceList}
												user={user}
												activeSoftwareIds={activeSoftwareIds}
												savedSoftwareExperience={savedSoftwareExperience}
												savedCheckboxOptions={savedCheckboxOptions}
												savedTouchPoints={savedTouchPoints}
												preSavedOjectFormat={preSavedOjectFormat}
												refetch = {refetch}
												softwareSwitchChecked={softwareSwitchChecked}
												setSoftwareSwitchChecked={setSoftwareSwitchChecked}
												socket={socket}
											/>
											
											{/***/}
										</Row>
										
									</ItemContainer>
								</Section>
							);
						}
					}
					})
					: ""
				}
		<Section>
			<ItemContainer className="editContainer">
			  <ItemTitle>Other Softwares</ItemTitle>
			  
				{showOtherSoftwareEditor
					?
						<Row >
							<div className="d-flex">
								<MultipleSelect
									showSearch
									mode="multiple"
									optionFilterProp="children"
									style={{ width: 200 }}
									defaultValue = {selectedOtherSoftwareList.map(item => item.name)}
									filterOption={(input, option) =>
										option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
									onChange={(value,option)=>{
										let otherSoftwares = [...selectedOtherSoftwareList]
										let nameValues = otherSoftwares.map(element => element.value)
										option.forEach(element => {
											if(!nameValues.includes(element.value) && element.children != null && element.value != null){
												otherSoftwares.push({"name":element.children,"value":element.value})
											}
											
										});
										setSelectedOtherSoftwareList(otherSoftwares)
									}}
									
									onDeselect = {(string,number,labelValue)=>{
										let otherSoftwares = [...selectedOtherSoftwareList];
										otherSoftwares = otherSoftwares.filter(element => (element.name != string) && (element != null) && (element != undefined))
										setSelectedOtherSoftwareList(otherSoftwares)
									}}

									>
									{otherSoftwareList.map((item,index)=>{
										return <Option value={item.id}>{item.name}</Option>
									})}
								</MultipleSelect>{" "}
								
							</div>
							<div className="col d-flex justify-content-end align-items-center">
							<button
									className="small-btn btn ml-3"
									onClick={handleOtherSoftwareEdit}
								  >
									<FontAwesomeIcon icon={faCheck} />
								</button>{" "}
								</div>
						 </Row>
					:<>
						{	selectedOtherSoftwareList.length === 0?<span className="label-value">None</span>
							:<div className="d-flex flex-wrap">
								{selectedOtherSoftwareList.map((element,index)=>{
									return <div key={index} className="labelBox ml-2"><span className="">{element.name}</span></div>
								})}
								</div>
						}
					</>
				}
			 
			  <div className="EditIcons">
				<img
				  alt=""
				  onClick={() => {
					EditHandler("other_softwares");
				  }}
				  src={editIcon}
				  width="20px"
				  height="20px"
				/>
			  </div>
			</ItemContainer>
		</Section>
		<Section>
		  <ItemContainer className="editContainer">
			<ItemTitle>Phone Number</ItemTitle>
			<Row>
			  {newdisplayInput ? (
				<div className="d-flex">
				  <InputWithLabel>
					<PhoneInput
					  value={phoneNumber}
					  countryCodeEditable={false}
					  onChange={HandlePhoneNumber}
					  country="us"
					  onlyCountries={["in", "gr", "us", "ca", "gb", "ph", "il"]}
					/>
				  </InputWithLabel>{" "}
				  <button
					className="mt-2 small-btn btn ml-3"
					onClick={handlePhoneEdit}
				  >
					<FontAwesomeIcon icon={faCheck} />
				  </button>{" "}
				</div>
			  ) : (
				<H4>{phoneNumber}</H4>
			  )}

			  <div className="EditIcons">
				<img
				  alt=""
				  onClick={() => {
					EditHandler("phoneNumber");
				  }}
				  src={editIcon}
				  width="20px"
				  height="20px"
				/>
			  </div>
			</Row>
		  </ItemContainer>

		  <ItemContainer className="editContainer">
			<ItemTitle>Years of Experience</ItemTitle>
			<Row>
			  {expInput ? (
				<RegInput
				  name="experience"
				  size="large"
				  placeholder={"5"}
				  type="Number"
				  value={experienceNum}
				  onChange={(e) => {
					setExperience(e.target.value);
				  }}
				/>
			  ) : (
				<H4>{experienceNum} years</H4>
			  )}
			  <div className="EditIcons">
				<img
				  alt=""
				  onClick={() => {
					EditHandler("experience");
				  }}
				  src={editIcon}
				  width="20px"
				  height="20px"
				/>
			  </div>
			</Row>
		  </ItemContainer>
		</Section>

		<Section>
		  <ItemContainer className="editContainer">
			<ItemTitle>Primary Language</ItemTitle>
			<Row>
			  {showLanguageInput ? (
				<div className="d-flex">
				  <LanguageSelect
					showSearch
					style={{ width: 200, textAlign: "left" }}
					optionFilterProp="children"
					defaultValue={editlanguage}
					filterOption={(input, option) =>
					  option.children
						.toLowerCase()
						.indexOf(input.toLowerCase()) >= 0
					}
					onChange={(value, option) => {
					  setLanguage(option.children);
					}}
				  >
					{languages.map((item, index) => {
					  if (index === 2) {
						return (
						  <Option key={`lang_${index}`} value={index}>
							{item[0]}
						  </Option>
						);
					  } else {
						return (
						  <Option key={`lang_${index}`} value={index}>
							{item[0]}
						  </Option>
						);
					  }
					})}
				  </LanguageSelect>{" "}
				  <button
					className="small-btn btn ml-3"
					onClick={handleLanguageEdit}
				  >
					<FontAwesomeIcon icon={faCheck} />
				  </button>{" "}
				</div>
			  ) : (
				<H4>{editlanguage}</H4>
			  )}
			  <div className="EditIcons">
				<img
				  alt=""
				  onClick={() => {
					EditHandler("language");
				  }}
				  src={editIcon}
				  width="20px"
				  height="20px"
				/>
			  </div>
			</Row>
		  </ItemContainer>
		
		  <ItemContainer className="editContainer">
			<ItemTitle>Additional Language</ItemTitle>
			<Row>
			  {showAddLanguageInput ? (
				<div className="d-flex">
					<div>
						<MultipleSelect
							showSearch
							mode="multiple"
							defaultValue = {additonalLanguage}
							style={{ width: 200 }}
							optionFilterProp="children"
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
							onChange = {(value,option)=>{
								let allAdditionalLanguage = [...additonalLanguage];
								if(option.children && option.children === additionalLanguage){
									console.log("ygyab")
								}
								option.forEach(element => {
									if(!allAdditionalLanguage.includes(element.children)){
										allAdditionalLanguage.push(element.children)
									}
									
								});  
								setAddLanguage(allAdditionalLanguage)                      
							}}
							onDeselect = {(string,number,labelValue)=>{
								let allAdditionalLanguage = [...additonalLanguage];
								allAdditionalLanguage = allAdditionalLanguage.filter(element => (element != string) && (element != null) && (element != undefined))
								setAddLanguage(allAdditionalLanguage)
							}}
							filterSort={(optionA, optionB) =>
								optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
							}
							>
							{languages.map((item,index)=>{
								return <Option value={index}>{item[0]}</Option>
							})}
						</MultipleSelect> {" "}
					</div>
					<div>
					  <button
						className="small-btn btn ml-3"
						onClick={handleAddLanguageEdit}
					  >
						<FontAwesomeIcon icon={faCheck} />
					  </button>{" "}
					</div>
				</div>
			  ) : (<>
			   {
			   	additonalLanguage.length === 0?<span className="label-value">None</span>
			   	:<div className="d-flex flex-wrap">
			   		{additonalLanguage.map((element,index)=>{
			   					return <div className="labelBox ml-2"><span className="">{element}</span></div>
			   		})}
			   	</div>
				}
				</>
			  )}
			  <div className="EditIcons">
				<img
				  alt=""
				  onClick={() => {
					EditHandler("add_language");
				  }}
				  src={editIcon}
				  width="20px"
				  height="20px"
				/>
			  </div>
			</Row>
		  </ItemContainer>
		</Section>

		<Section>
		  {engilshLevels[editedEnglishLevel] !== -1 ? (
			<ItemContainer className="editContainer">
			  <ItemTitle>FLUENCY LEVEL</ItemTitle>
			  <Row className="col-12">
				{!showLevelEditor ? (
				  <H4>{engilshLevels[editedEnglishLevel]}</H4>
				) : (
				  <div className="rate-fluency-level">
					<RateTabContainer>
					  <RateStepsTab
						progressDot
						onChange={handleProgressChange}
						current={parseInt(editedEnglishLevel)}
					  >
						{engilshLevels.map((rItem, index) => (
						  <RateStep key={index} description={rItem} />
						))}
					  </RateStepsTab>
					</RateTabContainer>
				  </div>
				)}
			  </Row>
			  <div className="EditIcons">
				<img
				  alt=""
				  onClick={() => {
					EditHandler("level");
				  }}
				  src={editIcon}
				  width="20px"
				  height="20px"
				/>
			  </div>
			</ItemContainer>
		  ) : (
			""
		  )}
		</Section>
		<Section>
		  {certifications
			? certifications.length > 0 && (
				<ItemContainer className="editContainer">
				  <ItemTitle>CERTIFICATIONS</ItemTitle>
				  {certifications.map((item, index) => (
					<Row key={index}>{item !== "" ? <H4>{item}</H4> : ""}</Row>
				  ))}
				</ItemContainer>
			  )
			: ""}
		</Section>

		<Section>
		  {otherLangList?.length > 0 && (
			<ItemContainer className="editContainer">
			  <ItemTitle>OTHER LANGUAGES</ItemTitle>
			  {otherLangList.map((item) => (
				<OtherLan direction="horizontal" key={item.name} size={10}>
				  <Row>
					<H4>{item.name}</H4>
				  </Row>
				  <OtherLangLevel>
					{`(${engilshLevels[item.level]}) Level: ${item.level}`}
				  </OtherLangLevel>
				</OtherLan>
			  ))}
			</ItemContainer>
		  )}
		</Section>

		<Section>
		<ItemContainer className="editContainer reset-password-container">
				<ItemTitle>Are you certified in quickbooks ?</ItemTitle>
				<Row>
					<CardItem  onSwitchClick={updateCertifiedStatus} title="STATUS" switchText={certifiedStatus ? "Yes" : "No"} isSwitchActive={certifiedStatus} />
				</Row>
			</ItemContainer>
			{/*<ItemContainer className="editContainer reset-password-container">
				<ItemTitle>Password</ItemTitle>
				<Row>
					<h5>
						{!showPassword ? (
							<span className="">********</span>
						) : (
							<span className="">Coming soon...</span>
						)}
					</h5>
					<a
						href={() => false}
						className="edit-link"
						onClick={() => {}}
					>
						Reset Password?
					</a>
					<div className="EditIcons">
						<FontAwesomeIcon
							icon={faEye}
							onClick={() => {
								setShowPassword(!showPassword);
						}}
					/>
					</div>
				</Row>
			</ItemContainer>*/}

			{/* <ItemContainer className="editContainer">
				<div className="d-flex flex-row">
					<Popover className="mt-1" content={<p>If you're not logged in to Geeker, you won't receive emails about scheduled jobs coming up.<br/>This setting allows you to receive emails about regular and scheduled jobs in case you <br/>haven't logged in yet.</p>}>
						<InfoCircleOutlined style={{ fontSize: "20px" }} />
					</Popover>
					<ItemTitle>Allow email alerts without being logged in</ItemTitle>
				</div>
				<Row>
					{showEmailAlertEditor ? (
						<>
							<div className="d-flex">
								<CardItem onSwitchClick={updateTechnicianEmailAlertStatus} title="STATUS" switchText={emailAlertStatus ? "Active" : "Inactive"} isSwitchActive={emailAlertStatus} />
							</div>
						</>
					) : (
						<H4>{emailAlertStatus ? "Active" : "Inactive"}</H4>
					)}

					<div className="EditIcons">
						<img
							alt=""
							onClick={() => EditHandler("emailAlert")}
							src={editIcon}
							width="20px"
							height="20px"
						/>
					</div>
				</Row>
			</ItemContainer> */}
		</Section>

	</BodyContainer>
	</Container>
	<Modal 
	afterClose={()=> {setShowResultPage(false);setShowFooter(true)}}
	onCancel={() => {setSoftwareUpdate(false);
		setSoftSelected(false)
	}}
	visible={softwareUpdate}
	width={'fit-content'}
	centered={true}
	footer={ showFooter ? 

			 [
					<Button
						className="btn app-btn app-btn-light-blue app-btn-small declne-job-btn"	
						onClick={() => {
							setSoftwareUpdate(false);
							setSoftSelected(false);
						}}
					>
						<span></span>Close
					</Button>,

					<Button
						className={"btn app-btn app-btn-small declne-job-btn " }
						onClick = {()=>setCallHandleComplete(true)}
					>
						<span></span>Submit
					</Button>,
			  ] : null
			}
	>

		{ showResultPage === false &&
			<MCQ selectedSoftwares={selectedSoftwares} question={question} testId={testId} register={user} setProgressBarPercentage={setProgressBarPercentage} setResult={setResult} setShowFooter={setShowFooter} setShowResultPage={setShowResultPage} callHandleComplete={callHandleComplete} setCallHandleComplete={setCallHandleComplete} handleNextButton={handleNextButton} refetch={refetch} />
		}
		{ showResultPage === true &&
			<ExamLoader setShowProgress={setShowProgress} previousTestSubmit={previousTestSubmit} setPreviousTestSubmit={setPreviousTestSubmit} setShowResultPage={false} result={result} setResult={setResult} testComplete={true} register={user}/>
		}
	</Modal>
	</>
  );

}

const CardItem = ({ switchText, style, showSwitch = true, isSwitchActive, onSwitchClick }) => {
	return (
		<div style={{ flex: 1, marginLeft: "30px", ...style }}>
			<Switch onSwitchClick={onSwitchClick} text={switchText} showSwitch={showSwitch} isSwitchActive={isSwitchActive} />
		</div>
	)
}
const Switch = ({ text, showSwitch, isSwitchActive, onSwitchClick }) => {
	return (
		<div style={{ display: "flex", alignItems: "center", }}>
			{showSwitch && <div
				onClick={onSwitchClick}
				style={{
					cursor: "pointer",
					background: isSwitchActive ? "#1bd4d5" : "#D6D6D6",
					justifyContent: isSwitchActive ? "flex-end" : "flex-start",
					display: "flex",
					height: "30px", borderRadius: "24px", width: "60px", padding: "0.2rem"
				}}>
				<div style={{
					width: "45%", background: isSwitchActive ? "#ffffff" : "#D6D6D6", borderRadius: "50%", height: "100%",
					boxShadow: !isSwitchActive && "0px 0px 1px 2px rgb(170 170 170 / 75%)"
				}}></div>
			</div>
			}
			<h5 style={{
				fontSize: "15px", color: isSwitchActive ? "#1fc7c8" : "#72838d", fontWeight: "bold", marginLeft: showSwitch ? "20px" : 0, marginBottom: 0,

				marginTop: showSwitch ? 0 : "0.5rem"
			}}>{text}</h5>
		</div>
	)
}
/*const CheckboxStyled = styled(Checkbox)`
  margin-bottom: 20px;
   display: inline-flex;
	 color: blue;
  
	span {
	  margin-top: -7px;
	}
	.ant-checkbox{
	  margin-top: 0px;
	} 

  margin-left: 0px !important;
  .ant-checkbox-checked .ant-checkbox-inner {
	background-color: ${props => props.theme.primary};
	border-color: ${props => props.theme.primary};
	&:focus {
	  border-color: ${props => props.theme.primary};
	}
	&:hover {
	  border-color: ${props => props.theme.primary};
	}
  }
`;*/
const Container = styled.div``;
// const LevelText = styled(Text)`
//   font-size: 15;
//   font-weight: bold;
//   text-align: left;
// `;
const OtherLangLevel = styled(Text)`
  font-size: 15;
  font-weight: bold;
  text-align: left;
  margin-bottom: 10px;
  padding-left: 10px;
`;
const LevelDescription = styled(Text)`
  font-style: italic;
  padding-top: 15px;
`;
const BodyContainer = styled.div`
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;
const OtherLan = styled.div`
  display: flex;
  align-items: center;
`;
const SoftwareRightSection = styled.div`
  padding-left: 30px;
  display: flex;
  flex-direction: column;
  text-align: left;
`;
const SoftwareImage = styled.img`
  width: 50px;
  height: auto;
`;
const Section = styled(Row)`
  width: 100%;
`;

const RegInput = styled(Input)`
  border: 0px none !important;
  border-radius: 0px none !important;
  border-bottom: 1px solid black !important;
  padding: 15px 20px;
  width: 30%;
  background: transparent !important;
  border-radius: initial;
  font-family: "Open-Sans", sans-serif;
`;

const LanguageSelect = styled(Select)`
  border: 0px none;
  color: black;
  border-bottom: 1px solid black !important;
`;

const AreaContainer = styled(Col)`
  background: white;
  overflow: auto;
  padding: 20px;
  width: 100%;
  justify-content: flex-start;
  display: flex;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;
  align-items: flex-start;
  font-family: initial;
`;
const RateSelectBody = styled(Row)`
  padding: 30px;
`;

const RateTabContainer = styled.div`
  width: 100%;
  margin-top: 30px;
`;

const MultipleSelect = styled(Select)`

  border:0px none;
  border-bottom:1px solid #72828f;
  

  & .ant-select-selection-search {
	width:360px;
	@media screen and (max-width: 763px) {
		width:260px;
	}
  }

`

const RateStepsTab = styled(Steps)``;
const RateStep = styled(Step)`
  .ant-steps-item-content {
	display: flex;
	justify-content: center;
	line-height: 17px;
  }
  .ant-steps-item-description {
	font-size: 14px;
  }
`;
const SelectYearContainer = styled(Col)`
  padding-top: 25px;
`;

export const InputWithLabel = styled.div`
  display: flex;
  flex-direction: column;

  &:last-child {
	marginRight: 0;
  }
  & input{
	height:50px;
	padding:10px;
	padding: 15px 20px;
	width:30%;
	border-radius: 10px;
	margin-top: 15px;

	border : 0px none !important;
	border-radius:0px none !important;
	border-bottom : 1px solid black !important;
	 padding: 15px 20px;
	  width:30%;
	background:transparent !important;
	margin-top:15px;
	margin-left:20px;
  }
  & .react-tel-input .flag-dropdown{
	background-color:transparent;
	border: 0px none;
  }
  & .react-tel-input .form-control {
	height:50px;  
	border : 0px none !important;
	border-radius:0px none !important;
	width:100%;
	border-bottom : 1px solid black !important;
`;

const TechSelect = styled(Select)`
  .ant-select-selector {
	min-width: 300px !important;
	height: 45px !important;
	border: 0px none !important;
	background-color: transparent !important;

	align-items: center;
	border-bottom: 1px solid #7a8994 !important;
  }
  .ant-select-selection-item {
	display: flex;
	cursor: pointer !important;
  }
  .ant-select-selection-search {
	display: flex;
	align-items: center;
	cursor: pointer !important;
  }
  .ant-select-selection-placeholder {
	text-align: left;
	color: #7a8994 !important;
	cursor: pointer !important;
  }
`;
/*const StepTitle = styled.div`
	text-align:center !important;
	padding-bottom:20px;
	& p{
		width : ${props => props.width ?props.width :"100%"}
		margin : ${props => props.margin ?props.margin :""}
		font-weight : bold;
		font-size: ${props => props.font_size? props.font_size :"45px"};
  }

`;*/
const SoftwareContainer = styled.div`
	background: #F6FBFF;
	margin-bottom: 50px;
	border-radius: 5px;
	display: flex;
	flex-direction: column;
	width: inherit;
	align-items: flex-start;
	padding: 40px;
`;
const engilshLevels = [
	"Beginner",
	"Intermediate",
	"Advanced",
	"Fluent",
	"Native",
];
/*const StepActionContainer = styled.div`
	width: 100%;
	margin-top: 40px;
	display: flex;
	justify-content: center;

	&.steps-action {
		margin-right :90px;
	}
`;*/
const SectionTitle = styled(Text)`
	font-size: 24px;
	font-weight: bold;
`;
/*const SectionImage = styled.img`
	width: 60px;
	margin-bottom: 25px;
`;*/
// const experienceYearsList = ['5 - 10', '10 - 15', '15 - 20', '20 - 25'];
export default memo(ProfileReview);
