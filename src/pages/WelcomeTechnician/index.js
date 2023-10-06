import React, { memo, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Formik } from 'formik';
import { Form, SubmitButton, Input } from 'formik-antd';
import {
  Button, Row, Col, Typography, message, Upload,
} from 'antd';
import styled from 'styled-components';
import * as _ from 'lodash';
import { useHistory } from 'react-router';
import messages from './messages';

import { LayoutMax } from '../../components/Layout';
import { FormikFormItem } from '../../components/FormItem';
import Header from '../../components/Header';
import { useAuth } from '../../context/authContext';
import validationSchema from './validation.schema';
import * as TechnicianApi from '../../api/technician.api';

function WelcomeTechnicianPage() {
  const [disableUpload, setDisableUpload] = useState(false);
  const [disableW9Upload, setDisableW9Upload] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [w9File, setW9File] = useState([]);
  const { user } = useAuth();
  const history = useHistory();

  const handleUpload = useCallback(
    async value => {
      const data = _.pick(value, ['bankAccount', 'nameAccount']);

      const formData = new FormData();
      formData.append('bankAccount', data.bankAccount);
      formData.append('nameAccount', data.nameAccount);

      formData.append('w9File', w9File);

      fileList.forEach((item) => {
        formData.append('photoDOL', item.originFileObj);
      });

      try {
        await TechnicianApi.updateAccountInfo(user?.technician?.id, formData);
        message.success('Update information success.');
        setTimeout(() => {
          history.push('/');
        }, 1500);
      } catch (err) {
        message.error('Update information error!');
      }
    },
    [w9File, fileList, user.technician.id, history],
  );

  const handleChange = info => {
    const { status, name } = info.file;
    if (info.fileList.length >= 1) {
      setDisableW9Upload(true);
    } else {
      setDisableW9Upload(false);
    }

    if (status === 'done') {
      message.success(`${name} file uploaded successfully`);
    } else if (status === 'error') {
      message.error(`${name} file upload failed.`);
    }
  };

  const handleChangePhoto = info => {
    const { status, name } = info.file;

    if (info.fileList.length >= 2) {
      setDisableUpload(true);
    } else {
      setDisableUpload(false);
    }

    if (status === 'done') {
      message.success(`${name} file uploaded successfully`);
    } else if (status === 'error') {
      message.error(`${name} file upload failed.`);
    } else {
      setFileList([...info.fileList]);
    }
  };

  const beforeDOLUpload = ({ file, setFieldValue }) => {
    const isLt100M = file.size < 100000000;
    const isImage = file.type === 'image/jpeg'
      || file.type === 'image/jpg'
      || file.type === 'image/png';
    if (!isImage) {
      return message.error('You can only upload image file!');
    }
    if (!isLt100M) {
      return message.error('Image must smaller than 100MB!');
    }
    setFileList([...fileList, file]);
    setFieldValue('photoDOL', [...fileList, file]);
    return false;
  };

  const beforeW9Upload = ({ file, list, setFieldValue }) => {
    const isLt100M = file.size < 100000000;
    const isImage = file.type === 'image/jpeg'
      || file.type === 'image/jpg'
      || file.type === 'image/png';
    if (!isImage) {
      return message.error('You can only upload image file!');
    }
    if (!isLt100M) {
      return message.error('Image must smaller than 100MB!');
    }
    setW9File(file);
    setFieldValue('w9File', list);
    return false;
  };

  const w9props = {
    name: 'w9File',
    listType: 'picture',
    onChange: handleChange,
  };

  const photoDOLProps = {
    name: 'photoDOL',
    fileList,
    listType: 'picture',
    onChange: handleChangePhoto,
  };

  return (
    <div className="w-85">
      <LayoutMax>
        <Header link="/" display />
        <LayoutMax.Content className="items-center">
          <Typography.Paragraph
            style={{
              maxWidth: 455,
              textAlign: 'justify',
              fontSize: 18,
              marginBottom: 50,
            }}
          >
            <FormattedMessage {...messages.welcome} />
          </Typography.Paragraph>
          <Formik
            initialValues={initialValues}
            onSubmit={handleUpload}
            validationSchema={validationSchema}
          >
            {({ setFieldValue, dirty }) => (
              <Form className="items-center" size="large">
                <FormikFormItem name="bankAccount">
                  <Input
                    name="bankAccount"
                    placeholder="Bank Account #"
                    style={{ width: '100%' }}
                  />
                </FormikFormItem>
                <FormikFormItem name="nameAccount">
                  <Input
                    name="nameAccount"
                    placeholder="Name on Account"
                    style={{ width: '100%' }}
                  />
                </FormikFormItem>
                <Row
                  gutter={[{ xs: 0, sm: 20 }, { xs: 20 }]}
                  style={{ width: '100%', marginBottom: 20 }}
                >
                  <Col xs={24} sm={12}>
                    <Form.Item name="w9File">
                      <AntdUpload
                        accept="image/*"
                        {...w9props}
                        beforeUpload={(file, list) => beforeW9Upload({ file, list, setFieldValue })}
                      >
                        <Button
                          style={{ width: '100%' }}
                          disabled={disableW9Upload}
                        >
                          <FormattedMessage {...messages.updateW9} />
                        </Button>
                      </AntdUpload>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="photoDOL">
                      <AntdUploadInline
                        accept="image/*"
                        {...photoDOLProps}
                        className="upload-list-inline"
                        beforeUpload={file => beforeDOLUpload({ file, setFieldValue })}
                      >
                        <Button
                          style={{ width: '100%' }}
                          disabled={disableUpload}
                        >
                          <FormattedMessage {...messages.uploadPhoto} />
                        </Button>
                      </AntdUploadInline>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <SubmitButton
                    style={{ width: 150 }}
                    type="primary"
                    size="large"
                    disabled={!dirty}
                    loading={false}
                  >
                    <FormattedMessage {...messages.getStart} />
                  </SubmitButton>
                </Row>
              </Form>
            )}
          </Formik>
        </LayoutMax.Content>
      </LayoutMax>
    </div>
  );
}

const initialValues = {
  bankAccount: null,
  nameAccount: null,
  w9File: null,
  photoDOL: null,
};

export const AntdUpload = styled(Upload)`
  .ant-upload {
    width: 100%;
  }
`;

export const AntdUploadInline = styled(AntdUpload)`
  @media only screen and (min-width: 600px) {
    .ant-upload-list-picture {
      display: flex;
      justify-content: space-between;

      &:before {
        display: none;
      }

      &:after {
        display: none;
      }
    }
  }

  &.upload-list-inline .ant-upload-list-item {
    @media only screen and (max-width: 600px) {
      width: 100%;
    }

    @media only screen and (min-width: 600px) {
      width: 164px;
      float: left;
    }
  }

  .upload-list-inline [class*='-upload-list-rtl'] .ant-upload-list-item {
    @media only screen and (min-width: 600px) {
      float: right;
    }
  }
`;

WelcomeTechnicianPage.propTypes = {};

export default memo(WelcomeTechnicianPage);
