import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router';
import mixpanel from 'mixpanel-browser';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { BiComment, BiShareAlt } from "react-icons/bi";
import { BsFillCircleFill } from "react-icons/bs";
import { FiClock } from "react-icons/fi";
import { FaGreaterThan } from "react-icons/fa";
import { Rate } from 'antd';
import { getOnlineTechnicianById, getTechnicianDetailesByUserId} from '../../../api/technician.api';
import * as SoftwareApi from '../../../api/software.api';
import { EmailOutlook } from '../../../constants/index'
import BasicButton from 'components/common/Button/BasicButton';
import Logo from "components/common/Logo";
import { openNotificationWithIcon } from '../../../utils/index'
import { useUser } from '../../../context/useContext';
import Loader from '../../../components/Loader';
import PlaceholderImage from '../../../assets/users/technicianProfileImage.png'
import { useJob } from '../../../context/jobContext';

const TechnicianUniqueLink = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const technicianUserId = queryParams.get("technicianId");
    const [isShown, setIsShown] = useState(false);
    const [techRating, setTechRating] = useState(5);
    const [softwareList, setSoftwareList] = useState([]);
    const [techImage, setTechImage] = useState("");
    const [techName, setTechName] = useState("");
    const [isTechOnline, setIsTechOnline] = useState(false);
    const [totalJobsCountTechnician, setTotalJobsCountTechnician] = useState("");
    const [showSpinner, setShowSpinner] = useState('');
    const [techProfileDescription, setTechProfileDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();
    const technicianProfile = queryParams.get('medium') ? queryParams.get('medium') : false;
    const totalCompletedJobsTechnician =  formatNumber(totalJobsCountTechnician);
    const { getTotalJobsForTechnicianWithoutAuthenticate } = useJob();

    useEffect(() => {
        const fetchTechnicianDetails = async () => {
            try {
                if (technicianUserId) {
                    const technicianDetails = await getTechnicianDetailesByUserId(technicianUserId);
                    const TechData = technicianDetails?.data[0];
                    // Convert HTML to plain text
                    const htmlContent = TechData.profileDescription;
                    setTechProfileDescription(htmlContent);
                    let totalJobsCount = await getTotalJobsForTechnicianWithoutAuthenticate({ technician: TechData?.id});
                    setTotalJobsCountTechnician(totalJobsCount)
                    if (TechData?.rating > 0) {
                        setTechRating(TechData?.rating);
                    } else {
                        setTechRating(5);
                    }
                    setTechName(TechData?.user?.firstName + " " + TechData?.user?.lastName);
                    if(TechData && TechData?.profile && TechData?.profile?.image){
                        setTechImage(TechData?.profile?.image);
                    }

                    const selectedSoftwareId = TechData?.expertise.map((softId) => softId.software_id);
                    const allSoftwares = await SoftwareApi.getSoftwareList();
                    const selectedSoftwareDetails = allSoftwares?.data
                        .filter((itemX) => selectedSoftwareId.includes(itemX.id))
                        // .filter((itemX) => !EmailOutlook.includes(itemX.id));

                    setSoftwareList(selectedSoftwareDetails);
                    setIsLoading(false);
                }
            } catch (error) {
                console.log("Error occurs while fetching technician details", error);
            }
        };
        fetchTechnicianDetails();
    }, [technicianUserId]);


    useEffect(() => {
        async function fetchOnlineTechnician() {
            if (technicianUserId) {
                const onlineTech = await getOnlineTechnicianById(technicianUserId);
                console.log("onlineTech", onlineTech)
                if (onlineTech.activeUserFound) setIsTechOnline(true);
                else setIsTechOnline(false);
            };
        }
        fetchOnlineTechnician();
    }, [technicianUserId]);

    function formatNumber(customerRatings) {
        if (customerRatings >= 1000 && customerRatings <= 10000) {
            return Math.floor(customerRatings/1000) + 'k';
        };
        return customerRatings;
    }
    
    const handleClick = event => {
        setIsShown(current => !current);
    };
    const clickForJobPost = () => {
        if (user && user.email) {
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Click connect now btn to post job from technician profile link.');
        }
        setShowSpinner('Connect Now');
        if (technicianUserId) {
            if (user && user.id) {
                window.location.href = `/customer/profile-setup?technicianId=${technicianUserId}&medium=${technicianProfile}`
            } else {
                window.location.href = `/customer/start-profile-setup?technicianId=${technicianUserId}&medium=${technicianProfile}`
            };
        };
    };
    const clickForScheduleJob = () => {
        if (user && user.email) {
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Click Schedule later btn to schedule job from technician profile link.');
        };
        setShowSpinner('Schedule later');
        if (user && user.id) {
            window.location.href = `/customer/profile-setup?technicianId=${technicianUserId}&medium=${technicianProfile}&applyJobFor=scheduleJob`
        } else {
            window.location.href = `/customer/start-profile-setup?technicianId=${technicianUserId}&medium=${technicianProfile}&applyJobFor=scheduleJob`
        };
    };
    const handleImageClick = (SoftId) => {
        if (user && user.id) {
            window.location.href = `/customer/profile-setup?technicianId=${technicianUserId}&softwareId=${SoftId}&medium=${technicianProfile}`
        } else {
            window.location.href = `/customer/start-profile-setup?technicianId=${technicianUserId}&softwareId=${SoftId}&medium=${technicianProfile}`
        };
    };
    const clickForChatWithGeek = () => {
        if (user && user.email) {
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Click chat geek btn for chat  from technician profile link.')
        };
        window.location.href = `/login?message=${technicianUserId}`
    };

    const shareCopiedLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            openNotificationWithIcon('success', 'Link copied.', 'You can share this technician profile link with anybody.');
        } catch (err) {
            openNotificationWithIcon('error', 'Copy Failed', 'Sorry, there was an error copying the link.');
        };
    };

    if (isLoading) return <Loader height="100%" className={`${isLoading ? 'loader-outer' : 'd-none'}`} />;
    return (
        <>
            <div className="parentDiv">
                <div className='mainSection gradientBackground'>
                    <Container>
                        <Row className="mb-4">
                            <Col>
                                <Logo user={user} fromJobFlow={true} />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <div className="leftSideSection">
                                    <div className="TechImageSection">
                                        {techImage && techImage !== "false" ?
                                            <Image
                                                src={techImage}
                                                alt="TechnicianImg"
                                                roundedCircle
                                                className="tech-profile-Image technicianImageCircleColor"
                                            />
                                            :
                                            <Image
                                                src={PlaceholderImage}
                                                alt="PlaceholderImage"
                                                className="tech-profile-Image"
                                            />
                                        }
                                        <span className="showCircle"><BsFillCircleFill className={`${isTechOnline ? "greenCircle" : "greyCircle"}`} /></span>
                                    </div>
                                    {/* for mobile Responsive start */}
                                    <div className="TechImageForMobile">
                                        {techImage && techImage !== "false" ?
                                            <Image
                                                src={techImage}
                                                alt="TechnicianImg"
                                                roundedCircle
                                                className="techImageMobile technicianImageCircleColor"
                                            />
                                            :
                                            <Image
                                                src={PlaceholderImage}
                                                alt="PlaceholderImage"
                                                className="techImageMobile"
                                            />
                                        }
                                        <span className="showCircleMobile"><BsFillCircleFill className={`${isTechOnline ? "greenCircleForMobile" : "greyCircleForMobile"}`} /></span>
                                    </div>
                                    {/* for mobile Responsive End here */}
                                    <div className='softwaresListSection'>
                                        {softwareList ?
                                            softwareList.map((experience, index) => {
                                                return (
                                                    <Image
                                                        key={index}
                                                        src={experience?.blob_image}
                                                        alt={experience?.name}
                                                        className={`${user && user?.userType === 'technician' ? "softwareImage" : "softwareListImage"}`}
                                                        rounded
                                                        title={experience?.name}
                                                        onClick={user && user?.userType === 'technician' ? null : () => { handleImageClick(experience.id) }}
                                                    />
                                                );
                                            })
                                            : " "
                                        }
                                    </div>
                                </div>
                            </Col>
                            <Col md={7}>
                                <div className="rightSideSection-heading">
                                    <div className="profileHeading">{techName}</div>
                                    {/* for mobile responsive start here */}
                                    <div className="profileHeadingMobile">{techName}</div>
                                    <div className='softwaresListSectionMobile'>
                                        {softwareList ?
                                            softwareList.map((experience, index) => {
                                                return (
                                                    <Image
                                                        key={index}
                                                        src={experience?.blob_image}
                                                        alt={experience?.name}
                                                        className="softwareListImage"
                                                        rounded
                                                        title={experience?.name}
                                                        onClick={user && user?.userType === 'technician' ? null : () => { handleImageClick(experience.id) }}
                                                    />
                                                );
                                            })
                                            : " "
                                        }
                                    </div>
                                    {/* for mobile responsive End here */}
                                    <div className='iconSection'>
                                        <span title="Chat with this geek." onClick={user && user?.userType === 'technician' ? null : clickForChatWithGeek} className={`${user && user?.userType === 'technician' ? 'opacity-point-5 pr-2' : "icons_section pr-2"}`}><BiComment className="reactIcon" /></span>
                                        {/* <span disabled title="Chat with this geek." onClick={user && user?.userType === 'technician' ? null : clickForChatWithGeek} className={`${user && user?.userType === 'technician' ? 'opacity-point-5' : "icons_section"}`}><BiComment className="reactIcon" /></span> */}
                                        <span className="icons_section" title="Technician profile link." onClick={shareCopiedLink}> <BiShareAlt className="reactIcon" /></span>
                                    </div>
                                </div>
                                <div className={`${totalJobsCountTechnician > 0 ? "technicianRating" : "technicianRatingSection"} mb-4`}>
                                    <span className="ratingSection">
                                        <Rate className="starRating" disabled allowHalf={true} defaultValue={techRating} value={techRating} />
                                    </span>
                                    {totalJobsCountTechnician > 0 &&
                                        <span className="customerRating" title={totalJobsCountTechnician +" "+ `Jobs Completed`}>{totalCompletedJobsTechnician} Jobs Completed</span>
                                    }
                                </div>

                                {/* for mobile responsive Start here */}
                                <div className='technicianRatingForMobile mb-2'>
                                    <span className="ratingSectionMobile mb-2">
                                        <Rate className="starRatingMobile" disabled allowHalf={true} defaultValue={techRating} value={techRating} />
                                    </span>
                                    {totalJobsCountTechnician > 0 &&
                                        <span className="customerRatingMobile">{totalCompletedJobsTechnician}  Jobs Completed</span>
                                    }
                                </div>

                                <div className='iconSectionMobile'>
                                    <div className="iconContentMobile" onClick={shareCopiedLink}>
                                        <span> <BiShareAlt className="reactIcon" /></span>
                                        <span className="chatgeek">Share</span>
                                    </div>
                                    <div disabled className={`${user && user?.userType === 'technician' ? 'opacity-point-5' : ""} iconContentMobile`} onClick={user && user?.userType === 'technician' ? null : clickForChatWithGeek}>
                                        <span><BiComment className="reactIcon" /></span>
                                        <span className="chatgeek">Message</span>
                                    </div>
                                    <div className={`${user && user?.userType === 'technician' ? 'opacity-point-5' : ""} iconContentMobile`} onClick={user && user?.userType === 'technician' ? null : clickForScheduleJob}  >
                                        <span><FiClock className="reactIcon" /></span>
                                        <span className="chatgeek">Schedule</span>
                                    </div>
                                </div>
                                <div className="techConnetBtnMobile">
                                        <BasicButton disable={user && user?.userType === 'technician' ? true : showSpinner == 'Connect Now' ? true : false} onClick={clickForJobPost} btnTitle={"Connect Now"} height={"50px"} width={"166px"} background={"#01D4D5"} color={"#FFFFFF"} showSpinner={showSpinner == 'Connect Now' ? true : false} />
                                </div>
                                {/* for mobile responsive End here */}
                                <Row className="mb-3">
                                    {techProfileDescription && techProfileDescription !== 'undefined' &&
                                        <Col className="technicianReview">
                                            <div dangerouslySetInnerHTML={{ __html: techProfileDescription }}></div>
                                        </Col>
                                    }
                                    {/* for mobile responsive Start here */}
                                    {techProfileDescription && techProfileDescription !== 'undefined' &&
                                        <div className="techReviewAtMobile">
                                            <div
                                                style={{
                                                    height: isShown ? "100%" : "16%",
                                                    transition: '2s',
                                                    overflow: 'hidden'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: techProfileDescription }}
                                            ></div>
                                            {!isShown && <span style={{ textAlign: "center" }} className="readMore" onClick={handleClick}>Read<FaGreaterThan className="greaterthenArrow" /></span>}
                                        </div>
                                    }
                                    {/* for mobile responsive End here */}
                                </Row>
                                <Row>
                                    <Col className="techSideBtn">
                                            <>
                                            <div className={`${user && user?.userType === 'technician' ? "scheduleOpacity" : ""}`}>
                                                <BasicButton disable={user && user?.userType === 'technician' ? true : showSpinner == 'Schedule later' ? true : false} onClick={user && user?.userType === 'technician' ? null : clickForScheduleJob} btnTitle={"Schedule later"} height={"60px"} width={"223px"} border={'2px solid'} background={"#FFFFFF"} color={showSpinner == 'Schedule later' ? "rgb(151, 171, 182)" : "#01D4D5"} showSpinner={showSpinner == 'Schedule later' ? true : false} />
                                            </div>

                                                <BasicButton disable={ user && user?.userType === 'technician' ? true : showSpinner == 'Connect Now' ? true : false} onClick={clickForJobPost} btnTitle={"Connect Now"} height={"60px"} width={"223px"} marginLeft={"15px"} background={"#01D4D5"} color={"#FFFFFF"} showSpinner={showSpinner == 'Connect Now' ? true : false} />
                                            </>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    )
};
export default TechnicianUniqueLink

