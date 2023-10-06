import React, { useState, useEffect } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import profileImg from '../../assets/users/user.png';
import { useServices } from '../../context/ServiceContext';
import * as JobService from "../../api/job.api"
import { useJob } from '../../context/jobContext';
import { useNotifications } from '../../context/notificationContext';
import ExcelImage from '../../assets/images/excel.png';
import GoogleSheetImage from '../../assets/images/google_sheet.png';
import QuickBookImage from '../../assets/images/quickbook.png';
import OtherSoftwareImage from '../../assets/images/other_software.png';
import Notifications from './Notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCopy } from '@fortawesome/free-solid-svg-icons';
import { useTools } from 'context/toolContext';
import { useAuth } from '../../context/authContext';
import * as UserApi from "../../api/users.api"
import './rightbar.css';
import { openNotificationWithIcon } from "../../utils";
import { APP_URL } from '../../constants';

function RightSidebar({ user, openNotification, setOpenNotification, sethideBadge, hideBadge, setcurrentStep, setjobId, setType, toggle, setActiveMenu, profilePicUpdated }) {

  const { techJobs } = useJob();
  const { imageupload, setImageupload, imageChange } = useTools();
  const [displayList, setDisplayList] = useState(techJobs.length > 0 ? true : false);
  const { allNotifications, updateReadStatus } = useNotifications();
  const [userNotifications, setUserNotifications] = useState([]);
  const [showExperience, setShowExperience] = useState(false);
  const [firstImage, setFirstImage] = useState(false);
  const [secondImage, setSecondImage] = useState(false);
  const [firstSoftware, setFirstSoftware] = useState(false);
  const [secondSoftware, setSecondSoftware] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0)
  const [techRating, setTechRating] = useState('5.00')
  const [techProfileLink, setTechProfileLink] = useState('');
  const [technicianPic, setTechnicianPic] = useState('');

  const TechImages = {
    'Google Sheets': GoogleSheetImage,
    'Microsoft Office': ExcelImage,
    'IT Technical Support': OtherSoftwareImage,
    'QuickBooks': QuickBookImage,
  };

  const {
    totalTimeSeconds,
    totalEarnings,
    monthlyEarnings,
    monthlySeconds,
    overAllRatings,
  } = useServices()
  const HandleHide = () => {
    toggle();
  };

  useEffect(() => {
    (async () => {
      if (imageupload) {
        setTechnicianPic(imageChange);
      }
    })();
  }, [imageupload, imageChange]);

  useEffect(() => {
    console.log("user: :::::::::::::", user)

    if (user && user.userType === "customer" && user.customer) {
      let filter_dict = {}
      filter_dict['customer'] = user.customer.id
      const res = JobService.findJobByParams(filter_dict)
      res.then((result) => {
        if (result.data.length > 2) {
          let software1 = (result && result.data[0] && result.data[0]['software'] ? result.data[0]['software']['name'] : '')
          let software2 = (result && result.data[1] && result.data[1]['software'] ? result.data[1]['software']['name'] : '')
          setFirstSoftware(software1)
          setFirstImage(TechImages[software1])
          if (software1 !== software2) {
            setSecondSoftware(software2)
            setSecondImage(TechImages[software2])
          }
          setShowExperience(true)
        } else if (result.data.length === 0) {
          setShowExperience(false)
        }
      })
    }
  }, [user])


  useEffect(() => {
    if (user && user.userType === "technician") {
      setTechProfileLink(`${APP_URL}/technician-details-setup?technicianId=${user.id}&medium=technician-profile`)
    }
  }, [user])

  useEffect(() => {
    (async () => {
      if (user && user.userType === "technician") {
        let updatedUser = await UserApi.getUserById(user?.id)
        if (updatedUser && updatedUser?.technician?.rating !== undefined) {
          const formattedRating = updatedUser?.technician?.rating.toFixed(2); // Format the rating to have 2 decimal places
          setTechRating(formattedRating);
        }
      }
    })();
  }, [user]);

  const notificationCountHandler = (userNotifyArr) => {
    const onLyReadableItems = userNotifyArr.filter(item => item.read === false)

    if (onLyReadableItems.length > 0) {
      document.title = `(${onLyReadableItems.length.toString()}) Geeker`;
    } else {
      document.title = "Geeker"
    }
    setNotificationCount(onLyReadableItems.length)

  }

  useEffect(() => {
    if (allNotifications && user) {
      const userNotifyArrTemp = allNotifications.filter(item => (item && user && item.user) && item.user.id === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      let userNotifyArr = userNotifyArrTemp
      notificationCountHandler(userNotifyArr)
      for (let i = 0; i <= userNotifyArr.length - 1; i++) {
        let old_time = new Date(userNotifyArr[i]['updatedAt'])
        let now_time = new Date();
        var diffMs = (now_time - old_time); // milliseconds between now & Christmas
        var diffDays = Math.floor(diffMs / 86400000); // days
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        if (diffDays !== 0) {
          userNotifyArr[i]['time'] = diffDays.toString() + ' days ago'
        } else if (diffHrs !== 0) {
          userNotifyArr[i]['time'] = diffHrs.toString() + ' hours ago'
        } else if (diffMins !== 0) {
          userNotifyArr[i]['time'] = diffMins.toString() + ' minutes ago'
        } else {
          userNotifyArr[i]['time'] = 'Few seconds ago'
        }
      }
      setUserNotifications(userNotifyArr)
    }
  }, [allNotifications])

  useEffect(() => {
    cleanUp()
  }, [techJobs])

  const cleanUp = () => {
    setTimeout(() => {
      let demoArr = [...techJobs]
      demoArr.shift()
    }, 3000)
  }

  useEffect(() => {
    if (openNotification) {
      setDisplayList(!displayList)
      setNotificationCount(0)
      updateReadStatus({ "user": user.id, "status": true })
      setOpenNotification(false)
    }
  }, [openNotification])

  const handleDropDown = () => {
    setDisplayList(!displayList)
    document.title = "Geeker"
    updateReadStatus({ "user": user.id, "status": true })
    setNotificationCount(0)
    sethideBadge(true)
  }

  const hms_convert = (t) => {
    if (t) {
      let d = Number(t);
      let h = Math.floor(d / 3600);
      let m = Math.floor(d % 3600 / 60);
      let s = Math.floor(d % 3600 % 60);
      let hFormat = h <= 9 ? "0" + h : h
      let mFormat = m <= 9 ? "0" + m : m
      let sFormat = s <= 9 ? "0" + s : s
      let hDisplay = h > 0 ? hFormat + ':' : "00:";
      let mDisplay = m > 0 ? mFormat + ':' : "00:";
      let sDisplay = s > 0 ? sFormat : "00";
      return hDisplay + mDisplay + sDisplay;
    } else {
      return '00:00:00';
    }
  }

  const copiedTechnicianLink = async () => {
    try {
      await navigator.clipboard.writeText(techProfileLink)
      openNotificationWithIcon('success', 'Link copied.', 'You can share this technician profile link with anybody.')
    } catch (err) {
      openNotificationWithIcon('error', 'Copy Failed', 'Sorry, there was an error copying the link.')
    }
  };

  return (
    <Row>
      <Col md="12" className="pt-lg-5 pt-0 pb-3">
        <Notifications
          user={user}
          handleDropDown={handleDropDown}
          notificationCount={notificationCount}
          userNotifications={userNotifications}
          displayList={displayList}
          setDisplayList={setDisplayList}
          setcurrentStep={setcurrentStep}
          setjobId={setjobId}
          setType={setType}
          setActiveMenu={setActiveMenu}
        />
      </Col>
      <button
        className="profile-toggle-hide"
        onClick={HandleHide}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      {user && user.userType === 'technician' && (
        <Col md="12" className="pt-0 pb-2">
          <h1 className="large-heading text-center">My Dashboard</h1>
        </Col>
      )}
      {user && user.userType === 'technician' && (
        <Col md="12" className="pt-3">
          <Row>
            <Col md="4" className="pt-md-5 pt-2">
              <span className="label-name d-block pt-1">Rating</span>
              <span className="label-value d-block one-liner ">
                {techRating}
              </span>
            </Col>
            <Col md="4" className="p-0">
              <div className="profile-img-outer-1">
                <div className="profile-img-outer grid-center">
                  <Image
                    roundedCircle
                    className="img-fluid h-100p"
                    src={
                      imageupload ? technicianPic : user?.technician?.profile?.image || profileImg
                    }
                  />
                </div>
              </div>
            </Col>
            {user && user.userType === 'technician' && (
              <Col md="4" className="pt-md-5 pt-2 text-right">
                <span className="label-name d-block pt-1">Earned</span>
                <span className="label-value d-block one-liner">
                  {user?.technician?.tag !== 'employed' ?
                    totalEarnings != null ? '$' + totalEarnings : '$' + 0.0
                    : 'NA'}
                </span>
              </Col>
            )}
            {user && user.userType === 'customer' && (
              <Col md="4" className="pt-5 text-right">
                <span className="label-name d-block pt-1">Billed</span>
                <span className="label-value d-block one-liner">
                  $
                  {totalEarnings != null ? totalEarnings : 0.0}
                </span>
              </Col>
            )}
          </Row>
        </Col>
      )}

      {user && user.userType === 'technician' && (
        <Col md="12" className="pt-5 text-center">
          {user && user.userType === 'technician' && (
            <>
              <Col md="12" className="text-center total-block-outer py-5 mx-auto px-0 mb-4">
                <Row>
                  <Col md="12">
                    <span className="d-block label-total-name">
                      Share Your Profile
                    </span>
                    <div className="col-12 input-group mt-2">
                      <input type="text" className=" form-control" readOnly value={techProfileLink} aria-label="Recipient's username" aria-describedby="basic-addon2" />
                      <div className="input-group-append">
                        <span className="input-group-text copiedLink" title='Copy' id="basic-addon2" onClick={copiedTechnicianLink}><FontAwesomeIcon icon={faCopy} /></span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col md="12" className="text-center total-block-outer py-5 mx-auto px-0 mb-4">
                <Row>
                  <Col md="6">
                    <span className="d-block label-total-name">
                      Total Hours Worked
                    </span>
                    <span className="d-block label-total-value">
                      {hms_convert(totalTimeSeconds)}
                    </span>
                  </Col>
                  <Col md="6">
                    <span className="d-block label-total-name">
                      Total Earnings
                    </span>
                    <span className="d-block label-total-value">
                      {user?.technician?.tag !== 'employed' ?
                        totalEarnings != null ? '$ ' + totalEarnings : '$ ' + 0.0
                        : 'NA'}
                    </span>
                  </Col>
                </Row>
              </Col>

              <Col md="12" className="text-center total-block-outer py-5 mx-auto px-0 mb-4">
                <Row>
                  <Col md="6">
                    <span className="d-block label-total-name">
                      Hours this period
                    </span>
                    <span className="d-block label-total-value">
                      {hms_convert(monthlySeconds)}
                    </span>
                  </Col>
                  <Col md="6" >
                    <span className="d-block label-total-name">
                      Earnings this period
                    </span>
                    <span className="d-block label-total-value">
                      {user?.technician?.tag !== 'employed' ?
                        monthlyEarnings != null ? '$' + monthlyEarnings : '$' + 0.0
                        : 'NA'}
                    </span>
                  </Col>
                </Row>
              </Col>

            </>
          )}

          {user && user.userType === 'customer' && (
            <Row>
              <Col
                md="5"
                className="text-center total-block-outer py-5 mx-auto px-0"
              >
                <Row>
                  <Col md="12" className="">
                    <span className="d-block label-total-name">
                      Total Hours Provided
                    </span>
                    <span className="d-block label-total-value">
                      {' '}
                      {hms_convert(totalTimeSeconds)}
                    </span>
                  </Col>

                  <Col md="12" className="pt-4">
                    <>
                      <span className="d-block label-total-name">
                        Hours this period
                      </span>
                      <span className="d-block label-total-value">
                        {hms_convert(monthlySeconds)}
                      </span>
                    </>
                  </Col>
                </Row>
              </Col>
              <Col
                md="5"
                className="text-center total-block-outer py-5 m-auto px-0"
              >
                <Row>
                  <Col md="12" className="">
                    <span className="d-block label-total-name">
                      Total Money Spent
                    </span>
                    <span className="d-block label-total-value">
                      $
                      {' '}
                      {totalEarnings != null && totalEarnings
                        ? totalEarnings
                        : 0}
                    </span>
                  </Col>
                  <Col md="12" className="pt-4">
                    <span className="d-block label-total-name">
                      Spent This Month
                    </span>
                    <span className="d-block label-total-value">
                      $
                      {' '}
                      {monthlyEarnings != null ? monthlyEarnings : 0}
                    </span>
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </Col>
      )}

      {user
        && user.userType === 'customer'
        && showExperience === true
        && firstImage && (
          <>
            <Col md="12" className="pt-5">
              <Row>
                <Col xs="12">
                  <h4 className="medium-heading">Expertise wanted</h4>
                </Col>
              </Row>
            </Col>
            <Col md="12" className="pt-4 text-center mb-5">
              <Row>
                {firstImage && (
                  <Col
                    md="5"
                    className="text-center radius-4 payment-outer py-4 px-0 bg-level-3 m-auto"
                  >
                    <span className="d-block label-payment-value">
                      <Image src={firstImage} className="software-img" />
                    </span>
                    <span className="d-block label-software-name">
                      {firstSoftware}
                    </span>
                  </Col>
                )}

                {secondImage && (
                  <Col
                    md="5"
                    className="text-center radius-4 payment-outer py-4 px-0 bg-level-2 m-auto"
                  >
                    <span className="d-block label-payment-value">
                      <Image src={secondImage} className="software-img" />
                    </span>
                    <span className="d-block label-software-name">
                      {secondSoftware}
                    </span>
                  </Col>
                )}
              </Row>
            </Col>
          </>
        )}
    </Row>
  );
}

export default React.memo(RightSidebar);
