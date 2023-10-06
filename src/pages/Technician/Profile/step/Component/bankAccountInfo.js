import React,{useEffect,useState,useRef} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Form } from 'antd';
import { FormattedMessage } from 'react-intl';
import messages from '../../messages';
import ItemLabel from '../../../../../components/ItemLabel';
// import StepButton from '../../../../../components/StepButton';
import {Button} from "react-bootstrap";
import AuthInput from '../../../../../components/AuthLayout/Input';
import FormItem from '../../../../../components/FormItem';
// import Box from '../../../../../components/common/Box';
import * as TechnicianApi from '../../../../../api/technician.api';
import { openNotificationWithIcon } from '../../../../../utils';
import {useUser} from '../../../../../context/useContext';
function BankAccountInfo(props) {
  const { setTechProfile,techProfile } = props;
  const BankformRef = useRef()
  const [bankDetails,setBankDetails] = useState({});
  const {user} = useUser()
  const handleComplete = e => {
    console.log(e,">>>>>>")
    TechnicianApi.updateTechnician(user.technician.id,{profileImage:false,bankAccount:{...e}})
    setTechProfile(prev => ({

      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        ...e,
        complete: true,
      },
    }));

       openNotificationWithIcon("success","Success","Information Submitted")

  };




  useEffect(()=>{

    setBankDetails(user.technician.profile.bankAccount)
  },[])

  useEffect(()=>{
    BankformRef.current.setFieldsValue(bankDetails)
    // console.log("bankDetails ::: ",bankDetails)
    // console.log("condition :::: ",Object.keys(bankDetails).length > 0)
    if(bankDetails && Object.keys(bankDetails).length > 0){
      let temptechProfile = {...techProfile}
      temptechProfile['bankAccount']['complete'] = true
      setTechProfile(temptechProfile)
    }
     
  },[bankDetails])



  return (
    <Container>
      <Form onFinish={handleComplete} initialValues = {bankDetails} ref={BankformRef}>
        <FormContainer>
          <FormSection gutter={16}>
            <Col span={12}>
              <ItemLabel>Account Number</ItemLabel>
              <FormItem
                name="accountNumber"
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage {...messages.accountNumber} />,
                  },
                ]}
              >
                <AuthInput
                  name="accountNumber"
                  id="accountNumber"
                  size="large"
                  type="number"
                  placeholder="Account Number"
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <ItemLabel>Routing Number</ItemLabel>
              <FormItem
                name="routingNumber"
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage {...messages.routingNumber} />,
                  },
                ]}
              >
                <AuthInput
                  name="routingNumber"
                  id="routingNumber"
                  size="large"
                  type="number"
                  placeholder="Routing Number"
                />
              </FormItem>
            </Col>
             <Button type="submit" className="btn app-btn"><span></span>Save</Button>
          </FormSection>

          
            
          

        </FormContainer>
        
      </Form>
    </Container>
  );
}

BankAccountInfo.propTypes = {
  setTechProfile: PropTypes.func,
  techProfile: PropTypes.object,
};

BankAccountInfo.defaultProps = {
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
export default BankAccountInfo;
