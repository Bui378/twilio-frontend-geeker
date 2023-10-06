import React, { useEffect ,useState } from 'react';
import { Table,Modal } from 'antd';
import { Col, Button } from 'react-bootstrap';
// import { DownloadOutlined } from '@ant-design/icons';
import Styled from 'styled-components';
import TextsmsIcon from '@mui/icons-material/Textsms';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';

// import StepButton from '../../../components/StepButton';
// import { useHistory } from 'react-router-dom';
// import $ from 'jquery';
// import moment from 'moment';
import mixpanel from 'mixpanel-browser';
import Box from '../../common/Box';
import StyledText from '../StyledText';
import { klaviyoTrack } from '../../../api/typeService.api';
import ExpandableJobDetail from './ExpandableJobDetail';
import {checkPendingStatus, haveUnreadMessagesForPendingJob} from '../../../utils';
import { useUser } from '../../../context/useContext';
import { useTools } from 'context/toolContext';
import { calculateTimeDifference } from 'constants/expandableJobContants';
import * as JobApi from '../../../api/job.api';


export default function DashboardTable(props) {
  // const history = useHistory();
  const { user } = useUser();
  const { setUseTimer ,setStartTimer } = useTools()
  const [customerConfirm,setCustomerConfirm] = useState(false);
  const [lastPendingSoftware,setLastPendingSoftware] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [expandedRowData, setExpandedRowData] = useState({});
  const [scheduleMsg,setScheduleMsg] = useState(false);
  const [isDisabled, setIsDisabled ]= useState(false)

  const message = scheduleMsg
  ? <span className="div-font" style={{fontSize:20,paddingTop:'40px'}}>
      One of your previous jobs of <b style={{fontWeight: 'bold'}}>{lastPendingSoftware}</b> is already scheduled with a technician. Are you sure you want to create a new job post?
    </span>
  : <span className="div-font" style={{fontSize:20,paddingTop:'40px'}}>
      We are still looking for a technician for your existing job of <b style={{fontWeight: 'bold'}}>{lastPendingSoftware}</b>. Are you sure you want to create a new job post?
    </span>;

  // This is commented as it is currently not in use. Commented by Jagroop on 17 april 2023
  // useEffect(() => {
  //   setTimeout(() => {
  //     // var w = $(".ant-table-structure-outer .ant-table-container table").width();
  //     // $(".highlight-background").css('width',(w+30)+'px')
  //   }, 1000);
  // }, []);

  /**
   * @author : Jagroop
   * @description : This function is firstly check props data and then follow following steps :
   * -> Calculate the time difference between current time and job created time.
   * -> Convert time (seconds) into minutes.
   * -> Check if time difference is less than 6 hours (360 minutes) then push that job into array.
   * -> Sort the array in ascending order of time difference.
   * -> Set the first element of array as expanded row key.
   * -> That will further show the expanbale open for that particular key (job).
   */
  useEffect(() => {
    console.log("===============================",props.tabname);
    if( props.tabname == 'ActiveJobTab'&& props && props.data){
    const arr = [];
    const res = props?.data?.map((item , index) => {
      if (item.key) {
        const currentDate = new Date();
        const jobCreatedDate = new Date(item.date);
        const diffTime = Math.abs(currentDate - jobCreatedDate);
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        if(diffMinutes <360){
          arr.push({key:item.key,minutes:diffMinutes , item : item})
        }
        if( index === props.data.length -1 && arr.length > 0){
          arr.sort( (a,b) => a.minutes - b.minutes );
          setExpandedRowKeys([arr[0].key])
          setExpandedRowData(prevData => ({ ...prevData, [arr[0].key]: arr[0].item }));
    
        } 
      }
    });
    //mixpanel.track('Customer - Dashboard',{result : res});
  }

  }, [props.data])
  const push_to_profile_setup = async (e) => {
    console.log('>>>>>>>>>>>>push_to_profile_setup ::::::: index');
    if (props?.user_data) {
      mixpanel.identify(props?.user_data?.email);
      mixpanel.track('Customer - Post a job');
      mixpanel.people.set({
        $first_name: props?.user_data?.firstName,
        $last_name: props?.user_data?.lastName,
      });
    }
    if (window.localStorage.getItem('extraMin')) {
      window.localStorage.removeItem('extraMin');
    }
    if (window.localStorage.getItem('secs')) {
      window.localStorage.removeItem('secs');
    }

    if (props?.user_data?.customer?.customerType === 'live') {
      const klaviyoData = {
        email: props?.user_data?.email,
        event: 'Job Post Button Click',
        properties: {
          $first_name: props?.user_data?.firstName,
          $last_name: props?.user_data?.lastName,
        },
      };
      await klaviyoTrack(klaviyoData);
    };

    window.location.href = '/customer/profile-setup?page=select-software';
  };

  function diff_hours(date) {

    var diff = (new Date().getTime() - new Date(date).getTime(date)) / 1000;
    diff /= (60 * 60);
    console.log("TIME DIFFERENCE",Math.abs(Math.round(diff)))
    return Math.abs(Math.round(diff));

  }
/**
	 * Function will check if there are any pending jobs of the customer.if pending then open modal and run push_to_profile_setup function
	 * @author : Nafees
	 */
const getAllPendingJobs = async() => {
  try {
    setIsDisabled(true)
    if (user && user?.customer) {
      let pendingJobs = await checkPendingStatus(user);
      if(pendingJobs.schedule_accepted)
        {
          setScheduleMsg(true)
        } 
      if (pendingJobs.success) {
        setLastPendingSoftware(pendingJobs.name)
        setCustomerConfirm(true);
      }
      else {
        push_to_profile_setup()
      }
    }
  } catch (e) {
    console.log('error in getAllPendingJobs', e)
  }
};
  const closePendingModal = () => {
    setCustomerConfirm(false);
  };
  const columns = [{
    title: 'Software',
    dataIndex: 'software',
    width: '20%',
    render: text => (
      <StyledText strong padding="10px 5px">
        {text}
      </StyledText>
    ),
  },
  {
    title: 'Created / Scheduled',
    dataIndex: 'date',
    width: '20%',
    render: text => (
      <span>
        {' '}
        {new Date(text).toLocaleTimeString('en-US', props.date_options)}
      </span>
    ),
  },

  {
    title: 'Status',
    dataIndex: 'stats',
    width: '15%',
    render: text => (
      <StyledText strong padding="10px 5px" className="one-liner">
        {text}
      </StyledText>
    ),
  },
  {
    title: 'Issue Description',
    dataIndex: 'issuedesc',
    width: '30%',
    render: text => (
      <p padding="10px 5px" title={text} className="issue-description">
        {(text.length > 100 ? `${text.substring(0, 100)}...` : text)}
      </p>
    ),
  },

  {
    title: 'Action',
    dataIndex: 'action',
    width: '25%',
    
  },

  {
    title: 'chat',
    dataIndex: 'jobData',
    width: '15%',
    render: (text) => {
      if (props.jobIdFromMessage.includes(text.id)) {
        return (
          <>
            <IconButton name={text.id}
              onClick={props.push_to_job_detailForChat}
              title="Click to see job details." aria-label="delete">
                 <Badge  sx={{
                    "& .MuiBadge-badge": {
                      // color: "red",
                      backgroundColor: "red"
                    }
                  }} variant="dot">
                    <TextsmsIcon  style={{ fontSize: '30px',color:'#1bd4d5'}} />
                 </Badge>
            </IconButton>
          </>
        );        
      } else if (
        text.id &&
        text.tech_message_dashbord && 
        ((text.status !== 'Waiting' &&
        text.status !== 'Declined' &&
        text.status !== 'Expired' &&
        text.status !== 'Pending' &&
        text.status !== 'Completed' &&
        text.status !== 'Draft'  ) ||
        (text.meeting_end_time && text.status == "Completed" && diff_hours(text.meeting_end_time) <= 24 ))
      ) {
        return (
          <IconButton name={text.id}
          onClick={props.push_to_job_detailForChat}
          title="Click to see job details." aria-label="delete">
             <Badge  sx={{
                    "& .MuiBadge-badge": {
                      // color: "red",
                      backgroundColor: "red"
                    }
                  }} variant="dot">
                  <TextsmsIcon  style={{ fontSize: '30px' ,color:'#1bd4d5'}} />
             </Badge>
        </IconButton>
        );
      } else if (
        text.id &&
       (( text.status !== 'Waiting' &&
        text.status !== 'Expired' &&
        text.status !== 'Pending' &&
        text.status !== 'Completed'&&
        text.status !== 'Draft' ) ||
        (text.meeting_end_time && text.status == "Completed" && diff_hours(text.meeting_end_time) <= 24 ) || (haveUnreadMessagesForPendingJob(text.id)))
      ) {
        return (
          <IconButton name={text.id}
          onClick={props.push_to_job_detailForChat}
          title="Click to see job details." aria-label="delete">
        <TextsmsIcon  style={{ fontSize: '30px',color:'#1bd4d5' }} />
        </IconButton>
        );
      } else {
        return null;
      }
    }
    
  }
];
if (props?.user_data?.userType === 'technician' || props?.user_data?.userType === 'customer') {
  columns.splice(3, 0, {
    title: 'Customer',
    dataIndex: 'customer',
    width: '30%',
    render: (text) => {
      const regex = /\[(.*?)\]/; // Regular expression to match text inside square brackets
      const match = text?.match(regex); // Extract the businessName from the text
      if (match) {
        const businessName = match[1]; // Extract the businessName from the regex match
        const boldText = text.replace(regex, `, <b>${businessName}</b>`); // Include comma before the businessName
        const titleText = text.replace(regex, businessName); // Remove brackets in the title attribute
        return <p padding="10px 5px" title={titleText} className="customer" dangerouslySetInnerHTML={{ __html: boldText }} />;
      }
      return <p padding="10px 5px" title={text} className="customer">{text}</p>;
    }
  });
}


  if (props?.user_data?.userType === 'customer') {
    columns.splice(4, 0, {
      title: 'Technician',
      dataIndex: 'technician',
      width: '30%',
      render: text => (
        <p padding="10px 5px" title={text} className="customer">
          {(text && text.length > 100 ? `${text.substring(0, 100)}...` : text)}
        </p>
      ),
    });
  }

  /**
   * 
   * @param {*} expanded  : boolean
   * @param {*} record  : object
   * @author : Jagroop
   * @description : This function will set the expanded row data and expanded row keys and will also set the timer if the job is in pending state
   */
  const handleRowExpand = async (expanded, record) => {
    let updatedJobData = {}  
    if(expanded){
        updatedJobData = await JobApi.retrieveJob(record?.jobData?.id)
    }else{
        updatedJobData = record
    }
    setExpandedRowData({})
    setExpandedRowKeys([])
    const key = record.key;
    const expandedRowKeys = expanded ? [key] : [];
    setExpandedRowKeys(expandedRowKeys);
    if (expanded) {
      setExpandedRowData(prevData => ({ ...prevData, [key]: record }));
      const timeDiff = calculateTimeDifference(updatedJobData.tech_search_start_at,updatedJobData.notifiedTechs,updatedJobData.tech_search_time)
      if((timeDiff > 0 && record.tech_search_time <= 900000) || record.tech_search_time >= 900000){
        setUseTimer(timeDiff)
        setStartTimer(true)
      }else{
        setStartTimer(false)
      } 
    } else {
      setExpandedRowData(prevData => ({ ...prevData, [key]: null }));
    };
  };


 /**
  * @author : Jagroop
  * @description : This function will call handleRow Expand function and on the basis of that a particular row's expandable data is shown
  */
  const expandable = {
    expandedRowRender: record =>  <ExpandableJobDetail jobSummaryData={expandedRowData[record.key]} />,
    expandedRowKeys,
    onExpand: handleRowExpand,
    expandIcon: () => null,
  };

  return (
    <>
    <div>
      {props.data && props.data.length > 0 ? (
        <Col xs="12" className="ant-table-structure-outer-home table-responsive p-0">
          {/* <div className="highlight-background"></div> */}
          <StyledTable
            bordered={false}
            pagination={false}
            columns={columns}
            dataSource={props.data}
            expandRowByClick={true}
            expandable={expandable}
            rowKey={(record) => record.key}
          />
        </Col>
      )
        : (
          <div>
            {/* props.user_data && props.user_data.userType === 'customer' && props.user_data.roles && props.user_data.roles.indexOf(roleStatus.USER) === -1 && */}
            {props?.user_data && props?.user_data?.userType === 'customer' && (

              <Col span={24} align="middle">
                <Box>

                  <div className="divarea">
                    <p>No jobs found. Click on the button to create a new job.</p>
                    <Button key={(isDisabled ? "disabled-btn" : "") + "btn-post-job"} disabled={isDisabled} onClick={getAllPendingJobs} className="btn app-btn">
                      <span />
                      Get Help Now
                    </Button>
                  </div>
                </Box>
              </Col>
            )}

            {props?.user_data && props?.user_data?.userType === 'technician' && (

              <Col span={24} align="middle">
                <Box>
                  <div className="divarea">
                    <p>No jobs found according to your skill.</p>
                  </div>
                </Box>
              </Col>
            )}
          </div>
        )}
    </div>
      <Modal
        style={{ top: 40 }}
        closable={true}
        onCancel={closePendingModal}
        visible={customerConfirm}
        maskStyle={{ backgroundColor: "#DCE6EDCF" }}
        maskClosable={true}
        width={800}
        bodyStyle={{ height: 170, paddingTop: 50 }}
        footer={
          [
            <Button
              className="btn app-btn app-btn-light-blue modal-footer-btn"
              onClick={() => {
                setCustomerConfirm(false);
              }}
            >
              <span></span>Back To Dashbord
            </Button>,

            <Button
              className="btn app-btn job-accept-btn modal-footer-btn"
              onClick={push_to_profile_setup}
            >
              <span></span>Create New
            </Button>,

          ]}
      >
        <div className="">
        <span className="div-font" style={{fontSize:20,paddingTop:'40px'}}>
        {message} 
        </span>
        </div>
      </Modal>
    </>
  );
}
const StyledTable = Styled(Table)`
`;
