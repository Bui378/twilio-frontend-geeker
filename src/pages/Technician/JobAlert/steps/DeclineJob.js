import React, { useState } from 'react';
// import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import {Button} from 'react-bootstrap';
// import StepButton from '../../../../components/StepButton';
import Select from '../../../../components/common/Select';
import {useJob} from '../../../../context/jobContext';
const { Option } = Select;

function DeclineJob({ setStep, job,user_logged }) {
  console.log('user_logged>>>>>>>>> in DeclineJob',user_logged)
  const [reason, setReason] = useState('Needed to log off');
  // const history = useHistory();
  const { updateJob } = useJob();

  const onSubmit = async () => {
    try {
      console.log(">>>>>>job id >>>>>>>>>>>>",job)
      await updateJob(job.id, {$push:{tech_declined_ids:user_logged.technician.id } });
      await updateJob(job.id, { reasons: [...job.reasons, reason] });
      setStep(0)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container span={15}>
      <StepContainer>
        <NewJobContainer>
          <Div>
            <Row span={24} style={{ marginBottom: '30px' }}>
              <AlertTileBox>
                <Title>Please tell us why you declined?</Title>
              </AlertTileBox>
            </Row>
            <Row span={24}>
              <SelectStyled value={reason} onChange={e => setReason(e)}>
                <Option value="Needed to log off">Needed to log off</Option>
                <Option value="No time for me">No time for me</Option>
                <Option value="No available for me">No available for me</Option>
              </SelectStyled>
            </Row>
            <Row>
              <Col span={24}>
                <ButtonContainer span={24}>
                  <Button className="btn app-btn" onClick={onSubmit}><span></span>Done</Button>
                  <Button className="btn app-btn app-btn-light-blue" onClick={() => setStep(0)}><span></span>Cancel</Button>
                </ButtonContainer>
              </Col>
            </Row>
          </Div>
        </NewJobContainer>
      </StepContainer>
    </Container>
  );
}

const Div = styled.div`
  width: 100%;
`;

const AlertTileBox = styled.div`
    width:100%;
    display: flex;
    position: relative;
    img{
        position: absolute;
        left: 0;
        top: -3px;
        padding:4px 4px 4px 0px;
    }
}
`;
const Title = styled.p`
  margin-bottom: 0.5em;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
  font-size: 24px;
  line-height: 1.4;
`;
const ButtonContainer = styled(Col)`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;

  & .ant-btn{
    float:left;
    margin-left:0 !important;
  }
`;
/*const DeclineButton = styled.button`
  height: 60px;
  background: transparent;
  display: flex;
  font-weight: bold;
  border-radius: 10px;
  padding: 0px 40px;
  line-height: 60px;
  border: 0px;
  font-size: 18px;
  curser: pointer;
  color: #464646;
  float:left;
  cursor:pointer;
`;*/
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
  padding: 60px;
  box-shadow: 0px 15px 50px 0px #d5d5d566;
  flex: 1;
`;
const StepContainer = styled.div`
  width: 80%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const SelectStyled = styled(Select)`
  width: 100%;
  margin-bottom: 30px;
`;

export default DeclineJob;
