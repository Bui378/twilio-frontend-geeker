import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
	Col,
	Switch,
	Row,
	Typography,
	Space,
	notification,
	Form,
} from 'antd';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import ItemLabel from '../../../../../components/ItemLabel';
// import StepButton from '../../../../../components/StepButton';
import AuthInput from '../../../../../components/AuthLayout/Input';
import FormItem from '../../../../../components/FormItem';
import messages from '../../messages';
import Box from '../../../../../components/common/Box';
import * as TechnicianApi from '../../../../../api/technician.api';
import { useUser } from '../../../../../context/useContext';
import PhoneInput from 'react-phone-input-2';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';


const { Text } = Typography;
function AlertPreference({ setTechProfile, techProfile }) {
	const { user } = useUser();

	const openNotificationWithIcon = (type, header, message) => {
		notification[type]({
			message: header,
			description: message,
		});
	};

	useEffect(() => {
		if (user.technician.profile.alertPreference) {
			const demoObj = user.technician.profile.alertPreference;
			if (demoObj && Object.keys(demoObj).length > 0) {
				const temptechProfile = { ...techProfile };
				temptechProfile.alertPreference.complete = true;
				setTechProfile(temptechProfile);
				setSettings(user.technician.profile.alertPreference.settings);
			}
		}
	}, [user.technician.profile.alertPreference]);

	const [isNoOneSelected, setIsNoOneSelected] = useState(false);

	const setPhone = (value, data, event, formattedValue) => {
		if(event.target){
			const keys = event.target.name.split('|')[0];
			const setting_val = event.target.name.split('|')[1];
			const duplDict = { ...settings };
	    	duplDict[keys][setting_val].value = value;
	    	setSettings(duplDict);
		}
	};
	const setEmail = (e) => {
		const keys = e.target.name.split('|')[0];
		const setting_val = e.target.name.split('|')[1];

		const duplDict = { ...settings };
		duplDict[keys][setting_val].value = e.target.value;
		setSettings(duplDict);
	};
	const [settings, setSettings] = useState({
		Job: {
			Browser: {
				toggle: true,
				value: true,
				type: 'button',
				error: null,
			},
			Email: {
				toggle: false,
				value: '',
				type: 'email',
				error: null,
			},
			Text: {
				toggle: false,
				value: '',
				type: 'number',
				error: null,
			},
			Whatsapp: {
				toggle: false,
				value: '',
				type: 'number',
				error: null,
			},
		},
		Techs: {
			Browser: {
				toggle: true,
				value: true,
				type: 'button',
			},
			Email: {
				toggle: false,
				value: '',
				type: 'email',
			},
			Text: {
				toggle: false,
				value: '',
				type: 'number',
			},
			Whatsapp: {
				toggle: false,
				value: '',
				type: 'number',
			},
		},
	});
	const handleChangeSetting = (e, type, item) => {
		setSettings(prev => ({
			...prev,
			[type]: {
				...prev[type],
				[item]: {
					...prev[type][item],
					toggle: e,
				},
			},
		}));
	};

	useEffect(() => {

		if (settings) {
			const filterJob = Object.keys(settings.Job).filter(
				item => settings.Job[item].toggle === false,
			);
			const filterTech = Object.keys(settings.Techs).filter(
				item => settings.Techs[item].toggle === false,
			);
			if (filterJob.length === 4 && filterTech.length === 4) {
				openNotificationWithIcon('error', 'error', 'Lorem ipsum for now...');
				setIsNoOneSelected(true);
			} else {
				setIsNoOneSelected(false);
			}
		}
	}, [settings]);

	const handleBrowserPermission = (value, type, item) => {
		const callback = res => {
			if (res === 'denied') {
				openNotificationWithIcon(
					'error',
					'error',
					'Permission Denied. Please enable for browser\'s setting...',
				);
				setSettings(prev => ({
					...prev,
					[type]: {
						...prev[type],
						[item]: {
							...prev[type][item],
							value: false,
						},
					},
				}));
			} else {
				setSettings(prev => ({
					...prev,
					[type]: {
						...prev[type],
						[item]: {
							...prev[type][item],
							value: true,
						},
					},
				}));
			}
		};
		Notification.requestPermission(callback);
	};

	const switchItemsElements = (type, item) => {
		switch (settings[type][item].type) {
			case 'number':
				return (
					<>
						<FormItem
						>
							<InputWithLabel background={"#EDF4FA"}>
									<PhoneInput 
											
											value={settings[type][item].value} 
											countryCodeEditable={false} 
											onChange={setPhone} 
											country="us" 
											onlyCountries={['in', 'gr', 'us', 'ca', 'gb', 'ph', 'il']}
											inputProps={{
													name:`${type}|${item}`,
												}}
									/>

							</InputWithLabel>
						</FormItem>
					</>
				);
			case 'email':
				return (
					<>
						<FormItem

							rules={[
								{
									type: 'email',
									message: <FormattedMessage {...messages.emailVail} />,
								},
								{
									required: true,
									message: <FormattedMessage {...messages.email} />,
								},
								() => ({
									validator(_, value) {
										if (value && value.length > 70) {
											return Promise.reject(
												new Error('Maximum length is 70 characters.'),
											);
										}
										return Promise.resolve();
									},
								}),
							]}
						>

							<AuthInput
								name={`${type}|${item}`}
								size="large"
								placeholder="Email"
								onChange={(e) => { setEmail(e); }}
								value={settings[type][item].value}
							/>
						</FormItem>
					</>
				);
			case 'button':
				return (
					<EnableButton
					style={{cursor: 'not-allowed',background: settings[type][item].value ? '#97ABB6' : ''}}
					disabled={true}
						onClick={() => handleBrowserPermission(!settings[type][item].value, type, item)}
					>
						{settings[type][item].value ? 'Enabled' : 'Enable Browser'}
					</EnableButton>
				);
			default:
				return null;
		}
	};

	const isValid = () => {
		if (settings.Job.Browser.toggle && !settings.Job.Browser.value) {
			openNotificationWithIcon(
				'error',
				'error',
				'Please enable browser notification...',
			);
			return false;
		}
		if (settings.Techs.Browser.toggle && !settings.Techs.Browser.value) {
			openNotificationWithIcon(
				'error',
				'error',
				'Please enable browser notification...',
			);
			return false;
		}

		if(settings.Job.Text.toggle && settings.Job.Text.type == "number"){
			let numValue = settings.Job.Text.value
			let numHavePlus = false;
			if(numValue.indexOf('+') >= 0) numHavePlus = true;
			if (isPossiblePhoneNumber(`${numHavePlus ? '' : '+'}`+numValue) === false && isValidPhoneNumber(`${numHavePlus ? '' : '+'}`+numValue)  === false) {
					openNotificationWithIcon(
						'error',
						'error',
						'Phone number for text is not valid.',
					);
					return false;
			}
		}

		if(settings.Techs.Text.toggle && settings.Techs.Text.type == "number"){
			let numValue = settings.Job.Text.value
			let numHavePlus = false;
			if(numValue.indexOf( '+') >= 0) numHavePlus = true;
			if (isPossiblePhoneNumber(`${numHavePlus ? '' : '+'}`+numValue)  === false && isValidPhoneNumber(`${numHavePlus ? '' : '+'}`+numValue)  === false) {
					openNotificationWithIcon(
						'error',
						'error',
						'Phone number for text is not valid.',
					);
					return false;
			}
		}

		if(settings.Techs.Email.toggle && settings.Techs.Email.value === ''){
			openNotificationWithIcon(
				'error',
				'error',
				'Email cant be blank.',
			);
			return false;
		}

		if(settings.Job.Email.toggle && settings.Job.Email.value === ''){
			openNotificationWithIcon(
				'error',
				'error',
				'Email cant be blank.',
			);
			return false;
		}


		return true;
	};

	const handleSave = () => {

		if (!isValid()) {
			setTechProfile(prev => ({
				...prev,
				alertPreference: {
					complete: false,
				},
			}));
			return false;
		}
		if (isNoOneSelected) {
			setTechProfile(prev => ({
				...prev,
				alertPreference: {
					complete: false,
				},
			}));
			return openNotificationWithIcon(
				'error',
				'Validation Error',
				'Please select atleast one option...',
			);
		}
		setTechProfile(prev => ({
			...prev,
			alertPreference: {
				complete: true,
				settings,
			},
		}));

		
		TechnicianApi.updateTechnician(user.technician.id, { profileImage: false, alertPreference: { settings, complete: true } });
		openNotificationWithIcon('success', 'Success', 'Information Submitted');
		return true;
	};

	return (
		<Container>
			<Form onFinish={handleSave}>
				<Label>When Available</Label>
				{/*<ItemLabel style={{ marginBottom: 20 }}>
					For when you are logged in an active and receive a job assignment
				</ItemLabel>*/}
				<Row gutter={[20, 20]}>
					{Object.keys(settings.Job).map(item => (
						<Col key={item} xs={24} md={6}>
							<Space size={20} direction="vertical">
								<Space size={10}>
									<CheckSwitch
										id={item}
										disabled={item === 'Browser' || item=== 'Whatsapp' ? true: false}
										checked={settings.Job[item].toggle}
										onChange={e => handleChangeSetting(e, 'Job', item)}
									/>
									<Text>{item}</Text>
								</Space>
								{settings.Job[item].toggle && switchItemsElements('Job', item)}
							</Space>
						</Col>
					))}
				</Row>
				<Label style={{ marginTop: 20 }}>
				When Not Available
				</Label>
				<Row gutter={[20, 20]}>
					{Object.keys(settings.Techs).map(item => (
						<Col key={item} xs={24} md={6}>
							<Space size={20} direction="vertical">
								<Space size={10}>
									<CheckSwitch
										id={item}
										disabled={item === 'Browser' || item=== 'Whatsapp' ? true: false}
										checked={settings.Techs[item].toggle}
										onChange={e => handleChangeSetting(e, 'Techs', item)}
									/>
									<Text>{item}</Text>
								</Space>
								{settings.Techs[item].toggle
									&& switchItemsElements('Techs', item)}
							</Space>
						</Col>
					))}
				</Row>
				<Box display="flex" justifyContent="flex-end" marginTop={30}>
					<Button className="btn app-btn" type="submit">
						<span />
						Save
					</Button>
				</Box>
			</Form>
		</Container>
	);
}

AlertPreference.propTypes = {
	setTechProfile: PropTypes.func,
};
AlertPreference.propTypes = {
	setTechProfile: () => {},
};

const CheckSwitch = styled(Switch)``;
const Label = styled(ItemLabel)`
	font-weight: bold;
	color: #868383;
`;
const Container = styled.div`
	display: flex;
	flex-direction: column;
`;

const EnableButton = styled(Button)`
	height: 50px;
	border: none; /* Add this line to remove the border color */
	border-radius: 10px;
	&:focus {
		box-shadow: unset;
	}
	&::placeholder {
		color: #999;
	}
`;


const InputWithLabel = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  marginRight: 30px;
  position: relative;
  &:last-child {
    marginRight: 0;
  }



  & input{
    height:50px;
    padding:10px;
   
    margin-top: 15px;
    
    margin-top:15px;
    margin-left:50px;
  }
  & .react-tel-input .form-control {
    height:50px; 
    border:0px none;
    width:80% !important;
    background:transparent;
    border-radius: 0px;
    border-bottom : 2px solid #B2B7BC; 
  }

  & .react-tel-input .selected-flag {
    background:${props => props.background}
    border: 1px solid #B2B7BC;
    border-left: none;
    border-right: none;
    border-top: none;
  }
  }
  & .react-tel-input .flag-dropdown {
    background:transparent;
    border: 0px none;
    bottom :1px;
  }

`;

export default AlertPreference;
