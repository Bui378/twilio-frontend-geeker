import styled from 'styled-components';
import * as Antd from 'antd';

const Input = styled(Antd.Input)`
  &.ant-input {
    height: 50px;
    
    border-radius: ${props => props.border_radius ? props.border_radius :"10px"}
    border:${props => props.border ? props.border :""}
    border-bottom :${props => props.borderbottom ? props.borderbottom : ""}
    background:transparent;
    &:focus {
      box-shadow: unset;
    }
    &::placeholder {
      color: #999;
    }
  }
`;

export default Input;
