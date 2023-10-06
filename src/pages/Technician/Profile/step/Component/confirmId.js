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

function ConfirmId(props) {
  // const [initialData, setInitialData] = useState({});
  const confirmRef = useRef();

  const { setTechProfile, techProfile } = props;
  const { user } = useUser();

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

    const tempVal = { ...e, 
                      imageUrl: user.technician.profile.confirmId.imageUrl,
                    };
    console.log('tempVal>>>>>>>>>>>>>>>>>>',tempVal)
    TechnicianApi.updateTechnician(user.technician.id, { profileImage: false, confirmId: { ...tempVal } });
    setTechProfile(prev => ({
      ...prev,
      confirmId: {
        ...prev.confirmId,
        ...e,
        complete:
          !!techProfile.confirmId.confirmed && !!techProfile.confirmId.imageUrl,
      },
    }));
    openNotificationWithIcon('success', 'Success', 'Information Submitted');
  };

  const handleChangeChecked = e => {
    const { checked } = e.target;
    setTechProfile(prev => ({
      ...prev,
      confirmId: {
        ...prev.confirmId,
        confirmed: checked,
      },
    }));
  };
  return (
    <Container>
      <ItemLabel>
        {`Please submit your ID.
        This is for our records, and to ensure everything is in order.`}
      </ItemLabel>
      <Form onFinish={handleComplete} ref={confirmRef}>
        <FormContainer>
          <FormSection gutter={16}>
            <Col span={12}>
              <ItemLabel>Your DD (Driver Licence Number)</ItemLabel>
              <FormItem
                name="DD"
                size="large"
                placeholder="Driver Licence Number"
              >
                <AuthInput
                  name="DD"
                  size="large"
                  placeholder="Driver Licence Number"
                />
              </FormItem>
            </Col>
          </FormSection>
        </FormContainer>
        <UploadFile
          title="Drag & Drop or Upload ID"
          description="Please upload front side of your driver licence or another ID document"
          type="confirmId"
          setTechProfile={setTechProfile}
          sectionName="confirmId"
        />
        <ConfirmContainer span={24}>
          <CheckBox onChange={handleChangeChecked}>
            I confirm that this is my valid ID document
          </CheckBox>
        </ConfirmContainer>
        <Button type="submit" className="btn app-btn">
          <span />
          Save
        </Button>

      </Form>
    </Container>
  );
}

ConfirmId.propTypes = {
  setTechProfile: PropTypes.func,
  techProfile: PropTypes.object,
};

ConfirmId.defaultProps = {
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
export default ConfirmId;
