import styled from 'styled-components';
import * as Antd from 'antd';
import COLORS from 'constants/color';

const BorderButton = styled(Antd.Button)`
  min-height: 70px;
  margin-bottom: 15px;
  padding: 20px;
  img {
    height: 50px;
      
    @media only screen and (max-width: 900px) {
      height: 30px;
    }
  }
  border: 5px solid white !important;
  border-radius: 8px !important;
  background: ${(props) => props.color} !important;
  box-shadow: 0 0 10px #b4b4b4 !important;
  display: flex !important;
  justify-content: center;
  align-items: center;
  &:hover {
    outline: none !important;
    border-color: white !important;
    color: white !important;
    opacity: 0.8;
  }
`;

BorderButton.defaultProps = {
  color: COLORS.brown,
};

export default BorderButton;
