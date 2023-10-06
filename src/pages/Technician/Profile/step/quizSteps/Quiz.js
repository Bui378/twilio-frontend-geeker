import React, { useEffect, useState, useCallback } from 'react';
import Styled from 'styled-components';
import {
  Card,
  Layout,
  Row,
  Col,
  Space,
  Radio,
  Typography,
  Divider,
  Button,
} from 'antd';
import ReactHtmlParser from 'react-html-parser';

import QuizResult from './QuizResult';
import { useQuiz } from '../../../../../context/quizContext';

export default function Quiz({
  questions, quizStartTime, _id, submissionId,
}) {
  const { submitQuiz } = useQuiz();
  const [radioValue, setRadioValue] = useState(0);
  const [quesStartTime, setQuesStartTime] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (quizStartTime) {
      setCurrentQuestionIndex(0);
      setQuesStartTime(quizStartTime);
      setShowResult(false);
    }
  }, [quizStartTime]);

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    setShowContinue(false);
  };

  const submitQuestion = async () => {
    const data = {
      _id,
      submissionId,
      questionId: questions[currentQuestionIndex].id,
      answerId: radioValue,
    };
    submitQuiz(data).then(submitRes => {
      nextQuestion();
      setQuesStartTime(submitRes.data.start_time);
    });
  };

  // eslint-disable-next-line no-shadow
  const Timer = ({ nextQuestion }) => {
    const calculateTimeLeft = useCallback(() => {
      const difference = +new Date(quesStartTime + 2 * 60 * 1000) - +new Date(Date.now());

      let timeLeftObj = {};
      if (difference > 0) {
        timeLeftObj = {
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        setQuesStartTime(Date.now());
        setTimeout(() => nextQuestion(), 500);
      }

      return timeLeftObj;
    });

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearTimeout(timer);
    }, [calculateTimeLeft]);

    return (
      <h5>
        {timeLeft.minutes}
        {' '}
        mins,
        {timeLeft.seconds}
        {' '}
        sec
        {' '}
      </h5>
    );
  };

  const onRadioChange = e => {
    setRadioValue(e.target.value);
    setShowContinue(true);
  };

  return (
    <Row>
      {showResult ? (
        <Col span={24}>
          <div style={{ textAlign: 'center' }}>
            <h2>Quiz Result</h2>
            <Divider />

            <QuizResult _id={_id} submissionId={submissionId} />
          </div>
        </Col>
      ) : (
        <Col span={24} style={{ marginBottom: '20px' }}>
          {questions && questions.length > 0 ? (
            <Card style={{ textAlign: 'left' }}>
              <Typography>
                <div style={{ textAlign: 'right' }}>
                  {quesStartTime ? <Timer nextQuestion={nextQuestion} /> : ''}
                </div>
                <h4>{`Question ${currentQuestionIndex + 1}`}</h4>
                <p className="quiz_question_text">
                  {ReactHtmlParser(
                    questions[currentQuestionIndex].question_text,
                  )}
                </p>
              </Typography>
              <Divider />
              <Radio.Group onChange={onRadioChange} value={radioValue}>
                <Space direction="vertical">
                  {questions[currentQuestionIndex].answers.map(
                    (answer, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Radio key={index} value={answer.id}>
                        {answer.text}
                      </Radio>
                    ),
                  )}
                </Space>
              </Radio.Group>
              <BottomSection>
                <Button disabled={!showContinue} onClick={submitQuestion}>
                  Continue
                </Button>
              </BottomSection>
            </Card>
          ) : (
            ''
          )}
        </Col>
      )}
    </Row>
  );
}

const BottomSection = Styled(Layout)`
display: flex;
justify-content: right;
align-items: flex-end;
background: transparent;
`;
