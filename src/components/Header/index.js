import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Modal, Menu, Dropdown, Space, Col, Row, Button } from 'antd';
import * as DOM from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import userPlaceholder from '../../assets/images/user_placeholder.png';
import { useAuth } from '../../context/authContext';
import { useUser } from '../../context/useContext';

export default function Header({ link, display = false, linked_logo = true }) {
  const { logout } = useAuth();
  const { user } = useUser();
  const profileLink = (user && user.userType === 'customer') ? '/customer/profile' : '/technician/profile';

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
      {user &&
        <Menu.Item key="0">
          <a href={profileLink}>View Profile</a>
        </Menu.Item>
      }
      {user && user.userType === 'technician' &&
        <Menu.Divider />
      }
      <Menu.Item key="1">
        <a onClick={Logout}>Logout</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Row align="middle" style={{ width: '100%', height: '130px' }}>

      <Col align="middle" span={24}>
        {linked_logo && <a href={link}>
          <Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
        </a>}

        {!linked_logo && <Link style={{ 'cursor': 'unset' }}><Image src={logo} alt="tetch" /></Link>}
      </Col>

      <Col align="right" span={18}>
        <div style={display ? {} : { display: 'none' }}>
          <Space wrap>
            <Dropdown overlay={menu}>
              <Button style={{ border: '0 none', cursor: 'pointer', 'marginTop': '20px', height: '45px', 'background': '#FFF', 'padding': '0 15px', 'width': '92px', 'borderRadius': '5px' }}>
                <Image src={userPlaceholder} alt="Menu" style={{ 'borderRadius': '50%', width: '35px', height: '35px', 'border': 'solid 3px #ccc', 'padding': '5px', 'float': 'left' }} />
                <span style={{ border: 'solid #CCC', borderWidth: '0 3px 3px 0', display: 'inline-block', padding: '3px', verticalAlign: 'middle', transform: 'rotate(45deg)', '-webkit-transform': 'rotate(45deg)', float: 'right', 'marginTop': '12px' }} />
              </Button>
            </Dropdown>
          </Space>
        </div>
      </Col>
    </Row>
  );
}

const Link = styled(DOM.Link)`
  font-size: 16px;
`;

const Image = styled.img`
  margin-top:2%;
`;
