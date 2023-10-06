import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import PropTypes from 'prop-types';
// import StepButton from '../../../../../components/StepButton';
import { Button } from 'react-bootstrap';
import SpeakerIcon from '../../../../../assets/images/speaker_icon.png';
import MicroPhoneIcon from '../../../../../assets/images/microphone_icon.png';
import ModalPopUp from './modalPopUp';
import Box from '../../../../../components/common/Box';
import * as TechnicianApi from '../../../../../api/technician.api';
import { useUser } from '../../../../../context/useContext';
import { openNotificationWithIcon } from '../../../../../utils';
import 'antd/dist/antd.css';

const { Text } = Typography;

const useAudio = url => {
  const [audio] = useState(new Audio(url));

  const [playing, setPlaying] = useState(false);
  const [isTest, setIsTest] = useState(false);
  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    if (playing) {
      if (audio.play()) {
        setIsTest(true);
      }
    } else {
      audio.pause();
    }
  }, [audio, playing]);

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, [audio]);
  return [playing, toggle, isTest];
};

const audioSrc = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

function SystemRequirement({ setTechProfile, techProfile }) {
  const { user } = useUser();
  const [micText, setMicText] = useState('Test Microphone');
  const [record, setRecord] = useState(false);
  const [stopStatus, setStopStatus] = useState(true);
  const [errorMic, setErrorMic] = useState('');
  const [errorSpeaker, setErrorSpeaker] = useState('');
  const [playing, toggle, isTest] = useAudio(audioSrc);

  const [isMicTest, setIsMicTest] = useState(false);
  const [micModal, setMicModal] = useState(false);

  const checkIfMicAvailable = () => navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(() => {
      setErrorMic('');
      return true;
    })
    .catch(() => {
      setErrorMic('Error Occurred. Please Check Your Device!');
      return false;
    });

  const micTest = async () => {
    if (await checkIfMicAvailable()) {
      setRecord(!record);
      setStopStatus(!stopStatus);
      setMicText(stopStatus ? 'Stop' : 'Test Microphone');
      setIsMicTest(true);
    }
  };

  const toggleMicModal = async () => {
    if (await checkIfMicAvailable()) {
      setMicModal(prev => !prev);
    }
  };

  useEffect(() => {
    if (isTest) {
      setErrorSpeaker('');
    }
  }, [isTest]);

  useEffect(() => {
    if (user.technician.profile.systemRequirement) {
      const demoObj = user.technician.profile.systemRequirement;
      if (demoObj && Object.keys(demoObj).length > 0) {
        const temptechProfile = { ...techProfile };
        temptechProfile.systemRequirement.complete = true;
        setTechProfile(temptechProfile);
      }

      // setSettings(user.technician.profile.alertPreference.settings)
    }
  }, [user.technician.profile.systemRequirement]);

  const handleSystemReqSave = () => {
    if (!isMicTest) {
      setErrorMic('Please Check Microphone.');
    }
    if (!isTest) {
      setErrorSpeaker('Please Check Speakers.');
    }

    if (isMicTest && isTest) {
      setTechProfile(prev => ({
        ...prev,
        systemRequirement: {
          ...prev.systemRequirement,
          complete: true,
        },
      }));
      setErrorMic('');
      setErrorSpeaker('');
    }

    TechnicianApi.updateTechnician(user.technician.id, { profileImage: false, systemRequirement: { complete: true } });
    openNotificationWithIcon('success', 'Success', 'Information Submitted');
  };

  return (
    <Container>
      <FormContainer>
        <FormSection justify="space-around">
          <TestSection xs={24} md={11}>
            <Box display="flex" justifyContent="flex-start" alignItems="center">
              <SystemIcon src={MicroPhoneIcon} />
              <TypeTitle>Built-in Microphone</TypeTitle>
            </Box>
            <TestText onClick={toggleMicModal}>{micText}</TestText>
            <AlertError>{errorMic}</AlertError>
          </TestSection>
          <ModalPopUp
            micModal={micModal}
            toggleMicModal={toggleMicModal}
            micTest={micTest}
            record={record}
            status={micText}
            stopStatus={stopStatus}
          />
          <TestSection xs={24} md={11}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <SystemIcon src={SpeakerIcon} />
              <TypeTitle>Attached or external Speakers</TypeTitle>
            </Box>
            <TestText onClick={toggle}>
              {playing ? 'Stop' : 'Test Speakers'}
            </TestText>
            <AlertError>{errorSpeaker}</AlertError>
          </TestSection>
        </FormSection>
      </FormContainer>

      <Box display="flex" justifyContent="flex-end" marginTop={30}>
        <Button className="btn app-btn" onClick={handleSystemReqSave}>
          <span />
          Save
        </Button>
      </Box>
    </Container>
  );
}

SystemRequirement.propTypes = {
  setTechProfile: PropTypes.func,
};

SystemRequirement.defaultProps = {
  setTechProfile: () => {},
};

const AlertError = styled.span`
  color: red;
  font-size: 14px;
  position: absolute;
  bottom: -24px;
  left: 0;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 30px;
`;

const FormSection = styled(Row)`
  width: 100%;
  margin: 20px;
`;

const SystemIcon = styled.img`
  width: 30px;
`;

const TestSection = styled(Col)`
  background: #f8f8f8;
  padding: 20px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TestText = styled(Text)`
  text-decoration: underline;
  cursor: pointer;
`;

const TypeTitle = styled(Text)`
  padding-left: 10px;
  font-weight: bold;
  font-size: 16px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default SystemRequirement;
