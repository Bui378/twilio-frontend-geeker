import React from "react";
import '../../../style.css'
import { Select } from 'antd';
import {useResizeObserver } from '../../../utils/index';

const SoftwareDropDown = (props) => {
    const handleChange = (value) => {
        console.log(`Selected software`, value);
        props.onSoftwareSelection(value)
      };
      const handleSubChange =(value)=>{
        console.log(`Selected sub soft : ${value}`);
        props.onSubSoftwareSelection(value)
      }
      const sizeRef = useResizeObserver(({ width, height }) => {
        console.log(`Inside selectSoftware Element width: ${width}, height: ${height}`);
      });

    return (<>         
        <div ref={sizeRef}>
        <Select 
            disabled={props.disable}
            className="softdropDownMenu" 
            name={props.name}  
            onChange={props.name === "softwares" ? handleChange : handleSubChange} 
            value={props.name === "softwares" ? props.softwareId : props.subSoftwareName }
            defaultValue={props.name === "softwares" ? "Select Software" : "Select" }
        >
            {props.dropDownOptions.map((ele, index)=>{
                if(props.name === "softwares"  && ele.subSoftware.length === 0 ){ 
                    return <Select.Option value={ele.id} key={index} className="softwares-option">
                                {(<><img src={ele.blob_image} width="27px" height="25px" alt="softImage"/>&nbsp;&nbsp;{ele.name}</>)}
                           </Select.Option>    
                }
                if(props.name === "subsoftwares" ){
                    return <Select.Option value={ele} key={index} className="sub-softwares-option">{ele}</Select.Option>    
                }   
            })}
        </Select>
        </div>

    </>)
}

export default  SoftwareDropDown