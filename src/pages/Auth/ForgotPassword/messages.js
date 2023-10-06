/*
 * ResetPasswordPage Messages
 *
 * This contains all the text for the ResetPasswordPage container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.LoginPage';

export const form = 'app.form.error';

export default defineMessages({
  email: {
    id: `${form}.email`,
    defaultMessage: 'Please input your E-mail.',
  },
  emailVail: {
    id: `${form}.emailVail`,
    defaultMessage: 'Check the format of the email you entered!',
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
  confirmRequest: {
    id: `${scope}.confirmRequest`,
    defaultMessage: 'Continue sending request to this email?',
  },
  forgotPassword : {
    id:`${scope}.login`,
    defaultMessage: 'Forgot Password',
  }
});
