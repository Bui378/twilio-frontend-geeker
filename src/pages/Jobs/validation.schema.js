import React from 'react';
import * as Yup from 'yup';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const validationSchema = Yup.object().shape({
  timeComplete: Yup.string()
    .trim()
    .nullable()
    .when('action', {
      is: val => val === 'accept',
      then: Yup.string()
        .trim()
        .matches(/^\d+$/, {
          message: <FormattedMessage {...messages.timeCompleteVail} />,
          excludeEmptyString: true,
        })
        .nullable()
        .required(<FormattedMessage {...messages.timeComplete} />),
      otherwise: Yup.string().notRequired(),
    }),
});

export default validationSchema;
