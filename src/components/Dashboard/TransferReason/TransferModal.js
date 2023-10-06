import React from 'react';
import { Modal } from 'antd';

const TransferModal = (props) => {
  console.log('TransferModal', props);

  return (

    <Modal
      style={{ top: 40 }}
      closable={false}
      title={<span className="customModalTitle">Transfer Job Reason</span>}
      destroyOnClose={false}
      visible={props.transferModal}
      maskStyle={{ backgroundColor: "#DCE6EDCF" }}
      maskClosable={true}
      width={615}
      footer={
        [
          <button
            className="btn app-btn job-accept-btn modal-footer-btn btn btn-primary"
            onClick={() => {
              props.setTransferModal(false);
            }}
            key='Cancel'
          >
            <span></span>Cancel
          </button>,
        ]}
    >
      <div className="">
        <span className="divsize">{props.transferReason}</span>
      </div>
    </Modal>
  );
};

export default TransferModal;
