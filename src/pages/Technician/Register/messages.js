import { defineMessages } from 'react-intl';

export const scope = 'app.containers.expertise';

export const form = 'app.form.error';

export default defineMessages({
  email: {
    id: `${form}.email`,
    defaultMessage: 'Please input your E-mail.',
  },
  emailVail: {
    id: `${form}.emailVail`,
    defaultMessage: 'Check the format of the email you entered.',
  },
  firstName: {
    id: `${form}.firstName`,
    defaultMessage: 'Please add your first name.',
  },
  lastName: {
    id: `${form}.lastName`,
    defaultMessage: 'Please add your last name.',
  },
  password: {
    id: `${form}.password`,
    defaultMessage: 'Please input your Password!',
  },
  btnFacebook: {
    id: `${scope}.signUpFacebook`,
    defaultMessage: 'Sign Up with Facebook',
  },
  btnGoogle: {
    id: `${scope}.signUpGoogle`,
    defaultMessage: 'Sign Up with Google',
  },
  btnCreateAccount: {
    id: `${scope}.btnCreateAccount`,
    defaultMessage: 'Create Account',
  },
  registered: {
    id: `${scope}.registered`,
    defaultMessage: 'Already Registered?',
  },
  login: {
    id: `${scope}.login`,
    defaultMessage: 'Login',
  },
  technicianRate: {
    id: `${form}.rate`,
    defaultMessage: 'Please add your rate.',
  },
});
