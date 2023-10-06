import React, { useState } from 'react';
import * as JitisiMeetAPI from '../api/jitsiMeet.api';
import { openNotificationWithIcon } from '../utils';

const JitsiMeetContext = React.createContext({});

function JitsiMeetProvider(props) {
  const [meetingInfo, setMeetingInfo] = useState({});
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getJitsiMeet = async (meetingId) => {
    try {
      setIsLoading(true);
      const res = await JitisiMeetAPI.gettingMeeting(meetingId);
      setMeetingInfo(res);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  };

  async function createMeeting(data) {
    try {
      setIsLoading(true);
      const res = await JitisiMeetAPI.createMeeting(data);

      setMeetingId(res.id);
      setIsLoading(true);
      return res;
    } catch (err) {

      setIsLoading(true);
      openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }

  return (
    <JitsiMeetContext.Provider
      value={{
        meetingId,
        meetingInfo,
        isLoading,
        getJitsiMeet,
        createMeeting,
      }}
      {...props}
    />
  );
}

function useJitsiMeet() {
  const context = React.useContext(JitsiMeetContext);
  if (context === undefined) {
    throw new Error('useJitsiMeet must be used within a JobProvider');
  }
  return context;
}

export { JitsiMeetProvider, useJitsiMeet };
