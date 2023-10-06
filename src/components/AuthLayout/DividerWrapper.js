import styled from 'styled-components';

const DividerWrapper = styled.div`
  & .div-login{
    font-size:20px !important;
  }
  @media only screen and (max-width: 600px) {
    width: 100%;
  }

  @media only screen and (min-width: 600px) {
    width: 350px;
  }

  @media only screen and (min-width: 768px) {
    min-width: 450px;
  }

`;

export default DividerWrapper;
