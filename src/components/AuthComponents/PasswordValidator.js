import React from "react";

import CheckInCircle from "../CheckInCircle";

let validationTexts = [
  { pos: 1, text: "6 Characters" },
  { pos: 2, text: "Letter" },
  { pos: 3, text: "Special Character" },
  { pos: 4, text: "Number" },
];

const ValidationField = ({ textObj, inputText, setAlertMessagePassword }) => {
  var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  let sixChar = false;
  let letter = false;
  let specialChar = false;
  let number = false;

  if (inputText.length > 5) sixChar = true;
  if (/[a-zA-Z]/.test(inputText)) letter = true;
  if (format.test(inputText)) specialChar = true;
  if (/[0-9]/.test(inputText)) number = true;

  if(sixChar && letter && specialChar && number){
    if(inputText.indexOf(" ") >= 0) setAlertMessagePassword("Password shouldn't contain black space");
    else setAlertMessagePassword("")
  }else{
    setAlertMessagePassword("Invalid Password")
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <CheckInCircle
        style={{ width: "15px", height: "15px" }}
        bgColor={
          (textObj.pos == 1 && sixChar) ||
          (textObj.pos == 2 && letter) ||
          (textObj.pos == 3 && specialChar) ||
          (textObj.pos == 4 && number)
            ? "turcose"
            : "grey"
        }
      />
      <p
        style={{
          fontSize: "15px",
          fontWeight: "400",
          color: "#708390",
          margin: "0 0 0 8px",
        }}
      >
        {textObj.text}
      </p>
    </div>
  );
};

const PasswordValidator = ({ inputText, setAlertMessagePassword }) => {
  return (
    <>
      {validationTexts.map((textObj,i) => (
        <ValidationField textObj={textObj} inputText={inputText} setAlertMessagePassword={setAlertMessagePassword} key={i}/>
      ))}
    </>
  );
};

export default PasswordValidator;
