import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import * as DOM from 'react-router-dom';

const Header = ({ link }) => (
  <HeaderWrapper>
    <Col span={24} align="middle">
      <Link to={link}>
        <Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
      </Link>
    </Col>
    <Link to={link}>
      <H1>Tech startup</H1>
    </Link>
  </HeaderWrapper>
);

const HeaderWrapper = styled(Row)`
  width: 100%;
  padding: 30px 40px;
  justify-content: center;
  // justify-content: flex-start;
  // position: absolute;
  z-index: 1;
`;

const Link = styled(DOM.Link)`
  font-size: 16px;
`;

const H1 = styled.h1`
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 600;
  margin: 0px;
`;

Header.propTypes = {
  link: PropTypes.string,
};

const Image = styled.img`
  display: block;
  width: 74px;
  padding-bottom:25px;
`;

export default Header;
