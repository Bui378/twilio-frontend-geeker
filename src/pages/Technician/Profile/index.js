import React, { useEffect, useState } from 'react';
import { Col, Tabs, Tab } from 'react-bootstrap';
import { useUser } from '../../../context/useContext';

import ScreenSteps from '../../../components/ScreenSteps';
import ProfileReview from './step/profileReview';
import CompleteProfile from './step/completeProfile';
import WatchVideo from './step/watchVideo';
import TestQuiz from './step/testQuiz';
// import LeftSidebar from '../../../components/Sidebar/LeftSidebar';
import Loader from '../../../components/Loader';

const TechnicianProfile = ({estimatedWaitTime, setEstimatedWaitTime}) => {
  const { user, refetch, isLoading } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const onNext = () => {
    if (currentStep === 3) {
      // history.push('./dashboard');
    }
    setCurrentStep(currentStep + 1);
    setShowLoader(false);
  };
  const onPrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [{
    title: 'profileReview',
    content: <ProfileReview user={user} estimatedWaitTime={estimatedWaitTime} setEstimatedWaitTime={setEstimatedWaitTime} />,
  },
  {
    title: 'completeProfile',
    content: (
      <CompleteProfile onPrev={onPrev} onNext={onNext} userInfo={user} />
    ),
  },
  {
    title: 'watchVideo',
    content: <WatchVideo onNext={onNext} onPrev={onPrev} />,
  },
  {
    title: 'testQuiz',
    content: <TestQuiz onNext={onNext} onPrev={onPrev} userInfo={user} />,
  }];

  useEffect(() => {
    refetch();
  }, []);

  if (!user || isLoading) return (<></>);

  return (

        <>
          
            <Loader height="100%" className={(showLoader ? 'loader-outer' : 'd-none')} />

            <Col md="12" className="py-4 mt-1">
              <Col xs="12" className="p-0">
                <Tabs defaultActiveKey="Manage Account" id="uncontrolled-tab-example" className="mb-3 tabs-outer">
                  <Tab eventKey="Manage Account" title="Manage Account" className="col-md-12 p-0">
                    <ScreenSteps stepsContent={steps[0].content} />
                  </Tab>
                  <Tab eventKey="Profile Settings" title="Profile Settings" className="col-md-12 p-0">
                    <ScreenSteps stepsContent={steps[1].content} />
                  </Tab>
                  {/*<Tab eventKey="Payment Settings" title="Payment Settings" className="col-md-12 p-0">
                    <h3 className="text-center">Coming soon...</h3>
                  </Tab>*/}
                </Tabs>

              </Col>
            </Col>
        </>
  );
};

export default TechnicianProfile;
