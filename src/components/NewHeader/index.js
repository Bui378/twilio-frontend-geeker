import React from 'react';
import styled from 'styled-components';
import { Col, Row } from 'antd';
import { Link } from 'react-router-dom'

export default function Header({ link, display = false,linked_logo = true }) {
 
  const handleLogoLink = (e) => {
    if(link){
      window.localStorage.removeItem('CurrentStep')
      window.location.href = link;
    }else{
      window.location.href = '/dashboard';
    }
  }

  return (
    <Row align="middle" style={{ width: '100%', height: 'auto', marginTop: "20px", display:'flex' ,justifyContent:"center" }}>

      <Col align="center" md={6} xs={12}>
        { linked_logo &&  
          <Link to={() => false} onClick={handleLogoLink}>
            <Image className='geeker-logo' src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
          </Link>
        }

        { ! linked_logo &&  <Link to={() => false} style={{'cursor':'unset'}}> <Image className='geeker-logo' src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" /></Link>}
       </Col>
    </Row>
  );
}

const Image = styled.img`
  margin-top:2%;
  @media screen and (max-width: 763px) {
    width: 100%;
  }
`;
