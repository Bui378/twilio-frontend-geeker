import React from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactPlayer from 'react-player/lazy';

const VideoPopup = ({ selectedVideo, setSelectedVideo }) => {
  const handleCloseVideo = () => {
    setSelectedVideo({
      ...selectedVideo,
      play: false,
    });
  };

  const handleEnd = () => {
    setSelectedVideo({
      ...selectedVideo,
      play: false,
      isComplete: true,
    });
  };
  const handleCancel = () => {
    setSelectedVideo({
      ...selectedVideo,
      play: false,
      isComplete: false,
    });
  };

  return (
    <Modal
      className = "video-modal"
      visible={selectedVideo.play}
      title={selectedVideo.title}
      onOk={handleCloseVideo}
      onCancel={handleCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <VideoPlayer
        url={selectedVideo.url}
        controls="true"
        onEnded={handleEnd}
      />
    </Modal>
  );
};

VideoPopup.propTypes = {
  selectedVideo: PropTypes.object,
  setSelectedVideo: PropTypes.func,
};

VideoPopup.defaultProps = {
  selectedVideo: {},
  setSelectedVideo: () => {},
};

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
  }
`;

export default VideoPopup;
