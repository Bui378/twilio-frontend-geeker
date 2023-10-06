import Styled from 'styled-components';
import { Layout } from 'antd';

const { Sider } = Layout;

const Siders = Styled(Sider)`
  background-color:white !important;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  padding:${p => p.padding};
  .ant-layout-sider-children{
      width:100%
  }
`;

export default Siders;
