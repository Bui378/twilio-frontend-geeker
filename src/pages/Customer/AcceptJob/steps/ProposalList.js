
import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Typography,Button } from 'antd';
import styled from 'styled-components';
// import moment from 'moment';
import { useHistory, useParams } from 'react-router';
import { getFullName } from '../../../../utils';
import StepButton from '../../../../components/StepButton';
import { useSocket } from '../../../../context/socketContext';
import ActionButton from '../../../../components/ActionButton';
import { List, message, Avatar, Spin } from 'antd';
import { PageHeader } from 'antd';
const ProposalList = ({ user,job,step,setStep})=>{
const [data,setData] = useState()

useEffect(()=>{
    const data = [
        {
          title: 'Sahil',
          description:"Python expert"
        },
        {
          title: 'Manibha',
          description:"Microsoft Expert"
        },
        {
          title: 'Karan',
          description:"Sheet expert"

        },
        {
          title: 'Karun',
          description:"Django expert"
        },
      ];
    setData(data)

},[])


    

    return (<>
    <Container span={15}>
    <PageHeader
        className="site-page-header"

        title={job.issueDescription}
    />
        <NewJobContainer>
        <List
             itemLayout="horizontal"
             dataSource={data}
             renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    
                    title={<a href="https://ant.design">{item.title}</a>}
                    description={item.description}
                  />
                  <ActionButton onClick={()=>{setStep(1)}}>Accept</ActionButton> 
                </List.Item>
              )}
        >

      </List>
    </NewJobContainer>
    </Container>
       
    </>)
}
const buttonContainer = styled.div`
display: flex;

`
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
  margin-top: 20px;
  padding: 60px;
  box-shadow: 0px 15px 50px 0px #d5d5d566;
  flex: 1;
`;
export default ProposalList