import React, {
  memo, useCallback, useEffect, useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Modal, Spin } from 'antd';

import messages from './messages';

import { LayoutMax } from '../../components/Layout';
import Header from '../../components/Header';
import Button from '../../components/AuthLayout/Button';

function SearchTechPage() {
  const history = useHistory();
  // const techName = 'techName';

  const [errorMessage, setErrorMessage] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  // const [tech, setTech] = useState(false);
  // const [show, setShow] = useState(true);
  const show = true;
  const [visible, setVisible] = useState(false);

  const handleCancel = () => {
    setVisible(false);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (show) {
      Modal.warning({
        title: 'Warning',
        content:
          'There is no available technician who has the skills match to the problem and service requested',
        onOk() {
          history.push('/home');
          Modal.destroyAll();
        },
      });
    }
  }, [show, history]);

  const onCancelRequest = useCallback(() => {
    setConfirmLoading(true);
  }, []);

  return (
    <div className="w-85">
      <LayoutMax>
        <Header display link="/" />
        <LayoutMax.Content className="mobile-center space-between">
          <div />
          <div className="items-center">
            <b style={{ fontSize: 20, marginBottom: 20 }}>
              <FormattedMessage {...messages.searching} />
            </b>
            <Spin size="large" spinning={false} />
          </div>
          <Button type="default" size="large" onClick={() => setVisible(true)}>
            <FormattedMessage {...messages.btnCancelRequest} />
          </Button>
          <Modal
            title={<FormattedMessage {...messages.btnCancelRequest} />}
            visible={visible}
            onOk={onCancelRequest}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            okText={<FormattedMessage {...messages.yes} />}
            cancelText={<FormattedMessage {...messages.no} />}
          >
            <p style={{ fontSize: 18 }}>
              <FormattedMessage {...messages.messageCancel} />
              {errorMessage && (
                <>
                  <span style={{ color: 'red' }}>
                    Error:
                    {errorMessage}
                  </span>
                </>
              )}
            </p>
          </Modal>
        </LayoutMax.Content>
      </LayoutMax>
    </div>
  );
}

SearchTechPage.propTypes = {};

export default memo(SearchTechPage);
