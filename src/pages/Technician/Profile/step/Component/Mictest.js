import React from 'react';
import { ReactMic } from 'react-mic';
import { PropTypes } from 'prop-types';

function MicTest({ record, stopStatus }) {
  return (
    <ReactMic
      width="509"
      style={{ paddingLeft: '20px' }}
      record={record}
      visualSetting="sinewave"
      onStop={stopStatus}
      strokeColor="black"
      backgroundColor="grey"
      mimeType="audio/webm"
      bitRate={256000}
      sampleRate={96000}
      timeSlice={3000}
    />
  );
}

MicTest.propTypes = {
  record: PropTypes.bool,
  stopStatus: PropTypes.bool,
};

MicTest.defaultProps = {
  record: false,
  stopStatus: true,
};

export default MicTest;
