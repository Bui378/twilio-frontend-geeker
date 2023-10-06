import { defineMessages } from 'react-intl';

export const scope = 'app.containers.SearchTechPage';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the SearchTechPage container!',
  },
  searching: {
    id: `${scope}.searching`,
    defaultMessage: 'SEARCHING',
  },
  continue: {
    id: `${scope}.continue`,
    defaultMessage: 'Continue',
  },
  btnCancelRequest: {
    id: `${scope}.btnCancelRequest`,
    defaultMessage: 'Cancel Request',
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
