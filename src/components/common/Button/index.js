import styled from 'styled-components';
import * as Antd from 'antd';
import COLORS from 'constants/color';

const Button = styled(Antd.Button)`
  margin: 10px 0 !important;
  padding-left: 40px !important;
  padding-right: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 20px !important;
  background: ${(props) => props.type === 'primary' ? COLORS.secondary : COLORS.white} !important;
  border-color: ${(props) => props.type === 'primary' ? COLORS.secondary : '#d9d9d9'} !important;
  color: ${(props) => props.type === 'primary' ? COLORS.white : COLORS.textColor} !important;
  font-family: Montserrat-Bold !important;
  &:active,
  &:focus,
  &:hover {
    color: ${(props) => props.type === 'primary' ? COLORS.white : COLORS.textColor} !important;
    background: ${(props) => props.type === 'primary' ? COLORS.secondary : COLORS.white} !important;
    border-color: ${(props) => props.type === 'primary' ? COLORS.secondary : COLORS.borderColor} !important;
  }

  @media only screen and (max-width: 400px) {
    width: 100%;
  }
`;

Button.defaultProps = {
  theme: {
    type: 'primary',
  },
};

export default Button;
