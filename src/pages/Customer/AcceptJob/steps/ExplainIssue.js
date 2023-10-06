import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
// import StepButton from '../../../../components/StepButton';
import {Button} from 'react-bootstrap';
import PinModal from './PinModal';
import { useSocket } from '../../../../context/socketContext';
import Box from '../../../../components/common/Box';

function ExplainIssue() {
  const { jobId } = useParams();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();

  const onCancelConnect = () => {
    socket.emit('cancel-connect', { id: jobId });
    history.push('/dashboard');
  };

  const renderTime = ({ remainingTime }) => (
    <div className="timer">
      <div className="value">{remainingTime}</div>
    </div>
  );

  const onStartShare = () => {
    setIsOpen(true);
  };

  const onSubmit = pinCode => {
    socket.emit('start-share', { id: jobId, pinCode });
    console.log('change here 111111111111111111111')
    window.location.href = process.env.REACT_APP_MEETING_PAGE+`/customer/job/${jobId}`
  };

  return (
    <Box display="flex" direction="column" width="100%">
      <Box display="flex" direction="column" justifyContent="center" height="100%" width="80%" marginAuto>
        <Box
          background="#fff"
          radius={5}
          display="flex"
          direction="column"
          alignItems="flex-start"
          marginTop={50}
          marginBottom={50}
          padding={60}
          flex={1}
          boxShadow="0px 15px 50px 0px #d5d5d566"
        >
          <Box width="100%">
            <Box display="flex" justifyContent="center" marginBottom={30}>
              <Title>Please explain your issue</Title>
            </Box>
            <Box display="flex" justifyContent="center" marginBottom={15} wrap>
              <Description>
                If your issue requires a screenshare session please click
                below to get started. The job meter will be paused until your
                tech can confirm they can resolve your issue.
              </Description>
            </Box>
            <Box paddingTop={40} paddingHorizontal={70} marginHorizontal={-60} borderTop="1px solid rgba(0, 0, 0, 0.3)">
              <Box display="flex" justifyContent="space-between" marginBottom={15} wrap style={{ marginBottom: 0 }}>
                <Box display="flex" alignItems="center" marginBottom={25}>
                  <CountdownCircleTimer
                    isPlaying
                    duration={5}
                    colors={[['#464646']]}
                    onComplete={() => {}}
                    size={70}
                    strokeWidth={5}
                  >
                    {renderTime}
                  </CountdownCircleTimer>
                  <Text>Session meter</Text>
                </Box>
                <Box display="flex" justifyContent="center" marginBottom={20}>
                  <Button onClick={onCancelConnect} className="btn app-btn app-btn-light-blue">
                    Cancel
                  </Button>
                  <Button onClick={onStartShare} className="btn app-btn">
                    Start Screenshare
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <PinModal
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        onSubmit={onSubmit}
      />
    </Box>
  );
}

const Title = styled.p`
  margin-bottom: 0.5em;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
  font-size: 24px;
  line-height: 1.4;
`;
const Description = styled.p`
  margin: 0 10px 10px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 300;
  font-size: 20px;
  line-height: 1.4;
`;

const Text = styled.span`
  color: rgba(0, 0, 0, 0.6);
  font-size: 16px;
  padding: 0 10px;
`;

const DeclineButton = styled.button`
  height: 60px;
  background: transparent;
  font-weight: bold;
  border-radius: 10px;
  padding: 0px 40px;
  line-height: 60px;
  font-size: 18px;
  cursor: pointer;
  color: #464646;
  border: 1px solid 464646;
  min-width: 200px;
  text-align: center;

  &:focus {
    outline: none;
  }
`;

export default ExplainIssue;
