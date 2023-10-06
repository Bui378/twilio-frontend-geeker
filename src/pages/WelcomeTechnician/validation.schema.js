import React from 'react';
import * as Yup from 'yup';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const validationSchema = Yup.object().shape({
  bankAccount: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.bankAccount} />),
  nameAccount: Yup.string()
    .trim()
    .nullable()
    .required(<FormattedMessage {...messages.nameAccount} />),
  photoDOL: Yup.array()
    .nullable()
    .required(<FormattedMessage {...messages.photoDOL} />),
  w9File: Yup.array()
    .nullable()
    .required(<FormattedMessage {...messages.w9File} />),
});

export default validationSchema;
