import React,{useEffect,useState} from "react";
import Calendar from 'react-calendar';
import CheckBox from "../CheckBox";
import TimeDropDown from "../TimeDropDown";
import { useDetectClickOutside } from 'react-detect-click-outside';
const ScheduleForLater = ({scheduleJobTime, setScheduleJobTime, showSpinner}) =>{
    const [value, setValue] = useState(scheduleJobTime.date);
    const [compareValue, setCompareValue] = useState();
    const [calendarValue, setCalendarValue] = useState();
    const [showCalendar,setShowCalendar] = useState(false)

    const handelCalender = (e)=>{
        setValue(e)
        setScheduleJobTime((prevState => ({...prevState, date:e  })))
    }

    const ref = useDetectClickOutside({onTriggered: () => {if(showCalendar) setShowCalendar(false)}}); 
    
    let todayDate = new Date();
    let todaydd = `${todayDate.getFullYear()}${todayDate.getMonth()}${todayDate.getDate()}`;

    useEffect(() => {       
        let todayCalenderValue = `${todayDate.getFullYear()}${value.getMonth()}${value.getDate()}`;
        setCompareValue(todayCalenderValue)
        setCalendarValue(`${value.toString().split(" ")[1]} ${value.toString().split(" ")[2]}`)
    }, [value])

    let  minArray = ["00","15","30","45"];

    let hourArray = [];

    for(let i=1; i<=12;i++){

        hourArray.push(String(i));
    } 

    return (<>
        
        <div className='d-flex justify-content-center'>
            <div className='flex-wrap' style={{width:"100%",maxWidth:"600px"}}>
                <div className='d-flex justify-content-start flex-wrap mb-20'>
                    <div>
                        <div>
                            <label className='date-label-div '>Date:</label>
                        </div>
                        <div>
                            <div className={`${!showCalendar === false ? 'today-div-true d-flex justify-content-start align-items-center' : 'today-div d-flex justify-content-start align-items-center' }`}   onClick={()=>{setShowCalendar(!showCalendar)}}>
                                    <span className="date-value ">
                                        {compareValue === todaydd ? "Today" : calendarValue}
                                    </span>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex mt-10-max-width-600 mb-30-max-width-600">
                        <div>
                            <div>
                                <label className='date-label-div '>Time:</label>
                            </div>
                            <div className="time-div d-flex justify-content-center align-items-center">
                                <TimeDropDown 
                                    dropdownValues={hourArray}
                                    name={"hour"}
                                    scheduleJobTime={scheduleJobTime}
                                    setScheduleJobTime={setScheduleJobTime}
                                    showSpinner = {showSpinner} 
                                    />
                                <span className="colon-dropdown"> :</span>
                                <TimeDropDown
                                    dropdownValues={minArray}
                                    name={"minutes"}
                                    scheduleJobTime={scheduleJobTime}
                                    setScheduleJobTime={setScheduleJobTime}
                                    showSpinner = {showSpinner} 
                                    />
                            </div>
                        </div>
                        <div className="check-box">
                            <CheckBox scheduleJobTime={scheduleJobTime}
                                    setScheduleJobTime={setScheduleJobTime}
                                    showSpinner = {showSpinner} 
                            />
                        </div>
                    </div>

                </div>  
                 
                    {showCalendar && 


                        <div className="calendar-container" ref={ref}>
                            <Calendar
                                tileDisabled={({date}) => [0, 6].includes(date.getDay())}
                                tileClassName={({date, view}) => {
                                    if (view === 'month' && ![0, 6].includes(date.getDay())) {
                                      return 'allowed-date';
                                    }
                                    return 'disabled-date';
                                  }}
                                onChange={(e)=>{handelCalender(e)}}
                                value={value}
                                maxDate={new Date(new Date().setMonth(new Date().getMonth()+2))}
                                minDate={new Date()}
                                />
                         </div>
                    }
                </div>
        </div>
    </>)

}

export default ScheduleForLater