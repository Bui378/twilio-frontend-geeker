import React from "react"
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
const TimeDropDown = (props) =>{
    let defaultOption = props.dropdownValues[0]
    if(props.name === "hour") defaultOption = props.scheduleJobTime.hours ? props.scheduleJobTime.hours : new Date(Number(props.scheduleJobTime)).getHours()
    if(props.name === "minutes") defaultOption = props.scheduleJobTime.minutes ? props.scheduleJobTime.minutes : new Date(Number(props.scheduleJobTime)).getMinutes()

    const handleChange = (e) =>{
        props.name === "hour" ? props.setScheduleJobTime(prevState => ({...prevState,hours:e.value})) : props.name === "minutes" ?  props.setScheduleJobTime(prevState => ({...prevState,minutes:e.value})) : props.setKeepSearchingFor(e.value) 
    }
                         
        return(
            <>
                <Dropdown 
                value={  `${defaultOption}`} 
                placeholder="Select an option"
                className={`${props.name==="hrArray" ? "new-drop-hr" : "new-drop"}`} 
                options={props.dropdownValues}
                onChange={handleChange}
                disabled={props.showSpinner}
                />
            </>
        )
}

export default TimeDropDown