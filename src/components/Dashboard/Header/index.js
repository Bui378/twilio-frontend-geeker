import React, { useCallback } from 'react';
import style from 'styled-components';
import { useHistory } from 'react-router-dom';
import * as DOM from 'react-router-dom';
import {
  Layout, Row, Col, Modal, Menu, Dropdown, Space
} from 'antd';

import { Button } from 'react-bootstrap'
import Box from '../../common/Box';
import logo from '../../../assets/images/logo.png';
import userPlaceholder from '../../../assets/images/user_placeholder.png';
import { useAuth } from '../../../context/authContext';

const { Header } = Layout;
const Headers = style(Header)`
  background-color:#efefef !important;
  height:94px !important;
`;

function DashboardHeader({
  activeStatus, role, toggle, handleCheck,
}) {
  const { logout } = useAuth();
  const profileLink = (role === 'technician') ? '/technician/profile' : '/customer/profile';
  const menuWidth = (role === 'technician') ? 18 : 12;
  const Logout = useCallback(() => {
    Modal.confirm({
      title: 'Logout Now?',
      okText: 'Logout',
      cancelText: 'Cancel',
      onOk() {
        logout();
      },
    });
  }, [logout]);

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <a href='/dashboard'>Dashboard</a>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="0">
        <a href={profileLink}>View Profile</a>
      </Menu.Item>

      {role === 'technician' &&
        <Menu.Divider />
      }
      <Menu.Item key="1">
        <a onClick={Logout}>Logout</a>
      </Menu.Item>
    </Menu>
  );


  const history = useHistory();
  const error = () => {
    throw new Error("Custom Error");
  }
  return (
    <Headers className="site-layout-background">
      {error()}

      <Row align="middle" style={{ width: '100%', height: '100%' }}>
        <Col span={6}>
          <Link to='/'>
            <Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
          </Link>
        </Col>
        {role === 'customer' &&
          <Col span={6} align="middle" flex="auto">
            <Box display="flex" justifyContent="flex-start">
              <Button key="btn-post-job" href="/customer/profile-setup" onClick={() => history.push('/customer/profile-setup')} className="btn app-btn">
                <span></span>
                + Ask for help now
              </Button>
            </Box>
          </Col>
        }

        <Col align="right" span={menuWidth}>
          <Space wrap="true">
            <Dropdown overlay={menu}>
              <Button style={{ border: '0 none', cursor: 'pointer', 'marginTop': '20px', height: '45px', 'background': '#FFF', 'padding': '0 15px', 'width': '60px', 'borderRadius': '5px' }}>
                <Image src={userPlaceholder} alt="Menu" style={{ 'borderRadius': '50%', width: '35px', height: '35px', 'border': 'solid 3px #ccc', 'padding': '5px', 'float': 'left' }} />
                <span style={{ border: 'solid #CCC', borderWidth: '0 3px 3px 0', display: 'inline-block', padding: '3px', verticalAlign: 'middle', transform: 'rotate(45deg)', 'WebkitTransform': 'rotate(45deg)', float: 'right', 'marginTop': '12px' }} />
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

    </Headers>
  );
}

const Image = style.img`
  display: block;
  width: 74px;
`;

const Link = style(DOM.Link)`
  font-size: 16px;
`;

export default DashboardHeader;
