import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { LayoutMax } from '../../../components/Layout';
import Header from '../../../components/NewHeader';
import WelcomeToGeekerTwo from './steps/WelcomeToGeekerTwo';
import ScreenSteps from '../../../components/ScreenSteps';
import { useUser } from '../../../context/useContext';
import { LANDING_PAGE_URL } from '../../../constants';
import TechRegister from './steps/techRegister';
import WhatIsYourSpeciality from './steps/WhatIsYourSpeciality';
import WhatIsYourSpeciality2 from './steps/WhatIsYourSpeciality2';
import ProgressBarTechOnboarding from 'components/ProgressBarTechOnboarding';
import DaysAvailable from './steps/DaysAvailable';
import DemoVideo from './steps/DemoVideo';
import ScheduleInterview from './steps/ScheduleInterview';
import Exam from './steps/Exam';
import FinaliseYourProfile from './steps/FinaliseYourProfile';
import { weekDataObj } from 'constants/other';

const TechnicianRegister = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    language: '',
    additionalLanguage: '',
    referred_code: ''
  });

  // --------START----------Days Availability Variables and states----------START---------
  let allWeekObj = {
    value: "allDays",
    available: true,
    startTime: "",
    endTime: "",
    timeStartValue: "--:--",
    timeEndValue: "--:--",
    otherTimes: [],
  };

  let daysArr = [
    { day: "Monday", selected: false },
    { day: "Tuesday", selected: false },
    { day: "Wednesday", selected: false },
    { day: "Thursday", selected: false },
    { day: "Friday", selected: false },
    { day: "Saturday", selected: false },
    { day: "Sunday", selected: false },
  ];

  const [customization, setCustomization] = useState(false);
  const [checkScheduleInterview, setCheckScheduleInterview] = useState(false);
  const [allWeek, setAllWeek] = useState(allWeekObj);
  const [weekDays, setWeekDays] = useState(weekDataObj);
  const [weekDaysArr, setWeekDaysArr] = useState([]);
  const [days, setDays] = useState(daysArr);
  // --------END----------Days Availability Variables and states----------END---------

  const [register, setRegister] = useState([]);
  const [reff_by, setReff_by] = useState("other");
  const { user, refetch } = useUser();
  const [language, setLanguage] = useState('');
  const [additionalLanguage, setAdditionalLanguage] = useState([]);
  const [languageDropdownValue, setLanguageDropdownValue] = useState(["English"]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [otherSoftwareSelected, setOtherSoftwareSelected] = useState([]);
  const [absentSoftwareSelected, setAbsentSoftwareSelected] = useState([]);
  const [expertiseArrselected, setExpertiseArrselected] = useState([]);
  const location = useLocation();
  const [showProgress, setShowProgress] = useState(false)
  const [progressBarPercentage, setProgressBarPercentage] = useState(0)
  const [expertiseLevel, setExpertiseLevel] = useState([]);

  useEffect(() => {
    if (user) {
      setRegister(user);
    }
    let urlParams = new URLSearchParams(location.search)
    console.log("urlParams :::::::::", urlParams.get("t"));

    if (urlParams.get("t") && urlParams.get("t") == "update_technician") {
      setCurrentStep(1);
    }
    if (urlParams.get("t") && urlParams.get("t") == "select_softwares") {

      setCurrentStep(2);
    }
    if (urlParams.get("t") && urlParams.get("t") == "level_of_expertise") {

      setCurrentStep(3);
    }
    if (urlParams.get("t") && urlParams.get("t") == "availability") {

      setCurrentStep(4);
    }
    if (urlParams.get("t") && urlParams.get("t") == "demo_video") {

      setCurrentStep(5);
    }
    if (urlParams.get("t") && urlParams.get("t") == "exam") {
      setCurrentStep(6);
    }
    if (urlParams.get("t") && urlParams.get("t") == "exam_fail") {

      setCurrentStep(6);
    }
    if (urlParams.get("t") && urlParams.get("t") == "finalize_profile") {

      setCurrentStep(7);
    }
    if (urlParams.get("t") && urlParams.get("t") == "schedule_interview") {

      setCurrentStep(8);
    }
    if (user &&
      user.technician &&
      user.technician.registrationStatus &&
      (user.technician.registrationStatus === "interview_result" ||
        user.technician.registrationStatus === "incomplete_profile" ||
        user.technician.registrationStatus === "complete"
      )) {
      window.location.href = "/"
    }
  }, []);

  const onNext = async () => {
    window.history.replaceState({}, "title", "/");

    if (currentStep >= 9) {
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep + 1);
    }
    console.log("currentStep inside the onNext function ::", currentStep)
  };

  const setTimezoneValue = (e) => {
    setTimezone(e.value);
  };

  const onPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const steps = [

    // First component for new tech-onboarding-design by Milan
    {
      title: 'Signup',
      content: (
        <TechRegister
          onNext={onNext}
          setShowProgress={setShowProgress}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          setProgressBarPercentage={setProgressBarPercentage}
          setRegister={setRegister}
        />
      ),
    },

    // Second component for new tech-onboarding-design by Kartar 
    {
      title: 'WelcomeToGeekerTwo',
      content: (<WelcomeToGeekerTwo
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        timezone={timezone}
        setTimezone={setTimezone}
        setTimezoneValue={setTimezoneValue}
        language={language}
        setLanguage={setLanguage}
        additionalLanguage={additionalLanguage}
        setAdditionalLanguage={setAdditionalLanguage}
        setProgressBarPercentage={setProgressBarPercentage}
        reff_by={reff_by}
        setReff_by={setReff_by}
        setLanguageDropdownValue={setLanguageDropdownValue}
        languageDropdownValue={languageDropdownValue}
        user={user}
        refetch={refetch}
      />
      ),
    },

    // Third component for new tech-onboarding-design
    {
      title: 'Speciality',
      content: (<WhatIsYourSpeciality
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        showProgress={showProgress}
        setProgressBarPercentage={setProgressBarPercentage}
        setOtherSoftwareSelected={setOtherSoftwareSelected}
        absentSoftwareSelected={absentSoftwareSelected}
        setAbsentSoftwareSelected={setAbsentSoftwareSelected}
        setExpertiseArrselected={setExpertiseArrselected}
        otherSoftwareSelected={otherSoftwareSelected}
        register={register}
        expertiseArrselected={expertiseArrselected}
        user={user}
        refetch={refetch}
        setCurrentStep={setCurrentStep}
      />
      ),
    },

    // Fourth component for new tech-onboarding-design
    {
      title: 'Speciality 2',
      content: (<WhatIsYourSpeciality2
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        setProgressBarPercentage={setProgressBarPercentage}
        setExpertiseArrselected={setExpertiseArrselected}
        expertiseArrselected={expertiseArrselected}
        register={register}
        expertiseLevel={expertiseLevel}
        setExpertiseLevel={setExpertiseLevel}
        user={user}
        refetch={refetch}
      />
      ),
    },

    // Fifth component for new tech-onboarding-design
    {
      title: 'Days Available',
      content: (<DaysAvailable
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
        customization={customization}
        setCustomization={setCustomization}
        allWeek={allWeek}
        setAllWeek={setAllWeek}
        weekDays={weekDays}
        setWeekDays={setWeekDays}
        weekDaysArr={weekDaysArr}
        setWeekDaysArr={setWeekDaysArr}
        days={days}
        setDays={setDays}
        user={user}
        refetch={refetch}
      />
      ),
    },

    // Sixth component for new tech-onboarding-design
    {
      title: 'Demo Video',
      content: (<DemoVideo
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
        user={user}
        setCurrentStep={setCurrentStep}
      />
      ),
    },

    // Seventh component for new tech-onboarding-design
    {
      title: 'Exam',
      content: (<Exam
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        showProgress={showProgress}
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
      />
      ),
    },

    // Eighth component for new tech-onboarding-design
    {
      title: 'Finalise your profile',
      content: (<FinaliseYourProfile
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        setProgressBarPercentage={setProgressBarPercentage}
        expertiseArrselected={expertiseArrselected}
        setCurrentStep={setCurrentStep}
        user={user}
        refetch={refetch}
        checkScheduleInterview={checkScheduleInterview}
        setCheckScheduleInterview={setCheckScheduleInterview}
      />
      ),
    },

    // Ninth component for new tech-onboarding-design
    {
      title: 'Schedule Interview',
      content: (<ScheduleInterview
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
        user={user}
        refetch={refetch}
        setCheckScheduleInterview={setCheckScheduleInterview}
      />
      ),
    },

  ];
  return (
    <div className="w-85 mb-3" id="LightTheme">
      <LayoutMax className="background-transparent box-shadow-none font-nova" bg="transparent">
        <Header link={LANDING_PAGE_URL} />
        <div className='new_tech_onboarding_container font-nova'>
          {showProgress && <ProgressBarTechOnboarding progressBarPercentage={progressBarPercentage} currentStep={currentStep} />}
          <ScreenSteps
            stepsContent={steps[currentStep].content}
            current={currentStep}
            steps={steps}
          />
        </div>
      </LayoutMax>
    </div>
  );
};
export default TechnicianRegister;
