import styled from 'styled-components';
import * as Antd from 'antd';

const IconButton = styled(Antd.Button)`
  border: none !important;
  color: white !important;
  background: none !important;
  padding: 0px !important;
  box-shadow: none !important;
  &:focus,
  &:hover,
  &:active &:focus:active {
  border: none !important;
  background: none !important;
  box-shadow: none !important;
  background-image: none !important;
  -webkit-box-shadow: none !important;
  outline: 0 !important;
  }
  ::after {
  display: none !important;
  }
  .anticon {
      font-size: 28px;
      color: white;
    }
`;

export default IconButton;
