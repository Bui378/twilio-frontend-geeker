import React, { useEffect, useRef, useState } from 'react';
import mixpanel from 'mixpanel-browser';
import { Row, Col, Form, Input, Select } from 'antd';
import BasicButton from "components/common/Button/BasicButton";
import { openNotificationWithIcon } from '../../../../utils';
import styled from 'styled-components';
import { ItemContainer, ItemTitle, DescriptionText } from './style';
import editIcon from '../../../../assets/images/edit.png';
import ReactQuill from 'react-quill'
import 'quill/dist/quill.snow.css'
import { getUserById } from '../../../../api/users.api';
import { useSocket } from '../../../../context/socketContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import H4 from 'components/common/H4';
import { Button } from 'react-bootstrap';
import * as BusinessApi from '../../../../api/businessDetails.api'
import { INDUSTRY, TEAM_SIZE } from '../../../../constants/index';
import { useAuth } from 'context/authContext';
const BusinessDetails = ({ user }) => {

    const digitRegex = /(\d{501,})|([A-Za-z]{501,})/;
    const [aboutBusinesDetails, setAboutBusinesDetails] = useState('');
    const [aboutBusinesDetailsForTech, setAboutBusinesDetailsForTech] = useState('');
    const [haveDescription, setHaveDescription] = useState(true)
    const [haveDescriptionForTech, setHaveDescriptionForTech] = useState(true)
    const [exceedsLimit, setExceedsLimit] = useState(false)
    const [exceedsLimitForTech, setExceedsLimitForTech] = useState(false)
    const quillRef = useRef(null);
    const quillRefforTech = useRef(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showSpinnerForTech, setShowSpinnerForTech] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [showEditorForTech, setShowEditorForTech] = useState(false);
    const [isOwnerAccount, setIsOwnerAccount] = useState(false)
    const { socket } = useSocket();
    const { Option } = Select;
    const { updateUserInfo } = useAuth();
    const [businessDetails, setBusinessDetails] = useState({
        businessName: '',
        isBusinessTypeAccount: false,
        businessWebsite: '',
        industry: '',
        teamSize: '',
        editBusinessNameFeild: false,
        editBusinessWebSiteField: false,
        editIndustryField: false,
        editTeamSizeField: false
    })

    useEffect(() => {
        (async () => {
            if (user && user?.userType === 'customer') {
                const haveOwnerId = user?.ownerId;
                let userDetails;
                if (haveOwnerId && haveOwnerId !== null) {
                    userDetails = await getUserById(user.ownerId)
                } else {
                    userDetails = await getUserById(user.id)
                };
                if (userDetails && userDetails?.business_details?.businessInfoMessage) {
                    setAboutBusinesDetails(userDetails?.business_details?.businessInfoMessage);
                }
                if (userDetails && userDetails?.business_details?.businessInfoMessageForTech) {
                    setAboutBusinesDetailsForTech(userDetails?.business_details.businessInfoMessageForTech);
                }
            }
        })()
    }, [user]);

    useEffect(() => {
        // This will decide to show Business Name Edit Field Or not
        const userRolesArray = user?.roles
        const isOwner = userRolesArray.includes("owner");
        if (userRolesArray && isOwner) {
            setIsOwnerAccount(true)
        }
    }, [user])

    useEffect(() => {
        if (user && user?.userType == "customer" && user?.business_details) {
            const businessDetails = user?.business_details
            const businessType = businessDetails?.isBusinessTypeAccount ? businessDetails?.isBusinessTypeAccount : false
            const businessName = businessDetails?.businessName ? businessDetails?.businessName : '';
            const businessWebsite = businessDetails?.businessWebsite ? businessDetails?.businessWebsite : '';
            const industry = businessDetails?.industry ? businessDetails?.industry : INDUSTRY[0].value;
            const teamSize = businessDetails?.teamSize ? businessDetails?.teamSize : TEAM_SIZE[0].value;
            const updatedFields = {
                businessName: businessName,
                isBusinessTypeAccount: businessType,
                businessWebsite: businessWebsite,
                industry: industry,
                teamSize: teamSize
            }
            setBusinessDetails((prevBusinessDetails) => ({
                ...prevBusinessDetails,
                ...updatedFields,
            }));
        }
    }, [user])

    useEffect(() => {
        (async () => {
            socket.on("updated-business-message", (data) => {
                if (data && (data?.userId === user.id) || (data?.userId === user?.ownerId) && data?.businessInfoMessage) {
                    setAboutBusinesDetails(data?.businessInfoMessage);
                }
            })
        })()
    }, [socket])

    const validateContent = (text) => {
        if (digitRegex.test(text)) {
            setExceedsLimit(true);
        } else {
            setExceedsLimit(false);
        };
    };

    const validateContentForTech = (text) => {
        if (digitRegex.test(text)) {
            setExceedsLimitForTech(true);
        } else {
            setExceedsLimitForTech(false);
        };
    };

    const handlePaste = (event) => {
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');
        if (digitRegex.test(pastedText)) {
            setExceedsLimit(true);
        } else {
            setExceedsLimit(false);
        };
        setHaveDescription(false);
    };

    const handlePasteForTech = (event) => {
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');
        if (digitRegex.test(pastedText)) {
            setExceedsLimitForTech(true);
        } else {
            setExceedsLimitForTech(false);
        };
        setHaveDescriptionForTech(false);
    };

    const handleComplete = async () => {
        try {
            if (user && user.email) {
                mixpanel.identify(user.email);
                mixpanel.track('Customer - Update business details.');
            }
            if (quillRef.current) {
                const quillEditor = quillRef.current?.getEditor();
                const htmlContent = quillEditor?.root.innerHTML;
                // Convert HTML to plain text
                const parser = new DOMParser();
                const parsedHtml = parser.parseFromString(htmlContent, 'text/html');
                const plainText = parsedHtml.body.textContent || '';
                const removeSpaceOfText = plainText.trim();
                console.log("editor text length", removeSpaceOfText.length)

                if (removeSpaceOfText.length > 500) {
                    setExceedsLimit(true);
                } else {
                    setExceedsLimit(false);
                    let customerUserId;
                    if (user && user?.userType === 'customer') {
                        if (user && user?.ownerId && user?.ownerId !== null) {
                            customerUserId = user?.ownerId
                        } else {
                            customerUserId = user.id
                        };
                        setShowSpinner(true);
                        await BusinessApi.updateBusinessDetails(user.business_details?.id, {
                            businessInfoMessage: aboutBusinesDetails, businessMessNofication: { ownerNotify: true, userNotify: true, adminNotify: true }
                        }).then(res => {
                            if (res) {
                                setTimeout(() => {
                                    setShowEditor(false);
                                    setShowSpinner(false);
                                    socket.emit("update-business-info-message", {
                                        userId: customerUserId,
                                        businessInfoMessage: aboutBusinesDetails
                                    });
                                    openNotificationWithIcon('success', 'Success', 'Business details submitted successfully.');
                                }, 800);
                            }
                        })
                    };
                };
            };
        } catch (e) {
            console.log("Error occurs while technician submit his profile description.", e)
        };
    };

    const saveMessageForTech = async () => {
        try {
            if (user && user.email) {
                mixpanel.identify(user.email);
                mixpanel.track('Customer - Update business details.');
            }
            if (quillRefforTech.current) {
                const quillEditor = quillRefforTech.current?.getEditor();
                const htmlContent = quillEditor?.root.innerHTML;
                // Convert HTML to plain text
                const parser = new DOMParser();
                const parsedHtml = parser.parseFromString(htmlContent, 'text/html');
                const plainText = parsedHtml.body.textContent || '';
                const removeSpaceOfText = plainText.trim();
                console.log("editor text length", removeSpaceOfText.length)

                if (removeSpaceOfText.length > 500) {
                    setExceedsLimitForTech(true);
                } else {
                    setExceedsLimitForTech(false);
                    let customerUserId;
                    if (user && user?.userType === 'customer') {
                        if (user && user?.ownerId && user?.ownerId !== null) {
                            customerUserId = user?.ownerId
                        } else {
                            customerUserId = user.id
                        };

                        setShowSpinnerForTech(true);

                        await BusinessApi.updateBusinessDetails(user.business_details?.id, {
                            businessInfoMessageForTech: aboutBusinesDetailsForTech
                        }).then(res => {
                            if (res) {
                                setTimeout(() => {
                                    setShowEditorForTech(false)
                                    setShowSpinnerForTech(false);
                                    openNotificationWithIcon('success', 'Success', 'Business details submitted successfully.');
                                }, 800);
                            }
                        })
                    };
                };
            } else {
                console.log("My console in my else ")
            };
        } catch (e) {
            console.log("Error occurs while technician submit his profile description.", e)
        };
    };

    let modules = {
        toolbar: [
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
                { align: [] }
            ],
            [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
        ]
    };

    let formats = [
        "header", "height", "bold", "italic",
        "underline", "strike", "blockquote",
        "list", "color", "bullet", "indent",
        "link", "align", "size",
    ];

    const changeBusinessDetails = (content, type, inputType) => {
        let value = '';
        if (inputType == "text") {
            value = content.target.value
        }
        if (inputType == "dropdown") {
            value = content
        }
        setBusinessDetails((prevBusinessDetails) => ({
            ...prevBusinessDetails,
            ...{ [type]: value },
        }));
    }

    const handleBusinessDetailsChange = async (type, resetField) => {
        const trimmedValue = businessDetails[type].trim();
        if (trimmedValue !== '') {
            const businessId = user?.business_details?.id
            if (businessId) {
                const dataToUpdate = {
                    [type]: trimmedValue
                }
                await BusinessApi.updateBusinessDetails(businessId, dataToUpdate);
                if (type == 'businessName') {
                    updateUserInfo({
                        "userId": user.id,
                        "businessName": trimmedValue,
                        "isBusinessTypeAccount": true
                    });
                }
                openNotificationWithIcon("success", "Success", "Changes saved successfully.");
                setBusinessDetails((prevBusinessDetails) => ({
                    ...prevBusinessDetails,
                    ...{ [resetField]: !businessDetails[resetField] },
                }));
            }
        } else {
            openNotificationWithIcon("error", "Error", "Please enter your business name.");
        }
    }

    const editBusinessDetailField = (type) => {
        setBusinessDetails((prevBusinessDetails) => ({
            ...prevBusinessDetails,
            ...{ [type]: !businessDetails[type] },
        }));
    }

    return (
        <>
            <Container>
                <BodyContainer>
                    <Section>
                        <ItemContainer className="editContainer">
                            <ItemTitle>Business Message - For Business Users</ItemTitle>
                            <DescriptionText>
                                <span className="font-italic">
                                    This message will be displayed to all your users with any instructions or information about how/when to use the Geeker platform.
                                </span>
                            </DescriptionText>
                            <Row >
                                {!showEditor ? <div className='text-left' dangerouslySetInnerHTML={{ __html: aboutBusinesDetails }}></div> :
                                    <React.Fragment key="primarylg" >
                                        <Form>
                                            <div className='w-100 my-2 text-left'>
                                                <Row className='mb-3'>
                                                    <Col className='w-100'>
                                                        <ReactQuill
                                                            ref={quillRef}
                                                            theme="snow"
                                                            value={aboutBusinesDetails}
                                                            modules={modules}
                                                            formats={formats}
                                                            placeholder="Business Message"
                                                            onChange={(text) => {
                                                                setAboutBusinesDetails(text);
                                                                validateContent(text);
                                                                setHaveDescription(false);
                                                            }}
                                                            onPaste={handlePaste}
                                                        />
                                                    </Col>
                                                </Row>
                                                {exceedsLimit && (
                                                    <div className="error-message" style={{ color: "red" }}>
                                                        <p>You can write less than or equal to 500 characters.</p>
                                                    </div>
                                                )}

                                                <BasicButton disable={showSpinner || haveDescription} onClick={handleComplete} btnTitle={"Save"} height={"60px"} width={"223px"} background={"#01D4D5"} color={"#FFFFFF"} showSpinner={showSpinner} />
                                            </div>
                                        </Form>
                                    </React.Fragment>
                                }
                                <div className="EditIcons" >
                                    <img onClick={() => setShowEditor(!showEditor)} src={editIcon} width="20px" height="20px" alt="Edit" />
                                </div>
                            </Row>
                        </ItemContainer>
                    </Section>
                    <Section>
                        <ItemContainer className="editContainer">
                            <ItemTitle>Business Message - For Technicians</ItemTitle>
                            <DescriptionText>
                                <span className="font-italic">
                                    Optional message for technicians with all basic information or rules regarding your company to review during/before call.
                                </span>
                            </DescriptionText>
                            <Row >
                                {!showEditorForTech ? <div className='text-left' dangerouslySetInnerHTML={{ __html: aboutBusinesDetailsForTech }}></div> :
                                    <React.Fragment key="primarylg" >
                                        <Form>
                                            <div className='w-100 my-2 text-left'>
                                                <Row className='mb-3'>
                                                    <Col className='w-100'>
                                                        <ReactQuill
                                                            ref={quillRefforTech}
                                                            theme="snow"
                                                            value={aboutBusinesDetailsForTech}
                                                            modules={modules}
                                                            formats={formats}
                                                            placeholder="Business Message"
                                                            onChange={(text) => {
                                                                setAboutBusinesDetailsForTech(text);
                                                                validateContentForTech(text);
                                                                setHaveDescriptionForTech(false)
                                                            }}
                                                            onPaste={handlePasteForTech}
                                                        />
                                                    </Col>
                                                </Row>
                                                {exceedsLimitForTech && (
                                                    <div className="error-message" style={{ color: "red" }}>
                                                        <p>You can write less than or equal to 500 characters.</p>
                                                    </div>
                                                )}

                                                <BasicButton disable={showSpinnerForTech || haveDescriptionForTech} onClick={saveMessageForTech} btnTitle={"Save"} height={"60px"} width={"223px"} background={"#01D4D5"} color={"#FFFFFF"} showSpinner={showSpinnerForTech} />
                                            </div>
                                        </Form>
                                    </React.Fragment>
                                }
                                <div className="EditIcons" >
                                    <img onClick={() => setShowEditorForTech(!showEditorForTech)} src={editIcon} width="20px" height="20px" alt="Edit" />
                                </div>
                            </Row>
                        </ItemContainer>
                    </Section>

                    {isOwnerAccount && user.isBusinessTypeAccount &&
                        <>
                            <Section>
                                <ItemContainer className="editContainer">
                                    <ItemTitle>BUSINESS WEBSITE</ItemTitle>
                                    <Row>
                                        {!businessDetails.editBusinessWebSiteField ? <H4>{businessDetails.businessWebsite}</H4> :

                                            <React.Fragment key="additional">
                                                <Input placeholder="Enter Business Website" value={businessDetails.businessWebsite} onChange={(e) => { changeBusinessDetails(e, 'businessWebsite', 'text') }} className="customer-edit-profile-input" style={{ width: 200, margin: 0 }} />
                                                <Button onClick={() => { handleBusinessDetailsChange('businessWebsite', 'editBusinessWebSiteField') }} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                                                    <FontAwesomeIcon icon={faCheck} /><span></span>
                                                </Button>
                                            </React.Fragment>}
                                        <div className="EditIcons" >
                                            <img onClick={() => { editBusinessDetailField('editBusinessWebSiteField') }} src={editIcon} width="20px" height="20px" alt="Edit" />
                                        </div>
                                    </Row>
                                </ItemContainer>
                            </Section>
                            <Section>
                                <ItemContainer className="editContainer">
                                    <ItemTitle>INDUSTRY</ItemTitle>
                                    <Row>
                                        {!businessDetails.editIndustryField ? <H4>{businessDetails.industry}</H4> :
                                            <React.Fragment key="primarylg" >
                                                <Select
                                                    optionFilterProp="children"
                                                    style={{ width: 200, textAlign: 'left' }}
                                                    defaultValue={businessDetails.industry}
                                                    onChange={(value) => { changeBusinessDetails(value, 'industry', 'dropdown') }}
                                                    className="background-class"
                                                >
                                                    {INDUSTRY.map((item, index) => {
                                                        return <Option disabled={item.disabled} key={index} value={item.value} >{item.value}</Option>
                                                    })}
                                                </Select>

                                                <Button onClick={() => { handleBusinessDetailsChange('industry', 'editIndustryField') }} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                                                    <FontAwesomeIcon icon={faCheck} /><span></span>
                                                </Button>
                                            </React.Fragment>
                                        }
                                        <div className="EditIcons" >
                                            <img onClick={() => { editBusinessDetailField('editIndustryField') }} src={editIcon} width="20px" height="20px" alt="Edit" />
                                        </div>
                                    </Row>
                                </ItemContainer>
                                <ItemContainer className="editContainer">
                                    <ItemTitle>TEAM</ItemTitle>
                                    <Row>
                                        {!businessDetails.editTeamSizeField ? <H4>{businessDetails.teamSize}</H4> :
                                            <React.Fragment key="primarylg" >
                                                <Select
                                                    optionFilterProp="children"
                                                    style={{ width: 200, textAlign: 'left' }}
                                                    defaultValue={businessDetails.teamSize}
                                                    onChange={(value) => { changeBusinessDetails(value, 'teamSize', 'dropdown') }}
                                                    className="background-class"
                                                >
                                                    {TEAM_SIZE.map((item, index) => {
                                                        return <Option key={index} disabled={item.disabled} value={item.value} >{item.value}</Option>
                                                    })}
                                                </Select>

                                                <Button onClick={() => { handleBusinessDetailsChange('teamSize', 'editTeamSizeField') }} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                                                    <FontAwesomeIcon icon={faCheck} /><span></span>
                                                </Button>
                                            </React.Fragment>
                                        }
                                        <div className="EditIcons" >
                                            <img onClick={() => { editBusinessDetailField('editTeamSizeField') }} src={editIcon} width="20px" height="20px" alt="Edit" />
                                        </div>
                                    </Row>
                                </ItemContainer>
                            </Section>
                        </>

                    }


                </BodyContainer>
            </Container>
        </>
    )
};
const Container = styled.div`
  background: transparent;  

  & .margin-class{
    margin-top:10px;
  }

  & .background-class{
      background-color:transparent;
      border-bottom: solid 1px #999;
  }

  & .margin-class-left{
    margin-left:15px;
  }
`;
const BodyContainer = styled.div`
  background: transparent;
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  // padding: 40px;
  flex: 1;

`;
const Section = styled(Row)`
  width: 100%;
`;
export default BusinessDetails