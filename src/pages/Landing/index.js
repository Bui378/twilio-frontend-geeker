import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';

import Header from '../../components/Header';
import { LayoutMax } from '../../components/Layout';

const Landing = () => (
  <div className="w-85">
    <Helmet>
      <title>Landing Page</title>
      <meta name="description" content="Description of LandingPage" />
    </Helmet>
    <CustomLayout>
      <Header link="/" />
      <CustomLayout.Content className="items-center">
        {/* <Paragraph>
            <Title>
              <FormattedMessage {...messages.welcome} />
            </Title>
            <br />
            <Title>
              <FormattedMessage {...messages.title} />
            </Title>
          </Paragraph>
          <Link to="/login">
            <Button type="primary" size="large">
              <FormattedMessage {...messages.button} />
            </Button>
          </Link> */}
      </CustomLayout.Content>
    </CustomLayout>
  </div>
);

const CustomLayout = styled(LayoutMax)`
  .content {
    padding: 100px 0;

    @media only screen and (max-width: 600px) {
      padding: 50px 0;
    }

    @media only screen and (min-width: 600px) {
      padding: 50px 0;
    }
  }
`;

Landing.propTypes = {};

export default Landing;
