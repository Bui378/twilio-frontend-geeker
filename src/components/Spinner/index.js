import React from 'react';
import * as Antd from 'antd';
import styled from 'styled-components';

const Spinner = () => (
  <Container>
    <Antd.Spin />
  </Container>
);

const Container = styled.div`
  margin: 20px 0;
  margin-bottom: 20px;
  padding: 30px 50px;
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
`;

const FullPageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.05);
`;

export const PageLoader = () => (
  <FullPageContainer>
    <Antd.Spin />
  </FullPageContainer>
);

export default Spinner;
