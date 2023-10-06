import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

const PasswordInput = ({
  name,
  placeholder,
  disable,
  width,
  style,
  onFocus,
  value,
  onChange,
  onBlur,
  id
}) => {

  const [pwHide, setPwHide] = useState(true);
  return (
    <div
      className="tech-signup-ipcomponent"
      style={{
        ...style,
        width: width ? width : "100%",
        height: "75px",
        borderRadius: "8px",
        border: "1px solid #DCE6ED",
        background: "#FFFFFF",
        boxShadow: "inset 0px 6px 8px #EEF5FA",
        display: "flex",
      }}
    >
      <input
        style={{
          border: "none",
          width: "85%",
          height: "100%",
          padding: "26px 25px",
          fontSize: "17px",
          fontWeight: 600,
          color: "#2F3F4C",
          inputSecurity: "none",
        }}
        id={id}
        name={name}
        disabled={disable ? disable : false}
        placeholder={placeholder}
        type={pwHide ? "password" : "text"}
        onFocus={onFocus}
        autoComplete="off"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <div
        style={{
          width: "15%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {pwHide ? (
          <FontAwesomeIcon
            style={{ fontSize: "17px" ,cursor:"pointer"}}
            onClick={() => setPwHide(!pwHide)}
            icon={faEye}
          />
        ) : (
          <FontAwesomeIcon
            style={{ fontSize: "17px" ,cursor:"pointer" }}
            onClick={() => setPwHide(!pwHide)}
            icon={faEyeSlash}
          />
        )
         }
      </div>
    </div>
  );
};

export default PasswordInput;
