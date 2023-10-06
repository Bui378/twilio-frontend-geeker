import React, { useEffect, useState } from "react";
import HeadingAndSubHeading from "components/HeadingAndSubHeading";
import FooterBtns from "components/FooterBtns";
import RoundSelectorBtn from "components/RoundSelectorBtn";
import AvailabilityTimeRange from "components/AvailabilityTimeRange";
import { openNotificationWithIcon } from "../../../../utils";
import * as TechnicianApi from "../../../../api/technician.api";
import mixpanel from "mixpanel-browser";
import { weekDataObj } from "constants/other";

const DaysAvailable = ({
  onPrev,
  onNext,
  setShowProgress,
  setProgressBarPercentage,
  register,
  customization,
  setCustomization,
  allWeek,
  setAllWeek,
  weekDays,
  setWeekDays,
  weekDaysArr,
  setWeekDaysArr,
  days,
  setDays,
  user,
  refetch,
}) => {
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    setShowProgress(true);
    setProgressBarPercentage(60);
    onSetWeekDaysArr();
    refetch();
  }, []);

  useEffect(() => {
    fetchPreviousValues();
  }, [user]);

  useEffect(() => {
    onSetWeekDaysArr();
  }, [weekDays]);

  const fetchPreviousValues = async () => {
    setCustomization(user.technician.profile.schedule.customization);
    let availableTimes = user.technician.profile.schedule.availableTimes;
    let tempDays = [];
    let tempObj = { ...weekDays };
    for (let property in availableTimes) {
      tempDays.push({
        day: property,
        selected: availableTimes[property].available,
      });
      tempObj[property] = {
        ...tempObj[property],
        available: availableTimes[property].available,
      };
    }
    setDays(tempDays);
    setWeekDays(tempObj);
    onSetWeekDaysArr();
    if (!user.technician.profile.schedule.customization) {
      for (let property in availableTimes) {
        if (availableTimes[property].available === true) {
          setAllWeek({ ...availableTimes[property], value: "allDays" });
          break;
        }
      }
      return;
    }
    if (user.technician.profile.schedule.customization) {
      setWeekDays(availableTimes);
    }
  };

  const onSetWeekDaysArr = async () => {
    let newArr = [];
    for (let property in weekDays) {
      newArr.push(weekDays[property]);
    }
    setWeekDaysArr(newArr);
  };

  const onChangeCustomization = async (dayOfTheWeek, customStatus) => {
    let noDaySelected = true;
    days.forEach(day => {
      if(day.selected === true) {
        noDaySelected = false;
        return;
      }
    })
    if(noDaySelected) return openNotificationWithIcon(
      "error",
      "Error",
      "Please select atleast one day."
    );
    if (!customStatus) {
      setAllWeek({ ...dayOfTheWeek, value: "allDays" });
      setCustomization(customStatus);
    }
    if (customStatus) {
      let tempObj = { ...weekDays };
      setWeekDays(weekDataObj);
      for (let property in tempObj) {
        if (tempObj[property].available) {
          let tempArr = [];
          allWeek.otherTimes.forEach((item) => {
            tempArr.push({ ...item, value: property });
          });
          tempObj[property] = {
            ...tempObj[property],
            startTime: allWeek.startTime,
            endTime : allWeek.endTime,
            timeEndValue: allWeek.timeEndValue,
            timeStartValue: allWeek.timeStartValue,
            value: tempObj[property].value,
            otherTimes: tempArr,
          };
        }
      }
      setWeekDays(tempObj);
      setCustomization(customStatus);
    }
  };

  const selectDayHandler = async (day) => {
    let newDayArr = [];
    for (let i = 0; i < days.length; i++) {
      if (days[i].day === day)
        newDayArr.push({
          day: days[i].day,
          selected: !days[i].selected,
        });
      else newDayArr.push(days[i]);
    }
    let tempObj = { ...weekDays };
    tempObj[day].available = !tempObj[day].available;
    tempObj[day].startTime = "";
    tempObj[day].endTime = "";
    tempObj[day].timeStartValue = "--:--";
    tempObj[day].timeEndValue = "--:--";
    tempObj[day].otherTimes = [];
    setDays(newDayArr);
    setWeekDays(tempObj);
  };

  const moreTimeHandler = async (day) => {
    if (customization) {
      let emptyFieldError = false;
      if (weekDays[day].timeEndValue === "--:--") emptyFieldError = true;

      if (weekDays[day].otherTimes.length > 0)
        if (
          weekDays[day].otherTimes[weekDays[day].otherTimes.length - 1]
            .timeEndValue === "--:--"
        )
          emptyFieldError = true;

      if (emptyFieldError)
        return openNotificationWithIcon(
          "error",
          "Error",
          "Please fill up the last empty fields."
        );

      let tempObj = weekDays;
      tempObj[day].otherTimes.push({
        startTime: "",
        endTime: "",
        timeStartValue: "--:--",
        timeEndValue: "--:--",
        value: day,
      });
      setWeekDays(tempObj);
      onSetWeekDaysArr();
    }
    if (!customization) {
      let emptyFieldError = false;
      if (allWeek.timeEndValue === "--:--") emptyFieldError = true;

      if (allWeek.otherTimes.length > 0)
        if (
          allWeek.otherTimes[allWeek.otherTimes.length - 1].timeEndValue ===
          "--:--"
        )
          emptyFieldError = true;

      if (emptyFieldError)
        return openNotificationWithIcon(
          "error",
          "Error",
          "Please fill up the empty fields to get more fields."
        );
      let tempAllWeekObj = { ...allWeek };
      tempAllWeekObj.otherTimes.push({
        startTime: "",
        endTime: "",
        timeStartValue: "--:--",
        timeEndValue: "--:--",
      });
      setAllWeek(tempAllWeekObj);
    }
  };

  const lessTimeHandler = async (day, dayOfTheWeek) => {
    if (customization) {
      let tempObj = weekDays;
      if (tempObj[day].otherTimes.length === 0) {
        tempObj[day].startTime = "";
        tempObj[day].endTime = "";
        tempObj[day].timeStartValue = "--:--";
        tempObj[day].timeEndValue = "--:--";
        tempObj[day].available = false;

        let newDayArr = [];
        for (let i = 0; i < days.length; i++) {
          if (days[i].day === day)
            newDayArr.push({
              day: days[i].day,
              selected: false,
            });
          else newDayArr.push(days[i]);
        }
        setDays(newDayArr);
      } else tempObj[day].otherTimes.pop();
      setWeekDays(tempObj);
      onSetWeekDaysArr();
    }
    if (!customization) {
      let tempTimesArr = allWeek.otherTimes;
      tempTimesArr.pop();
      setAllWeek({ ...allWeek, otherTimes: tempTimesArr });
    }
  };

  const onSelectTime = async (value, day, type, available, position) => {
    let date = new Date();
    date.setHours(value);
    date.setMinutes(0);
    date.setSeconds(0);
    date = new Date(date).toISOString();
    if (customization) {
      if (available) {
        let tempObj = weekDays;
        for (let property in tempObj) {
          if (property === day) {
            tempObj[property].timeStartValue =
              type === "start" ? value : tempObj[property].timeStartValue;
            tempObj[property].timeEndValue =
              type === "end" ? value : tempObj[property].timeEndValue;
            tempObj[property].startTime =
              type === "start" ? date : tempObj[property].startTime === "" ? "" : (new Date(tempObj[property].startTime).toISOString());
            tempObj[property].endTime =
              type === "end" ? date : tempObj[property].endTime === "" ? "" : (new Date(tempObj[property].endTime).toISOString());
          }
        }
        setWeekDays(tempObj);
        onSetWeekDaysArr();
      }
      if (!available) {
        let tempObj = weekDays;
        for (let property in tempObj) {
          if (property === day) {
            tempObj[property].otherTimes[position] = {
              value: day,
              timeStartValue:
                type === "start"
                  ? value
                  : tempObj[property].otherTimes[position].timeStartValue,
              timeEndValue:
                type === "end"
                  ? value
                  : tempObj[property].otherTimes[position].timeEndValue,
              startTime:
                type === "start"
                  ? date
                  : tempObj[property].otherTimes[position].startTime === "" ? "" : (new Date(tempObj[property].otherTimes[position].startTime).toISOString()),
              endTime:
                type === "end"
                  ? date
                  : tempObj[property].otherTimes[position].endTime === "" ? "" : (new Date(tempObj[property].otherTimes[position].endTime).toISOString()),
            };
          }
        }
        setWeekDays(tempObj);
        onSetWeekDaysArr();
      }
    }
    if (!customization) {
      if (available) {
        setAllWeek({
          ...allWeek,
          timeStartValue: type === "start" ? value : allWeek.timeStartValue,
          timeEndValue: type === "end" ? value : allWeek.timeEndValue,
          startTime: type === "start" ? date : allWeek.startTime === "" ? "" : (new Date(allWeek.startTime).toISOString()),
          endTime: type === "end" ? date : allWeek.endTime === "" ? "" : (new Date(allWeek.endTime).toISOString()),
        });
      }
      if (!available) {
        let tempOtherTimes = allWeek.otherTimes;
        tempOtherTimes[position] = {
          timeStartValue:
            type === "start" ? value : tempOtherTimes[position].timeStartValue,
          timeEndValue:
            type === "end" ? value : tempOtherTimes[position].timeEndValue,
          startTime:
            type === "start" ? date : tempOtherTimes[position].startTime === "" ? "" :(new Date(tempOtherTimes[position].startTime).toISOString()),
          endTime: type === "end" ? date : tempOtherTimes[position].endTime === "" ? "" :(new Date(tempOtherTimes[position].endTime).toISOString()),
        };
        setAllWeek({
          ...allWeek,
          otherTimes: tempOtherTimes,
        });
      }
    }
  };

  const submitHandler = async () => {
    let error = false;
    let minOneSelected = false;
    if (!customization) {
      if (allWeek.startTime.length === 0 || allWeek.endTime.length === 0) {
        error = true;
      }
      if (allWeek.otherTimes.length > 0) {
        allWeek.otherTimes.forEach((item) => {
          if (item.startTime === "" || item.endTime === "") {
            error = true;
          }
        });
      }
    }
    if (customization) {
      for (let property in weekDays) {
        if (weekDays[property].available) {
          minOneSelected = true;
          if (
            weekDays[property].startTime === "" ||
            weekDays[property].endTime === ""
          ) {
            error = true;
            break;
          }
          if (weekDays[property].otherTimes.length > 0) {
            weekDays[property].otherTimes.forEach((item) => {
              if (item.startTime === "" || item.endTime === "") {
                error = true;
              }
            });
          }
        }
      }
    }

    if (!customization) {
      let dataObj = { ...weekDays };
      for (let property in dataObj) {
        if (dataObj[property].available === true) {
          minOneSelected = true;
          dataObj[property].value = dataObj[property].value;
          dataObj[property].startTime = allWeek.startTime;
          dataObj[property].endTime = allWeek.endTime;
          dataObj[property].timeStartValue = allWeek.timeStartValue;
          dataObj[property].timeEndValue = allWeek.timeEndValue;
          dataObj[property].available = allWeek.available;
          dataObj[property].otherTimes = allWeek.otherTimes;
        }
      }
      setWeekDays(dataObj);
    }
    if (!minOneSelected) {
      openNotificationWithIcon(
        "error",
        "Error",
        "Please select atleast one day."
      );
      return;
    }

    if (error) {
      openNotificationWithIcon(
        "error",
        "Error",
        "Please select time in the empty field."
      );
      return;
    }
    setShowSpinner(true);
    const response = await TechnicianApi.updateTechnician(
      register.technician.id,
      {
        schedule: {
          availableTimes: weekDays,
          timezone: register.timezone ? register.timezone : "",
          customization: customization,
        },
        registrationStatus: "demo_video",
      }
    );
    if (response) {
      openNotificationWithIcon(
        "success",
        "Success",
        "Availability time saved."
      );
      // mixpanel code//
      mixpanel.identify(user.email);
      mixpanel.track(
        "Technician - submitted availability time and proceeded to next form"
      );
      // mixpanel code//
      onNext();
    }
  };

  const saveForLater = async () => {
    const response = await TechnicianApi.updateTechnician(
      register.technician.id,
      {
        schedule: {
          availableTimes: weekDays,
          timezone: register.timezone ? register.timezone : "",
        },
      }
    );
    if (response) {
      openNotificationWithIcon(
        "success",
        "Success",
        "Availability time saved for later."
      );
      // mixpanel code//
      mixpanel.identify(user.email);
      mixpanel.track("Technician - saved availability time (if any) for later");
      // mixpanel code//
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      <HeadingAndSubHeading
        heading={"Days Available"}
        subHeading={
          "Yes. This is real! Pick the days and hours you would like to work. It’s that easy."
        }
        incSubHeadingFontSize={true}
      />
      <div className="d-flex justify-content-around w-70p mb-40 flex-wrap">
        {days.map((dayObj, i) => (
          <RoundSelectorBtn
            btnTitle={dayObj.day.substring(0, 3)}
            clickHandler={() => selectDayHandler(dayObj.day)}
            selected={days[i].selected}
            btnName={"weekdays"}
            key={i}
          />
        ))}
      </div>

      <div className="d-flex flex-column time-range-div">
        {customization ? (
          <>
            {weekDaysArr
              .filter((dayObj) => dayObj.available)
              .map((dayObj, i) => (
                <React.Fragment key={i}>
                  <AvailabilityTimeRange
                    key={i}
                    position={i}
                    nextStartValue={dayObj.otherTimes.length > 0 ? dayObj.otherTimes[0].timeStartValue : undefined }
                    dayOfTheWeek={dayObj}
                    showDayOfTheWeek={true}
                    onChangeCustomization={onChangeCustomization}
                    customization={customization}
                    moreTimeHandler={moreTimeHandler}
                    lessTimeHandler={lessTimeHandler}
                    onSelectTime={onSelectTime}
                    />
                  {dayObj.otherTimes.map((otherTime, j) => (
                    <AvailabilityTimeRange
                    key={j}
                    length={dayObj.otherTimes.length}
                    position={j}
                    lastEndValue={
                      j === 0
                      ? dayObj.timeEndValue
                      : dayObj.otherTimes[j - 1].timeEndValue
                    }
                    nextStartValue={dayObj.otherTimes[j+1] ? dayObj.otherTimes[j+1].timeStartValue : undefined }
                    dayOfTheWeek={otherTime}
                    showDayOfTheWeek={false}
                    onChangeCustomization={onChangeCustomization}
                    customization={customization}
                    moreTimeHandler={moreTimeHandler}
                    lessTimeHandler={lessTimeHandler}
                    onSelectTime={onSelectTime}
                    />
                  ))}
              </React.Fragment>
              ))}
          </>
        ) : (
          <>
            {[allWeek].map((dataObj, i) => (
             <React.Fragment key={i}>
                <AvailabilityTimeRange
                  key={i}
                  dayOfTheWeek={dataObj}
                  showDayOfTheWeek={false}
                  nextStartValue={dataObj.otherTimes.length > 0 ? dataObj.otherTimes[0].timeStartValue : undefined }
                  showCustomize={true}
                  onChangeCustomization={onChangeCustomization}
                  customization={customization}
                  moreTimeHandler={moreTimeHandler}
                  lessTimeHandler={lessTimeHandler}
                  onSelectTime={onSelectTime}
                />
                {allWeek.otherTimes.map((otherTime, j) => (
                  <AvailabilityTimeRange
                    key={j}
                    length={dataObj.otherTimes.length}
                    position={j}
                    lastEndValue={
                      j === 0
                        ? dataObj.timeEndValue
                        : dataObj.otherTimes[j - 1].timeEndValue
                    }
                    nextStartValue={allWeek.otherTimes[j+1] ? allWeek.otherTimes[j+1].timeStartValue : undefined }
                    dayOfTheWeek={otherTime}
                    showDayOfTheWeek={false}
                    showCustomize={false}
                    onChangeCustomization={onChangeCustomization}
                    customization={customization}
                    moreTimeHandler={moreTimeHandler}
                    lessTimeHandler={lessTimeHandler}
                    onSelectTime={onSelectTime}
                  />
                ))}
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      <FooterBtns
        onPrev={onPrev}
        onNext={submitHandler}
        footerNote={
          "You will be able to further customize your availability later on"
        }
        showSpinner={showSpinner}
        availabilityPage={true}
        saveForLater={saveForLater}
      />
    </div>
  );
};

export default DaysAvailable;
