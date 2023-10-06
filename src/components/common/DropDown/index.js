import React from "react";
import '../../../style.css'
import { Select } from 'antd';
// import Form from 'react-bootstrap/Form';

const DropDown = (props) => {

    const handleChange = (value) => {
        console.log(`Selected: ${value}`);
        props.onSoftwareSelection(value)
        
      };

    return (<>         
        <Select
            showSearch
            defaultValue={
                           props.name === 'language'? "English" 
                                    :  props.name === 'hearAboutUs' ? "LinkedIn"
                                                 : props.name === "softwares" ? "soft_8d7523aa-6e55-11ec-8c4c-5346fd03eb93"
                                                              : props.name === "subsoftwares" ? "select"
                                                                    : "select"
                         }
            name={props.name}  
            onChange={props.name === "softwares" ? handleChange : props.onChange} 
            className="dropDownMenu" 
            aria-label="Default select example">
            {props.dropDownOptions.map((ele, index)=>{
                return <Select.Option value={props.name === "softwares" ? ele.id : ele} key={index}>{props.name==='languages' ? ele[0] : props.name === "softwares" ? (<><img src={ele.blob_image} width="27px" height="25px" alt="blobImage"/>{"  "}{ele.name}</>) :
                ele}</Select.Option>    
            })}
                
        </Select>

    </>)
}

export default DropDown