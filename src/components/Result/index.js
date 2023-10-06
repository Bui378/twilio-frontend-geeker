import styled from 'styled-components';
import * as Antd from 'antd';

const Result = styled(Antd.Result)`
  @media only screen and (max-width: 480px) {
    &.ant-result {
      padding: 0;

      .ant-result-subtitle {
        margin-top: 10px;
      }

      .ant-result-content {
        padding: 10px;
      }

      .ant-result-extra {
        .ant-btn-primary {
          margin-bottom: 15px;
        }

        button {
          width: 100%;
        }
      }
    }
  }
`;

export default Result;
