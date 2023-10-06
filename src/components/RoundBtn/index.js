import React from "react";

const RoundBtn = ({ title, toolTipContent, active }) => {

  return (<>
    <div className="pos-relative">
      <button className={"round-btn " + (active === true ? "round-btn-acitve" : "")}>
        <span className="round-btn-span">{title}</span>
      </button>
      <div className="software-strength-tooltip">
        {toolTipContent}
      </div>
    </div>
  </>
  );
};

export default RoundBtn;
