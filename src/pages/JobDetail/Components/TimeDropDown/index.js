import React from "react"
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
const TimeDropDown = (props) =>{
     const defaultOption1 = props.name === "hour" ?   props.dropdownValues[0] : props.name === "minutes" ?    props.dropdownValues[0] : props.dropdownValues[0];
     const defaultOption = props.name === "hour" ? props.editscheduleJobTime.hours :  props.dropdownValues[0] ? props.name === "minutes" ? props.editscheduleJobTime.minutes :  props.dropdownValues[0] : props.dropdownValues[0];

    const handleChange = (e) =>{
        props.name === "hour" ? props.setEditScheduleJobTime(prevState => ({...prevState,hours:e.value})) : props.name === "minutes" ?  props.setEditScheduleJobTime(prevState => ({...prevState,minutes:e.value})) : props.setEditScheduleJobTime(e.value) 
    }
                         
        return(
            <>
                <Dropdown 
                value={  `${defaultOption}`} 
                placeholder=""
                className={`new-drop`} 
                options={props.dropdownValues}
                onChange={handleChange}
                />
            </>
        )
}

export default TimeDropDown