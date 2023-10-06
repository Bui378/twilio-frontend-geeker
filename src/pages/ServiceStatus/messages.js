/*
 * ServiceStatusPage Messages
 *
 * This contains all the text for the ServiceStatusPage container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.ServiceStatusPage';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the ServiceStatusPage container!',
  },
  btnChoose: {
    id: `${scope}.btnChoose`,
    defaultMessage: 'Choose',
  },
  name: {
    id: `${scope}.name`,
    defaultMessage: 'Name',
  },
  timeComplete: {
    id: `${scope}.timeComplete`,
    defaultMessage: 'Time Complete',
  },
  btnCancelRequest: {
    id: `${scope}.btnCancelRequest`,
    defaultMessage: 'Cancel Request',
  },
  acceptTerms: {
    id: `${scope}.acceptTerms`,
    defaultMessage: 'Accept Terms and Conditions',
  },
  messageCancel: {
    id: `${scope}.messageCancel`,
    defaultMessage: 'Do you cancel request?',
  },
  yes: {
    id: `${scope}.yes`,
    defaultMessage: 'Yes',
  },
  no: {
    id: `${scope}.no`,
    defaultMessage: 'No',
  },
});
