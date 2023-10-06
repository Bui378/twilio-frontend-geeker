import React, { useEffect, useState } from 'react';
import { Table } from 'antd';

const columns = [
  { title: 'Title', dataIndex: 'title', key: 'name' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  { title: 'Address', dataIndex: 'address', key: 'address' },
  {
    title: 'Action',
    dataIndex: '',
    key: 'x',
    render: row => (
      <a href={row.html_url} target="_blank" rel="noopener noreferrer">
        Take Quiz
      </a>
    ),
  },
];

export default function QuizzesTable() {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch('http://localhost:3600/quizzes', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      const response = await result.json();
      console.log(response);

      if (Array.isArray(response) && response.length > 0) {
        const newData = response.map(res => res.data.quiz);

        setTableData([newData[0]]);
      }
    })();
  }, []);

  return <Table columns={columns} dataSource={tableData} />;
}
