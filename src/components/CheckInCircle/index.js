import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const CheckInCircle = ({ bgColor, style, checkStyle }) => {

  return (
    <>
      <div
        style={{ ...style }}
        className={
          "checkbox-circle d-flex justify-content-center align-items-center " +
          (bgColor === "grey"
                              ? "bk-color-grey"
                              : bgColor === "turcose"
                                                      ? "bk-color-turcose"
                                                      : bgColor === "cyan" ? "bk-color-cyan"
                                                            : "")
           }
      >
        <FontAwesomeIcon icon={faCheck} className="check-size" style={checkStyle} />
      </div>
    </>
  );
};

export default CheckInCircle;
