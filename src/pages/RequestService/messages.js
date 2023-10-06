/*
 * RequestServicePage Messages
 *
 * This contains all the text for the LoginPage component.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.RequestServicePage';
export const form = 'app.form.error';

export default defineMessages({
  typeService: {
    id: `${form}.typeService`,
    defaultMessage: 'Please select Type of Service!',
  },
  problem: {
    id: `${form}.problem`,
    defaultMessage: 'Please select Problem you are Having!',
  },
  typeServicePlaceholder: {
    id: `${scope}.typeServicePlaceholder`,
    defaultMessage: 'Select Type of Service',
  },
  problemPlaceholder: {
    id: `${scope}.problemPlaceholder`,
    defaultMessage: 'Select Problem you are Having',
  },
  btnSendRequest: {
    id: `${scope}.sendRequest`,
    defaultMessage: 'Request Service',
  },
  description: {
    id: `${scope}.description`,
    defaultMessage: 'Need more description?',
  },
});
