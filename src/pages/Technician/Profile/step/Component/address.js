import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Form } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import messages from '../../messages';
import ItemLabel from '../../../../../components/ItemLabel';
// import StepButton from '../../../../../components/StepButton';
import AuthInput from '../../../../../components/AuthLayout/Input';
import FormItem from '../../../../../components/FormItem';
import CheckBox from '../../../../../components/common/CheckBox';
import { openNotificationWithIcon } from '../../../../../utils';
import UploadFile from './upload';
// import Box from '../../../../../components/common/Box';
import { useUser } from '../../../../../context/useContext';
import * as TechnicianApi from '../../../../../api/technician.api';
import {
  CitySelect,
  CountrySelect,
  StateSelect,
  LanguageSelect,
  GetCountries,
  GetState,
  GetCity,
  GetLanguages,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

function ConfirmAddress(props) {
  // const [initialData, setInitialData] = useState({});
  const confirmRef = useRef();

  const { setTechProfile, techProfile } = props;
  const { user } = useUser();
  const [addressLine1, setAddressLine1] = useState(user.technician.profile.confirmId.address1 ? user.technician.profile.confirmId.address1 : "")
  const [addressLine2, setAddressLine2] = useState(user.technician.profile.confirmId.address2 ? user.technician.profile.confirmId.address2 : "")
  const [zipcode, setZipcode] = useState( user.technician.profile.confirmId.zip ? user.technician.profile.confirmId.zip : "")
  const [city, setCity] = useState(user.technician.profile.confirmId.cityObject ? user.technician.profile.confirmId.cityObject.name : "")
  const [cityObject, setCityObject] = useState(user.technician.profile.confirmId.cityObject ? user.technician.profile.confirmId.cityObject : {})
  const [state, setState] = useState(user.technician.profile.confirmId.stateObject ? user.technician.profile.confirmId.stateObject.name : "")
  const [stateObject, setStateObject] = useState(user.technician.profile.confirmId.stateObject ? user.technician.profile.confirmId.stateObject : {})
  const [country, setCountry] = useState(user.technician.profile.confirmId.countryObject ? user.technician.profile.confirmId.countryObject.name : "")
  const [countryObject, setCountryObject] = useState(user.technician.profile.confirmId.countryObject ? user.technician.profile.confirmId.countryObject : {})
  const [countryid, setCountryid] = useState(user.technician.profile.confirmId.countryObject ? user.technician.profile.confirmId.countryObject.id : 0);
  const [stateid, setstateid] = useState(user.technician.profile.confirmId.stateObject ? user.technician.profile.confirmId.stateObject.id : 0);

  useEffect(()=>{
    console.log("My conosle for checking values", {addressLine1, addressLine2, country, state, city, zipcode})
  },[addressLine1, addressLine2, country, state, city, zipcode])

  useEffect(() => {
    if (user.technician.profile.confirmId) {
      confirmRef.current.setFieldsValue(user.technician.profile.confirmId);
      // setInitialData(user.technician.profile.confirmId);
    }

    const temptechProfile = { ...techProfile };
    temptechProfile.confirmId.complete = true;
    setTechProfile(temptechProfile);

  }, []);

  const handleComplete = e => {

    if(addressLine1 === ""){
      openNotificationWithIcon('error','Error','Please provide your address to submit data.')
      return
    }
    
    if(country === ""){
      openNotificationWithIcon('error','Error','Please enter your country to submit data.')
      return
    }

    const tempVal = { ...e, 
                      imageUrl: user.technician.profile.confirmId.imageUrl,
                      address1 : addressLine1,
                      address2 : addressLine2,
                      city : city,
                      cityObject : cityObject,
                      zip : zipcode,
                      state : state,
                      stateObject : stateObject,
                      country : country,
                      countryObject : countryObject
                    };
    console.log('tempVal>>>>>>>>>>>>>>>>>>',tempVal)
    TechnicianApi.updateTechnician(user.technician.id, { profileImage: false, confirmId: { ...tempVal } });
    setTechProfile(prev => ({
      ...prev,
      confirmId: {
        ...prev.confirmId,
        ...e,
        complete:
          // !!techProfile.confirmId.confirmed && !!techProfile.confirmId.imageUrl,
          !!techProfile.confirmId.address1,
      },
    }));
    openNotificationWithIcon('success', 'Success', 'Information Submitted');
  };

  return (
    <Container>
      <ItemLabel>
        {`Please submit your address.
        This is for our records, and to ensure everything is in order.`}
      </ItemLabel>
      <Form onFinish={handleComplete} ref={confirmRef}>
        <FormContainer>
          <FormSection gutter={16}>
            <Col span={12} className="d-flex flex-column">
              <label className='mb-10'>Address Line 1 *</label>
              <input
                type="text"
                name="address"
                className='settings-address-input'
                onChange={(e)=>setAddressLine1(e.target.value.trim())}
                defaultValue={user.technician.profile.confirmId.address1}
              />
              {/* <ItemLabel>Your Address</ItemLabel>
              <FormItem
                name="address"
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage {...messages.address} />,
                  },
                ]}
              >
                <AuthInput
                  name="address"
                  size="large"
                  placeholder="Your Address"
                />
              </FormItem> */}
            </Col>
            <Col span={12} className="d-flex flex-column">
              <label className='mb-10'>Address Line 2</label>
              <input
                type="text"
                className='settings-address-input'
                onChange={(e)=>setAddressLine2(e.target.value.trim())}
                defaultValue={user.technician.profile.confirmId.address2}
              />
            </Col>
            <Col span={12} className="d-flex flex-column">
              <label className='mb-10'>Country *</label>
              <CountrySelect
                containerClassName="mb-24"
                inputClassName="country-select-input"
                onChange={(e) => {
                  setCountryid(e.id);
                  setCountry(e.name)
                  setCountryObject(e)
                  console.log("Country selected", e)
                }}
                name="country"
                placeHolder="Select Country"
                defaultValue={user.technician.profile.confirmId.countryObject ? user.technician.profile.confirmId.countryObject : ""}
              />
            </Col>
            <Col span={12} className="d-flex flex-column">
              <label className='mb-10'>State</label>
              <StateSelect
                containerClassName="mb-24"
                inputClassName="country-select-input"
                countryid={countryid}
                onChange={(e) => {
                  setstateid(e.id);
                  setState(e.name)
                  setStateObject(e)
                  console.log("State selected", e)
                }}
                name="state"
                placeHolder="Select State"
                defaultValue={user.technician.profile.confirmId.stateObject ? user.technician.profile.confirmId.stateObject : ""}
              />
            </Col>
            <Col span={12} className="d-flex flex-column">
              <label className='mb-10'>City</label>
              <CitySelect
                containerClassName="mb-24"
                inputClassName="country-select-input"
                countryid={countryid}
                stateid={stateid}
                onChange={(e) => {
                  setCity(e.name)
                  setCityObject(e)
                  console.log("City selected", e)
                }}
                name="city"
                placeHolder="Select City"
                defaultValue={user.technician.profile.confirmId.cityObject ? user.technician.profile.confirmId.cityObject : ""}
              />
            </Col>
            <Col span={12} className="d-flex flex-column">
              <label className='mb-10'>Zip</label>
              <input
                type="text"
                name='zip'
                className='settings-address-input'
                onChange={(e)=>setZipcode(e.target.value.trim())}
                defaultValue={user.technician.profile.confirmId.zip ? user.technician.profile.confirmId.zip : "" }
              />
            </Col>
          </FormSection>
            {/* <Col span={12}>
              <ItemLabel>City</ItemLabel>
              <FormItem
                name="city"
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage {...messages.city} />,
                  },
                ]}
              >
                <AuthInput name="city" size="large" placeholder="City" />
              </FormItem>
            </Col>
          <FormSection gutter={16}>
            <Col span={12}>
              <FormItem
                name="state"
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage {...messages.state} />,
                  },
                ]}
              >
                <AuthInput name="state" size="large" placeholder="State" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="zip"
                placeholder="ZIP"
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage {...messages.zip} />,
                  },
                ]}
              >
                <AuthInput name="zip" size="large" placeholder="ZIP" />
              </FormItem>
            </Col>
          </FormSection> */}
        </FormContainer>
        <Button type="submit" className="btn app-btn">
          <span />
          Save
        </Button>

      </Form>
    </Container>
  );
}

ConfirmAddress.propTypes = {
  setTechProfile: PropTypes.func,
  techProfile: PropTypes.object,
};

ConfirmAddress.defaultProps = {
  setTechProfile: () => {},
  techProfile: {},
};

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 30px;
`;
const FormSection = styled(Row)`
  width: 100%;
  margin: 20px;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const ConfirmContainer = styled.div`
  padding-top: 20px;
  padding-bottom: 30px;
`;
export default ConfirmAddress;
