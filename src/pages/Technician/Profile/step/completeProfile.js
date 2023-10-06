import { Row } from 'antd';
// import PropTypes from 'prop-types';
import React, {
  memo, useState,
} from 'react';
import styled from 'styled-components';
// import { Button } from 'react-bootstrap';
import Collapse from '../../../../components/Collapse';
// import StepButton from '../../../../components/StepButton';
// import { StepActionContainer } from './style';
// import Agreement from './Component/agreement';
import AlertPreference from './Component/alertPreferences';
import BankAccountInfo from './Component/bankAccountInfo';
import ConfirmId from './Component/confirmId';
import ConfirmAddress from './Component/address';
import ConfirmYourSchedule from './Component/ConfirmYourSchedule';
import ReviewGuide from './Component/reviewGuide';
import SystemRequirement from './Component/systemRequirement';
// import UploadFile from './Component/upload';
import EditResume from './Component/resume';
import UploadAvatar from './Component/uploadAvatar';
import ProfileDescription from './Component/ProfileDescription';
// import * as TechnicianApi from '../../../../api/technician.api';

// import { useUser } from '../../../../context/useContext';

/*const profileSectionMap = [
  {
    label: 'Upload Profile Photo',
    value: 'profileImage',
  },
  {
    label: 'Confirm your ID',
    value: 'confirmId',
  },
  {
    label: 'Bank Account Info',
    value: 'bankAccount',
  },
  {
    label: 'Confirm Your Schedule',
    value: 'schedule',
  },
  {
    label: 'System Requirements Test',
    value: 'systemRequirement',
  },
  {
    label: 'Set Your Alert Preferences',
    value: 'alertPreference',
  },
  {
    label: 'Review Guidlines and Best Practices',
    value: 'reviewGuide',
  },
];*/

function CompleteProfile(props) {
  // const { onNext } = props;
  // const { user } = useUser();

  const [techProfile, setTechProfile] = useState({
    profileImage: {
      complete: false,
    },
    profileDescription:{
      complete: false,
    },
    confirmId: {
      complete: false,
    },
    bankAccount: {
      complete: false,
    },
    schedule: {
      complete: false,
    },
    systemRequirement: {
      complete: false,
    },
    alertPreference: {
      complete: false,
    },
    reviewGuide: {
      complete: false,
    },
  });

  /*const openNotificationWithIcon = (type, header, message) => {
    notification[type]({
      message: header,
      description: message,
    });
  };*/

  /*const handleConfirm = useCallback(async () => {
    const uncompletedProfiles = [];
    let validateProfile = true;
    Object.keys(techProfile).forEach(item => {
      if (!techProfile[item].complete) {
        validateProfile = false;
        uncompletedProfiles.push(
          profileSectionMap.find(m => m.value === item).label,
        );
      }
    });
    if (validateProfile) {
      try {
        await TechnicianApi.updateTechnician(user?.technician?.id, techProfile);
        openNotificationWithIcon(
          'success',
          'Success',
          'Profile created successfully',
        );
        setTimeout(() => {
          onNext();
        }, 1000);
      } catch (e) {
        openNotificationWithIcon('error', 'Error', 'Failed create profile.');
      }
    } else {
      openNotificationWithIcon(
        'error',
        'The following steps are not completed:',
        <div>
          {uncompletedProfiles.map(item => (
            <div key={item}>
              {item}
              .
            </div>
          ))}
        </div>,
      );
    }
  }, [onNext, techProfile, user]);*/

  const profileSections = {
    'Choose Image Profile': {
      complete: techProfile.profileImage.complete,
      children: (
        <UploadAvatar
          setTechProfile={setTechProfile}
          techProfile={techProfile}
        />
      ),
    },
    'Profile Description': {
      complete: techProfile.profileDescription.complete,
      children: (
      <ProfileDescription
      setTechProfile={setTechProfile}
      techProfile={techProfile}
      />
       ),
    },
    
    'Confirm your ID': {
      complete: techProfile.confirmId.complete,
      children: (
        <ConfirmId setTechProfile={setTechProfile} techProfile={techProfile} />
      ),
    },
    'Confirm your Address': {
      complete: techProfile.confirmId.complete,
      children: (
        <ConfirmAddress setTechProfile={setTechProfile} techProfile={techProfile} />
      ),
    },
    'Bank Account Info': {
      complete: techProfile.bankAccount.complete,
      children: (
        <BankAccountInfo
          setTechProfile={setTechProfile}
          techProfile={techProfile}
        />
      ),
    },
    'Confirm Your Schedule': {
      complete: techProfile.schedule.complete,
      children: (
        <ConfirmYourSchedule
          setTechProfile={setTechProfile}
          techProfile={techProfile}
        />
      ),
    },
    'System Requirements Test': {
      complete: techProfile.systemRequirement.complete,
      children: (
        <SystemRequirement
          setTechProfile={setTechProfile}
          techProfile={techProfile}
        />
      ),
    },
    'Modify Alert Notifications': {
      complete: techProfile.alertPreference.complete,
      children: (
        <AlertPreference
          setTechProfile={setTechProfile}
          techProfile={techProfile}
        />
      ),
    },
    'Review Guidelines and Best Practices': {
      complete: techProfile.reviewGuide.complete,
      children: (
        <ReviewGuide
          setTechProfile={setTechProfile}
          techProfile={techProfile}
        />
      ),
    },
    'Your Resume': {
      complete: techProfile.resume != "",
      children: (
        <EditResume/>
      ),
    },
  };

  const initStep = step => {
    console.log("asd",step)
    const index = Object.keys(profileSections).indexOf(step);
    if (index === -1) return;

    const key = Object.keys(techProfile)[index];

    setTechProfile({
      ...techProfile,
      [key]: {
        completed: false,
      },
    });
  };

  return (
    <Container>
      <BodyContainer>
        {Object.keys(profileSections).map(item => (
          <Section key={item}>
           
            <Collapse
              defaultActiveKey={['1']}
              headerTitle={item}
              initStep={() => initStep(item)}
              complete = {profileSections[item].complete}
            >
              {profileSections[item].children}
            </Collapse>
          </Section>
        ))}
      </BodyContainer>
    </Container>
  );
}

const Container = styled.div`
  
`;

const BodyContainer = styled.div`
  
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px;
  flex: 1;
`;

const Section = styled(Row)`
  width: 100%;
  margin-bottom: 30px;
`;
CompleteProfile.propTypes = {
  // onNext: PropTypes.func,
  // onPrev: PropTypes.func,
};

export default memo(CompleteProfile);
