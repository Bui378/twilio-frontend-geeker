import React from "react";

const ValidatorModelForEmail = ({ height, visible, children}) => {
  return (
    <>
      {visible ? (
        <div 
        className="mailvalidator-div ">
          <div
            className="mailvalidator-triangle"></div>
          <div
          className="mailvalidator-inner-div" >
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ValidatorModelForEmail;
