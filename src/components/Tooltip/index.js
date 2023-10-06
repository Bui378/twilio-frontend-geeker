import React, { useState } from "react";

const Tooltip = (props) => {
  let timeout;
  const [active, setActive] = useState(false);

  const showTip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, props.delay || 400);
  };

  const hideTip = () => {
    clearInterval(timeout);
    setActive(false);
  };

  return (
    <div
      style={{ display: "inline-block", position: "relative" }}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {props.children}
      {active && (
        <div
          style={{
            width: "200px",
            minHeight: "80px",
            borderRadius: "8px",
            padding: "25px",
            boxShadow: "0 0 16px rgba(0, 0, 0, 0.3)",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "25px",
            zIndex: "100",
            backgroundColor: "white",
          }}
          className="tooltip-tip"
        >
          {props.content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
