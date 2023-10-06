import React, { useEffect, useState } from 'react';
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import FooterBtns from "components/FooterBtns"
import Dropdown from "components/Dropdown"
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import TimezoneSelect, { allTimezones } from "react-timezone-select";
import 'react-phone-input-2/lib/high-res.css'
import { languages } from '../../../../constants';
import * as Techapi from '../../../../api/technician.api';
import * as UserApi from '../../../../api/users.api';
import { openNotificationWithIcon } from '../../../../utils';
import mixpanel from 'mixpanel-browser';
import { useTools } from '../../../../context/toolContext';

const WelcomeToGeekerTwo = (
    {
        onNext,
        onPrev,
        setShowProgress,
        timezone,
        setTimezoneValue,
        language,
        setLanguage,
        additionalLanguage,
        setAdditionalLanguage,
        setProgressBarPercentage,
        setReff_by,
        reff_by,
        setLanguageDropdownValue,
        languageDropdownValue,
        user,
        refetch,
        setTimezone
    }) => {

    const [showSpinner, setShowSpinner] = useState(false)
    const { getCountryCategory } = useTools();

    useEffect(() => {
        setProgressBarPercentage(20)
        setShowProgress(true)
        refetch()
    }, [])

    useEffect(() => {
        if (user && user.technician.language) {
            let temp = user.technician.additionalLanguage
            temp.unshift(user.technician.language)
            setLanguageDropdownValue(temp)
        }
        if (user && user.timezone) {
            setTimezone(user.timezone)
        }
        if (user && user.referred_by) {
            setReff_by(user.referred_by)
        }
    }, [user])

    const saveForLater = async () => {
        let category = getCountryCategory(timezone)
        let techUpdate = await Techapi.updateTechnicianWithParams(user.technician.id, { language: language, additionalLanguage: additionalLanguage, commissionCategory: category, })
        const data = {
            userId: user.id,
            timezone: user.timezone,
            referred_by: reff_by,
        }
        let timeZoneUpdate = await UserApi.updateUser(data)
        if (techUpdate && timeZoneUpdate) {
            openNotificationWithIcon('success', 'Success', 'Technician data updated successfully for later.');
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Technician - saved data (language, timezone and reffered by) for later');
            // mixpanel code//
        }

    }

    /**
    * Function that handles the next button after  the registration and update the tech with timeZone language and reffered by 
    * @author : Kartar
    **/

    const onHandelSubmit = async (value) => {

        if (!language) {
            openNotificationWithIcon('error', 'Error', 'Please select language.');
            return
        }
        setShowSpinner(true)
        let category = getCountryCategory(timezone)
        let techUpdate = await Techapi.updateTechnicianWithParams(user.technician.id, { language: language, additionalLanguage: additionalLanguage, registrationStatus: "select_softwares", commissionCategory: category })
        const data = {
            userId: user.id,
            timezone: user.timezone,
            referred_by: reff_by,
        }
        let timeZoneUpdate = await UserApi.updateUser(data)
        if (techUpdate && timeZoneUpdate) {
            openNotificationWithIcon('success', 'Success', 'Technician data updated successfully.');
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Technician - submitted language, timezone and reffered by and proceeded to next form');
            // mixpanel code//
        }
        onNext()
    }

    useEffect(() => {
        if (languageDropdownValue.length > 0) {
            setLanguage(languageDropdownValue[0])
        }
        if (languageDropdownValue.length > 1) {
            let additionalLangArr = []
            for (const key in languageDropdownValue) {
                additionalLangArr.push(languageDropdownValue[key]);
            }
            additionalLangArr.shift()
            setAdditionalLanguage(additionalLangArr)
        }
    }, [languageDropdownValue])

    return (

        <div className="d-flex justify-content-center align-items-center flex-column">
            <HeadingAndSubHeading heading={"Welcome to Geeker"} subHeading={"We’re excited to have you here! We’re always looking for talented techs like you."} />
            <form style={{ width: "100%", maxWidth: "428px" }} onSubmit={onHandelSubmit}>
                <div className='lang'>
                    <div className='label-div '>
                        <label className='language-label'>Language</label>
                    </div>
                    <div className="d-sm-flex justify-content-sm-center lang-resp lang-div">
                        <Dropdown
                            placeholder={"English"}
                            value={languageDropdownValue}
                            className="lang-style"
                            name={'languages'}
                            opts={languages}
                            style={{ width: "100%", maxWidth: "428px" }}
                            setLanguageDropdownValue={setLanguageDropdownValue}
                        />
                    </div>
                </div>


                <div className='time'  >
                    <div className='label-div '>
                        <label className='language-label'>Time Zone</label>
                    </div>
                    <div className="d-sm-flex justify-content-sm-center timeContainer " >
                        <TimezoneSelect
                            value={timezone}
                            onChange={setTimezoneValue}
                            timezones={{
                                ...allTimezones
                            }}
                            className="mb-1 pl-0"
                            id="tech-timezone"
                        />
                    </div>
                </div>

                <div className='social-div'>
                    <div className='label-div'>
                        <label className='language-label'>How did you hear about us</label>
                    </div>
                    <div className="d-flex  justify-content-between flex-wrap">

                        <div onClick={() => { setReff_by("facebook") }} className={`d-flex align-items-center  icon-social justify-content-center round-btn-selector-social cursor-pointer ${reff_by === "facebook" ? "active-refff-by" : ""}`}>
                            <FaFacebookF className='social-Icon' />
                        </div>

                        <div onClick={() => { setReff_by("twitter") }} className={`d-flex align-items-center  icon-social justify-content-center round-btn-selector-social cursor-pointer ${reff_by === "twitter" ? "active-refff-by" : ""}`}>
                            <FaTwitter className='social-Icon ' />
                        </div>

                        <div onClick={() => { setReff_by("linkedin") }} className={`d-flex align-items-center  icon-social justify-content-center round-btn-selector-social cursor-pointer ${reff_by === "linkedin" ? "active-refff-by" : ""}`}>
                            <FaLinkedinIn className='social-Icon' />
                        </div>

                        <div onClick={() => { setReff_by("friend") }} className={`d-flex align-items-center  social-btn justify-content-center round-btn-selector-social cursor-pointer ${reff_by === "friend" ? "active-refff-by" : ""}`} >
                            <span className="friend-btn">
                                Friend
                            </span>
                        </div>

                        <div onClick={() => { setReff_by("other") }} className={` d-flex align-items-center justify-content-center round-btn-selector-social  social-btn cursor-pointer ${reff_by === "other" ? "active-refff-by" : ""} `} >
                            <span className="friend-btn">
                                Other
                            </span>
                        </div>

                    </div>
                </div>
            </form>

            <FooterBtns onPrev={onPrev} saveForLater={saveForLater} onNext={onHandelSubmit} showSpinner={showSpinner} hidePrevBtn={'yes'} />
        </div>
    )
}

export default WelcomeToGeekerTwo