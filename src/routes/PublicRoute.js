import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { useUser } from '../context/useContext';
import { useLocation } from 'react-router';
import {useTools} from '../context/toolContext';
import * as JobApi from '../api/job.api';

const PublicRoute = ({ component: C, props: cProps, ...rest }) => {
  const { user } = useUser();
    const location = useLocation();
    let detailsJobId = false
    let jobStatus = false
    console.log("My console for location ", location)
    const {setJobId,setTypeForDetails,setStepDeciderDashboard,setActiveMenu} = useTools()
    const urlParams = new URLSearchParams(location.search)
    
    if(urlParams.get("jobId")){
      detailsJobId = urlParams.get("jobId")
    }
    if(urlParams.get("status")){
      jobStatus = urlParams.get("status")
    }
    if(detailsJobId && jobStatus === 'acceptjob'){
          ChangeToJobDetailsPage(detailsJobId)
      }

      async function ChangeToJobDetailsPage(jobId){
        let type = "noapply"
        let theJob = JobApi.retrieveJob(jobId)

        theJob.then((res)=>{
            if(res.technician == undefined || res.technician === "" ||  res.technician == null  ){
                type = "apply"
            }
            setJobId(jobId)
            setTypeForDetails(type)
            setStepDeciderDashboard(6)
            setActiveMenu("job-reports")
            localStorage.removeItem('checkjobdata');
        })
    }
    if(urlParams.get("t") && urlParams.get("t") === "sub"){
     setStepDeciderDashboard(10)
    }
    let to = "/dashboard"
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "softwares"){
      console.log("user private ::::::::", user);
      to = "/technician/register_steps?t=softwares";
    } 
    if(user && user.userType === 'customer' && location && location.pathname && location.pathname === "/technician-details"){
      to = `/technician-details-setup${location.search}`
    }

    if(urlParams.get("slackJobid")){
      to = to + `?slackJobid=${urlParams.get("slackJobid")}`
    }
    if(urlParams.get("message")){
      to = to + `?message=${urlParams.get("message")}`
    }

    if(user && user.userType === 'customer' && location && location.pathname && location.pathname === "/business-plan"){
      to = `/buy-business-plan${location.search}&page=CompleteYourPurchase`
    }
    
    if(urlParams.get("chatScreen")){
      const jobID = urlParams.get("chatScreen")
      window.sessionStorage.setItem("chatScreen",jobID)
    }
    
  return (
    <Route
      {...rest}
      render={(props) => !user ? (
        <C {...props} {...cProps} match={rest.computedMatch} />
      ) : (
        <Redirect to= {to}/>
      )}
    />
  );
};

PublicRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  props: PropTypes.object.isRequired,
};

export default PublicRoute;
