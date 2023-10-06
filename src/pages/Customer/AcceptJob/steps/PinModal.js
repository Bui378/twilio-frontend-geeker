import React, { useState } from 'react';
import { Modal as AntModal, Typography } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';
import Input from '../../../../components/AuthLayout/Input';
import Box from '../../../../components/common/Box';

const PinModal = ({ isOpen, onClose, onSubmit,openSecondModal ,openFirstModal,setopenSecondModal,setopenFirstModal}) => {
  // console.log('openFirstModal>>>>>>>',openFirstModal)
  const [pinCode, setPinCode] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);

  const handleSubmit = () => {
    onSubmit(pinCode);
  };

  const openGeneratePinWindow = () => {
    window.open('https://remotedesktop.google.com/support', 'Generate Code', "height=700,width=950");
    setPinCode('')
    setopenSecondModal(true)
    setopenFirstModal(false)
  };

  const handlePinCodeChange = (e) => {
    setIsDisabled(false)
    setPinCode(e.target.value)
    if(e.target.value == ''){
      setIsDisabled(true)
    }
  }

  return (
    <div>
    { openSecondModal &&  (<Modal visible={isOpen} onCancel={onClose} footer={false} bodyStyle={{height:340}}>
      <Box padding={20}>
        <Label className="steplable">Step 2:</Label>
        <Label>Enter Code :</Label>
        <CusInput value={pinCode} onChange={handlePinCodeChange} placeholder="Enter remote desktop code" />
        <div className="pin-message">
            Paste the code in the input box that you have generated & copied from the chrome desktop screen and wait.
            This code will then be sent to the technician so he/she can get access to your machine.This might take some time.
        </div>
        <Box marginTop={20}>
          <SendButton onClick={handleSubmit} disabled={isDisabled} className={(isDisabled ? "disabled-btn" : "") + " pin-modal-btn"}>Share</SendButton>
          <SendButton onClick={openGeneratePinWindow} className="pin-modal-btn-large" title="Click to generate code again if you lost the screen.">Generate Code Again?</SendButton>
        </Box>
        
      </Box>
    </Modal>
    )}

    { openFirstModal &&  (<Modal visible={isOpen} onCancel={onClose} footer={false} bodyStyle={{height:340}}>
      <Box padding={20}>
        <Label className="steplable">Step 1:</Label>
        <div className="pin-message">
            <p>1. Click on the button below to generate code.A new screen will be shown, if chrome remote desktop is not installed in your computer you will have to download and install it using the download button on the chrome desktop screen.</p>
            <p>2. If chrome remote desktop is already installed then "Generate code" named button will be shown in the chrome desktop screen.
                Click on the button to generate code and copy the code.</p>
        </div>
        <Box marginTop={20}>
          <SendButton onClick={openGeneratePinWindow} className="pin-modal-btn">Generate Code</SendButton>
        </Box>
        
      </Box>
    </Modal>
    )}
    </div>
  );
};

const Modal = styled(AntModal)`
  .ant-modal-body{
    min-height: 260px;
  }
  .steplable{
    font-size: 19px;
  }
  .ant-modal-content {
    border-radius: 10px;
   
  }
  .ant-typography{
    margin-bottom:8px;
  }
  .ant-input{
    border-radius: 4px !important;
    margin-bottom: 10px;
  }
  .pin-message{
    font-style: italic;
  }
  .pin-modal-btn{
    height:45px !important;
    width:140px !important;
    float:right;
  }
  .pin-modal-btn-large{
    height:45px !important;
    width:186px !important;
    float:right;
  }
  .disabled-btn{
    background: #908d8d !important;
    color: #fff !important;
    border-color: #464646 !important;
  }
`;

const CusInput = styled(Input)`
  height: 40px !important;
`;

const Label = styled(Typography)`
  font-size: 14px;
`;

const SendButton = styled(StepButton)`
  padding: 20px 40px;
  font-size: 16px;
  width: initial;
  margin: 0;
`;

PinModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default PinModal;
