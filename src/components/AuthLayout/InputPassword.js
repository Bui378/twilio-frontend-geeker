import styled from 'styled-components';
import { Input } from 'antd';

const InputPassword = styled(Input.Password)`

  &.ant-input-password {
    
     background-color:transparent;
    border-radius: ${props => props.border_radius ? props.border_radius :"10px"}
    border:${props => props.border ? props.border :""}
    border-bottom :${props => props.borderbottom ? props.borderbottom : ""}


  & .ant-input-suffix {
        margin-left: 122px;
  }
  




  &.ant-form-item-has-error .ant-input-affix-wrapper {
    &:focus {
      box-shadow: unset;
      
    }
  }
`;

export default InputPassword;
