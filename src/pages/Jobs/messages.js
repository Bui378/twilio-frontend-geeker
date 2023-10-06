/*
 * JobListPage Messages
 *
 * This contains all the text for the JobListPage container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.JobListPage';
export const form = 'app.form.error';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the JobListPage container!',
  },
  emailLabel: {
    id: `${scope}.emailLabel`,
    defaultMessage: 'Email',
  },
  typeLabel: {
    id: `${scope}.typeLabel`,
    defaultMessage: 'Type',
  },
  descriptionLabel: {
    id: `${scope}.descriptionLabel`,
    defaultMessage: 'Description',
  },
  acceptJob: {
    id: `${scope}.acceptJob`,
    defaultMessage: 'Accept Job',
  },
  declineJob: {
    id: `${scope}.declineJob`,
    defaultMessage: 'Decline Job',
  },
  timeLabel: {
    id: `${scope}.timeLabel`,
    defaultMessage: 'Time to do the job',
  },
  minute: {
    id: `${scope}.minute`,
    defaultMessage: 'MINUTE',
  },
  typeService: {
    id: `${scope}.typeService`,
    defaultMessage: 'Type of Service',
  },
  descriptionProblem: {
    id: `${scope}.descriptionProblem`,
    defaultMessage: 'Description of Problem',
  },
  btnCancel: {
    id: `${scope}.btnCancel`,
    defaultMessage: 'Cancel',
  },
  btnSave: {
    id: `${scope}.btnSave`,
    defaultMessage: 'Save',
  },
  btnMore: {
    id: `${scope}.btnMore`,
    defaultMessage: 'View More',
  },
  timeComplete: {
    id: `${form}.timeComplete`,
    defaultMessage: 'Please input your time to complete!',
  },
  timeCompleteVail: {
    id: `${form}.timeCompleteVail`,
    defaultMessage: 'Time to complete should be number.',
  },
});
