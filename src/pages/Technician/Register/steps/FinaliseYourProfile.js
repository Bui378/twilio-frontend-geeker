import React, { useState, useEffect } from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import FooterBtns from "components/FooterBtns"
import CheckInCircle from "components/CheckInCircle"
import { FaUserCircle } from "react-icons/fa"
import * as SoftwareApi from '../../../../api/software.api';
import { Upload, message, Space, notification, } from 'antd';
import { EmailOutlook, SERVER_URL } from '../../../../constants';
import { FaCloudUploadAlt } from "react-icons/fa";
import * as Techapi from '../../../../api/technician.api';
import mixpanel from 'mixpanel-browser';
import { Button } from 'antd';
import {
  CitySelect,
  CountrySelect,
  StateSelect,
  LanguageSelect,
  GetCountries,
  GetState,
  GetCity,
  GetLanguages,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

let r = (Math.random() + 1).toString(36).substring(7);
const FinaliseYourProfile = ({ onPrev, onNext, setShowProgress, setProgressBarPercentage, expertiseArrselected, setCurrentStep, user, refetch, checkScheduleInterview, setCheckScheduleInterview
}) => {
  const [fileList, setFileList] = useState([]);
  const [fileListImage, setFileListImage] = useState([]);
  const [selectedsoftwareList, setSelectedSoftwareList] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false)
  const [geekImage, setGeekImage] = useState();
  const [disable, setDisable] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [showRedBorderforAddressLine1, setShowRedBorderforAddressLine1] = useState(false);
  const [showRedBorderforZip, setShowRedBorderforZip] = useState(false);
  const [addressLine1, setAddressLine1] = useState(user.technician.profile.confirmId.address1 ? user.technician.profile.confirmId.address1 : "")
  const [addressLine2, setAddressLine2] = useState(user.technician.profile.confirmId.address2 ? user.technician.profile.confirmId.address2 : "")
  const [zipcode, setZipcode] = useState(user.technician.profile.confirmId.zip ? user.technician.profile.confirmId.zip : "")
  const [city, setCity] = useState(user.technician.profile.confirmId.city ? user.technician.profile.confirmId.city : "")
  const [cityObject, setCityObject] = useState(user.technician.profile.confirmId.cityObject ? user.technician.profile.confirmId.cityObject : {})
  const [state, setState] = useState(user.technician.profile.confirmId.state ? user.technician.profile.confirmId.state : "")
  const [stateObject, setStateObject] = useState(user.technician.profile.confirmId.stateObject ? user.technician.profile.confirmId.stateObject : {})
  const [country, setCountry] = useState(user.technician.profile.confirmId.country ? user.technician.profile.confirmId.country : "")
  const [countryObject, setCountryObject] = useState(user.technician.profile.confirmId.countryObject ? user.technician.profile.confirmId.countryObject : {})
  const [countryid, setCountryid] = useState(user.technician.profile.confirmId.countryObject ? user.technician.profile.confirmId.countryObject.id : 0);
  const [stateid, setstateid] = useState(user.technician.profile.confirmId.stateObject ? user.technician.profile.confirmId.stateObject.id : 0);
  let finalSoftwares = []
  let selectedSoftware = []

  useEffect(() => {
    console.log("My conosle for address", { addressLine1, addressLine2, city, zipcode, state, country, user: user.technician.profile.confirmId })
  }, [addressLine1, addressLine2, city, zipcode, state, country])

  useEffect(() => {
    if (user) {
      console.log("My conosle for user", { user })
      setAddressLine1(user.technician.profile.confirmId.address1 ? user.technician.profile.confirmId.address1 : "")
      setAddressLine2(user.technician.profile.confirmId.address2 ? user.technician.profile.confirmId.address2 : "")
      setZipcode(user.technician.profile.confirmId.zip ? user.technician.profile.confirmId.zip : "")
      setCountry(user.technician.profile.confirmId.country ? user.technician.profile.confirmId.country : "")
      setState(user.technician.profile.confirmId.state ? user.technician.profile.confirmId.state : "")
      setCity(user.technician.profile.confirmId.city ? user.technician.profile.confirmId.city : "")
    }
  }, [user])

  useEffect(() => {
    GetState(countryid).then((allStates) => {
      if (allStates.length === 0) {
        setState("NA")
        setCity("NA")
      } else {
        setState("")
        setCity("")
      }
    })
  }, [countryid])

  useEffect(() => {
    (async () => {
      console.log('inside finalize>>>', checkScheduleInterview)
      const techDataRes = await Techapi.retrieveTechnician(user.technician.id)
      finalSoftwares = techDataRes.expertise.filter(item => item.software_id !== EmailOutlook)
      console.log('Before filter finalSoftwares>>>', finalSoftwares)
      // finalSoftwares = techDataRes.expertise.filter(item => item.result === "Pass")
      // finalSoftwares = techDataRes.testHistory.filter(item => item.software_id !== EmailOutlook)
      // let finalSoftwaresIds = techDataRes.testHistory.filter(item => item.result === "Pass")
      let passedSoftwares = techDataRes.testHistory.filter(function (item) {

        return item.result === "Pass";

      }).map(function (item) {

        return item.software_id;

      })
      console.log('filter passedSoftwares>>>', passedSoftwares)
      finalSoftwares = techDataRes.expertise.filter(item => passedSoftwares.includes(item.software_id))
      console.log('filter finalSoftwares>>>', finalSoftwares)

      const softwareListResponse = await SoftwareApi.getSoftwareList()
      if (softwareListResponse && softwareListResponse.data) {
        for (var x in finalSoftwares) {
          for (var y in softwareListResponse.data) {
            let temp = {}
            if (softwareListResponse.data[y].id === finalSoftwares[x].software_id) {
              temp = softwareListResponse.data[y]
              selectedSoftware.push(temp)
            }
          }
        }
        setSelectedSoftwareList(selectedSoftware)
      }
      //  await Techapi.updateTechnicianWithParams(user.technician.id, {expertise:finalSoftwares})

    })()
    //   (async () => { 
    //     const softwareListResponse = await SoftwareApi.getSoftwareList()
    //     if(softwareListResponse && softwareListResponse.data){
    //         for (var x in finalSoftwares){
    //             for (var y in softwareListResponse.data){
    //                 let temp = {}
    //                 if(softwareListResponse.data[y].id === finalSoftwares[x].software_id){
    //                     temp = softwareListResponse.data[y]
    //                     selectedSoftware.push(temp)
    //                 }
    //             }
    //         }
    //         console.log("My console to see", selectedSoftware, expertiseArrselected)
    //         setSelectedSoftwareList(selectedSoftware)
    //     }
    // })();
    setShowProgress(true)
    setProgressBarPercentage(95)
    refetch()
  }, [])

  useEffect(() => {

    console.log("My console for user days available", user.technician.profile)
    setGeekImage(user && user.technician.profile.image.length > 0 ? user.technician.profile.image : "")
    if (user && user?.technician?.profile && user?.technician?.profile?.image && user?.technician?.profile?.image?.length > 0) {
      setImageUploaded(true);
    } else {
      setImageUploaded(false);
    }
  }, [user])

  const deleteImage = async () => {
    let techUpdate = await Techapi.updateTechnicianWithParams(user.technician.id, {
      "profile.image": "",
      registrationStatus: 'finalize_profile'
    })
    openNotificationWithIcon('success', 'Success', 'Image deleted succesfully',)
    setFileListImage([])
    setGeekImage("")
    refetch()
  }

  const deleteResume = async () => {
    let techUpdate = await Techapi.updateTechnicianWithParams(user.technician.id, { "resume": "" })
    openNotificationWithIcon('success', 'Success', 'Resume deleted succesfully',)
    refetch()
  }

  const handleNext = async () => {
    if (imageUploaded) {

      if (addressLine1 === "") {
        openNotificationWithIcon('error', 'Error', 'Please provide your address to proceed further.')
        return
      }

      if (country === "") {
        openNotificationWithIcon('error', 'Error', 'Please enter your country to proceed further.')
        return
      }

      if (state === "") {
        openNotificationWithIcon('error', 'Error', 'Please enter your state to proceed further.')
        return
      }

      if (city === "") {
        openNotificationWithIcon('error', 'Error', 'Please enter your city to proceed further.')
        return
      }

      if (zipcode === "") {
        openNotificationWithIcon('error', 'Error', 'Please enter your zipcode to proceed further.')
        return
      }

      setShowSpinner(true)
      await Techapi.updateTechnicianWithParams(user.technician.id,
        {
          registrationStatus: 'schedule_interview',
          profile: {
            confirmId: {
              address1: addressLine1,
              address2: addressLine2,
              city: city,
              cityObject: cityObject,
              zip: zipcode,
              state: state,
              stateObject: stateObject,
              country: country,
              countryObject: countryObject
            }
          }
        })
      if (checkScheduleInterview) {
        await Techapi.updateTechnicianWithParams(user.technician.id,
          {
            registrationStatus: 'interview_result',
            profile: {
              confirmId: {
                address1: addressLine1,
                address2: addressLine2,
                city: city,
                zip: zipcode,
                state: state,
                country: country
              }
            }
          })
        window.location.href = '/'
      }
      onNext()
    } else {
      openNotificationWithIcon('error', 'Error', 'Please upload a profile image to proceed further.')
    }
  }

  const openNotificationWithIcon = (nType, header, nMessage) => {
    notification[nType]({
      message: header,
      description: nMessage,
    });
  };

  const fileTypes = '.png, .jpg, .jpeg, .pdf, .doc';
  const { Dragger } = Upload;
  const fileTypesImage = '.png, .jpg, .jpeg';

  let fileNameImage = `${user.id}_userProfile-${r}`;

  const propsForImage = {
    name: 'file',
    accept: fileTypesImage,
    multiple: false,
    fileList: fileListImage,
    action: `${SERVER_URL}/api/uploads`,
    data: { "user": `${fileNameImage}` },
    maxCount: 1,
    beforeUpload: file => {
      console.log("file :::::", file)
      if (fileListImage.length > 0) {
        openNotificationWithIcon('error', 'Warning', 'Only one file is allowed. Please delete remove the previous one first');
        return false;
      }
      if (
        !(
          file.type === 'image/jpeg'
          || file.type === 'image/png'
          || file.type === 'image/jpg'
        )
      ) {
        openNotificationWithIcon('error', 'Warning', 'File Type Not Supported');
        return false
      }
      if (file.size / 1048576 > 10) {
        openNotificationWithIcon('error', 'Warning', 'File should be smaller than 5mb');
        return false;
      }
    },
    async onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'uploading') {
        setFileListImage([info.file]);
      }
      if (status === 'done') {
        setImageUploaded(true)
        message.success(`${info.file.name} file uploaded successfully.`);
        let finalImage = `${fileNameImage}-.${info.file.type.split('/').pop()}`;
        let techUpdate = await Techapi.updateTechnicianWithParams(user.technician.id, { "profile.image": `${SERVER_URL}/images/${finalImage}` })
        setFileListImage([info.file]);
        setGeekImage(`${SERVER_URL}/images/${finalImage}`);
        if (user) {
          // mixpanel code//
          mixpanel.identify(user.email);
          mixpanel.track('Technician - uploaded profile image');
          // mixpanel code//
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    async onRemove() {
      setGeekImage("")
      setImageUploaded(false)
      let techUpdate = await Techapi.updateTechnicianWithParams(user.technician.id, { "profile.image": "" })
      refetch()
      setFileListImage([])
      r = (Math.random() + 1).toString(36).substring(7);

    }
  };

  let fileName = `${user.id}_resume`
  const props = {
    name: 'file',
    accept: fileTypes,
    multiple: false,
    fileList,
    action: `${SERVER_URL}/api/uploads`,
    data: { "user": `${fileName}` },
    maxCount: 0,
    beforeUpload: file => {
      console.log("file :::::", fileList)
      if (fileList.length > 0) {
        openNotificationWithIcon('error', 'Warning', 'Only one file is allowed. Please delete remove the previous one first');
        return false;
      }
      if (
        !(
          file.type === 'image/jpeg'
          || file.type === 'application/pdf'
          || file.type === 'image/png'
          || file.type === 'image/jpg'
          || file.type === 'application/msword'
        )
      ) {
        openNotificationWithIcon('error', 'Warning', 'File Type Not Supported');
        return false
      }
      if (file.size / 1048576 > 10) {
        openNotificationWithIcon('error', 'Warning', 'File should be smaller than 10mb');
        return false;
      }
    },
    async onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'uploading') {
        setFileList([info.file]);
      }
      if (status === 'done') {
        // if(user){
        //   mixpanel.identify(user.email);
        //   mixpanel.track('Technician- Resume Uploaded',{ 'Email': user.email });
        // }

        message.success(`${info.file.name} file uploaded successfully.`);
        let techUpdateForpdf = await Techapi.updateTechnicianWithParams(user.technician.id, { resume: `${fileName}-.${info.file.name.split('.').pop()}` })
        setFileList([info.file]);
        // mixpanel code//
        if (user) {
          mixpanel.identify(user.email);
          mixpanel.track('Technician - uploaded resume');
        }
        // mixpanel code//
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    async onRemove() {
      let techUpdate = await Techapi.updateTechnicianWithParams(user.technician.id, { "resume": "" })
      setFileList([])
    }
  };

  // let selectedSoftware = []

  const handleSkills = () => {
    setCurrentStep(2)
  }

  const handleInfo = () => {
    setCurrentStep(1)
  }

  const handlePreviousBtn = () => {
    setCurrentStep(5)
    // onPrev()
  }

  const handleAddressLine1OnBlur = () => {
    if (addressLine1 === "") {
      setShowRedBorderforAddressLine1(true)
    } else {
      setShowRedBorderforAddressLine1(false)
    }
  }

  const handleZipOnBlur = () => {
    if (zipcode === "") {
      setShowRedBorderforZip(true)
    } else {
      setShowRedBorderforZip(false)
    }
  }

  return <div className="d-flex justify-content-center align-items-center flex-column">
    <HeadingAndSubHeading heading={"Finalize your profile"} subHeading={"Please finish completing your profile. This is optional, but wouldn’t it be cool to have your own picture or avatar now?"} />

    <div className="w-90p">
      <div className="finalise-upload-div d-flex justify-content-center" >
        <div className="upload-div d-flex justify-content-center align-items-start flex-column"  >
          <div className="d-flex justify-content-start align-items-center check-in-circle-div">
            <CheckInCircle bgColor={"grey"} />
            <span className="finalise-upload-text">Upload Profile Image</span>
          </div>
          <div className={`${user.technician.profile.image ? "disable-image" : ""}`}>
            <Dragger {...propsForImage} >
              <div className="uploadProfileImage">
                {geekImage ?
                  <img src={geekImage} className="geekImage"></img>
                  :
                  <FaUserCircle className="uploadProfileImage" />
                }
              </div>
            </Dragger>
          </div>
          <div className="delete-Image-Button">
            {
              user.technician.profile.image &&
              <Space wrap>
                <Button
                  type="text"
                  onClick={deleteImage}
                  size="small"
                >
                  Delete image
                </Button>
              </Space>
            }
          </div>
        </div>
        <div className=" upload-div d-flex justify-content-center align-items-center flex-column">
          <div className="d-flex justify-content-start align-items-start w-100p check-in-circle-div">
            <CheckInCircle bgColor={"grey"} />
            <span className="finalise-upload-text">Upload Resume</span>
          </div>
          <div className={`${user.technician.resume ? "disable-image" : ""}`}>
            <Dragger {...props} >
              {
                fileList.length > 0 && fileList[0].name || user.technician.resume ?
                  (<div className="uploadResume d-flex justify-content-center align-items-center flex-column  ">
                    <span>Resume uploaded successfully</span>
                  </div>)
                  :
                  <div className="uploadResume d-flex justify-content-center align-items-center flex-column  ">
                    <div className="cloud-upload">
                      <FaCloudUploadAlt className="cloud-icon" />
                    </div>
                    {/* <div className="drag-drop"> */}
                    <span className=" drag-drop drag-drop-text">
                      Drag & Drop or 	&nbsp;
                      <span className="drag-drop-upload">Upload</span>
                    </span>
                    {/* </div> */}
                  </div>
              }
            </Dragger>
          </div>
          <div className="delete-resume-Button">
            {
              user.technician.resume &&
              <Space wrap>
                <Button
                  type="text"
                  onClick={deleteResume}
                  size="small"
                >
                  Delete resume
                </Button>
              </Space>
            }
          </div>
        </div>
      </div>
      <div className="finalise-summary-div d-flex justify-content-around align-items-start  w-100p">
        <div className="d-flex justify-content-start align-items-start flex-column" style={{ width: "260px" }}>
          <div className="d-flex justify-content-start align-items-center">
            <CheckInCircle bgColor={"turcose"} />
            <span className="finalise-upload-text">Profile Details</span>
          </div>
          <div className="finalise-profile-details">
            <p className="finalise-profile-p">{user.firstName + " " + user.lastName}</p>
            <p className="finalise-profile-p">{user.email}</p>
            <p className="finalise-profile-p">{user.technician.profile.confirmId.phoneNumber}</p>
          </div>
          {/* <div className="w-100p edit-icon-div">
                        <div className="edit-icon-inner-div">
                          <button 
                          style={{border:"none"}}
                          onClick={handleInfo}
                          >

                            <EditIcon />
                          </button>
                        </div>
                    </div> */}
        </div>
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ width: "260px" }}>
          <div className="d-flex justify-content-start align-items-center w-100p">
            <CheckInCircle bgColor={"turcose"} />
            <span className="finalise-upload-text mb-10">Skills</span>
          </div>
          {selectedsoftwareList.map((software, index) => {
            return (<div key={index} className="finalise-profile-skills">
              <img src={software.blob_image} className="sw-img" />
              <span className="finalise-profile-skills-span">{software.name}</span>
            </div>)
          })}
          {/* <div className="w-100p edit-icon-div">
                        <div className="edit-icon-inner-div">
                        <button
                         style={{border:"none"}}
                         onClick={handleSkills}
                         >
                            <EditIcon />
                          </button>
                        </div>
                    </div> */}
        </div>
      </div>
      <div className="finalise-summary-div d-flex justify-content-around align-items-start w-100p">
        <div className="d-flex justify-content-start align-items-start flex-column w-100p">
          <div className="d-flex justify-content-center align-items-center w-100p address-heading-div">
            <span className="finalise-upload-text">Address Details</span>
          </div>
          <div className="d-flex justify-content-around align-items-start w-100p flex-wrap">
            <div className="d-flex flex-column mt-3">
              <div className="d-flex justify-content-end align-items-center mb-2 flex-wrap max-width-768-justify-content-center">
                <label htmlFor="addressLine1" className="address-label">Address Line 1 *</label>&nbsp;
                <input
                  type="text"
                  className={"address-input " + (showRedBorderforAddressLine1 ? " red-border" : "")}
                  id="addressLine1"
                  onChange={(e) => setAddressLine1(e.target.value.trim())}
                  onBlur={handleAddressLine1OnBlur}
                  defaultValue={user.technician.profile.confirmId.address1}
                />
              </div>
              <div className="d-flex justify-content-end align-items-center mb-2 flex-wrap max-width-768-justify-content-center">
                <label htmlFor="addressLine2" className="address-label">Address Line 2</label>&nbsp;
                <input
                  type="text"
                  className="address-input"
                  id="addressLine2"
                  onChange={(e) => setAddressLine2(e.target.value.trim())}
                  defaultValue={user.technician.profile.confirmId.address2}
                />
              </div>
              <div className="d-flex justify-content-end align-items-center mb-2 flex-wrap max-width-768-justify-content-center">
                <label htmlFor="zipcode" className="address-label">Zip Code *</label>&nbsp;
                <input
                  type="text"
                  className={"address-input " + (showRedBorderforZip ? " red-border" : "")}
                  id="zipcode"
                  onChange={(e) => setZipcode(e.target.value.trim())}
                  onBlur={handleZipOnBlur}
                  defaultValue={user.technician.profile.confirmId.zip ? user.technician.profile.confirmId.zip : ""}
                />
              </div>
            </div>
            <div className="d-flex flex-column mt-3">
              <div className="d-flex justify-content-end align-items-center mb-2 flex-wrap max-width-280-justify-content-center">
                <label htmlFor="country" className="address-label">Country *</label>&nbsp;
                <CountrySelect
                  containerClassName="country-select"
                  inputClassName="country-select-input"
                  onChange={(e) => {
                    setCountryid(e.id);
                    setCountry(e.name)
                    setCountryObject(e)
                    console.log("Country selected", e)
                  }}
                  placeHolder="Select Country"
                  defaultValue={user.technician.profile.confirmId.countryObject ? user.technician.profile.confirmId.countryObject : ""}
                />
              </div>
              <div className="d-flex justify-content-end align-items-center mb-2 flex-wrap max-width-280-justify-content-center">
                <label htmlFor="state" className="address-label">State *</label>&nbsp;
                <StateSelect
                  containerClassName="country-select"
                  inputClassName="country-select-input"
                  countryid={countryid}
                  onChange={(e) => {
                    setstateid(e.id);
                    setState(e.name)
                    setStateObject(e)
                    console.log("State selected", e)
                  }}
                  placeHolder="Select State"
                  defaultValue={user.technician.profile.confirmId.stateObject ? user.technician.profile.confirmId.stateObject : ""}
                />
              </div>
              <div className="d-flex justify-content-end align-items-center mb-2 flex-wrap max-width-280-justify-content-center">
                <label htmlFor="city" className="address-label">City *</label>&nbsp;
                <CitySelect
                  containerClassName="country-select"
                  inputClassName="country-select-input"
                  countryid={countryid}
                  stateid={stateid}
                  onChange={(e) => {
                    setCity(e.name)
                    setCityObject(e)
                    console.log("City selected", e)
                  }}
                  placeHolder="Select City"
                  defaultValue={user.technician.profile.confirmId.cityObject ? user.technician.profile.confirmId.cityObject : ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <FooterBtns disable={true} onPrev={handlePreviousBtn} onNext={handleNext} hideSaveForLater={true} showSpinner={showSpinner} />
  </div>
}

export default FinaliseYourProfile