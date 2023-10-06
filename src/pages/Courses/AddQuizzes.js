/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Layout, Form, Input, Button, Modal, Switch,
} from 'antd';

import Styled from 'styled-components';

// const { Option } = Select;

export default function AddQuizzes({ visible, setVisible }) {
  const [questions, setQuestions] = useState([{ id: 0 }]);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const onFinish = values => {
    console.log(values);

    (async () => {
      const result = await fetch('http://localhost:3600/quizzes', {
        method: 'POST',
        body: JSON.stringify(values.quiz),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const response = await result.json();

      console.log(response);
      setVisible(false);
    })();
  };

  const addNewQuestionHandler = () => {
    setQuestions([...questions, { id: questions.length }]);
  };

  return (
    <Modal
      title="Add New Quiz"
      centered
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      width={1000}
    >
      <Form {...layout} name="nest-messages" onFinish={onFinish}>
        <Form.Item name={['quiz', 'title']} label="title">
          <Input />
        </Form.Item>
        {/* <Form.Item name={['quiz', 'description']} label="description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name={['quiz', 'quiz_type']} label="quiz_type">
          <Select placeholder="Select quiz_type">
            <Option value="practice_quiz">practice_quiz</Option>
            <Option value="assignment">assignment</Option>
          </Select>
        </Form.Item>
        <Form.Item name={['quiz', 'due_at']} label="due_at">
          <DatePicker />
        </Form.Item>
        <Form.Item name={['quiz', 'lock_at']} label="lock_at">
          <DatePicker />
        </Form.Item>
        <Form.Item name={['quiz', 'unlock_at']} label="unlock_at">
          <DatePicker />
        </Form.Item> */}
        {questions.map(question => (
          <NewQuestion>
            <Form.Item
              name={['quiz', 'questions', question.id, 'question_name']}
              label="question_name"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['quiz', 'questions', question.id, 'question_text']}
              label="question_text"
            >
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ span: 16, offset: 8 }}>Answers</Form.Item>

            <Form.Item
              name={[
                'quiz',
                'questions',
                question.id,
                'answers',
                0,
                'answer_text',
              ]}
              label="answer_text"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={[
                'quiz',
                'questions',
                question.id,
                'answers',
                0,
                'is_correct',
              ]}
              label="is_correct"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={[
                'quiz',
                'questions',
                question.id,
                'answers',
                1,
                'answer_text',
              ]}
              label="answer_text"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name={[
                'quiz',
                'questions',
                question.id,
                'answers',
                1,
                'is_correct',
              ]}
              label="is_correct"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name={[
                'quiz',
                'questions',
                question.id,
                'answers',
                2,
                'answer_text',
              ]}
              label="answer_text"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={[
                'quiz',
                'questions',
                question.id,
                'answers',
                2,
                'is_correct',
              ]}
              label="is_correct"
            >
              <Switch />
            </Form.Item>
          </NewQuestion>
        ))}
        <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
          <Button onClick={addNewQuestionHandler}>Add new Question</Button>
        </Form.Item>

        <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Create Quiz
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

const NewQuestion = Styled(Layout)`
margin: 20px 0;
padding: 20px;
`;
