import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import { PlayCircleFilled } from '@ant-design/icons';
import ItemLabel from '../../../../../components/ItemLabel';
import CompleteIcon from '../../../../../assets/images/complete_icon.png';
import NotCompleteIcon from '../../../../../assets/images/not_complete_icon.png';
import VideoPopup from './videoPopup';
import {getVideos} from '../../../../../api/video.api';
import {useUser} from '../../../../../context/useContext';
const { Text } = Typography;

function ReviewGuide({ setTechProfile }) {
  const {user} = useUser()
  const [submitDetails,setSubmitDetails] = useState(false)
  const [guideLines, setGuideLines] = useState({
    'Protecting Customer Data1': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
    'Protecting Customer Data2': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
    'Protecting Customer Data3': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
    'Protecting Customer Data4': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
  });


    useEffect(()=>{
    const links = getVideos()
    
    links.then((res)=>{
      let temp = {}
      for(var k in res.data){
        temp[res.data[k].title] = {"play":false,url:res.data[k].videoUrl,isComplete:true, title:res.data[k].title}
      }
      // console.log("temp :: ",temp)
      setGuideLines(temp)
    })
  },[])



  const [selectedVideo, setSelectedVideo] = useState({});
  const [selectedTitle, setSelectedTitle] = useState('');

  const handleClickVideo = (video, title) => {
    const payload = {
      ...video,
      play: true,
      isComplete: false,
      title:title,
    };
    setSelectedTitle(title);
    setSelectedVideo(payload);
    setGuideLines(prev => ({
      ...prev,
      [title]: payload,
    }));
    setSubmitDetails(true)
  };

  useEffect(() => {
    if (selectedVideo.isComplete) {
      setGuideLines(prev => ({
        ...prev,
        [selectedTitle]: {
          ...selectedVideo,
          isComplete: true,
        },
      }));
      setSelectedTitle('');
      setSelectedVideo('');
    }
  }, [selectedTitle, selectedVideo]);

  useEffect(() => {
    if (guideLines && submitDetails) {
      const filter = Object.values(guideLines).filter(
        item => item.isComplete === false,
      );
      if (filter.length === 0) {
        setTechProfile(prev => ({
          ...prev,
          reviewGuide: {
            ...prev.reviewGuide,
            complete: true,
          },
        }));
      }
      // TechnicianApi.updateTechnician(user.technician.id,{profileImage:false,reviewGuide:{complete:true}})
      console.log("user?.technician?.profile.image :::::::::",user.technician.profile.image)
      // TechnicianApi.updateTechnician(user.technician.id, { profileImage: user?.technician?.profile.image ? user?.technician?.profile.image : '', reviewGuide: { complete: true } });

    }
  }, [guideLines, setTechProfile,user]);
  return (
    <Container>
      <ItemLabel>
        {`
        Please make sure to review our Geeker Guidelines and watch the Onboarding video. Once done, it will be marked "Complete".`}
      </ItemLabel>
      <ListContainer>
        <VideoPopup
          selectedVideo={selectedVideo}
          setSelectedVideo={setSelectedVideo}
        />
        {Object.keys(guideLines).map(item => (
          <Row align="middle" gutter={[30, 30]} key={item}>
            <Col span={8}>
              <GuideTitle>{item}</GuideTitle>
            </Col>
            <MidSection
              span={11}
              onClick={() => handleClickVideo(guideLines[item], item)}
            >
              <PlayCircleFilled style={{ fontSize: 20, float:'left' }} />
              <GuideVideoTitle>
                {guideLines[item].isComplete
                  ? 'Watch Video again'
                  : 'Watch Video'}
              </GuideVideoTitle>
            </MidSection>
            <Col spn={4}>
              <RightIcon
                src={
                  guideLines[item].isComplete ? CompleteIcon : NotCompleteIcon
                }
              />
              <Text>
                {guideLines[item].isComplete ? 'Completed' : 'Not Completed'}
              </Text>
            </Col>
          </Row>
        ))}
      </ListContainer>
      <Row />
    </Container>
  );
}

ReviewGuide.propTypes = {
  setTechProfile: PropTypes.func,
};

ReviewGuide.defaultProps = {
  setTechProfile: () => {},
};

const GuideTitle = styled(Text)`
  font-size: 18px;
`;
const GuideVideoTitle = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  padding-left: 10px;
`;
const MidSection = styled(Col)`
  display: flex;
  align-items: center;
  cursor: pointer;
`;
const ListContainer = styled.div`
  padding-top: 30px;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const RightIcon = styled.img`
  width: 20px;
  marginRight: 10px;
`;
export default ReviewGuide;
