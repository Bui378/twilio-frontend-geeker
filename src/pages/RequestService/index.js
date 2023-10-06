import React, {memo, useCallback, useEffect, useState} from 'react';
import { Form, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { LayoutMax } from '../../components/Layout';
import Header from '../../components/Header';
import FormItem from '../../components/FormItem';
import Input from '../../components/AuthLayout/Input';
import CustomButton from '../../components/AuthLayout/Button';
import * as TypeServiceApi from '../../api/typeService.api';
import * as DescriptionProblemApi from '../../api/descriptionProblems.api';
import * as RequestServiceApi from '../../api/requestService.api';

import messages from './messages';
import {openNotificationWithIcon} from '../../utils';

function RequestServicePage() {
  const history = useHistory();
  const [typeServices, setTypeServices] = useState([]);
  const [descriptionProblems, setDescriptionProblems] = useState([]);

  useEffect(() => {
    (async () => {
      const typeRes = await TypeServiceApi.getTypeServices();

      if (typeRes) {
        setTypeServices(typeRes.data);
      }

      const descriptionRes = await DescriptionProblemApi.getDescriptionProblems();

      if (descriptionRes) {
        setDescriptionProblems(descriptionRes.data);
      }
    })();
  }, []);

  const onSubmit = useCallback(async values => {
    try {
      await RequestServiceApi.createRequestService(values);

      history.push('/home');
      openNotificationWithIcon('success', 'Success', '')
    } catch (err) {
      openNotificationWithIcon('error', 'Error', '')
    }
  }, []);

  return (
    <div className="w-85">
      <LayoutMax>
        <Header link="/" display />
        <LayoutMax.Content className="items-center">
          <Form className="items-center" onFinish={onSubmit} colon={false}>
            <FormItem
              name="typeService"
              rules={[
                {
                  required: true,
                  message: <FormattedMessage {...messages.typeService} />,
                },
              ]}
            >
              <Select
                size="large"
                name="typeService"
                optionFilterProp="children"
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase())
                  >= 0}
                showSearch
                placeholder={
                  <FormattedMessage {...messages.typeServicePlaceholder} />
                }
              >
                {
                  typeServices.map(item => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))
                }
              </Select>
            </FormItem>
            <FormItem
              name="descriptionProblem"
              rules={[
                {
                  required: true,
                  message: <FormattedMessage {...messages.problem} />,
                },
              ]}
            >
              <Select
                size="large"
                name="descriptionProblem"
                optionFilterProp="children"
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase())
                  >= 0}
                showSearch
                placeholder={
                  <FormattedMessage {...messages.problemPlaceholder} />
                }
              >
                {
                  descriptionProblems.map(item => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))
                }
              </Select>
            </FormItem>
            <FormItem
              label={<FormattedMessage {...messages.description} />}
              name="otherDescription"
              labelCol={{ span: 24 }}
            >
              <Input.TextArea
                name="otherDescription"
                autoSize={{ minRows: 6 }}
              />
            </FormItem>
            <CustomButton
              type="primary"
              size="large"
              htmlType="submit"
              loading={false}
            >
              <FormattedMessage {...messages.btnSendRequest} />
            </CustomButton>
          </Form>
        </LayoutMax.Content>
      </LayoutMax>
    </div>
  );
}

RequestServicePage.propTypes = {};

export default memo(RequestServicePage);
