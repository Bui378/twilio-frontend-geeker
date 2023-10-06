import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router';
import * as SoftwareApi from '../../../api/software.api';
import { Helmet } from 'react-helmet';
import { useUser } from '../../../context/useContext';
import { useJob } from '../../../context/jobContext';
import { platform } from '../../../constants/index.js';
import CustomerSignUp from './steps/CustomerSignUp';
import LogoWithHeading from 'components/common/LogoWithHeading';
import SelectSoftware from './steps/SelectSoftware';
import HelpIsOnTheWay from './steps/HelpIsOnTheWay';
import JobSummary from './steps/JobSummary';
import { useResizeObserver } from '../../../utils';

const CustomerProfileSetup = () => {
  console.log("?>>>>>>>>>>>>>>>>>>>>>>>>>> Customer posting a job  >>>>>>>>>>>>>>?>>>>>>>>>>>>>>")
  const { jobId } = useParams();
  const location = useLocation();
  let searchParams = useMemo(() => { return new URLSearchParams(window.location.search) }, [location])
  const repostJob = searchParams.get('repost') ? searchParams.get('repost') : false;
  const transferredJob = searchParams.get('transferredJob') ? searchParams.get('transferredJob') : false;
  const [softwareId, setSoftwareId] = useState(searchParams.get('softwareId'))
  const [software, setSoftware] = useState();
  const [subSoftware, setSubSoftware] = useState();
  const [expertise, setExpertise] = useState();
  const [subOption, setSubOption] = useState();
  const [issueDescription, setIssueDescription] = useState('');
  const [isScheduleJob, setIsScheduleJob] = useState(false)
  const formHeading = ["What do you need help with?",
    "Job Summary",
    "Please complete your order to connect to an expert",
    "Help is on the way!"]

  const [jobFlowStepNumber, setJobFlowStepNumber] = useState(0);
  const jobFlowStepsArray = {
    "selectSoftware": 0,
    "jobSummary": 1,
    "signUp": 2,
    "helpIsOnTheWay": 3,
  }
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "", email: "", password: "", businessName: "" })
  const [jobInfo, setJobInfo] = useState({ currentSoftware: {}, currentSubSoftware: "Select", needThisDone: "", moreDetails: "" })
  let defaultHour = new Date().getMinutes() >= 53 ? new Date().getHours() + 1 : new Date().getHours()
  let defaultHourValue = `${defaultHour > 12 ? defaultHour - 12 : defaultHour}`
  let defaultMinutes = new Date().getMinutes()
  let defaultMinutesValue = defaultMinutes >= 53 || defaultMinutes < 8 ? "00" : defaultMinutes >= 8 && defaultMinutes < 23 ? "15" : defaultMinutes >= 23 && defaultMinutes < 38 ? "30" : "45"
  let defaultDurationType = defaultHour < 12 ? "AM" : "PM"
  const [givenEmail, setGivenEmail] = useState();
  const [scheduleJobTime, setScheduleJobTime] = useState({
    date: new Date(),
    hours: defaultHourValue,
    minutes: defaultMinutesValue,
    durationType: defaultDurationType
  })
  const [guestJobId, setGuestJobId] = useState()
  const [selectedTechnician, setSelectedTechnician] = useState({})
  const [isFirsJob, setIsFirsJob] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [currentTab, setCurrentTab] = useState("createYourAccount")

  useEffect(() => {
    console.log("<jobInfo <><><><><><<>", jobInfo)
  }, [jobInfo])

  useEffect(() => {
    console.log("<scheduleJobTime <><><><><><<>", scheduleJobTime)
  }, [scheduleJobTime])



  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> searchParams", searchParams) }, [searchParams])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> location", location) }, [location])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> software", software) }, [software])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> subSoftware", subSoftware) }, [subSoftware])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> expertise", expertise) }, [expertise])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> subOption", subOption) }, [subOption])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> issueDescription", issueDescription) }, [issueDescription])

  const { user, setUser, setToken } = useUser();
  const { job, fetchJob, setJob } = useJob();

  useEffect(() => {
    (async () => {
      if (softwareId) {
        // retrieving software data
        let software_response = await SoftwareApi.retrievesoftware(softwareId)
        setJobInfo({ ...jobInfo, currentSoftware: software_response })
      }
    })()
  }, [softwareId])

  useEffect(() => {
    (async () => {
      if (jobId) {
        console.log("jobIdParam in profile setup ::", jobId)
        fetchJob(jobId);
      }
    })();
  }, [])

  useEffect(() => {
    if (searchParams.get('page') !== null) {
      const parameter = {
        'select-software': 'selectSoftware',
        'job-summary': 'jobSummary',
        'registration': 'signUp',
        'add-card': 'signUp',
        'tech-search': 'helpIsOnTheWay'
      }
      setJobFlowStepNumber(jobFlowStepsArray[parameter[searchParams.get('page')]])

    }
  }, [])


  useEffect(() => {
    if (repostJob && job) {
      setSubSoftware((job.subSoftware ? job.subSoftware : undefined));
      setIssueDescription(job.issueDescription);
    }
    if (job && job.status === 'Pending') {
      setSoftware(job.software);
      setSubSoftware((job.subSoftware ? job.subSoftware : undefined));
      setExpertise(job.expertise);
      setSubOption(job.subOption);
      setIssueDescription(job.issueDescription);

    }
  }, [job])

  const sizeRef = useResizeObserver(({ width, height }) => {
    console.log(`Inside selectSoftware Element width: ${width}, height: ${height}`);
  });

  return (
    <div className="w-85" reg={sizeRef}>
      {
        platform == 'production' && <Helmet
          script={[{
            innerHTML: "gtag('event', 'conversion', {'send_to': 'AW-10817392225/m6wHCM37gM4DEOGckaYo'});"
          }]}>
        </Helmet>
      }
      <div className={"jobFloMainDiv margin-auto jobFloMainDivResponsive " + (jobFlowStepNumber === 0 ?
        "w-55p"
        :
        jobFlowStepNumber === 2 ?
          "w-80p"
          :
          "w-65p"
      )} >
        {!transferredJob && jobFlowStepNumber !== 2 && <LogoWithHeading heading={formHeading[jobFlowStepNumber]} user={user} jobFlowStepNumber={jobFlowStepNumber} />}

        {jobFlowStepNumber === 0 && <SelectSoftware
          setJobInfo={setJobInfo}
          jobInfo={jobInfo}
          user={user}
          job={job}
          setJob={setJob}
          setGuestJobId={setGuestJobId}
          setIsFirsJob={setIsFirsJob}
          isFirsJob={isFirsJob}
          setShowLoader={setShowLoader}
        />
        }
        {jobFlowStepNumber === 1 && <JobSummary
          jobInfo={jobInfo}
          scheduleJobTime={scheduleJobTime}
          setScheduleJobTime={setScheduleJobTime}
          user={user}
          job={job}
          setIsScheduleJob={setIsScheduleJob}
          selectedTechnician={selectedTechnician}
          setSelectedTechnician={setSelectedTechnician}
          isFirsJob={isFirsJob}
        />
        }
        {jobFlowStepNumber === 2 && <CustomerSignUp
          givenEmail={givenEmail}
          setGivenEmail={setGivenEmail}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          setToken={setToken}
          user={user}
          setUser={setUser}
          isScheduleJob={isScheduleJob}
          job={job}
          isFirsJob={isFirsJob}
          setShowLoader={setShowLoader}
          showLoader={showLoader}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />
        }
        {jobFlowStepNumber === 3 && <HelpIsOnTheWay
          user={user}
          job={job}
          jobInfo={jobInfo}
          scheduleJobTime={scheduleJobTime}
          setScheduleJobTime={setScheduleJobTime}
          selectedTechnician={selectedTechnician}
          setShowLoader={setShowLoader}
        />
        }
      </div>
    </div>
  );
};

export default React.memo(CustomerProfileSetup);
