import React from "react";

const TextInput = ({
  onChange,
  name,
  placeholder,
  width,
  type,
  style,
  onFocus,
  value,
  onBlur,
}) => {
  return (
    <input
      className="tech-signup-ipcomponent"
      style={{
        ...style,
        width: width ? width : "100%",
        height: "75px",
        borderRadius: "8px",
        padding: "26px 25px",
        border: "1px solid #DCE6ED",
        background: "#FFFFFF",
        boxShadow: "inset 0px 6px 8px #EEF5FA",
        fontSize: "17px",
        fontWeight: 600,
        color: "#2F3F4C",
      }}
      name={name}
      placeholder={placeholder}
      type={type}
      onFocus={onFocus}
      onChange={onChange}
      defaultValue={value}
      onBlur={onBlur}
    />
  );
};

export default TextInput;
