import Styled from 'styled-components';
import { Typography } from 'antd';

const { Title } = Typography;
const StyledTitle = Styled(Title)`
  color:${p => p.color} !important;
  opacity:${p => p.opacity};
  font-weight:${p => p.weight} !important;
  margin:${p => p.margin} !important;
  letter-spacing:${p => p.spacing} !important;
  font-size:${p => p.size} !important;
  width:${p => p.width} !important;
  text-align:${p => p.align} !important;
  line-height:${p => p.line}!important
`;

export default StyledTitle;
