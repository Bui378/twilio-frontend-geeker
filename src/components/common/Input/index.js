import styled from 'styled-components';
import * as Antd from 'antd';

const Input = styled(Antd.Input)`
  &.ant-input {
    height: 50px;
    border-radius: 10px;
    
    &:focus {
      box-shadow: unset;
    }
    &::placeholder {
      color: #999;
    }
  }
`;

export default Input;
