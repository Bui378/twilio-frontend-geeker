import React,{useEffect} from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { useUser } from '../context/useContext';
import { useLocation } from 'react-router';
import {useTools} from '../context/toolContext';
const PrivateRoute = ({
  permission, component: C, props: cProps, ...rest
}) => {
  // const location = useLocation();
  const { user, hasPermission } = useUser();

  const location = useLocation();
  const {setJobId } = useTools()
  const urlParams = new URLSearchParams(location.search)
  let to="/dashboard"
  if(urlParams.get("checkStripeAccountStatus")){
    localStorage.setItem("checkStripeAccountStatus",true)
  }

  let toIfNoPermission = "/login"
  if(urlParams.get("jobId") && urlParams.get("newpost") && urlParams.get("isMobilePost")){
    console.log(">>>>> jobs >>>>>> auth ::: ", urlParams);
    toIfNoPermission = "/login?job-id="+urlParams.get("jobId")+"&isMobilePost="+urlParams.get("isMobilePost")
  }

  if(urlParams.get("medium")){
      toIfNoPermission = "/technician-details?technicianId="+urlParams.get("technicianId")+"&medium="+urlParams.get("medium")
  }
  
  let loginPath = '/login'
  useEffect(()=>{

    if(urlParams.get("checkJobId")){
      console.log('inside 0',urlParams.get("checkJobId"));
      setJobId(urlParams.get("checkJobId"))
      localStorage.setItem("checkjobdata",true);

    }
  },[])


  return (
    <Route
      {...rest}
      render={(props) => (user
        ? !permission || hasPermission(permission)
          ? (<C {...props} {...cProps} match={rest.computedMatch} />)
          : (<Redirect to={to} />)
        : (<Redirect to={toIfNoPermission} />)
      )}
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  props: PropTypes.object.isRequired,
};

export default PrivateRoute;
