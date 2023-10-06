import React, {
  memo, useCallback, useEffect, useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Avatar, Button, Skeleton, Modal,
} from 'antd';
import { Formik } from 'formik';
import { Form, Input, Radio } from 'formik-antd';

import { BsClockHistory } from 'react-icons/bs';
import messages from './messages';

import validationSchema from './validation.schema';
import Header from '../../components/Header';
import List from '../../components/List';
import { LayoutMax } from '../../components/Layout';
import Space from '../../components/Space';
import { FormikFormItem } from '../../components/FormItem';

import jobIcon from '../../assets/images/jobs-icon.jpg';
// import { useAuth } from '../../context/authContext';
import * as RequestServiceApi from '../../api/requestService.api';

function JobListPage() {
  const [visible, setVisible] = useState(false);
  const [modalItem, setModalItem] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [requestServices, setRequestServices] = useState([]);

  // const { user } = useAuth();

  useEffect(() => {
    (async () => {
      await fetchRequestServices();
    })();
  }, []);

  const fetchRequestServices = async () => {
    const res = await RequestServiceApi.getRequestServices();
    setRequestServices(res.data);
  };

  function modal(item) {
    return (
      <Modal
        title={item.title}
        visible={visible}
        footer={false}
        onCancel={onCancel}
        closable={false}
      >
        <div>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            {({
              values, isSubmitting, dirty, setFieldValue,
            }) => (
              <Form id="modal-form" size="large" style={{ fontSize: 16 }}>
                {errorMessage && (
                  <p style={{ color: 'red' }}>
                    Error:
                    {' '}
                    {errorMessage.statusText}
                  </p>
                )}
                <p>
                  <span>
                    <b>
                      <FormattedMessage {...messages.emailLabel} />
                      :
                    </b>
                    &nbsp;
                    {item?.user?.email}
                  </span>
                  <br />
                  <span>
                    <b>
                      <FormattedMessage {...messages.typeLabel} />
                      :
                    </b>
                    &nbsp;
                    {item?.typeService?.name}
                  </span>
                  <br />
                  <span>
                    <b>
                      <FormattedMessage {...messages.descriptionLabel} />
                      :
                    </b>
                    &nbsp;
                    {item?.descriptionProblem?.name}
                  </span>
                </p>
                <p>
                  <i>
                    &quot;
                    {item.otherDescription}
                    &quot;
                  </i>
                </p>
                <FormikFormItem name="action">
                  <Radio.Group
                    name="action"
                    onChange={() => {
                      setFieldValue('timeComplete', '');
                      // eslint-disable-next-line no-underscore-dangle
                      setFieldValue('id', item.id);
                    }}
                  >
                    <Radio
                      name="action"
                      value="accept"
                      style={{ fontSize: 18 }}
                    >
                      <FormattedMessage {...messages.acceptJob} />
                    </Radio>
                    <Radio
                      name="action"
                      value="decline"
                      style={{ fontSize: 18 }}
                    >
                      <FormattedMessage {...messages.declineJob} />
                    </Radio>
                  </Radio.Group>
                </FormikFormItem>
                <FormikFormItem
                  name="timeComplete"
                  label={<FormattedMessage {...messages.timeLabel} />}
                  labelCol={{ span: 24 }}
                >
                  <Input
                    name="timeComplete"
                    disabled={values.action !== 'accept'}
                    prefix={<BsClockHistory />}
                    suffix={<FormattedMessage {...messages.minute} />}
                  />
                </FormikFormItem>
                <Space>
                  <Button
                    size="middle"
                    type="default"
                    onClick={onCancel(setFieldValue)}
                  >
                    <FormattedMessage {...messages.btnCancel} />
                  </Button>
                  <Button
                    size="middle"
                    type="primary"
                    htmlType="submit"
                    disabled={isSubmitting || !dirty}
                    loading={isSubmitting}
                  >
                    <FormattedMessage {...messages.btnSave} />
                  </Button>
                </Space>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    );
  }

  const onCancel = useCallback(
    setFieldValue => () => {
      setVisible(false);
      setFieldValue('action', null);
      setErrorMessage(null);
    },
    [],
  );

  const onSubmit = useCallback(
    async (data, form) => {
      if (data.action === 'decline') {
        form.setSubmitting(false);
        form.resetForm();
        setVisible(false);
      } else {
        try {
          await RequestServiceApi.assignUserToRequestService(data.id, data);

          form.setSubmitting(false);
          form.resetForm();
          setVisible(false);
          await fetchRequestServices();
        } catch (err) {
          form.setSubmitting(false);
          setErrorMessage(err);
        }
      }
    },
    [],
  );

  return (
    <div className="w-85">
      <LayoutMax>
        <Header link="/" display />
        <LayoutMax.Content>
          <List
            loading={false}
            itemLayout="horizontal"
            pagination={{
              size: 'small',
              pageSize: 5,
            }}
            dataSource={requestServices}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    onClick={() => {
                      setVisible(true);
                      setModalItem(item);
                    }}
                    type="primary"
                  >
                    <FormattedMessage {...messages.btnMore} />
                  </Button>,
                ]}
              >
                <Skeleton avatar title={false} loading={false} active>
                  <List.Item.Meta
                    avatar={<Avatar src={jobIcon} />}
                    title={item?.user?.email}
                    description={(
                      <div className="flex-column">
                        <span>
                          <FormattedMessage {...messages.typeService} />
                          :&nbsp;
                          {item?.typeService?.name}
                        </span>
                        <span>
                          <FormattedMessage {...messages.descriptionProblem} />
                          :&nbsp;
                          {item?.descriptionProblem?.name}
                        </span>
                      </div>
                    )}
                  />
                </Skeleton>
              </List.Item>
            )}
          />
          {modal(modalItem)}
        </LayoutMax.Content>
      </LayoutMax>
    </div>
  );
}

const initialValues = {
  id: '',
  timeComplete: '',
};

JobListPage.propTypes = {};

export default memo(JobListPage);
