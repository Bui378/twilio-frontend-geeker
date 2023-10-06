import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Row, Col, Typography, Modal, Space,
} from 'antd';
import {Button} from "react-bootstrap";
import { Link } from 'react-router-dom';
import ItemLabel from '../../../../../components/ItemLabel';
import CheckBox from '../../../../../components/common/CheckBox';
// import StepButton from '../../../../../components/StepButton';
import InputNumber from '../../../../../components/common/InputNumber';
import TechImages from '../../../../../components/TechImages';
import Box from '../../../../../components/common/Box';
import * as SoftwareService from '../../../../../api/software.api';
const { Text } = Typography;
function Agreement(props) {
  const { user, setTechProfile, techProfile } = props;
  const [rates, setRates] = useState({});
  console.log("user in agreement :: ",user)
  const { technician: { expertise = [] } = {} } = user;

  const handleAgreement = () => {
    setTechProfile(prev => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        complete: true,
        rates,
      },
    }));
  };

  return (
    <Container>
      <Label>YOUR RATES & TIERS</Label>
      <Row>
        {expertise.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box display="flex" key={index} width="50%" marginTop={30}>
             {  item.software_id 
              ?
                <SoftwareTabs item={item} /> 
             :
              <></> }
          </Box>
        ))}
        <LicenseeText>
          The Licensee may permit its employees to use the Asset for the
          purposes described in Item 8, provided that the Licensee takes all
          necessary steps and imposes the necessary conditions to ensure that
          all employees using the Asset do not commercialize or disclose the
          contents of it to any third person, or use it other than in accordance
          with the terms of this Agreement. The Licensee acknowledges and agrees
          that neither Licensor nor its board members, officers, employees or
          agents, will be liable for any loss or damage arising out of or
          resulting from Licensor’s provision of the Asset under this Agreement,
          or any use of the Asset by the Licensee or its employees; and Licensee
          hereby releases Licensor to the fullest extent from any such
          liability, loss, damage or claim.
        </LicenseeText>
        <Link to="/full-agreement">
          <Label> Read Full Agreement Here</Label>
        </Link>
        <LicenseeCheckContainer span={24}>
          <CheckBox
            onChange={e => {
              setTechProfile(prev => ({
                ...prev,
                agreement: {
                  ...prev.agreement,
                  acceptTerms: e.target.checked,
                  complete: e.target.checked ? prev.agreement.complete : false,
                },
              }));
            }}
          >
            I accept Terms and Conditions
          </CheckBox>
        </LicenseeCheckContainer>
        <Box display="flex" justifyContent="flex-end" width="100%" marginTop={30}>
          <Button
            disabled={!techProfile.agreement.acceptTerms}
            onClick={handleAgreement}
            className="btn app-btn"
          >
            <span></span>
            Accept
          </Button>
        </Box>
      </Row>
    </Container>
  );
}

const SpecialItems = props => {
  const {
    itemIndex, image, experience, expertise, setRates, rates,
  } = props;
  const [modalView, setModalView] = useState(false);
  const ratesCloned = JSON.parse(JSON.stringify(rates));
  const softwareName = experience?.software?.name;

  const handleChangeRate = value => {
    if (!ratesCloned[softwareName]) {
      ratesCloned[softwareName] = {
        [expertise?.expertise?.name]: {
          price: value,
        },
      };
    } else if (!ratesCloned[softwareName][expertise?.expertise?.name]) {
      ratesCloned[softwareName] = {
        ...ratesCloned[softwareName],
        [expertise?.expertise?.name]: {
          price: value,
        },
      };
    } else {
      ratesCloned[softwareName][expertise?.expertise?.name].price = value;
    }
  };

  return (
    <SoftwareRightContainer>
      <RoundNumber>{itemIndex + 1}</RoundNumber>
      <AmountContainer>
        <Amount>
          $
          {(rates && rates[softwareName]
            && rates[softwareName][expertise?.expertise?.name]
            && rates[softwareName][expertise?.expertise?.name].price)
            || 35}
        </Amount>
        <Mins>/15 mins</Mins>
      </AmountContainer>
      <EditImage src={image} onClick={() => setModalView(true)} />

      <Modal
        title={`${experience?.software?.name} (${expertise?.expertise?.name})`}
        centered
        visible={modalView}
        onOk={() => {
          setModalView(false);
          setRates(ratesCloned);
        }}
        onCancel={() => setModalView(false)}
      >
        <ItemLabel>Rate:</ItemLabel>
        <Space style={{ width: '100%' }} align="center">
          <InputNumber
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            style={{ width: '100%' }}
            defaultValue={
              rates[softwareName]
              && rates[softwareName][expertise?.expertise?.name]
              && rates[softwareName][expertise?.expertise?.name].price || 35
            }
            onChange={handleChangeRate}
          />
          <ItemLabel>/15 mins</ItemLabel>
        </Space>
      </Modal>
    </SoftwareRightContainer>
  );
};

SpecialItems.propTypes = {
  itemIndex: PropTypes.number,
  image: PropTypes.string,
  experience: PropTypes.string,
  software: PropTypes.string,
  setRates: PropTypes.func,
  rates: PropTypes.object,
};

SpecialItems.defaultProps = {
  itemIndex: '',
  image: '',
  experience: '',
  software: '',
  rates: {},
};

Agreement.propTypes = {
  user: PropTypes.object,
  setTechProfile: PropTypes.func,
  techProfile: PropTypes.object,
};

Agreement.defaultProps = {
  user: {},
  techProfile: {},
};



const SoftwareTabs = async (props)=>{
  console.log(props.item)

  const software = await SoftwareService.retrievesoftware(props.item.software_id)
  console.log()
  // software.then((res)=>{
  //   return <h1>{res.name}</h1>
  // })
  
   // <SoftwareImage
   //            src={TechImages[props.item.parent] || TechImages.otherSoftware}
   //          /> :  <SoftwareImage
   //          src={""}
   //        /> 
}

const Label = styled(ItemLabel)`
  font-weight: bold;
  color: #868383;
`;
const LicenseeText = styled(ItemLabel)`
  margin-top: 50px;
  line-height: 30px;
`;
const Amount = styled(Text)`
  font-size: 23px;
  font-weight: bold;
`;
const LicenseeCheckContainer = styled(Col)`
  margin-top: 30px;
`;
const Mins = styled(Text)`
  font-size: 16px;
`;
const AmountContainer = styled.div`
  display: flex;
  align-items: baseline;
  margin-left: 20px;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const SoftwareImage = styled.img`
  width: 50px;
  height: 50px;
`;

const EditImage = styled.img`
  width: 20px;
  height: 20px;
  margin-left: 30px;
  cursor: pointer;
`;

const SoftwareRightContainer = styled.div`
  display: flex;
  margin-left: 40px;
  align-items: center;
  width: 100%;
  margin-bottom: 30px;
`;
const RoundNumber = styled(Text)`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #d0d0d0;
  display: flex;
  margin: 0;
  justify-content: center;
  align-items: center;
  font-weight: bold;
`;

export default Agreement;
