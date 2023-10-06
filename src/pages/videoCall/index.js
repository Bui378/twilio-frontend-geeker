import React from 'react';
// import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import { FaUpload, FaShare, FaDesktop } from 'react-icons/fa';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import './index.css';

const VideoCall = () => {
  const renderTime = ({ remainingTime }) => {
    if (remainingTime <= 9) {
      remainingTime = `0${remainingTime}`;
    }
    return (
      <div className="timer">
        <div className="value">
          0 :
          {remainingTime}
        </div>
      </div>
    );
  };

  return (
    <div className="video-call">
      <Row>
        <Col span={5}>
          <div className="video-side-bar">
            <h1 className="title">EZ</h1>
            <h3 className="tagline">
              Waiting for customer to confirm the solution
            </h3>
            <div className="underline">
              <span />
            </div>
          </div>
        </Col>
        <Col span={19}>
          <div className="video-section">
            <div className="video-call">
              <h4 className="video-title">VIDEO CALL</h4>
              <form className="file-upload">
                <div className="upload-file">
                  <input type="file" />
                  <FaUpload />
                  File Upload
                </div>
              </form>
            </div>
            <div className="video-call-footer">
              <Row>
                <Col span={11}>
                  <div className="video-call-detail">
                    <p>
                      Customer:
                      {' '}
                      <span>John Doe</span>
                      Est. time:
                      {' '}
                      <span>30 mins</span>
                      Est. earinings
                      {' '}
                      <span>$55</span>
                    </p>
                    <p>
                      issue:
                      <span>
                        Need Excel VBA script written to combine 750+ sheets
                        that are all similarly formatted into a single sheet.
                      </span>
                    </p>
                  </div>
                </Col>
                <Col span={3}>
                  {' '}
                  <div className="send-timer">
                    <CountdownCircleTimer
                      isPlaying
                      size={60}
                      strokeWidth={4}
                      className="red"
                      duration={10}
                      colors={[['#005050']]}
                      onComplete={() => [true, 1000]}
                    >
                      {renderTime}
                    </CountdownCircleTimer>
                  </div>
                </Col>
                <Col span={6}>
                  <ul className="share-call">
                    <li>
                      <button className="share-call-icon">
                        <FaShare />
                      </button>
                      share
                    </li>
                    <li>
                      <button className="share-call-icon">
                        <FaDesktop />
                      </button>
                      Remote
                    </li>
                    <li>
                      <button className="share-call-icon">
                        <FaUpload />
                      </button>
                      Upload
                    </li>
                  </ul>
                </Col>
                <Col span={4}>
                  <div className="cancel-session">
                    <button>Cancel Session</button>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default VideoCall;
