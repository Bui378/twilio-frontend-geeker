import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Layout } from 'antd';

import Quiz from './quizSteps/Quiz';
import QuizResult from './quizSteps/QuizResult';

import Loader from '../../../../components/Loader';
import { useQuiz } from '../../../../context/quizContext';

const { Content } = Layout;
const softwareMap = {
  Excel: 2,
  'Quickbooks Online': 4,
  'Microsoft Word': 5,
  Word: 5,
  'Google Sheets': 6,
  'Excel VBA': 7,
  'Microsoft Office': 2,
  'IT Technical Support': 2,
  Quickbooks: 4,
};

function TestQuiz(props) {
  const { userInfo } = props;
  // const { onNext } = props;
  const { fetchQuiz, getQuiz } = useQuiz();

  const [quizData, setQuizData] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [resultOpen, setResultOpen] = useState([false, null]);

  const takeQuizHandler = async transData => {
    if (!transData.quizId) {
      return;
    }

    getQuiz(transData).then(getQuizRes => {
      setSubmissionData(getQuizRes.data);
    });
  };

  useEffect(() => {
    const courseId = softwareMap[Object.keys(userInfo?.technician?.experiences)[0]?.software?.name] || 2;
    fetchQuiz(courseId).then(quizArrRes => {
      if (quizArrRes.data.length > 0) {
        setQuizData({ ...quizArrRes.data[0] });
        const transData = {
          courseId,
          quizId: quizArrRes.data[0].id,
        };
        takeQuizHandler(transData);
      }
    });
  }, []);

  return (
    <Container>
      <Layout className="layout">
        <Content style={{ padding: '40px 50px', margin: '40px' }}>
          {quizData ? (
            <Quiz
              questions={
                submissionData && submissionData.questions
                  ? submissionData.questions
                  : []
              }
              quizStartTime={submissionData && submissionData.start_time}
              submissionId={submissionData && submissionData.submission_id}
              _id={submissionData && submissionData._id}
            />
          ) : (
            <Loader />
          )}
        </Content>
        {resultOpen[0] === true ? (
          <QuizResult resultOpen={resultOpen} setResultOpen={setResultOpen} />
        ) : (
          ''
        )}
      </Layout>
    </Container>
  );
}

TestQuiz.propTypes = {
  // onNext: PropTypes.func,
  userInfo: PropTypes.object,
};

TestQuiz.defaultProps = {
  // onNext: () => {},
  userInfo: {
    firstName: '',
    lastName: '',
    email: '',
    experience: {
      special: {},
      other: '',
      general: {
        freelancerProfiles: [],
        employmentProfiles: [],
        availableProfile: { employment: false, freelancer: false },
        otherLangList: [],
        englishLevel: 0,
        certifications: [],
        validOtherLang: true,
      },
    },
  },
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default TestQuiz;
