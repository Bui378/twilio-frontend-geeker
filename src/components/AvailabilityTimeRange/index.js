import React, { useState } from "react";
import { Select } from "antd";
import RoundPlusMinusBtn from "components/RoundPlusMinusBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from "@fortawesome/free-solid-svg-icons";
import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";

const AvailabilityTimeRange = ({
  position,
  lastEndValue,
  nextStartValue,
  length,
  dayOfTheWeek,
  showDayOfTheWeek,
  showCustomize,
  onChangeCustomization,
  customization,
  moreTimeHandler,
  lessTimeHandler,
  onSelectTime,
}) => {
  const { Option } = Select;
  const options = [];
  const [startValue, setStartValue] = useState(
    dayOfTheWeek.timeStartValue && dayOfTheWeek.timeStartValue !== "--:--" ? dayOfTheWeek.timeStartValue : 0
  );
  const [endValue, setEndValue] = useState(
    dayOfTheWeek.timeEndValue && dayOfTheWeek.timeEndValue !== "--:--" ? dayOfTheWeek.timeEndValue : 23
  );

  for (let i = 0; i < 24; i++) {
    if (i === 0) {
      options.push({
        value: i,
        label: "12 AM",
      });
    }
    if (i > 0 && i < 12) {
      options.push({
        value: i,
        label: i + " AM",
      });
    }
    if (i === 12) {
      options.push({
        value: i,
        label: i + " PM",
      });
    }
    if (i > 12) {
      options.push({
        value: i,
        label: i - 12 + " PM",
      });
    }
  }

  return (
    <>
      <Container className="mb-20">
        <div className="d-flex justify-content-center align-items-center time-component-div-container">
          <div className="time-component-div">
            <span
              className="dayOfTheWeek"
              style={{
                visibility: showDayOfTheWeek ? "visible" : "hidden",
              }}
            >
              {dayOfTheWeek &&
              dayOfTheWeek.value &&
              dayOfTheWeek.value.length > 0
                ? dayOfTheWeek.value.substring(0, 3)
                : ""}
            </span>
          </div>
          <div className="time-component-div">
            <Select
              showArrow={false}
              defaultValue="--:--"
              onChange={(value) => {
                setStartValue(value);
                onSelectTime(
                  value,
                  dayOfTheWeek.value,
                  "start",
                  dayOfTheWeek.available,
                  position
                );
              }}
              className="availability-time-select"
              value={
                dayOfTheWeek.timeStartValue !== "--:--"
                  ? dayOfTheWeek.timeStartValue * 1
                  : "--:--"
              }
            >
              {options.map((opt,i) => (
                <Option
                  key={i}
                  value={opt.value}
                  disabled={opt.value >= endValue || opt.value <= lastEndValue}
                >
                  {opt.label}
                </Option>
              ))}
            </Select>
            <span className="to">to</span>
            <Select
            showArrow={false}
              defaultValue="--:--"
              onChange={(value) => {
                setEndValue(value);
                onSelectTime(
                  value,
                  dayOfTheWeek.value,
                  "end",
                  dayOfTheWeek.available,
                  position
                );
              }}
              className="availability-time-select"
              value={
                dayOfTheWeek.timeEndValue !== "--:--"
                  ? dayOfTheWeek.timeEndValue * 1
                  : "--:--"
              }
            >
              {options.map((opt,i) => (
                <Option
                  key={i}
                  value={opt.value}
                  disabled={
                    opt.value <= startValue || opt.value <= lastEndValue + 1 || (nextStartValue && opt.value >= nextStartValue)
                  }
                >
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className="time-component-div">
            <div
              className="d-flex justify-content-between align-items-center sign-btns-div"
              style={{ margin: "0 4px" }}
            >
              <div
                onClick={
                  dayOfTheWeek.otherTimes &&
                  dayOfTheWeek.otherTimes.length === 0
                    ? () => moreTimeHandler(dayOfTheWeek.value)
                    : length - 1 === position
                    ? () => moreTimeHandler(dayOfTheWeek.value)
                    : () => {}
                }
              >
                <RoundPlusMinusBtn
                  sign={"plus"}
                  showBtn={
                    dayOfTheWeek.otherTimes &&
                    dayOfTheWeek.otherTimes.length === 0
                      ? true
                      : length - 1 === position
                      ? true
                      : false
                  }
                />
              </div>
              <div
                onClick={
                  dayOfTheWeek.otherTimes &&
                  dayOfTheWeek.otherTimes.length === 0
                    ? () => lessTimeHandler(dayOfTheWeek.value, dayOfTheWeek)
                    : length - 1 === position
                    ? () => lessTimeHandler(dayOfTheWeek.value, dayOfTheWeek)
                    : () => {}
                }
              >
                <RoundPlusMinusBtn
                  sign={"minus"}
                  showBtn={true}
                  otherStyles={{
                    backgroundColor:
                      dayOfTheWeek.otherTimes &&
                      dayOfTheWeek.otherTimes.length === 0
                        ? "#92A9B8"
                        : length - 1 === position
                        ? "#92A9B8"
                        : "lightgrey",
                  }}
                />
              </div>
            </div>
            <div style={{ margin: "0 4px", minWidth: "110px" }}>
              {customization ? (
                <span
                  className="turquiose-text"
                  style={{
                    visibility:
                      position === 0 && dayOfTheWeek.otherTimes
                        ? "visible"
                        : "hidden",
                  }}
                >
                  <a onClick={() => onChangeCustomization(dayOfTheWeek, false, setStartValue, setEndValue)}>
                    <FontAwesomeIcon className="copy-icon" icon={faClone} />
                    &nbsp; Copy to all
                  </a>
                </span>
              ) : (
                <span
                  className="turquiose-text text-underline"
                  style={{
                    visibility: showCustomize ? "visible" : "hidden ",
                  }}
                >
                  <a onClick={() => onChangeCustomization(dayOfTheWeek, true, setStartValue, setEndValue)}>Customize</a>
                </span>
              )}
            </div>
          </div>
        </div>
      </Container>
      {/* <div className="d-flex align-items-center justify-content-around mb-20">
            <span className="dayOfTheWeek" style={{visibility : showDayOfTheWeek ? "visible" : "hidden"}}>
                {dayOfTheWeek}
            </span>
            <div>
                <Select
                    // size={size}
                    defaultValue="9:00"
                    onChange={handleChange}
                    className="availability-time-select"
                    options={options}
                />
                <span className="to">
                    to
                </span>
                <Select
                    // size={size}
                    defaultValue="9:00"
                    onChange={handleChange}
                    className="availability-time-select"
                    options={options}
                />
            </div>
            <div className="d-flex justify-content-between align-items-center sign-btns-div">
                <RoundPlusMinusBtn sign={"plus"} showBtn={showPlusBtn} />
                <RoundPlusMinusBtn sign={"minus"} showBtn={showMinusBtn} />
            </div>
            {textToShow === 'customize' ? 
                <span className="turquiose-text text-underline" style={{visibility : showCustomize ? "visible" : "hidden"}}>
                    <a href="#">
                        Customize
                    </a>
                </span>
                :
                <div>
                    <FontAwesomeIcon 
                        className="copy-icon" 
                        icon={faClone}
                        style={{visibility : showCopyToAll ? "visible" : "hidden"}}
                    />&nbsp; <span className="turquiose-text" style={{visibility : showCopyToAll ? "visible" : "hidden"}}>Copy to all</span>
                </div>
            }
        </div> */}
    </>
  );
};

export default AvailabilityTimeRange;
