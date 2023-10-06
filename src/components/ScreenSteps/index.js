import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ScreenSteps = props => {
  const { stepsContent } = props;
  return (
    <StepContainer>
      <StepsContent>{stepsContent}</StepsContent>
      
    </StepContainer>
  );
};

ScreenSteps.propTypes = {
  stepsContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

ScreenSteps.defaultProps = {
  stepsContent: '',
};

const StepContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StepsContent = styled.div`
  margin-top: 0vh;
  text-align: center;
`;

export default ScreenSteps;
