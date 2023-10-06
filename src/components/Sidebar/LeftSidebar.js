import React, { useEffect, useState } from 'react';
import { Row, Col, ListGroup } from 'react-bootstrap';
import * as DOM from 'react-router-dom';
import style from 'styled-components';
import './leftSidebar.css';
import UserReviewButton from '../../components/UserReviewButton/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as UserApi from "../../api/users.api"
import {
	faHome,
	faDollarSign,
	faCog,
	faTimes, faHandHoldingUsd, faMoneyCheck, faFileInvoice, faUser,

} from '@fortawesome/free-solid-svg-icons';
import {
	faChartBar,
	faQuestionCircle,
	faUserCircle,

} from '@fortawesome/free-regular-svg-icons';
import { roleStatus } from '../../utils/index';
import { useTools } from 'context/toolContext';
import BusinessInfo from 'components/BusinessInfo';
import BusinessMsgModal from 'components/BusinessMessageModal'
import AccountManagerReference from 'components/AccountManagerReference';
import { useSocket } from '../../context/socketContext';
import TelegramIcon from '@mui/icons-material/Telegram';
import Badge from '@mui/material/Badge';
function LeftSidebar({
	user,
	setcurrentStep,
	currentStep,
	toggle,
	setType,
	activeMenu,
	setActiveMenu,
	showMenu = true,
	newMessageAlert
}) {

	const { iconChange, setIconChange, isVisible, setIsVisible, setShowIframe } = useTools();
	const [businessMessage, setBusinessMessage] = useState('');
	const [showTwilioUnreadMessageCountBadge, setShowTwilioUnreadMessageCountBadge] = useState(user.unreadTwilioMessages > 0 ? true : false)
	const [unreadTwilioMessageCount, setUnreadTwilioMessageCount] = useState(user.unreadTwilioMessages && user.unreadTwilioMessages > 0 ?
		user.unreadTwilioMessages < 100
			? user.unreadTwilioMessages
			: "99+"
		:
		"");
	const [ownerHasBusinessAccount, setOwnerHasBusinessAccount] = useState(false);
	const { socket } = useSocket();
	//Check Current Step and render leftsidebar component according it.

	useEffect(() => {
		const matchStep = localStorage.getItem('CurrentStep')
		if (matchStep === 2) {
			setActiveMenu('job-reports')
			setcurrentStep(2)
		}
		else if (matchStep === 3) {
			setActiveMenu('billing-reports')
			setcurrentStep(3)
		}
		else if (matchStep === 1) {
			setActiveMenu('earnings')
			setcurrentStep(1)
		}
		else if (matchStep == 4) {
			if (user && user.userType === 'customer') {
				setActiveMenu('settings')
				setcurrentStep(5)
			} else {
				setActiveMenu('settings')
				setcurrentStep(4)
			}

		}
		else if (matchStep === 5) {
			setActiveMenu('settings')
			setcurrentStep(5)
		}
		else if (matchStep === 7) {
			setActiveMenu('home')
			setcurrentStep(0)
		}
		else if (matchStep === 8) {
			setActiveMenu('refferal')
			setcurrentStep(8)
		}
		else if (matchStep === 9) {
			setActiveMenu('invite')
			setcurrentStep(9)
		}
		else if (matchStep === 10) {
			setActiveMenu('subscriptions')
			setcurrentStep(10)
		}
		else if (matchStep === 11) {
			setActiveMenu('active_techs')
			setcurrentStep(11)
		}

		else if (matchStep === 14) {
			setActiveMenu('technician_transactions')
			setcurrentStep(14)
		}
		else if (matchStep === 12) {
			setActiveMenu('discount_referal')
			setcurrentStep(12)
		}
		else if (matchStep === 112) {
			setActiveMenu('previousTech')
			setcurrentStep(112)
		}
		else if (matchStep === 15) {
			console.log()
			setActiveMenu('messages')
			setcurrentStep(15)
		}
		else {
			console.log("inside else part...")
			setActiveMenu('home')
			setcurrentStep(0)
		}

	}, [])

	useEffect(() => {
		(async () => {
			let parser = new DOMParser();
			if (user && user?.ownerId && user?.ownerId !== null) {
				const ownerUserInfo = await UserApi.getUserById(user.ownerId)
				if (ownerUserInfo && ownerUserInfo.isBusinessTypeAccount === true) {
					setOwnerHasBusinessAccount(true)
				}
				if (ownerUserInfo && ownerUserInfo?.business_details?.businessInfoMessage) {
					const parsedHtml = parser.parseFromString(ownerUserInfo.business_details.businessInfoMessage, 'text/html');
					const plainText = parsedHtml.body.textContent || '';
					setBusinessMessage(plainText)
				}
			} else {
				if (user.isBusinessTypeAccount === true) {
					setOwnerHasBusinessAccount(true)
				}
				const parsedHtml = parser.parseFromString(user?.business_details?.businessInfoMessage, 'text/html');
				const plainText = parsedHtml.body.textContent || '';
				setBusinessMessage(plainText)
			};
			socket.on("updated-business-message", (data) => {
				if (data && (data.userId === user?.id) || (data.userId === user?.ownerId) && data?.businessInfoMessage) {
					const parsedHtml = parser.parseFromString(data.businessInfoMessage, 'text/html');
					const plainText = parsedHtml.body.textContent || '';
					setBusinessMessage(plainText);
				};
			})
			socket.on('send-unread-twiio-messages', (data) => {
				if (data.userId === user.id) {
					console.log("fixing notification badge", data)
					setUnreadTwilioMessageCount(data.totalUnreadMessagesCount)
				}
			})
		})()
	}, [user, socket]);


	const HandleHide = () => {
		toggle();
	};
	const handleLogoClick = (e) => {
		e.preventDefault();
		setcurrentStep(0);
		setActiveMenu('home');
	}

	const callChatFunction = () => {
		setIsVisible(!isVisible);
		setIconChange(!iconChange);
		setShowIframe(true);
	}

	return (
		<Row>
			<Col xs={12} className="pt-4 mt-2 mb-1">
				<div className="bar-logo-box">
					<Link to="/" onClick={(e) => handleLogoClick(e)}>
						<Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
					</Link>
					<button
						className="mobile-toggle-bar"
						onClick={() => {
							HandleHide();
						}}
					>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
			</Col>
			{(user && user.userType === 'customer' && ownerHasBusinessAccount) && <Col xs={12} className="business-info-col mt-4">
				<BusinessInfo user={user} />
			</Col>}
			{(user && user.userType === 'customer' && businessMessage && businessMessage !== '' && businessMessage !== 'undefined' && (user.isBusinessTypeAccount || user.ownerId !== null)) && <Col xs={12} className="business-info-col mt-4">
				<div className="business-info-class grey-background-imp  py-3 pl-4">
					<BusinessMsgModal user={user} />
				</div>
			</Col>}
			{showMenu && (
				<Col xs={12} className="mt-4 side-menu-bar px-3">
					<ListGroup className="list-group" >
						<ListGroup.Item className={activeMenu === 'home' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							<button
								onClick={() => {
									setcurrentStep(0);
									setActiveMenu('home');
								}}
							>
								<FontAwesomeIcon icon={faHome} />
								<span
									className="pl-3"
								>
									Home
								</span>
							</button>
						</ListGroup.Item>

						{user && user.userType === 'customer' && (
							<ListGroup.Item
								className={activeMenu === 'previousTech' ? 'active' : ''}
								onClick={() => {
									HandleHide();
								}}
							>
								<button
									onClick={() => {
										if (user && user.userType === "customer") {
											setcurrentStep(112);
											setActiveMenu('previousTech');
										}
									}}
								>
									<FontAwesomeIcon icon={faUser} />
									<span
										className="pl-3"
									>
										Technicians
									</span>
								</button>
							</ListGroup.Item>
						)}

						<ListGroup.Item
							className={activeMenu === 'job-reports' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							<button
								onClick={() => {
									setcurrentStep(2);
									setActiveMenu('job-reports');
								}}
							>
								<FontAwesomeIcon icon={faChartBar} />
								<span
									className="pl-3"
								>
									Job Reports
								</span>
							</button>
						</ListGroup.Item>

						{user && user.userType === 'technician' && user?.technician?.tag !== 'employed' && (
							<ListGroup.Item
								className={
									activeMenu === 'earnings' || activeMenu === 'billing-reports'
										? 'active'
										: ''
								}
								onClick={() => {
									HandleHide();
								}}
							>
								<button
									onClick={() => {
										setcurrentStep(1);
										setActiveMenu('earnings');
									}}
								>
									<FontAwesomeIcon icon={faDollarSign} />
									<span className="pl-3">
										My Earnings
									</span>
								</button>
							</ListGroup.Item>
						)}

						{user && user.userType === 'customer' && (
							<ListGroup.Item
								className={
									activeMenu === 'earnings' || activeMenu === 'billing-reports'
										? 'active'
										: ''
								}
								onClick={() => {
									HandleHide();
								}}
							>
								<button
									onClick={() => {
										setcurrentStep(3);
										setActiveMenu('billing-reports');
									}}
								>
									<FontAwesomeIcon icon={faDollarSign} />
									<span className="pl-3">
										Billing Reports
									</span>
								</button>
							</ListGroup.Item>
						)}

						{user && user.userType === 'customer' && user.roles[0] == 'owner' && (
							<ListGroup.Item
								className={activeMenu === 'subscriptions' ? 'active' : ''}
								onClick={() => {
									HandleHide();
								}}
							>

								<button
									onClick={() => {
										setcurrentStep(10);
										setActiveMenu('subscriptions');
									}}
								>
									<FontAwesomeIcon icon={faHandHoldingUsd} />
									<span
										className="pl-3"
									>
										Subscriptions
									</span>
								</button>

							</ListGroup.Item>
						)}

						{user && (
							<ListGroup.Item
								className={activeMenu === 'messages' ? 'active' : ''}
								onClick={() => {
									HandleHide();
								}}
							>

								<button
									onClick={() => {
										setcurrentStep(15);
										setActiveMenu('messages');
									}}
								>
									<div className='d-flex justify-content-between'>
										<div>
											<TelegramIcon />
											<span
												className="pl-3"
											>
												Message Center
											</span>
										</div>
										<Badge className='badge-notification-style-left-side' sx={{ "& .MuiBadge-badge": { backgroundColor: `${newMessageAlert ? 'red' : ''} ` } }} variant="dot">
											{unreadTwilioMessageCount > 0 && <div className='round-red-div' title={user.unreadTwilioMessages > 0 ? user.unreadTwilioMessages : ""}>
												{unreadTwilioMessageCount}
											</div>}
										</Badge>
									</div>
								</button>

							</ListGroup.Item>
						)}
						{user && user.userType === "technician" &&
							<ListGroup.Item
								className={activeMenu === 'active_techs' ? 'active' : ''}
								onClick={() => {
									HandleHide();
								}}
							>
								<button
									onClick={() => {
										setcurrentStep(11);
										setActiveMenu('active_techs');
									}}
								>
									<FontAwesomeIcon icon={faUserCircle} />
									<span
										className="pl-3"
									>
										Active Technicians
									</span>
								</button>

							</ListGroup.Item>
						}

						{user.userType === 'technician' &&
							<ListGroup.Item
								className={activeMenu === 'technician_transactions' ? 'active' : ''}
								onClick={() => {
									HandleHide();
								}}
							>
								<button
									onClick={() => {
										setActiveMenu('technician_transactions');
										setcurrentStep(14);
									}}
								>
									<FontAwesomeIcon icon={faMoneyCheck} />
									<span
										className="pl-3"
									>
										Transactions
									</span>
								</button>
							</ListGroup.Item>
						}

						{user && user.userType === "customer" && (!user.roles || user.roles.indexOf(roleStatus.USER) === -1) && (
							<ListGroup.Item
								className={activeMenu === 'invite' ? 'active' : ''}
								onClick={() => {
									HandleHide();
								}}
							>
								<button
									onClick={() => {
										setcurrentStep(9);
										setActiveMenu('invite');
									}}
								>
									<FontAwesomeIcon icon={faUserCircle} />
									<span className="pl-3">
										User Management
									</span>
								</button>
							</ListGroup.Item>
						)}

						<ListGroup.Item
							className={activeMenu === 'settings' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							{user && user.userType === 'technician' && (
								<button
									onClick={() => {
										setcurrentStep(4);
										setActiveMenu('settings');
									}}
								>
									<FontAwesomeIcon icon={faCog} />
									<span
										className="pl-3"
									>
										Settings
									</span>
								</button>
							)}
							{user && user.userType === 'customer' && (
								<button
									onClick={() => {
										setcurrentStep(5);
										setActiveMenu('settings');
									}}
								>
									<FontAwesomeIcon icon={faCog} />
									<span
										className="pl-3"
									>
										Settings
									</span>
								</button>
							)}
						</ListGroup.Item>
						<ListGroup.Item
							className={activeMenu === 'helpCenter' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							<button
								onClick={() => {
									if (user && user.userType === "technician") {
										setcurrentStep(111);
									}
									setActiveMenu('helpCenter');
									callChatFunction();
								}}
							>
								<FontAwesomeIcon icon={faQuestionCircle} />
								<span
									className="pl-3"
								>
									Help Center
								</span>
							</button>
						</ListGroup.Item>
					</ListGroup>
				</Col>
			)}
			{user && user.userType === 'customer' && ownerHasBusinessAccount && <Col xs={12}>
				<AccountManagerReference user={user} />
			</Col>}
			{!showMenu && user && user.userType === 'technician' && (
				<button
					className="app-btn app-btn-transparent mt-5 ml-4 customer-history-btn"
					title="Coming soon"
					target="_blank"
				>
					<span />
					Customer History
				</button>
			)}

			<UserReviewButton />

		</Row>
	);
}

const Link = style(DOM.Link)`
		cursor:pointer;
`;
const Image = style.img`
		display: block;
		width: 120px;
`;

export default LeftSidebar;
