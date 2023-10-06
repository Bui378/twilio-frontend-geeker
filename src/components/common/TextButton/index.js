import styled from 'styled-components';
import * as Antd from 'antd';
import COLORS from '../../../constants/color';

const TextButton = styled(Antd.Button)`
  marginRight: 20px;
  background: transparent !important;
  border: none !important;
  color: ${(props) => props.color} !important;
  box-shadow: none !important;
  &:hover {
    opacity: 0.8;
  }
  &:focus {
    outline: none !important;
  }
  @media (max-width: 576px) {
    marginRight: 0;
  }
`;

TextButton.defaultProps = {
  color: COLORS.white,
};

export default TextButton;
