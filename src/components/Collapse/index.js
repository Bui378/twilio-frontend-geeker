import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as Antd from 'antd';
import PropTypes from 'prop-types';
import PlusIcon from '../../assets/images/collapse_plus.png';
import MinIcon from '../../assets/images/collapse_min.png';
// import CompleteIcon from '../../assets/images/complete_icon.png';
// import NotCompleteIcon from '../../assets/images/not_complete_icon.png';
import editIcon from  '../../assets/images/edit.png';              
const { Panel } = Antd.Collapse;
// const { Text } = Antd.Typography;
const Collapse = props => {
  const {
    children, headerTitle, complete, initStep,
  } = props;
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen && complete) {
      initStep();
    }
  }, [isOpen]);

  useEffect(() => {
    if (complete) {
      setIsOpen(false);
    }
  }, [complete]);

  return (
    <CollapseContainer
      bordered={false}
      defaultActiveKey={headerTitle}
      activeKey={isOpen ? headerTitle : 0}
      expandIcon={({ isActive }) => (
        <CollapseIcon src={isActive ? MinIcon : PlusIcon} alt="icon" />
      )}
      onChange={() => setIsOpen(!isOpen)}
    >
      <Panel key={headerTitle} header={headerTitle} extra={genExtra(complete)}>
        {children}
      </Panel>
    </CollapseContainer>
  );
};

const genExtra = complete => (
  <ExtraContainer style={{ marginRight: complete ? 32 : 0 }}>
    <ExtraIcon src={editIcon} />
  </ExtraContainer>
);

Collapse.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element.isRequired,
  ]),
  headerTitle: PropTypes.string,
  complete: PropTypes.bool,
  initStep: PropTypes.func.isRequired,
};

Collapse.defaultProps = {
  headerTitle: '',
  complete: false,
};

const CollapseContainer = styled(Antd.Collapse)`
  width: 100% !important;
  text-align: left !important;
  background: #fff !important;
  .ant-collapse-item {
    border: none !important;
  }
  .ant-collapse-content {
    padding-left: 10px !important;
    padding-bottom: 20px !important;
  }
  .ant-collapse-item > .ant-collapse-header {
    padding: 25px !important;
    margin: 0 !important;
    padding-left: 80px !important;
  }
  .site-collapse-custom-panel {
    margin-bottom: 24px !important;
    overflow: hidden !important;
    background: #fff !important;
    border: 0px !important;
    border-radius: 2px !important;
  }
  .ant-collapse-borderless {
    background: #fff !important;
  }
  .ant-collapse-header {
    margin-bottom: 0.5em !important;
    color: rgba(0, 0, 0, 0.85) !important;
    font-weight: 600 !important;
    font-size: 20px !important;
    line-height: 1.4 !important;
  }
`;

const CollapseIcon = styled.img`
  width: 30px;
  height: 30px;
  margin-left: 10px;
  opacity: 0.5;
`;

const ExtraContainer = styled.div`
  display: flex;
  align-items: center;
`;
const ExtraIcon = styled.img`
  width: 20px;
  height: 20px;
`;
export default Collapse;
