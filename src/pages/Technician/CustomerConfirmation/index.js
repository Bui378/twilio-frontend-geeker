import React from 'react';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import StepButton from '../../../components/StepButton';
import Box from '../../../components/common/Box';

const { Text } = Typography;

function CustomerConfirmation() {
  return (
    <div className="w-85">
      <Container span={15}>
        <StepContainer>
          <NewJobContainer>
            <Div>
              <Row style={{ textAlign: 'center' }}>
                <Title
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    marginBottom: '20px',
                  }}
                >
                  You are connected with the customer
                </Title>
              </Row>
              <Row>
                <SubTitle
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    marginBottom: '20px',
                  }}
                >
                  Our system will connect you and your tech by calling
                  {' '}
                </SubTitle>
              </Row>
              <Row>
                <Col
                  span={12}
                  style={{
                    display: 'block',
                    textAlign: '-webkit-right',
                  }}
                >
                  <Title
                    style={{
                      float: 'right',
                      width: '100%',
                      marginBottom: '20px',
                      fontWeight: '500',
                    }}
                  >
                    +1 201-555-555
                  </Title>
                </Col>
                <Col
                  span={8}
                  style={{
                    display: 'block',
                    textAlign: '-webkit-center',
                  }}
                >
                  <TextHeader2>Ext:</TextHeader2>
                  <ExtTitle> 105 </ExtTitle>
                </Col>
              </Row>
              <Box display="flex" justifyContent="center" alignItems="center">
                <StepButton>Dial Number</StepButton>
              </Box>
            </Div>
          </NewJobContainer>
        </StepContainer>
      </Container>
    </div>
  );
}

CustomerConfirmation.defaultProps = {
  userInfo: {},
  setTechProfile: () => {},
  techProfile: {},
};

const Div = styled.div`
  width: 100%;
`;

const Title = styled.p`
  margin-bottom: 0.5em;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
  font-size: 26px;
  padding-bottom: 22px;
  line-height: 1.4;
`;
const ExtTitle = styled.span`
  margin-bottom: 0.5em;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  font-size: 26px;
  padding-bottom: 22px;
  line-height: 1.4;
`;
const SubTitle = styled.p`
  margin-bottom: 0.5em;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 300;
  font-size: 22px;
  line-height: 1.4;
`;

const TextHeader2 = styled(Text)`
  font-size: 26px;
  font-weight: 400;
  margin-bottom: 30px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NewJobContainer = styled.div`
  background: #fff;
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  margin-top: 50px;
  align-items: flex-start;
  padding: 55px;
  box-shadow: 0px 15px 50px 0px #d5d5d566;
  flex: 1;
`;

const StepContainer = styled.div`
  width: 47%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default CustomerConfirmation;
