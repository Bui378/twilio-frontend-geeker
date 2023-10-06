import React, { useEffect, useState } from 'react';
import { Layout, notification,Checkbox ,Rate,Input,Button} from 'antd';
import Styled from 'styled-components';
import { useHistory } from 'react-router';
import DashboardHeader from '../../../components/Dashboard/Header';
import { useUser } from '../../../context/useContext';
import { openNotificationWithIcon } from 'utils';
import RightImage from '../../../assets/images/circle-tick.jpg';
import { CheckCircleTwoTone } from '@ant-design/icons';
const { Content } = Layout;
var  new_values = [];

const Thankyou = () => {
  const { user, updateUserInfo } = useUser();
  const history = useHistory();
  const [role, setRole] = useState('');
  const [activeStatus, setActiveStatus] = useState(false);

  function return_dashboard(){
    history.push('/dashboard');
  }

  useEffect(() => {
    if (user) {
      // setTimeout(function(){history.push("/dashboard")},5000)
      setRole(user.userType);
      setActiveStatus(user.activeStatus);
    }
  }, [user]);

  if (!user) {
    history.push('/login');
  }

  
  const handleNext = async () => {
    history.push('/thankyou');
  }

  return (
    <React.Fragment key="thankyou">
      <Layout>
        <MainLayout>
          <div className="main_block">
            <div className="thank_div">
                 <CheckCircleTwoTone twoToneColor="#52c41a" />
                <p className="title">Thank You!</p>
                <p className="sub-title">Your submission is received and we will contact you soon.</p> 
              <Button className="primary" onClick={return_dashboard} >Go to dashboard</Button>     
            </div>
          </div>
        </MainLayout>
      </Layout>
    </React.Fragment>
  );

};

export default Thankyou;

const MainLayout = Styled(Layout)`
  background-color: #f9f9f9 !important;
  min-height: fit-content !important;
  width:100%;

 & .main_block{
    width:950px;
    margin :auto;
    height:auto;
    margin-top:2%;
    text-align:center;
 }


 & .thank_div .title{
    font-size: 40px;
    font-weight: bold;
    margin-bottom: 5px;
 }

 & .thank_div  Button{
     border-color: #1890ff;
    color: #fff;
    background: #1890ff;
    font-size: 15px;
    font-weight: bold;
    width:27%;
    height: 40px;
    border-radius: 4px;
    margin-bottom:2%;
 }

 & .thank_div .sub-title{
    font-size: 20px;
 }


  & .thank_div .primary{
    margin-left:unset;
    background-color:#4CBB16;
    border-color:#4CBB16;
 }

 & .thank_div .anticon-check-circle {
    font-size: 70px;
    margin-bottom: 20px;
 }

`;

const Image = Styled.img`
  width:130px;
`;
