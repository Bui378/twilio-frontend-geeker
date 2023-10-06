import React, {
  memo, useCallback, useEffect, useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Button, Skeleton, Checkbox, Modal, 
} from 'antd';
import { useHistory } from 'react-router-dom';

import messages from './messages';

import Header from '../../components/Header';
import List from '../../components/List';
import { LayoutMax } from '../../components/Layout';
// import { useUser } from '../../context/useContext';

function ServiceStatusPage() {
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirmLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const {ListData} = useState([]);
  const {tech} = useState(false);
  const {show} = useState(true);

  const history = useHistory();
  // const { user } = useUser();

  useEffect(() => {
    if (show) {
      Modal.warning({
        title: 'Warning',
        content: "You have not created any 'request service' yet.",
        onOk() {
          history.push('/request-service');
          Modal.destroyAll();
        },
      });
    }
  }, [show, history]);

  const onChange = e => {
    setChecked(e.target.checked);
  };

  const onSubmit = useCallback(
    item => () => {
    },
    [],
  );

  const onCancelRequest = useCallback(() => {
  }, []);

  const handleCancel = () => {
    setVisible(false);
    setErrorMessage(null);
  };

  return (
    <div className="w-85">
      <LayoutMax>
        <Header display link="/" />
        {tech ? (
          <LayoutMax.Content className="items-center mobile-center">
            <p style={{ fontSize: 20 }}>Your technician will call shortly</p>
          </LayoutMax.Content>
        ) : (
          <LayoutMax.Content>
            {errorMessage && (
              <>
                <span style={{ color: 'red' }}>
                  Error:
                  {errorMessage}
                </span>
              </>
            )}
            <List
              loading={false}
              dataSource={ListData}
              itemLayout="horizontal"
              pagination={{
                size: 'small',
                pageSize: 4,
              }}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button
                      disabled={!checked}
                      onClick={onSubmit(item)}
                      type="primary"
                    >
                      <FormattedMessage {...messages.btnChoose} />
                    </Button>,
                  ]}
                >
                  <Skeleton avatar title={false} loading={false} active>
                    <List.Item.Meta
                      title={item.email}
                      description={(
                        <div className="flex-column">
                          <span>
                            <FormattedMessage {...messages.name} />
                            :
                            {' '}
                            {item.name}
                          </span>
                          <span>
                            <FormattedMessage {...messages.timeComplete} />
                            :
                            {' '}
                            {item.timeComplete}
                          </span>
                        </div>
                      )}
                    />
                  </Skeleton>
                </List.Item>
              )}
            />
            <Checkbox
              checked={checked}
              onChange={onChange}
              style={{ marginTop: 20, marginBottom: 20 }}
            >
              <span style={{ fontSize: 18 }}>
                <FormattedMessage {...messages.acceptTerms} />
              </span>
            </Checkbox>
            <br />
            <Button
              type="default"
              size="large"
              onClick={() => setVisible(true)}
            >
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
              </p>
            </Modal>
          </LayoutMax.Content>
        )}
      </LayoutMax>
    </div>
  );
}

ServiceStatusPage.propTypes = {};

export default memo(ServiceStatusPage);
