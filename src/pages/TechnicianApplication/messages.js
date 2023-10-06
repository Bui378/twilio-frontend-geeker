import { defineMessages } from 'react-intl';

export const scope = 'app.containers.TechnicianApplicationPage';
export const form = 'app.form.error';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the TechnicianApplicationPage container.',
  },
  btnApply: {
    id: `${scope}.btnApply`,
    defaultMessage: 'Apply Now',
  },
  btnGoHome: {
    id: `${scope}.btnGoHome`,
    defaultMessage: 'Go to Home Page',
  },
  btnTryAgain: {
    id: `${scope}.btnTryAgain`,
    defaultMessage: 'Try Again',
  },
  titleError: {
    id: `${scope}.titleError`,
    defineMessages: 'The content you submitted has the following error:',
  },
  listError: {
    id: `${scope}.listError`,
    defineMessages: 'Request provider already exists',
  },
  first: {
    id: `${scope}.first`,
    defaultMessage: 'First',
  },
  second: {
    id: `${scope}.second`,
    defaultMessage: 'Second',
  },
  done: {
    id: `${scope}.done`,
    defaultMessage: 'Done',
  },
  successTitle: {
    id: `${scope}.successTitle`,
    defineMessages: 'Successfully sent the request to the admin.',
  },
  successSubTitle: {
    id: `${scope}.successSubTitle`,
    defineMessages: 'Please wait until the admin accepts your request.',
  },
  errorTitle: {
    id: `${scope}.errorTitle`,
    defineMessages: 'Submission Failed',
  },
  errorSubTitle: {
    id: `${scope}.errorSubTitle`,
    defineMessages:
      'Please check and modify the following information before resubmitting.',
  },
  name: {
    id: `${form}.name`,
    defaultMessage: 'Please input your Name.',
  },
  phone: {
    id: `${form}.phone`,
    defaultMessage: 'Please input your Phone.',
  },
  email: {
    id: `${form}.email`,
    defaultMessage: 'Please input your Email.',
  },
  emailVail: {
    id: `${form}.emailVail`,
    defaultMessage: 'The input is not valid E-mail.',
  },
  city: {
    id: `${form}.city`,
    defaultMessage: 'Please input your City.',
  },
  state: {
    id: `${form}.state`,
    defaultMessage: 'Please input your State.',
  },
  specialities: {
    id: `${form}.specialities`,
    defaultMessage: 'Please select your Specialities.',
  },
  stateId: {
    id: `${form}.stateId`,
    defaultMessage: 'Please input your State Id.',
  },
  education: {
    id: `${form}.education`,
    defaultMessage: 'Please input your education?',
  },
  certificate: {
    id: `${form}.certificate`,
    defaultMessage: 'Please choose certificate form your school?',
  },
  certificateLabel: {
    id: `${form}.specialitiesLabel`,
    defaultMessage: 'Do you have a certificate form your school?',
  },
  expertise: {
    id: `${form}.expertise`,
    defaultMessage: 'Please choose your expertise.',
  },
  expertiseLabel: {
    id: `${form}.expertiseLabel`,
    defaultMessage: 'Where did you get your expertise?',
  },
});
