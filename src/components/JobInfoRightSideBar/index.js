
import React, { useEffect, useState } from "react"
import { useLocation } from 'react-router';
import { useAuth } from '../../context/authContext';
import { useJob } from '../../context/jobContext';
import { SECRET_KEY } from '../../constants';
import Loader from '../../components/Loader';
import * as JobApi from '../../api/job.api';
import * as SoftwareApi from '../../api/software.api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import EditJobModal from "../../pages/Customer/ProfileSetup/Components/EditJobModal"
const JobInfoRightSideBar = ({ user }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const jobIdFromUrl = queryParams.get("jobId") ? queryParams.get("jobId") : false
    const { getGuestUser } = useAuth();
    const { fetchJobAsGuest, setJob } = useJob();
    const [showLoader, setShowLoader] = useState(true)
    const [jobData, setJobData] = useState(true)
    const [showEditJobModal, setShowEditJobModal] = useState(false);
    const [softwareList, setSoftwareList] = useState([]);
    const [isJobSummaryUpdate, setIsJobSummaryUpdate] = useState(false);
    useEffect(() => {
        (async () => {
            if (!user) {
                //Login temporarily as guest user to make backend requests
                const guestUserRes = await getGuestUser();
                console.log("My console to check guest user", guestUserRes)
                //Fetch job data as guest user.
                const fetchUserRes = await fetchJobAsGuest(jobIdFromUrl, guestUserRes.token.accessToken)
                console.log("My console to fetch job as guest user", fetchUserRes)
                setJob(fetchUserRes)
                setJobData(fetchUserRes)
                if (fetchUserRes?.guestJob) {
                    console.log("tetch token removed from component jobSummary index")
                    localStorage.removeItem(SECRET_KEY);
                }
                setShowLoader(false)
            } else {
                const jobRes = await JobApi.retrieveJob(jobIdFromUrl)
                setJobData(jobRes)
                console.log("My con from job summary component else", jobRes)
                setShowLoader(false)
            }
            const res = await SoftwareApi.getSoftwareList();
            if (res) {
                console.log("software api response from job summary component", res)
                setSoftwareList(res.data)
            }
        })();
    }, [isJobSummaryUpdate])

    const handleJobEdit = () => {
        setShowEditJobModal(true)
        setIsJobSummaryUpdate(false);
    }

    if (showLoader) return <Loader height="100%" />;
    return (<>
        <div className="chosen-plan-summary-div">
            <div className="d-flex flex-row justify-content-between">
                <span className="job-summary-text">Job Summary</span>
                <div className="edit-icon-div" title="Update job summary" onClick={handleJobEdit}>
                    <FontAwesomeIcon className="editJobSummary" icon={faPencilAlt} />
                </div>
            </div>
            <div className="mb-8">
                <span className="jobSummaryLabel">Software:</span>
            </div>
            <div>
                <span className="jobSummaryInfo">{jobData?.software?.name}</span>
            </div>
            <div className="mb-8">
                <span className="jobSummaryLabel">Area:</span>
            </div>
            <div>
                <span className="jobSummaryInfo">{jobData?.subOption}</span>
            </div>
            <div className="mb-8">
                <span className="jobSummaryLabel">Details:</span>
            </div>
            <div>
                <span className="jobSummaryInfo">{jobData?.issueDescription}</span>
            </div>
            {jobIdFromUrl &&
                <EditJobModal softwareList={softwareList} jobData={jobData} showEditJobModal={showEditJobModal} setShowEditJobModal={setShowEditJobModal} user={user} setIsJobSummaryUpdate={setIsJobSummaryUpdate} />
            }
        </div>
    </>)
}

export default JobInfoRightSideBar