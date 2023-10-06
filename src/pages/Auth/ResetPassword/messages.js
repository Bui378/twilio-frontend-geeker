import { defineMessages } from 'react-intl';

export const scope = 'app.containers.LoginPage';

export const form = 'app.form.error';

export default defineMessages({
  btnReset: {
    id: `${scope}.btnReset`,
    defaultMessage: 'Reset Password',
  },
  btnLogin: {
    id: `${scope}.login`,
    defaultMessage: 'Log In',
  },
  needAnAccount: {
    id: `${scope}.needAnAccount`,
    defaultMessage: 'Need an Account?',
  },
  register: {
    id: `${scope}.register`,
    defaultMessage: 'Register',
  },
  loading: {
    id: `${scope}.loading`,
    defaultMessage: 'loading',
  },
  notValidToken: {
    id: `${scope}.notValidToken`,
    defaultMessage: 'Token is already expired',
  },
});
