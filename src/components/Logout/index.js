import React from 'react';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { setUserData } from '../../store/actions/auth.action';
import TextButton from '../common/TextButton';

const Logout = ({ color }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleLogOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('promo-code-details')
    dispatch(setUserData(null));
    history.push('/login');
  };

  return (
    <TextButton color={color} onClick={handleLogOut}>Logout</TextButton>
  );
};

Logout.defaultProps = {
  color: 'white',
};

Logout.propTypes = {
  color: PropTypes.string,
};

export default Logout;
