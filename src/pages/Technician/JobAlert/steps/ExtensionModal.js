// Commented by Nafees as per ticket - GKF-237 on 10-07-2023
// import React from 'react';
// import { Modal as AntModal, Typography } from 'antd';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';
// import StepButton from '../../../../components/StepButton';

// const ExtensionModal = ({ isOpen, onClose }) => {
//   const handleSubmit = () => {
//     window.open('https://remotedesktop.google.com/support', 'Generate Code', "height=800,width=800");
//     onClose();
//   };

//   return (
//     <Modal visible={isOpen} onCancel={onClose} footer={false}>
//       <Container>
//         <Description>Please install Remote PC controller Extension</Description>
//         <ButtonContainer>
//           <InstallButton onClick={handleSubmit}>Install or Use</InstallButton>
//         </ButtonContainer>
//       </Container>
//     </Modal>
//   );
// };

// const Modal = styled(AntModal)`
//   .ant-modal-content {
//     border-radius: 10px;
//   }
// `;

// const Container = styled.div`
//   padding: 20px;
// `;
// const ButtonContainer = styled.div`
//   margin-top: 60px;
//   display: flex;
//   justify-content: center;
// `;
// const Description = styled(Typography)`
//   font-size: 20px;
//   margin: 15px 0;
//   font-weight: 600;
//   text-align: center;
// `;
// const InstallButton = styled(StepButton)`
//   padding: 20px 40px;
//   font-size: 16px;
//   width: initial;
//   margin: 0;
// `;

// ExtensionModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// export default ExtensionModal;
