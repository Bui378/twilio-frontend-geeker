import React, { useState } from 'react';
import {
  Layout, Button, Row, Col, PageHeader,
} from 'antd';
import Styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import AddQuizzes from './AddQuizzes';
import QuizzesTable from './QuizzesTable';

const { Content } = Layout;

const Courses = () => {
  const [visible, setVisible] = useState(false);

  const history = useHistory();

  return (
    <React.Fragment key="courses">
      <Layout>
        <MainLayout>
          <PageHeader
            className="site-page-header"
            onBack={() => history.push('/')}
            title="Quizzes"
          >
            <Button onClick={() => setVisible(true)}>Add Quizzes</Button>
            <AddQuizzes visible={visible} setVisible={setVisible} />
          </PageHeader>
          ,
          <Content
            className="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
            }}
          >
            <Row>
              <Col span={24}>
                <QuizzesTable />
              </Col>
            </Row>
          </Content>
        </MainLayout>
      </Layout>
    </React.Fragment>
  );
};

export default Courses;

const MainLayout = Styled(Layout)`
background-color: #f9f9f9 !important;
min-height: 100vh;
width:100%;
`;
