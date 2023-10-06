/**
 *
 * Layout
 *
 */

import styled from 'styled-components';
import * as Antd from 'antd';

const Layout = styled(Antd.Layout)`
  height: 100%;
  background-color: ${(props) => props.type === "Dark" ? props.bg : ""} !important;
  text-align: center;
  color:${(props) => props.type === "Dark" ? "white" : ""} !important;
  .items-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .ant-divider-horizontal {
    &.ant-divider-with-text::before,
    &.ant-divider-with-text::after {
      top: unset;
    }
  }

  .mobile-center {
    @media only screen and (max-width: 768px) {
      height: calc(100vh - 220px);
    }
  }

  .ant-steps-horizontal:not(.ant-steps-label-vertical) .ant-steps-item {
    padding-left: 0px;
  }

  .form-label {
    font-size: 18px;
    color: rgba(0, 0, 0, 0.65);
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }

  .space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
  }
`;

Layout.defaultProps = {
  type: "light",
  color: "white"
};

export default Layout;

export const LayoutMax = styled(Layout)`
  &.ant-layout {
    background: #FFFFFF 0% 0% no-repeat padding-box;
    box-shadow: -2px -2px 3px #FFFFFF;
    border-radius: 10px;
    opacity: 1;
    
    };
  }

  @media only screen and (min-width: 1200px) {
    height: 100%;
  }

  @media only screen and (min-width: 768px) {
    height: 100%;
  }
`;
