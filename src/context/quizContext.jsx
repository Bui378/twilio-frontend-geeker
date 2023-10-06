import React, { useState } from 'react';
// import { useHistory } from 'react-router';
import * as QuizApi from '../api/quiz.api';
import { openNotificationWithIcon } from '../utils';

const QuizContext = React.createContext({});

function QuizProvider(props) {
  const [isLoading, setIsLoading] = useState(false);

  async function fetchQuiz(courseId) {
    try {
      setIsLoading(true);
      const res = await QuizApi.FetchQuiz(courseId);
      setIsLoading(false);
      return res;
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Quiz does not exist.');
    }
  }

  async function getQuiz(data) {
    try {
      const res = await QuizApi.GetQuiz(data);
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }

  async function submitQuiz(data) {
    try {
      const res = await QuizApi.SubmitQuiz(data);
      return res;
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Failed to update job.');
    }
  }

  async function getQuizResult(data) {
    try {
      const res = await QuizApi.GetQuizResult(data);
      return res;
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Failed to update job.');
    }
  }

  return (
    <QuizContext.Provider
      value={{
        isLoading,
        fetchQuiz,
        getQuiz,
        submitQuiz,
        getQuizResult,
      }}
      {...props}
    />
  );
}

function useQuiz() {
  const context = React.useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

export { QuizProvider, useQuiz };
