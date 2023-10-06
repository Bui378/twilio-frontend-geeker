import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function FetchQuiz(courseId) {
  return apiClient
    .get(`/test/quizzes/${courseId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function GetQuiz(data) {
  return apiClient
    .post('/test/quizzes/submissions', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function SubmitQuiz(data) {
  const {
    _id, submissionId, questionId, answerId,
  } = data;
  return apiClient
    .post('/test/quizzes/submit',
      {
        _id,
        submission_id: submissionId,
        question_id: questionId,
        answer_id: answerId,
      })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function GetQuizResult(data) {
  const { _id, submissionId } = data;
  return apiClient
    .post('/test/quizzes/submit/result',
      {
        _id,
        submission_id: submissionId,
      })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}
