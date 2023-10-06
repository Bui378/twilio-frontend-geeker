import styled from 'styled-components';
import { Input } from 'antd';

const TextArea = styled(Input.TextArea)`
  &.ant-input {
    min-height: 80px !important;
    border-radius: 10px;
    &:focus {
      box-shadow: unset;
    }
    &::placeholder {
      color: #999;
    }
  }
`;

export default TextArea;
