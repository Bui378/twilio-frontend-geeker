import { defineMessages } from 'react-intl';

export const scope = 'app.containers.ServiceRatePage';
export const form = 'app.form.error';

export default defineMessages({
  rateTitle: {
    id: `${form}.rateTitle`,
    defaultMessage: 'Service is Completed.',
  },
  rateSubTitle: {
    id: `${form}.rateSubTitle`,
    defaultMessage: 'Please rate your Technician!',
  },
  receiveRecording: {
    id: `${scope}.receiveRecording`,
    defaultMessage: 'Receive a recording of your call ($10 fee)',
  },
  btnRateService: {
    id: `${scope}.rateService`,
    defaultMessage: 'Done',
  },
});
