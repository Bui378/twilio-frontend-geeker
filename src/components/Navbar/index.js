import React from 'react';
import { useHistory } from 'react-router-dom';
import { PageHeader, Row } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import StepButton from '../StepButton';
const Navbar = () => {
  const history = useHistory();
  return (
    <PageHeader
      title=""
      className="site-page-header"
      onBack={() => null}
      backIcon={<MenuOutlined />}
      extra={[
        <Row key="buttons">
          <StepButton key="btn-post-job" onClick={() => history.push('/customer/profile-setup')}>
            + Ask for help now
          </StepButton>
        </Row>,
      ]}
    />
  );
};

export default Navbar;
