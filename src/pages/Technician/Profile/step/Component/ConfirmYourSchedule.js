import {
  Col, Row, Space, TimePicker, Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import Select from '../../../../../components/common/Select';
import ItemLabel from '../../../../../components/ItemLabel';
import CheckBox from '../../../../../components/common/CheckBox';
import { openNotificationWithIcon } from '../../../../../utils';
import Box from '../../../../../components/common/Box';
import * as TechnicianApi from '../../../../../api/technician.api';
import { useUser } from '../../../../../context/useContext';
import TimezoneSelect, { allTimezones } from "react-timezone-select";
import AvailableDatePicker from "react-datepicker";
import {updateUser} from '../../../../../api/users.api';

const { Option } = Select;
const { Text } = Typography;

const initSelectedTimes = [
  'startTime',
  'endTime'
]

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const initAvailableTimes = {
  Sunday: {
    available: false,
    startTime: '',
    endTime: '',
    timeZone: '',
  },
  Monday: {
    available: false,
    startTime: '',
    endTime: '',
    timeZone: '',
  },
  Tuesday: {
    available: false,
    startTime: '',
    endTime: '',
    timeZone: '',
  },
  Wednesday: {
    available: false,
    startTime: '',
    endTime: '',
    timeZone: '',
  },
  Thursday: {
    available: false,
    startTime: '',
    endTime: '',
    timeZone: '',
  },
  Friday: {
    available: false,
    startTime: '',
    endTime: '',
    timeZone: '',
  },
  Saturday: {
    available: false,
    startTime: '',
    endTime: '',
    timeZone: '',
  },
};

function ConfirmYourSchedule({ setTechProfile, techProfile }) {
  const { user } = useUser();
  const [timezone, setTimezone] = useState("");
  const [availableTimes, setAvailableTimes] = useState({ ...initAvailableTimes });
  const [selectedTimes, setSelectedTimes] = useState({ ...initSelectedTimes });
  const [indeterminate, setIndeterminate] = React.useState(false);
  const [checkAll, setCheckAll] = React.useState(false);
  const [timezoneError, setTimezonError] = useState(null);
  const [selectedDaysError, setSelectedDaysError] = useState(null);
  const [selectedTime, setSelectedTime] = useState("00:00");
  const [endselectedTime, setEndSelectedTime] = useState("00:00");

  useEffect(() => {
    if (user && user.technician && user.technician.profile && user.technician.profile.schedule && user.technician.profile.schedule.availableTimes) {
      const tempTchProfile = { ...techProfile };
      const demoObj = user.technician.profile.schedule;
      if (demoObj && Object.keys(demoObj).length > 0) {
        tempTchProfile.schedule.complete = true;
        setTechProfile(tempTchProfile);
        setAvailableTimes(user.technician.profile.schedule.availableTimes);
      }
      // if(bankDetails != undefined && Object.keys(bankDetails).length > 0)
    }
    console.log("usesr",user)
    if(user && user.timezone){
      setTimezone(user.timezone);
    }else{
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
      }  
  }, [ user]);

  // [setTechProfile, techProfile, user]); commented by manibha 6:07pm

  const onCheckChange = e => {
    const { checked, id } = e.target;
    let checkedCount = checked ? 1 : -1;
    Object.keys(availableTimes).forEach(item => {
      if (availableTimes[item].available) checkedCount += 1;
    });
    setIndeterminate(!!(checkedCount > 0 && checkedCount < 7));
    setCheckAll(checkedCount === 7);

    const tempAvailabletimes = { ...availableTimes };
    tempAvailabletimes[id].available = checked;
    if (!checked) {
      tempAvailabletimes[id].startTime = '';
      tempAvailabletimes[id].endTime = '';
      tempAvailabletimes[id].timeZone = '';
    }
    setAvailableTimes(tempAvailabletimes);
    // setAvailableTimes(prev => ({
    //   ...prev,
    //   [id]: {
    //     ...prev[id],
    //     available: checked,
    //   },
    // }));
    setSelectedDaysError('');
  };
  const onCheckAllChange = e => {
    let updateAvailableTimes = { ...availableTimes };
    Object.keys(availableTimes).forEach(item => {
      updateAvailableTimes = {
        ...updateAvailableTimes,
        [item]: {
          ...updateAvailableTimes[item],
          available: e.target.checked,
        },
      };
    });
    setAvailableTimes(updateAvailableTimes);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const ifSelectedDays = () => {
    const selectedDays = Object.keys(availableTimes).filter(
      item => availableTimes[item].available,
    );
    return selectedDays.length;
  };

  const validateTime = () => {
    const selectedDays = Object.keys(availableTimes).filter(item => {
      if (availableTimes[item].available) {
        if (
          availableTimes[item].startTime === ''
          || availableTimes[item].endTime === ''
        ) {
          return item;
        }
      }
      return undefined;
    });
    return selectedDays.length;
  };

  const handleComplete = async (e) => {
    setTechProfile(prev => ({
      ...prev,
      schedule: {
        complete: false,
      },
    }));

    if (!timezone || timezone === "") {
      setTimezonError('No Timezone Selected.');
    } else if (!ifSelectedDays()) {
      setSelectedDaysError('No days Selected.');
    } else if (validateTime()) {
      openNotificationWithIcon(
        'error',
        'Time is missing',
        'Please add time correctly',

      );
    } else if (validateStartEndTime()) {
      openNotificationWithIcon(
        'error',
        'Invalid time',
        'Start and End Date is invalid',
      );
    } else {
      setTechProfile(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          complete: true,
          timezone,
          availableTimes,
        },
      }));

      TechnicianApi.updateTechnician(user.technician.id, { profileImage: false, schedule: { timezone:timezone.value, availableTimes: { ...availableTimes } } });
      await updateUser({userId:user.id,timezone:timezone.value})

      openNotificationWithIcon(
        'success',
        'Success',
        'Time updated Successfully',
      );
    }
  };

  /*const zoneList = Object.keys(timezoneList).map(d => (
    <Option key={`zone-${d}`} style={{ textAlign: 'left' }} value={d}>
      {d}
    </Option>
  ));*/
  const handleChangeTimeZone = value => {
    setTimezone(value);
    setTimezonError('');
  };

  const deselectAll = () => {
    let updateAvailableTimes = { ...availableTimes };
    Object.keys(availableTimes).forEach(item => {
      updateAvailableTimes = {
        ...updateAvailableTimes,
        [item]: {
          ...updateAvailableTimes[item],
          available: false,
        },
      };
    });
    setAvailableTimes(updateAvailableTimes);
    setIndeterminate(false);
    setCheckAll(false);
  };

  const validateStartEndTime = () => {
    let isFailed = false;
    Object.keys(availableTimes).filter(key => {
      if (availableTimes[key].available) {
        if (

          moment(availableTimes[key].endTime).isBefore(moment(availableTimes[key].startTime))
        ) {
          isFailed = true;
          return key;
        }
      }
      return undefined;
    });
    return isFailed;
  };

  const onTimeSelect = (type, typeDay, time) => {
    (type == "startTime")?setSelectedTime(time):setEndSelectedTime(time);
    if (typeDay === 'checkAll') {
      setSelectedTimes(prev => ({
        ...prev,
        [type]:time,
      }))
      Object.keys(availableTimes).map(key => {
        setAvailableTimes(prev => ({
          ...prev,
          [key]: { ...availableTimes[key], [type]: time },
        }));
        return key;
      });
    } else {
      setAvailableTimes(prev => ({
        ...prev,
        [typeDay]: { ...availableTimes[typeDay], [type]: time },
      }));
    }
    console.log("availableTimes :::::::", availableTimes);
  };

  return (
    <Container>
      <ItemLabel>
        {`Please check off all days you are available. This helps us help you, and send you appropriate jobs within your chosen timeframes and days. If you select all days, this notifies us that you are available throughout the 7 days of the week.`}
      </ItemLabel>
      <Label>DAYS AVAILABLE</Label>

      <Row gutter={[40, 40]}>
        <Col span={24}>
          <CheckBox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
          >
            All Days
          </CheckBox>
          <AlertError>{selectedDaysError}</AlertError>
        </Col>
        {checkAll ? (
          <Row gutter={[20, 0]} className="availableDatePicker">
            <Col span={24}><ItemLabel style={{ marginBottom:0 }}>Select hours available</ItemLabel></Col>
            <Col xs={24} md={11}>
              
              <AvailableDatePicker
                selected={selectedTimes.startTime !== '' ? selectedTimes.startTime : ''}
                onChange={date => onTimeSelect('startTime', 'checkAll', date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={60}
                placeholderText="Start"
                timeCaption="Start Time"
                dateFormat="h aa"
                />
            </Col>
            <Col xs={24} md={11}>
              <AvailableDatePicker
                selected={selectedTimes.endTime !== '' ? selectedTimes.endTime : ''}
                onChange={date => onTimeSelect('endTime', 'checkAll', date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={60}
                placeholderText="End"
                timeCaption="End Time"
                dateFormat="h aa"
                />
            </Col>
          </Row>
        ) : (
          days.map(item => (
            <DaySection
              key={item}
              name={item}
              onCheckChange={onCheckChange}
              values={{ ...availableTimes }}
              onTimeSelect={onTimeSelect}
            />
          ))
        )}
        <Col col={6}>
          <DeSelectText onClick={deselectAll}>Deselect ALL</DeSelectText>
        </Col>
      </Row>
      <Label>SELECT TIMEZONE *</Label>
      {/*<Select
        id="select_year"
        showSearch
        style={{ width: '50%' }}
        placeholder="Select TimeZone"
        showArrow
        value={timezone}
        optionFilterProp="children"
        filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        onChange={handleChangeTimeZone}
      >
        {zoneList}
      </Select>*/}
      <TimezoneSelect
          value={timezone}
          onChange={setTimezone}
          timezones={{
              ...allTimezones
          }}
          className = "mb-1 "
          id="tech-timezone"
          style={{ width: '50%' }}
      />
      <AlertError>{timezoneError}</AlertError>
      <Box display="flex" justifyContent="flex-end" marginTop={30}>
        <Button className="btn app-btn" onClick={handleComplete}>
          <span />
          Save
        </Button>
      </Box>
    </Container>
  );
}

const DaySection = props => {
  const {
    name, onCheckChange, values, onTimeSelect,
  } = props;

  return (
    <Col xs={24} md={6}>
      <Space direction="vertical" size={15}>
        <CheckBox
          id={name}
          checked={values[name].available}
          onChange={onCheckChange}
        >
          {name}
        </CheckBox>
        
        {values[name].available && (
          <Row><ItemLabel style={{ marginBottom:0 }}>Select hours available</ItemLabel>
          <Row gutter={[20, 0]} className="availableDatePicker">

            <Col xs={24} md={11}>
              <AvailableDatePicker
                value={values[name].startTime !== '' ? new Date(values[name].startTime) : ''}
                selected={values[name].startTime !== '' ? new Date(values[name].startTime) : ''}
                onChange={time => onTimeSelect('startTime', name, time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={60}
                timeCaption="Start Time"
                placeholderText="Start Time"
                dateFormat="h aa"
              />
              {/* <AvailableTimePicker
                use12Hours
                allowClear={false}
                format="h A"
                placeholder="Start"
                defaultValue={values[name].startTime !== '' ? moment(values[name].startTime) : ''}
                onSelect={time => onTimeSelect('startTime', name, time)}
              /> */}
            </Col>
            <Col span={11}>
              <AvailableDatePicker
                value={values[name].endTime !== '' ? new Date(values[name].endTime) : ''}
                selected={values[name].endTime !== '' ? new Date(values[name].endTime) : ''}
                onChange={time => onTimeSelect('endTime', name, time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={60}
                timeCaption="End Time"
                placeholderText="End Time"
                dateFormat="h aa"
              />
              {/* <AvailableTimePicker
                use12Hours
                allowClear={false}
                format="h A"
                placeholder="End"
                defaultValue={values[name].endTime !== '' ? moment(values[name].endTime) : ''}
                onSelect={time => onTimeSelect('endTime', name, time)}
              /> */}
              
            </Col>
          </Row></Row>
        )}
      </Space>
    </Col>
  );
};

DaySection.propTypes = {
  name: PropTypes.string,
  values: PropTypes.object,
  onCheckChange: PropTypes.func,
  onTimeSelect: PropTypes.func,
};

DaySection.defaultProps = {
  name: 'Monday',
};
ConfirmYourSchedule.propTypes = {
  setTechProfile: PropTypes.func,
};

ConfirmYourSchedule.defaultProps = {
  setTechProfile: () => {},
};

const AlertError = styled.div`
  color: red;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const AvailableTimePicker = styled(TimePicker)`
  height: 50px;
  border-radius: 10px;
`;
const Label = styled(ItemLabel)`
  font-weight: bold;
  color: #868383;
  padding-top: 30px;
  padding-bottom: 20px;
`;
const DeSelectText = styled(Text)`
  font-size: 15px;
  font-weight: bold;
  color: #8c8989;
  text-decoration: underline;
  padding-top: 20px;
  cursor: pointer;
`;
export default ConfirmYourSchedule;
