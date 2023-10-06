import React from 'react';
import PropTypes from 'prop-types';

const DashboardSteps = props => {
  const { stepsContent } = props;
  return (
    <>
      {stepsContent}
    </>
  );
};

DashboardSteps.propTypes = {
  stepsContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

DashboardSteps.defaultProps = {
  stepsContent: '',
};

export default DashboardSteps;
