import React,{useState} from "react"
import {Radio, Space } from 'antd';
const CheckBox = ({scheduleJobTime, setScheduleJobTime, showSpinner}) =>{
    const [value, setValue] = useState(scheduleJobTime?.durationType?.length > 0 ? scheduleJobTime.durationType : "AM");

    const onChange = (e) => {
      setValue(e.target.value);
      setScheduleJobTime(prevState=> ({...prevState, durationType:e.target.value}))
    };
  
    return (
      <Radio.Group onChange={onChange} value={value}>
        <Space direction="vertical">
          <Radio value={"AM"} disabled={showSpinner}><span className="am-span">AM</span></Radio>
          <Radio value={"PM"} disabled={showSpinner}><span className="am-span" >PM</span></Radio>
        </Space>
      </Radio.Group>
    );
  };
export default CheckBox
