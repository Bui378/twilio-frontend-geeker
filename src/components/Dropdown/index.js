import React from "react";
import { Select } from "antd";
const { Option } = Select;

const Dropdown = ({ placeholder, style, name, opts, value, setOtherSoftwareSelected, setAbsentSoftwareSelected, selectedLanguage, selectedAdditionalLanguage, setLanguageDropdownValue }) => {
  const handleChange = (value) => {
    console.log(`Selected: ${value}`);
    if (name === "languages") {
      if (value.length > 0) {
        setLanguageDropdownValue(value)
      }
    } else if (name === "additional_softwares") {
      setOtherSoftwareSelected(value)
    }
    else if (name === "absent_softwares") {
      setAbsentSoftwareSelected(value)
    }
  };

  // It will return a dropdown component with no options user can write and add own options
  if (name === "absent_softwares") return (
    <div className="dropdown-div" style={{ ...style }}>
      <Select
        mode="tags"
        size="small"
        placeholder={placeholder}
        onChange={handleChange}
        className="newDropdown"
        value={value}
        notFoundContent={false}
      />
    </div>
  )

  return (
    <div className="dropdown-div" style={{ ...style }}>
      <Select
        mode="multiple"
        size="large"
        placeholder={placeholder}
        onChange={handleChange}
        className="newDropdown"
        value={value}
      >

        {name === "languages" && opts.map((opt, i) => (
          <Option style={{ lineHeight: 2 }} value={opt[0]} key={i}>
            {opt[0]}
          </Option>
        ))}

        {name === "sub_option" && opts.map((opt, i) => (
          <Option style={{ lineHeight: 2 }} value={opt} key={i}>
            {opt}
          </Option>
        ))}

        {name === "additional_softwares" && opts.map((opt, i) => {
          return (<Option style={{ lineHeight: 2 }} value={opt.id} key={i}>
            {opt.name}
            <img
              style={{ height: "25px", marginLeft: "10px" }}
              alt={opt.name}
              src={opt.blob_image}
            />
          </Option>)
        })
        }
      </Select>
    </div>
  );
};

export default Dropdown;
