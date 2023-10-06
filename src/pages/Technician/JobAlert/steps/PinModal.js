import React from 'react';
import { Modal as AntModal, Typography } from 'antd';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';
import { openNotificationWithIcon } from '../../../../utils';

const PinModal = ({ isOpen, onClose, pinCode }) => {
  const pinCodeRef = React.useRef(null);

  const openExtension = () => {
    window.open(`https://remotedesktop.google.com/support/session/${pinCode}`);
  };

  const copyPinCode = () => {
    if (pinCodeRef && pinCodeRef.current) {
      pinCodeRef.current.select();
      document.execCommand('copy');
      openNotificationWithIcon('success', 'Success', 'Copied Pin code');
    }
    // onClose();
  };

  return (
    <Modal visible={isOpen} onCancel={onClose} footer={false} width={600}>
      <Container>
        <Box>
          <Label>PIN Code:</Label>
          <Description ref={pinCodeRef} value={pinCode} />
        </Box>
        <ButtonContainer>
          <DeclineButton onClick={openExtension}>Open Extension</DeclineButton>
          <SendButton onClick={copyPinCode}>Pin Code Copy</SendButton>
        </ButtonContainer>
      </Container>
    </Modal>
  );
};

const Modal = styled(AntModal)`
  .ant-modal-content {
    border-radius: 10px;
  }
`;
const Container = styled.div`
  padding: 20px;
`;
const Box = styled.div`
  display: flex;
`;
const Label = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  marginRight: 15px;
`;
const Description = styled.input`
  font-size: 16px;
  font-weight: 600;
  border: 0;

  &:focus {
    outline: none;
  }
`;
const ButtonContainer = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
`;
const SendButton = styled(StepButton)`
  padding: 20px 40px;
  font-size: 16px;
  width: initial;
  margin: 0;
`;

const DeclineButton = styled.button`
  height: 60px;
  background: transparent;
  display: flex;
  font-weight: bold;
  border-radius: 10px;
  padding: 0px 40px;
  margin-left: 15px;
  line-height: 60px;
  border: 0px;
  font-size: 18px;
  cursor: pointer;
  color: #464646;
`;

export default PinModal;
