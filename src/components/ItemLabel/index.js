import styled from 'styled-components';
import { Typography } from 'antd';

const { Text } = Typography;

const ItemLabel = styled(Text)`
  margin-bottom: 10px;
  display: block;
  font-size: 15px;

  & .colorred{
    color:red
  }
`;

export default ItemLabel;
