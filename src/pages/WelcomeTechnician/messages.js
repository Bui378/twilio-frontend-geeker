import { defineMessages } from 'react-intl';

export const scope = 'app.containers.WelcomeTechnicianPage';
export const form = 'app.form.error';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the WelcomeTechnicianPage container!',
  },
  welcome: {
    id: `${scope}.welcome`,
    defaultMessage:
      'This is a bunch of welcome text and some instructions for new technicians. They must fill in the following detail to finalize their account and start taking jobs.',
  },
  updateW9: {
    id: `${scope}.updateW9`,
    defaultMessage: 'Upload your w9 form',
  },
  uploadPhoto: {
    id: `${scope}.uploadPhoto`,
    defaultMessage: 'Upload photo of drivers license',
  },
  getStart: {
    id: `${scope}.getStart`,
    defaultMessage: 'Get start',
  },
  bankAccount: {
    id: `${form}.bankAccount`,
    defaultMessage: 'Please input your bank account.',
  },
  nameAccount: {
    id: `${form}.nameAccount`,
    defaultMessage: 'Please input your name on account.',
  },
  photoDOL: {
    id: `${form}.photoDOL`,
    defaultMessage: 'Please upload your photo of drivers license.',
  },
  w9File: {
    id: `${form}.w9File`,
    defaultMessage: 'Please upload your w9 form.',
  },
});
