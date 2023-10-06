/**
 *
 * FormItem
 *
 */

import * as Antd from 'antd';
import { Form } from 'formik-antd';
import styled from 'styled-components';

const FormItem = styled(Antd.Form.Item)`
  text-align: left;
  
  .ant-col-24.ant-form-item-label {
    padding: 0;
  }
  .ant-row .ant-form-item {
    margin-bottom :10px !important;
  }
  .ant-form-item-label > label.ant-form-item-required::before {
    display: none;
  }

  .ant-form-item-label {
    display: flex;
    align-items: center;
    padding: 0;
    // padding-bottom: 10px;
  }
  
  .ant-form-item-label > label {
    font-size: 15px;
    // font-weight: bold;
    font-weight: 400;
    padding: 0;
    margin-bottom: 5px;
    // color: rgba(0, 0, 0, 0.65);
    font-size: 15px;
    color: #708390;
  }
  .ant-input {
    height: 50px;
    border-radius: 10px;
  }
  .ant-input-affix-wrapper-lg {
    padding: 0 0px;
    border-radius: 10px;
  }
  .ant-form-item-control-input-content {
    display: flex;
    justify-content: space-between;
  }

  @media only screen and (max-width: 600px) {
    width: 100%;
  }

  @media only screen and (min-width: 600px) {
    width: 100%;
  }

  @media only screen and (min-width: 768px) {
    width: 100%;
  }
`;

export default FormItem;

export const FormikFormItem = styled(Form.Item)`
  text-align: left;

  .ant-form-item-label > label.ant-form-item-required::before {
    display: none;
  }

  .ant-form-item-label > label {
    font-size: 18px;
    color: rgba(0, 0, 0, 0.65);
  }

  .ant-form-item-control-input-content {
    display: flex;
    justify-content: space-between;
  }

  @media only screen and (max-width: 600px) {
    width: 100%;
  }

  @media only screen and (min-width: 600px) {
    width: 350px;
  }

  @media only screen and (min-width: 768px) {
    min-width: 450px;
  }
`;
