import React from 'react';
import { Modal as AntModal, Typography } from 'antd';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import StepButton from '../StepButton';
import Box from '../common/Box';

const NotificationModal = ({ isOpen, onClose, onSubmit, description = "The job has already been taken" }) => {
  const history = useHistory();

  const handleSubmit = () => {
    if (onSubmit) onSubmit()
    else {
      history.push('/dashboard');
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} onCancel={onClose} footer={false}>
      <Box padding={20}>
        <Description>{description}</Description>
        <Box display="flex" justifyContent="center" marginTop={60}>
          <InstallButton onClick={handleSubmit}>Ok</InstallButton>
        </Box>
      </Box>
    </Modal>
  );
};

const Modal = styled(AntModal)`
  .ant-modal-content {
    border-radius: 10px;
  }
`;

const Description = styled(Typography)`
  font-size: 20px;
  margin: 15px 0;
  font-weight: 600;
  text-align: center;
`;

const InstallButton = styled(StepButton)`
  padding: 20px 40px;
  font-size: 16px;
  width: initial;
  margin: 0;
`;

export default NotificationModal;
