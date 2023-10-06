import styled from 'styled-components';
import * as Antd from 'antd';

const Button = styled(Antd.Button)`
  min-width: 250px;
  margin: 10px 0;

  &.btn-fb {
    background: #4285f4;
    border-color: #4285f4;
    color: #fff;

    &:hover {
      color: #fff;
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }
`;

export default Button;
