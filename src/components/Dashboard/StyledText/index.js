import Styled from 'styled-components';
import { Typography } from 'antd';

const { Text } = Typography;
const StyledText = Styled(Text)`
  color:${p => p.color} !important;
  opacity:${p => p.opacity};
  text-decoration:${p => p.decoration};
  font-weight:${p => p.weight} !important;
  margin:${p => p.margin} !important;
  padding:${p => p.padding} !important;
  letter-spacing:${p => p.spacing} !important;
  font-size:${p => p.size} !important;
  line-height:${p => p.line}!important
`;

export default StyledText;
