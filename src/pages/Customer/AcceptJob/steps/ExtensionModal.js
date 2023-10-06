
// Commented by Nafees as per ticket - GKF-237 on 10-07-2023
// import React from 'react';
// import { Modal as AntModal, Typography } from 'antd';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';
// import StepButton from '../../../../components/StepButton';
// import Box from '../../../../components/common/Box';

// const ExtensionModal = ({ isOpen, onClose }) => {
  
//   const handleSubmit = () => {
//     window.open('https://remotedesktop.google.com/support', 'Generate Code', "height=600,width=800");
//     onClose();
//   };

//   return (
//     <Modal visible={isOpen} onCancel={onClose} footer={false}>
//       <Box padding={20}>
//         <Description>Please install Remote PC controller Extension</Description>
//         <Box display="flex" justifyContent="center" marginTop={60}>
//           <InstallButton onClick={handleSubmit}>Install or Use</InstallButton>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

// const Modal = styled(AntModal)`
//   .ant-modal-content {
//     border-radius: 10px;
//   }
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
