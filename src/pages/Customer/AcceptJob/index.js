import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import Spinner from '../../../components/Spinner';
import { useJob } from '../../../context/jobContext';
import InviteTech from './steps/InviteTech';
import { useAuth } from '../../../context/authContext';

const AcceptJob = () => {
  const { jobId } = useParams();
  const { job, fetchJob } = useJob();
  const { user } = useAuth();

  useEffect(() => {
    fetchJob(jobId);
  }, [jobId]);

  if (!job) return <Spinner />;

  return (
    <div className="w-85">
      <InviteTech user={user} job={job} />
    </div>
  );
};

export default AcceptJob;
