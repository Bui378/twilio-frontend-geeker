import React, { useEffect, useState } from 'react';
import { Layout, notification, Checkbox, Rate, Input, Button } from 'antd';
import Styled from 'styled-components';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import { openNotificationWithIcon } from 'utils';
import DashboardHeader from '../../../components/Dashboard/Header';
import { useUser } from '../../../context/useContext';
import { useJob } from '../../../context/jobContext';
import * as SettingsApi from '../../../api/settings.api';
const { Content } = Layout;

const MeetingFeedbackOne = ({
	setshowYesBlock,
	setshowNoBlock,
	setIsSolved,
	job,
	jumpToStep,
}) => {
	const { user, updateUserInfo } = useUser();
	const history = useHistory();
 	let settings = SettingsApi.getSettingsList({"software":job.software.id})	
	function toggle() {
		setIsSolved(false);
		setshowYesBlock(false);
		// setshowNoBlock(true);
		jumpToStep(1);
	}

	function toggle_solved() {
		setIsSolved(true);
		setshowYesBlock(true);
		// setshowNoBlock(false);
		jumpToStep(1);
	}
	const totalTime = history.location?.state?.time || '';
	// const totalTime = { seconds: 40, minutes: 3, hours: 1 };

	function totalCost() {
		let totalSeconds = 0;
		if (totalTime.seconds > 0) {
			totalSeconds += totalTime.seconds;
		}
		if (totalTime.minutes > 0) {
			totalSeconds += totalTime.minutes * 60;
		}
		if (totalTime.hours > 0) {
			totalSeconds += totalTime.hours * 3600;
		}
		let totalCost = 0;
		let totalMinutes = totalSeconds / 60;

		console.log(">>>>>>settings>>>>>>>>settings>>>>>>>>>>>",settings)

		if (job?.technician?.rate) {
			totalCost = job.technician.rate * (totalMinutes / 10);
		}
		return totalCost.toFixed(2);
	}

	function timeStr(value, label) {
		return value ? value + ' ' + label + (value === 1 ? '' : 's') : '';
	}

	function callDuration() {
		return totalTime
			? `${timeStr(totalTime.hours, 'hour')}
      ${timeStr(totalTime.minutes, 'minute')}
      ${timeStr(totalTime.seconds, 'second')}`
			: '';
	}

	return (
		<React.Fragment key="feedbackOne">
			<Layout>
				<MainLayout>
					<div className="main_block">
						<div className="section_one">
							<p className="title"> Call Summary </p>
							<div className="section_sub_one">
								<table cellPadding="10">
									<tbody>
										<tr>
											<th width="125">Total Time</th>
											<td width="50">:</td>
											<td>{callDuration()}</td>
										</tr>
										<tr>
											<th>Total Cost</th>
											<td>:</td>
											<td>${totalCost()}</td>
										</tr>
										<tr>
											<th>Description</th>
											<td>:</td>
											<td>{job ? job.issueDescription : ''}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div className="section_two">
							{ user.userType == "customer" ? <p className="problem_title"> Is your problem solved?</p> :<p className="problem_title"> Is problem solved?</p> }
							
							<div className="section_sub_one">
								<Button className="primary" onClick={toggle_solved}>
									Yes
								</Button>
								<Button className="secondary" onClick={toggle}>
									No
								</Button>
							</div>
						</div>
					</div>
				</MainLayout>
			</Layout>
		</React.Fragment>
	);
};

export default MeetingFeedbackOne;

const MainLayout = Styled(Layout)`
  background-color: #f9f9f9 !important;
  min-height: fit-content !important;
  width:100%;


 & .section_one .title,.section_two .title, .section_three .title, .section_four .title,.section_five .title{
    padding-top: 15px;
    font-size:25px;
    text-align:center;
    font-weight:bold;
 }




 & .section_one .section_sub_one table{
    font-size:18px;
    width:70%;
    margin:auto;
    border: 1px solid #ccc;

 }

 & .section_one .section_sub_one table tr{
  border: 1px solid #ccc;
}

 & .section_two .section_sub_one{
    text-align:center;    
 }
 
  & .section_two .section_sub_one Button{
    border-color: #1890ff;
    color: #fff;
    background: #1890ff;
    font-size: 15px;
    font-weight: bold;
    width:23%;
    height: 40px;
    border-radius: 4px;
    margin-bottom:2%;

 }
 
 &  .section_two .section_sub_one .primary{
    margin-left:unset;
    background-color:green;
    border-color:#4CBB16;
 }

 &  .section_two .section_sub_one .secondary{
    margin-left:15px;
    background-color:white;
    border :1px solid #999;
    color:#666;
 }
 
`;

const SiteLayoutContent = Styled(Content)`
  margin: 24px 16px,
  padding: 24px,
  min-height: 280px,
`;
