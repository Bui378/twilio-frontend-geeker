import React from 'react';
import loadable from 'utils/loadable';
import Loader from '../../../../../../components/Loader';

export default loadable(() => import('./index'), {
  fallback: <Loader />,
});
