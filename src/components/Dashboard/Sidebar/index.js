import React, { useCallback } from 'react';
import { Modal } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/authContext';
import StyledTitle from '../StyledTitle';
import Box from '../../common/Box';

function Sidebar() {
  const { logout } = useAuth();

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

  return (
    <>
      <Box
        display="flex"
        borderBottom="2px solid #efefef"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        paddingBottom={20}
      >
        <Box display="flex" alignItems="center">
          <BellOutlined style={{ fontSize: '25px' }} />
          <UserOutlined style={{ fontSize: '25px', marginLeft: '30px' }} />
        </Box>
        <StyledTitle
          margin="0"
          level={4}
          size="15px"
          strong
          onClick={Logout}
          style={{ cursor: 'pointer' }}
        >
          Logout
        </StyledTitle>
      </Box>
      <StyledTitle
        margin="30px 0 0 0"
        width="100%"
        align="center"
        level={3}
        weight="600"
      >
        Profile summary will go here ...
      </StyledTitle>
    </>
  );
}

export default Sidebar;
