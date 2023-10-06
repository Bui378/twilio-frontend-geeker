import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Form } from 'antd';
import ReactPlayer from 'react-player/lazy';
import StepButton from '../../../../components/StepButton';
import H2 from '../../../../components/common/H2';
import H4 from '../../../../components/common/H4';
import playButton from '../../../../assets/images/playButton.png';

function WatchVideo(props) {
  const { onNext } = props;

  const [guideLines, setGuideLines] = useState({
    play: false,
    playing: false,
    urls: [],
    isComplete: false,
  });




  const handleEnd = () => {
    setGuideLines({
      ...guideLines,
      play: false,
      isComplete: true,
    });
  };

  return (
    <Container>
      <Form>
        <FormContainer>
          <FormSection gutter={16}>
            <Col span={24}>
              <StepTitle>Your Account is created!</StepTitle>
            </Col>
          </FormSection>
          <FormSection gutter={16}>
            <Col span={11}>
              <StepSubTile>
                Watch video about rules and regulations to proceed to quiz
              </StepSubTile>
              <Paragraph>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum is simply dummy text of the printing
              </Paragraph>
              <br />
              <Paragraph>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum is simply dummy text of the printing.
              </Paragraph>
              <ButtonContainer className="steps-action">
                <DisabledButton
                  type="button"
                  onClick={() => {
                    setGuideLines({ ...guideLines, playing: true });
                  }}
                >
                  <SystemIcon src={playButton} />
                  Watch Video
                </DisabledButton>
                <DisabledButton
                  type="button"
                  disabled={!guideLines.isComplete}
                  onClick={() => {
                    // eslint-disable-next-line no-unused-expressions
                    guideLines.isComplete ? onNext() : null;
                  }}
                >
                  Proceed to software quiz
                </DisabledButton>
              </ButtonContainer>
            </Col>
            <Col span={11} offset={1}>
              <VideoPlayer
                url={guideLines.urls[0]}
                playing={guideLines.playing}
                controls="true"
                onEnded={handleEnd}
              />
            </Col>
          </FormSection>
        </FormContainer>
      </Form>
    </Container>
  );
}

WatchVideo.propTypes = {
  onNext: PropTypes.func,
};

WatchVideo.defaultProps = {
  onNext: () => {},
};

const ButtonContainer = styled.div`
  width: 100%;
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
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
  margin: 20px 0px;
`;

const DisabledButton = styled(StepButton)`
  &:disabled {
    background: #dddddd;
    color: ${props => (props.type === 'back' ? '#464646' : '#fff')};
  }
  width: 45%;
  margin: 0px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const SystemIcon = styled.img`
  width: 30px;
  marginRight: 15px;
`;

const StepTitle = styled(H2)`
  margin-bottom: 60px;
`;

const StepSubTile = styled(H4)`
  padding-bottom: 50px;
  line-height: 2.2;
  font-size: 22px;
`;

const Paragraph = styled.div`
  text-align: left;
  color: #a0a0a0;
  line-height: 2;
`;

const VideoPlayer = styled(ReactPlayer)`
  width: 100% !important;
  height: 100% !important;
  position: relative;
  padding-bottom: 56%;
  padding-top: 10px;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 20px;
    filter: grayscale(1.5);
  }
`;

export default WatchVideo;
