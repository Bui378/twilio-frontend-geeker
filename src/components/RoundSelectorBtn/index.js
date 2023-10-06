import React from "react";

const RoundSelectorBtn = ({ btnTitle, clickHandler, selected, btnName, software, expertiseLevel }) => {
  return (
    <>
      <button
        onClick={clickHandler}
        className={"d-flex align-items-center round-btn-selector "
          + (btnName === "experience" && expertiseLevel.find(item => item.software_id === software.id && item.experience === btnTitle) ? "round-btn-selector-active" : "")
          + (btnName === "weekdays" && selected ? "weekdays-btn-selected" : "")
        }
      >
        <span className="round-btn-selector-span">{btnTitle}</span>
      </button>
    </>
  );
};

export default RoundSelectorBtn;
