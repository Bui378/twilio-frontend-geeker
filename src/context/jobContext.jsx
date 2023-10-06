import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import * as JobApi from '../api/job.api';

const JobContext = React.createContext({});

function JobProvider(props) {
  const [job, setJob] = useState();
  const [method, setMethod] = useState("ComputerAudio")
  const [jobTime, setJobTime] = useState(0);
  const [jobIds, setJobIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const [allJobs, setAllJobs] = useState();
  const [techJobs, settechJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0)
  const fetchJob = useCallback(async (jobId, excludeTechNotified = 'no') => {
    try {
      setIsLoading(true);
      const res = await JobApi.retrieveJob(jobId, excludeTechNotified);
      setJob(res);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  }, [history]);

  async function createJob(data) {
    try {
      console.log(data, ">>the job data")
      const res = await JobApi.createJob(data);
      setJob(res);
      return res;
    } catch (err) {
    }
  }

  const gettAllJobs = useCallback(async () => {
    try {
      let res = await JobApi.getJobs()
      return res
    }
    catch (err) {
      console.log("I am the res -----------", err)
    }
  }, [])

  // Fetching pageNum from localstorage if it's available.
  async function fetchJobByParams(data, pagination = { page: localStorage.getItem('pageNum') ? localStorage.getItem('pageNum') : 1, pageSize: 10 }) {
    try {
      let res = await JobApi.findJobByParams(data, pagination)
      setAllJobs(res.jobs)
      console.log("response ::::: 1", res)
      setTotalJobs(res.totalPages)
      return res
    }
    catch (err) {
      setIsLoading(false);
    }
  }
  // findJobByParams
  async function updateJob(jobId, data) {
    try {
      await JobApi.updateJob(jobId, data);
      await fetchJob(jobId);
      return true
    } catch (err) {
      setIsLoading(false);
      return false
    }
  }

  async function createJobAsGuest(data, token) {
    try {
      const res = await JobApi.createJobAsGuest(data, token);
      setJob(res)
      return res
    } catch (err) {
    }
  }

  async function fetchJobAsGuest(jobId, token) {
    try {
      console.log("from api", { jobId, token })
      const res = await JobApi.fetchJobAsGuest(jobId, token);
      return res
    } catch (err) {
    }
  }

  async function updateJobAsGuest(jobId, data) {
    try {
      console.log("from api", { jobId, data })
      const res = await JobApi.updateJobAsGuest(jobId, data);
      return res
    } catch (err) {
    }
  }

  async function getTotalJobs(data) {
    try {
      const res = await JobApi.getTotalJobs(data);
      return res
    } catch (err) {
    }
  }

  async function getTotalJobsTechnician(data) {
    try {
      const res = await JobApi.getTotalJobsTechnician(data);
      return res
    } catch (err) {
    }
  }

  async function getTotalJobsForTechnicianWithoutAuthenticate(data) {
    try {
      const res = await JobApi.getTotalJobsForTechnicianWithoutAuthenticate(data);
      return res
    } catch (err) {
      console.log("Error occurs during getTotalJobsForTechnicianWithoutAuthenticate", err)
      return false
    }
  }

  async function getTotalPaidJobs(data) {
    try {
      console.log("getTotalPaidJobs data:", data)
      const res = await JobApi.getTotalPaidJobs(data);
      console.log("res in context", res)
      return res
    } catch (err) {
      console.log("error while getting getTotalPaidJobs", err)
    }
  }

  return (
    <JobContext.Provider
      value={{
        job,
        isLoading,
        fetchJob,
        createJob,
        updateJob,
        setJob,
        jobTime,
        setJobTime,
        allJobs,
        gettAllJobs,
        fetchJobByParams,
        method,
        setMethod,
        setJobIds,
        jobIds,
        techJobs,
        settechJobs,
        totalJobs,
        setTotalJobs,
        setAllJobs,
        createJobAsGuest,
        fetchJobAsGuest,
        updateJobAsGuest,
        getTotalJobs,
        getTotalJobsTechnician,
        getTotalJobsForTechnicianWithoutAuthenticate,
        getTotalPaidJobs,
      }}
      {...props}
    />
  );
}

function useJob() {
  const context = React.useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

export { JobProvider, useJob };
