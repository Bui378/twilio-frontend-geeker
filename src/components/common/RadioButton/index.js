import styled from 'styled-components';
import * as Antd from 'antd';
import COLORS from '../../../constants/color';

const RadioButton = styled(Antd.Radio)`
  font-size: 16px !important;
  .ant-radio-checked .ant-radio-inner {
    border-color: ${COLORS.primary};
  }
  .ant-radio-checked::after {
    border: 1px solid ${COLORS.primary};
  }
  .ant-radio-inner::after {
    background-color: ${COLORS.primary};
  }
}
`;

export default RadioButton;
