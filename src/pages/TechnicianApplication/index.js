import React, {
  memo, useCallback, useEffect, useState,
} from 'react';
import styled from 'styled-components';
import {
  Button, Space, Typography, Steps,
} from 'antd';
import {
  Form, Radio, Input, Checkbox, Select,
} from 'formik-antd';
import { Formik } from 'formik';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import messages from './messages';

import Layout from '../../components/Layout';
import Header from '../../components/Header';
import Result from '../../components/Result';
import { FormikFormItem } from '../../components/FormItem';
import validationSchema from './validation.schema';
import { useAuth } from '../../context/authContext';
import * as TypeServiceApi from '../../api/typeService.api';
import * as ServiceProviderApi from '../../api/serviceProvider.api';
import Box from '../../components/common/Box';

function TechnicianApplicationPage() {
  const { user } = useAuth();
  const history = useHistory();
  const [selectedItems, setSelectedItems] = useState([]);
  const [checked, setChecked] = useState(false);
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState(null);
  const [typeServices, setTypeServices] = useState([]);
  const error = true;

  useEffect(() => {
    (async () => {
      const res = await TypeServiceApi.getTypeServices();

      if (res) {
        setTypeServices(res.data);
      }
    })();
  }, []);

  const handleChange = useCallback(value => {
    setSelectedItems(value);
  }, []);

  const onSubmit = useCallback(
    async data => {
      const { city, state } = data;
      const newData = Object.assign(data, {
        address: { city, state },
        user: user.id,
      });

      if (current !== 0) {
        delete newData.city;
        delete newData.state;

        try {
          await ServiceProviderApi.createServiceProvider(newData);
          setStatus('success');
        } catch (e) {
          setStatus('error');
        }

        setCurrent(current + 1);
      }
    },
    [current, user.id],
  );

  const onChange = e => {
    setChecked(e.target.checked);
  };

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const filteredOptions = Object.keys(typeServices)
    .map(i => typeServices[i].name)
    .filter(o => !selectedItems.includes(o));

  return (
    <div className="w-85">
      <Layout>
        <Header link="/" display />
        <Layout.Content className="items-center">
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema[current]}
          >
            {({ isValid, submitForm }) => (
              <Form
                className="item-center"
                style={{ width: '100%' }}
                size="large"
                labelCol={{ span: 24 }}
              >
                <StepsChild current={current} style={{ marginBottom: 50 }}>
                  {steps.map(item => (
                    <Steps.Step key={item.title} title={item.title} />
                  ))}
                </StepsChild>
                <Box display="flex" direction="column" justifyContent="center" alignItems="center">
                  {current === 0 ? (
                    <React.Fragment key="flex1">
                      <FormikFormItem name="name" required>
                        <Input name="name" placeholder="Name" autoFocus />
                      </FormikFormItem>
                      <FormikFormItem name="email" required>
                        <Input name="email" placeholder="Email" />
                      </FormikFormItem>
                      <FormikFormItem name="phone" required>
                        <Input name="phone" placeholder="Phone" />
                      </FormikFormItem>
                      <FormikFormItem name="address">
                        <Form.Item
                          name="city"
                          required
                          style={{
                            display: 'inline-block',
                            width: 'calc(50% - 8px)',
                            marginBottom: 0,
                          }}
                        >
                          <Input name="city" placeholder="City" />
                        </Form.Item>
                        <Form.Item
                          name="state"
                          required
                          style={{
                            display: 'inline-block',
                            width: 'calc(50% - 8px)',
                            marginBottom: 0,
                          }}
                        >
                          <Input name="state" placeholder="State" />
                        </Form.Item>
                      </FormikFormItem>
                      <FormikFormItem name="specialities" required>
                        <Select
                          name="specialities"
                          mode="multiple"
                          placeholder="Specialities"
                          value={selectedItems}
                          onChange={handleChange}
                          style={{ width: '100%' }}
                        >
                          {filteredOptions.map(item => (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          ))}
                        </Select>
                      </FormikFormItem>
                    </React.Fragment>
                  ) : current === 1 ? (
                    <React.Fragment key="stateId">
                      <FormikFormItem name="stateId" required>
                        <Input name="stateId" placeholder="State Id" />
                      </FormikFormItem>
                      <FormikFormItem name="education" required>
                        <Input
                          name="education"
                          placeholder="Place of Education"
                        />
                      </FormikFormItem>
                      <FormikFormItem
                        name="certificate"
                        label={
                          <FormattedMessage {...messages.certificateLabel} />
                        }
                        required
                      >
                        <Radio.Group name="certificate">
                          <Radio
                            name="certificate"
                            value="yes"
                            className="form-label"
                          >
                            Yes
                          </Radio>
                          <Radio
                            name="certificate"
                            value="no"
                            className="form-label"
                          >
                            No
                          </Radio>
                        </Radio.Group>
                      </FormikFormItem>
                      <FormikFormItem
                        name="expertise"
                        label={
                          <FormattedMessage {...messages.expertiseLabel} />
                        }
                        required
                      >
                        <Radio.Group name="expertise">
                          <Radio
                            name="expertise"
                            value="school"
                            className="form-label"
                          >
                            School
                          </Radio>
                          <Radio
                            name="expertise"
                            value="experience"
                            className="form-label"
                          >
                            Experience
                          </Radio>
                          <Radio
                            name="expertise"
                            value="other"
                            className="form-label"
                          >
                            Other
                          </Radio>
                        </Radio.Group>
                      </FormikFormItem>
                      <FormikFormItem name="message" required>
                        <Input.TextArea
                          name="message"
                          placeholder="Wright a message?"
                          autoSize={{ minRows: 4 }}
                        />
                      </FormikFormItem>
                      <FormikFormItem name="terms" required>
                        <Checkbox
                          name="terms"
                          className="form-label"
                          onChange={onChange}
                        >
                          Accept Terms and Condition
                        </Checkbox>
                      </FormikFormItem>
                    </React.Fragment>
                  ) : (
                    <Result
                      status={status}
                      title={
                        <FormattedMessage {...messages[`${status}Title`]} />
                      }
                      subTitle={
                        <FormattedMessage {...messages[`${status}SubTitle`]} />
                      }
                      extra={[
                        <Button
                          type="primary"
                          key="console"
                          onClick={() => history.push('/home')}
                        >
                          <FormattedMessage {...messages.btnGoHome} />
                        </Button>,
                        <Button
                          style={error ? {} : { display: 'none' }}
                          key="buy"
                          onClick={() => setCurrent(0)}
                        >
                          <FormattedMessage {...messages.btnTryAgain} />
                        </Button>,
                      ]}
                    >
                      <div
                        className="desc"
                        style={error ? {} : { display: 'none' }}
                      >
                        <Typography.Paragraph>
                          <Typography.Text
                            strong
                            style={{
                              fontSize: 16,
                            }}
                          >
                            <FormattedMessage {...messages.titleError} />
                          </Typography.Text>
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                          <FormattedMessage {...messages.listError} />
                        </Typography.Paragraph>
                      </div>
                    </Result>
                  )}
                </Box>
                <div style={{ marginTop: 30 }}>
                  {current === 0 && (
                    <Button
                      style={{ width: 150 }}
                      type="primary"
                      onClick={() => {
                        submitForm().then(() => {
                          if (isValid) {
                            next();
                          }
                        });
                      }}
                    >
                      Next
                    </Button>
                  )}
                  {current === 1 && (
                    <Space>
                      <Button type="primary" onClick={() => prev()}>
                        Previous
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={false}
                        disabled={!checked}
                      >
                        Apply Now
                      </Button>
                    </Space>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </Layout.Content>
      </Layout>
    </div>
  );
}

const steps = [
  {
    title: <FormattedMessage {...messages.first} />,
    content: 'First-content',
  },
  {
    title: <FormattedMessage {...messages.second} />,
    content: 'Second-content',
  },
  {
    title: <FormattedMessage {...messages.done} />,
    content: 'Last-content',
  },
];

const initialValues = {
  name: null,
  email: null,
  phone: null,
  city: null,
  state: null,
  specialities: null,
  stateId: null,
  education: null,
  certificate: null,
  expertise: null,
  message: null,
};

TechnicianApplicationPage.propTypes = {};

const StepsChild = styled(Steps)`
  @media only screen and (max-width: 480px) {
    margin-bottom: 20px !important;

    &.ant-steps-horizontal.ant-steps-label-horizontal {
      flex-direction: row;
    }

    .ant-steps-item-container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      > .ant-steps-item-tail:after {
        display: none;
      }

      .ant-steps-item-icon {
        margin: 0;
      }

      .ant-steps-item-content > .ant-steps-item-title {
        padding: 0;
      }
    }
  }
`;

export default memo(TechnicianApplicationPage);
