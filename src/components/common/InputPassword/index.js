import styled from 'styled-components';
import { Input } from 'antd';

const InputPassword = styled(Input.Password)`
  height: 50px;
  .ant-input {
    height: 100%;
  }

  &.ant-form-item-has-error .ant-input-affix-wrapper {
    &:focus {
      box-shadow: unset;
    }
  }
`;

export default InputPassword;
