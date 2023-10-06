import styled from 'styled-components';
import * as Antd from 'antd';

const Select = styled(Antd.Select)`
  ${props => props.width && `width: ${props.width} !important;`}
  ${props => props.margin && `margin: ${props.margin} !important;`}
  .ant-select-selector {
    height: 45px !important;
    border-radius: ${p => (p.radius ? p.radius : '10px')} !important;
    background-color: ${p => (p.bg ? p.bg : 'white')} !important;
    align-items: center;
  }
  .ant-select-selection-item {
    display: flex;
  }
  .ant-select-selection-search {
    display: flex;
    align-items: center;
  }
  .ant-select-selection-placeholder {
    text-align: left;
  }
  .ant-select-selection-item-remove .anticon-close {
    vertical-align: 0;
  }
`;

export default Select;
