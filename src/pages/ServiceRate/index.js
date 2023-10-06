import React, { memo, useCallback } from 'react';
import {
  Form, Rate, Checkbox, notification,
} from 'antd';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { LayoutMax } from '../../components/Layout';
import Header from '../../components/Header';
import FormItem from '../../components/FormItem';
import CustomButton from '../../components/AuthLayout/Button';
import messages from './messages';
import * as ServiceRateApi from '../../api/serviceRate.api';

const ServiceRatePage = () => {
  const history = useHistory();

  const onSubmit = useCallback(async (value) => {
    try {
      await ServiceRateApi.createServiceRate(value);
      history.push('/home');
    } catch (e) {
      notification.error({
        message: 'Error',
      });
    }
  }, [history]);

  return (
    <div className="w-85">
      <LayoutMax>
        <Header link="/" display />
        <LayoutMax.Content className="items-center">
          <Form className="items-center" onFinish={onSubmit} colon={false}>
            <h2>
              <FormattedMessage {...messages.rateTitle} />
            </h2>
            <p>
              <FormattedMessage {...messages.rateSubTitle} />
            </p>
            <FormItem name="rate" className="align-center">
              <Rate allowHalf defaultValue={0} />
            </FormItem>
            <FormItem name="recording">
              <Checkbox name="recording">
                <FormattedMessage {...messages.receiveRecording} />
              </Checkbox>
            </FormItem>
            <CustomButton
              type="primary"
              size="large"
              htmlType="submit"
              loading={false}
            >
              <FormattedMessage {...messages.btnRateService} />
            </CustomButton>
          </Form>
        </LayoutMax.Content>
      </LayoutMax>
    </div>
  );
};

ServiceRatePage.propTypes = {};

export default memo(ServiceRatePage);
