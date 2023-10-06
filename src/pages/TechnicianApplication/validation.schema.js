import React from 'react';
import * as Yup from 'yup';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const validation1 = Yup.object().shape({
  name: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.name} />),
  email: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.email} />),
  phone: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.phone} />),
  city: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.city} />),
  state: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.state} />),
  specialities: Yup.array()
    .nullable()
    .required(<FormattedMessage {...messages.specialities} />),
});

const validation2 = Yup.object().shape({
  stateId: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.stateId} />),
  education: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.education} />),
  certificate: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.certificate} />),
  expertise: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.expertise} />),
});

const validationSchema = [validation1, validation2];

export default validationSchema;
