import styled from 'styled-components';
import * as Antd from 'antd';
import COLORS from 'constants/color';

const RoundButton = styled(Antd.Button)`
  background: ${(props) => props.bgcolor} !important;
  padding: 6px 15px !important;
  border-radius: 30px !important;
  height: fit-content !important;
  color: ${(props) => props.color}!important;
  font-family: "Montserrat-Bold";
  font-size: 18px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center;
  margin-top: 25px !important;
  border: none !important;
  .anticon {
  font-size: 28px;
    color: white;
  }
  &:hover {
    opacity: 0.8;
  }

  @media(max-width: 576px) {
    font-size: 14px !important;
  }
`;

RoundButton.defaultProps = {
  bgcolor: COLORS.default,
  color: COLORS.white,
};

export default RoundButton;
