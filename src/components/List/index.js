/**
 *
 * List
 *
 */

import styled from 'styled-components';
import * as Antd from 'antd';

const List = styled(Antd.List)`
  .ant-list-items {
    text-align: left;
  }

  .ant-pagination.mini .ant-pagination-prev .ant-pagination-item-link,
  .ant-pagination.mini .ant-pagination-next .ant-pagination-item-link {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media only screen and (max-width: 480px) {
    .ant-list-items {
      .ant-list-item {
        width: 100%;

        .ant-list-item-action {
          width: 100%;
          margin-top: 20px;
          padding-right: 16px;

          li {
            width: 100%;

            button {
              width: 100%;
            }
          }
        }
      }
    }
  }
`;

export default List;
