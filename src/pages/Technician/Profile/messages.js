import { defineMessages } from 'react-intl';

export const scope = 'app.containers.CompleteTechProfilePage';
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
  address: {
    id: `${form}.address`,
    defaultMessage: 'Please input your address.',
  },
  city: {
    id: `${form}.city`,
    defaultMessage: 'Please input your city.',
  },
  state: {
    id: `${form}.state`,
    defaultMessage: 'Please input your state.',
  },
  zip: {
    id: `${form}.zip`,
    defaultMessage: 'Please input your zip.',
  },
  phoneNumber: {
    id: `${form}.phoneNumber`,
    defaultMessage: 'Please input your Phone Number.',
  },
  dd: {
    id: `${form}.phoneNumber`,
    defaultMessage: 'Please input your Driver Licence Number.',
  },
  routingNumber: {
    id: `${form}.routingNumber`,
    defaultMessage: 'Please input your routing number.',
  },
  accountNumber: {
    id: `${form}.accountNumber`,
    defaultMessage: 'Please input your account number.',
  },
  profileDescription:{
    id: `${form}.profileDescription`,
    defaultMessage: 'Please input your profile description.', 
  },
  profileDescExceedsLimit:{
    id: `${form}.profileDescExceedsLimit`,
    defaultMessage: 'You can enter less than or equal to 800 characters.', 
  }
});
