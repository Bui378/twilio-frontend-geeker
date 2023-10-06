import React,{useState} from "react"
import {Radio, Space } from 'antd';
const CheckBox = ({editscheduleJobTime , setEditScheduleJobTime }) =>{
    const [value, setValue] = useState(editscheduleJobTime.durationType);

    const onChange = (e) => {
      setValue(e.target.value);
      setEditScheduleJobTime(prevState=> ({...prevState, durationType:e.target.value}))
    };
  
    return (
      <Radio.Group onChange={onChange} value={value}>
        <Space direction="vertical">
          <Radio value={"AM"}><span className="am-span">AM</span></Radio>
          <Radio value={"PM"}><span className="am-span" >PM</span></Radio>
        </Space>
      </Radio.Group>
    );
  };
export default CheckBox