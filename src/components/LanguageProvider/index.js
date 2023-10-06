import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

const LanguageProvider = (props) => {
  return (
    <IntlProvider locale="en" messages={props.messages.en}>
      {React.Children.only(props.children)}
    </IntlProvider>
  );
};

LanguageProvider.propTypes = {
  messages: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
};

export default LanguageProvider;
