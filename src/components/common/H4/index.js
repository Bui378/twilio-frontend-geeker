import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';

const { Title } = Typography;

const H4 = ({ children }) => <H2Style level={4}>{children}</H2Style>;
const H2Style = styled(Title)`
  text-align: left;
`;

export default H4;
