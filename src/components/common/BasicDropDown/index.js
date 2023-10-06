import React from "react";
// import '../../../style.css'
import { Select } from 'antd';

const BasicDropDown = (props) => {

    return (<>         
        <div className={props.divClass}>
        <Select 
            // disabled={props.disable}
            className="basic-drop-down default-inset-shadow" 
            name={props.name}  
            onChange={(e)=>{props.setValue(e)}} 
            // value={props.name === "softwares" ? props.softwareId : props.subSoftwareName }
            defaultValue={"Please Select" }
        >
            {props.dropDownOptions.map((ele, index)=>{
                return <Select.Option value={ele.value} key={index}>
                            {<>{ele.label}</>}
                        </Select.Option>    
            })}
        </Select>
        </div>

    </>)
}

export default  BasicDropDown