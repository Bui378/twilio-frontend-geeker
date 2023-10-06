import styled from 'styled-components';
import * as Antd from 'antd';

const InputNumber = styled(Antd.InputNumber)`
  border-radius: 5px;
  .ant-input-number-input-wrap {
    height: 40px;
    align-items: center;
    display: flex;
    justify-content: center;
    input {
      text-align: center;
    }
  }
`;

export default InputNumber;
