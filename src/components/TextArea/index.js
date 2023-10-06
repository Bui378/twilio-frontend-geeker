import styled from 'styled-components';
import * as Antd from 'antd';

const TextArea = styled(Antd.Input.TextArea)`
  border-radius: 5px;
  padding: 15px;
  textarea.ant-input {
    line-height: 2 !important;
  }
`;

export default TextArea;
