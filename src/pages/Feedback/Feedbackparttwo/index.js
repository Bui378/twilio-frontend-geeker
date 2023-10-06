import React, { useEffect, useState } from 'react';
import {
  Layout, notification, Checkbox, Rate, Input, Button,
} from 'antd';
import Styled from 'styled-components';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import { openNotificationWithIcon } from 'utils';
import DashboardHeader from '../../../components/Dashboard/Header';
import { useUser } from '../../../context/useContext';
import { useJob } from '../../../context/jobContext';
import { useFeedback } from '../../../context/feedbackContext';
import StepButton from '../../../components/StepButton';
import WebFont from 'webfontloader';
import ReactStars from "react-rating-stars-component";
import { library } from '@fortawesome/fontawesome-svg-core';
import {far,faStar} from '@fortawesome/free-regular-svg-icons';

const { Content } = Layout;

var  new_values = [];

const MeetingFeedbackPartTwo = ({showYesBlock,showNoBlock,IsSolved,jumpToStep,setshowYesBlock,setshowNoBlock}) => {

useEffect(()=>{
  library.add(far,faStar)
  WebFont.load({
    google: {
      families: ['Droid Sans', 'Chilanka','Google Sans','Roboto']
    }
  });

},[])

  const { TextArea } = Input;
  const { user, updateUserInfo } = useUser();
  const [activeStatus, setActiveStatus] = useState(false);
  const [issueDescription, setIssueCheckboxOne] = useState([]);
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(0);
  const { jobId } = useParams();
  const { job, setJobTime, fetchJob } = useJob();
  const history = useHistory();
  const { createFeedback } = useFeedback();
  const [summary, setSummary] = useState('');
  const [isloading, setisloading] = useState(false);
  const [rated,setRated] = useState(false)

  const ratingChanged = async(newRating) => {
    setRating(newRating)
    
    if(newRating > 3){
      const feed = await createFeedback({
        job: jobId,
        user: user.id,
        is_solved: IsSolved,
        rating,
        comments: summary,
        issues: issueDescription,
      });
      jumpToStep(2)
    }
    if(newRating <= 3){
      setshowNoBlock(true)
      setRated(true)
    }

    
    
  };

  const handleChangeText = e => {
    setSummary(e.target.value);
  };

  function setIssueCheckbox(checkedValues) {
    new_values.push(checkedValues.target.value);
    setIssueCheckboxOne(new_values);
  }
  const handleNext = async () => {
    if (IsSolved === '' || issueDescription.length < 1 ) {
      openNotificationWithIcon('error', 'Error', 'Please select one option');


    } else {
      setTimeout(function(){ notification.destroy()},100);
      setisloading(true);
      const feed = await createFeedback({
        job: jobId,
        user: user.id,
        is_solved: IsSolved,
        rating,
        comments: summary,
        issues: issueDescription,
      });
      jumpToStep(2);
    }
    

   
  };

  return (
    <React.Fragment key="feedbackTwo">
      <Layout>
        <MainLayout>

          <div className="without_background">
          
            { !rated ?  <Ratingbox>
              <ContentDiv>
               <TitleDiv>How was your Meeting Experience?</TitleDiv> 
               <div className ="section_sub_four">
                 <Rate style={{fontSize:"40px"}}  onChange={ratingChanged} value={rating}/>
                 <TextDiv><p>Very bad</p><p>Very Good</p></TextDiv>

              </div>
              </ContentDiv>
            </Ratingbox> :<div></div>}
            {showNoBlock && user.userType == 'technician' ?  <Ratingbox>
              <ContentDiv>
               <TitleDiv>What Went Wrong?</TitleDiv> 
               <ListDiv>
    
                    <OrganizedDiv><Checkbox value='Customer was not knowledgeable.'onChange={setIssueCheckbox}/><p className="DesignChecks">Customer was not knowledgeable.</p></OrganizedDiv>
                   <OrganizedDiv><Checkbox value='Audio or screen share was not clear.' onChange={setIssueCheckbox}></Checkbox><p className="DesignChecks">Audio or screen share was not clear</p></OrganizedDiv>
                   <OrganizedDiv><Checkbox value="I couldn't understand customer's language." onChange={setIssueCheckbox} ></Checkbox><p className="DesignChecks">I couldn't understand customer's language</p></OrganizedDiv>
                   <OrganizedDiv> <Checkbox value="Others." onChange={setIssueCheckbox} ></Checkbox><p className="DesignChecks">Others</p></OrganizedDiv>
               </ListDiv>
               
              </ContentDiv>
            </Ratingbox> :<div></div> }
            {showNoBlock && user.userType == 'customer' ? 
             <Ratingbox>
              <ContentDiv>
               <TitleDiv>What Went Wrong?</TitleDiv> 
               <ListDiv>
    
                    <OrganizedDiv> <Checkbox value='Technician was not knowledgeable.'onChange={setIssueCheckbox}/><p className="DesignChecks">Technician was not knowledgeable</p></OrganizedDiv>
                   <OrganizedDiv><Checkbox value='Audio or screen share was not clear.'
                             onChange={setIssueCheckbox}/><p className="DesignChecks">Audio or screen share was not clear</p></OrganizedDiv>
                   <OrganizedDiv><Checkbox value="I couldn't understand techinician's language." onChange={setIssueCheckbox} ></Checkbox><p className="DesignChecks">I couldn't understand techinician's language</p></OrganizedDiv>
                   <OrganizedDiv> <Checkbox value="Others." onChange={setIssueCheckbox} ></Checkbox><p className="DesignChecks">Others</p></OrganizedDiv>
               </ListDiv>
               
              </ContentDiv> 
            </Ratingbox> : <div></div> }
            { rated ? <div className="section_six">            
              <div className ="section_sub_one">
                  <StepButton className="primary" disabled={isloading} onClick={handleNext} >Submit Feedback</StepButton>                             
              </div>
          </div> :<div></div>}
          </div> 
        </MainLayout>
      </Layout>
    </React.Fragment>
  );
};

export default MeetingFeedbackPartTwo;

const MainLayout = Styled(Layout)`
  background-color: #f9f9f9 !important;
  min-height: fit-content !important;
  width:100%;



 & .section_one .title,.section_two .title, .section_three .title, .section_four .title,.section_five .title{
    margin-top:2%;
    font-size:25px;
    text-align:center;
    font-weight:bold;
 }

 & .section_one .section_sub_one p{
    font-size:18px;
    text-align :center;
    margin-bottom :30px;
 }
 & .section_one .section_sub_one span{
    font-size:18px;
    text-align :center;
    color: #464646;
    font-weight:bold;
 }
 & .section_two .section_sub_one{
    text-align:center;    
 }
  & .section_sub_four{
    width: 305px;
    margin: auto;
 }
 & .section_sub_four .ant-rate .ant-rate-star-second .anticon-star {
   margin-left:10px;
 }
 & .section_sub_four .ant-rate .ant-rate-star-second .anticon-star svg path {

    stroke-width: 62px;
    stroke: #5F6375;
    stroke-dasharray: 55,2;
    stroke-linejoin: miter;


 }
 & .section_sub_four .ant-rate .ant-rate-star-second .anticon-star svg path:hover {

  stroke-width:0px


}
& .section_sub_four .ant-rate .ant-rate-star-second .anticon-star svg:hover {

  stroke-width:0px


}
 }

 & .section_three .section_sub_three{
    width: 500px;
    margin: auto;
   
 }

 & .section_three .section_sub_three label{
    font-size:20px;
    margin-top:10px;
 } 

  & .section_sub_five {
    width: 500px ;
    margin: auto;  
 }

 & .section_six .section_sub_one{
    text-align:center;    
    margin-top:2%;
    margin-bottom:2%;
 }

 & .section_six .section_sub_one Button{
   border-color: #1890ff;
    color: #fff;
    background: #1890ff;
    font-size: 15px;
    font-weight: bold;
    width:27%;
   
    border-radius: 4px;
    margin-bottom:40px;

 }

  &  .section_six .section_sub_one .primary{
    margin-left:unset;
    background-color:#4CBB16;
    border-color:#4CBB16;
 }
 
`;

const SiteLayoutContent = Styled(Content)`
  margin: 24px 16px,
  padding: 24px,
  min-height: 280px,
`;
const MeetDiv = Styled.div`
font-family: 'Google Sans',Roboto,Arial,sans-serif;
font-size: 2.25rem;
text-align: center;
font-weight: 400;
letter-spacing: 0;
line-height: 2.75rem;
color: #3c4043;
cursor: default;
max-width: 700px;
}

`
const Ratingbox = Styled.div`
border: 1px solid;
max-width: 350px;
margin:auto;
border-radius: 8px;
margin-top: 35px;
box-shadow: 0px 1px 2px 0px rgb(60 64 67 / 30%), 0px 2px 6px 2px rgb(60 64 67 / 15%);
border-width: 0px;
padding: 32px 24px;
`
const TitleDiv = Styled.div`

  letter-spacing: .00625em;
  font-family: 'Google Sans',Roboto,Arial,sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: rgba(0,0,0,0.87);
  cursor: default;
  padding-bottom: 18px;



`
const ContentDiv = Styled.div`
  padding:auto;
  
`
const TextDiv = Styled.div`
letter-spacing: .025em;
font-family: Roboto,Arial,sans-serif;
font-size: .75rem;
font-weight: 400;
line-height: 1rem;
cursor: default;
box-sizing: border-box;
display: flex;
box-pack: justify;
-webkit-box-pack: justify;
justify-content: space-between;
padding: 0 10px;
width: 100%;
margin-top: 3px;
  width : 300px;
  color: rgba(0,0,0,0.54);
  display:flex;
  letter-spacing: .025em;
  font-family: Roboto,Arial,sans-serif;
  justify-content: space-between;

`
const ListDiv = Styled.div`
display:flex;
flex-direction:column;

 

`
const OrganizedDiv = Styled.div`
  display:flex;
  justify-content:flex start;
  max-width:100%;
  & p {
    margin-left:23px;
    letter-spacing: .01428571em;
    font-family: Roboto,Arial,sans-serif;
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.25rem;
}
  }
  & .largecheck .ant-checkbox .ant-checkbox-input{

    outline: 2px solid #c00;
  }
`