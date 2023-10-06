import React, { useEffect } from 'react';
import { Modal, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ReactMic } from 'react-mic';

const ModalPopUp = ({
  micModal,
  toggleMicModal,
  record,
  stopStatus,
  micTest,
}) => {
  useEffect(() => {
    if (micModal) micTest();
  }, [micModal]);

  const handleCloseMic = () => {
    toggleMicModal();
    micTest();
  };

  return (
    <Modal
      visible={micModal}
      title="Built-in Microphone"
      onOk={handleCloseMic}
      cancelButtonProps={{ style: { display: 'none' } }}
      className="app-confirm-modal"
      closable={false}
    >
      <FormSection>
        <TestSection>
          <TestMic record={record} stopStatus={stopStatus} />
        </TestSection>
      </FormSection>
    </Modal>
  );
};

ModalPopUp.propTypes = {
  micModal: PropTypes.bool,
  toggleMicModal: PropTypes.func,
  record: PropTypes.any,
  stopStatus: PropTypes.bool,
  micTest: PropTypes.func,
};

ModalPopUp.defaultProps = {
  micModal: false,
  toggleMicModal: () => {},
  record: {},
  stopStatus: false,
  micTest: () => {},
};

const TestMic = styled(ReactMic)`
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

const TestSection = styled(Col)`
  background: #f8f8f8;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormSection = styled(Row)`
  width: 100%;
  padding: 20px;
`;

export default ModalPopUp;
