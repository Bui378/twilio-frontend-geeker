import React, { useState, useEffect } from 'react';
import {
  Layout, Table, Tag, Button,
} from 'antd';
import PropTypes from 'prop-types';
import Styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import * as Antd from 'antd';
import { useAuth } from '../../../../../context/authContext';
import { useQuiz } from '../../../../../context/quizContext';

const columns = [
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
  },
  {
    title: 'Max Score',
    dataIndex: 'max_score',
    key: 'max_score',
  },
  {
    title: 'Percentage',
    dataIndex: 'percent',
    key: 'percent',
    render: percent => percent.toFixed(2),
  },
  {
    title: 'Submitted At',
    dataIndex: 'submitted_at',
    key: 'submitted_at',
  },
  {
    title: 'Grade',
    key: 'percent',
    dataIndex: 'percent',
    render: percent => {
      let color = '';
      let text = '';

      if (percent >= 80) {
        color = 'green';
        text = 'tier 2';
      } else if (percent >= 60 && percent < 80) {
        color = 'geekblue';
        text = 'tier 1';
      } else {
        color = 'volcano';
        text = 'failed';
      }

      return (
        <span>
          <Tag color={color} key={percent}>
            {text.toUpperCase()}
          </Tag>
        </span>
      );
    },
  },
  // {
  //   title: 'Action',
  //   key: 'action',
  //   render: (text, record) => (
  //     <Space size="middle">
  //       <a>Invite {record.name}</a>
  //       <a>Delete</a>
  //     </Space>
  //   ),
  // },
];

// const { Option } = Select;

export default function QuizResult({ _id, submissionId }) {
  const history = useHistory();
  const { logout } = useAuth();
  const { getQuizResult } = useQuiz();

  const [result, setResult] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = {
          _id,
          submissionId,
        };
        getQuizResult(data).then(submitResultRes => {
          setResult([submitResultRes.data]);
        });
      } catch (err) {
        Antd.notification.error({
          message: 'Error',
          description: err,
        });
      }
    };
    fetchResults();
  }, []);

  const onNextFunc = () => {
    const { percent } = result[0];
    if (percent > 80) {
      history.push('/dashboard');
    } else if (percent > 60) {
      logout();
    } else {
      logout();
    }
  };

  return (
    <QuizResultContainer>
      <Table columns={columns} dataSource={result} />
      <Button onClick={() => onNextFunc()}>Next</Button>
    </QuizResultContainer>
  );
}

QuizResult.protoTypes = {
  resultOpen: PropTypes.arrayOf(
    PropTypes.shape({
      quiz_id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      max_score: PropTypes.number.isRequired,
    }).isRequired,
  ),
  setResultOpen: PropTypes.func.isRequired,
};

const QuizResultContainer = Styled(Layout)`
margin: 20px 0;
padding: 20px;
`;
