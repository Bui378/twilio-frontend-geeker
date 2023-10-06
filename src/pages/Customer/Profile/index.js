import React, { useState, useEffect } from 'react';
import { Col, Tabs, Tab } from 'react-bootstrap';
import ScreenSteps from '../../../components/ScreenSteps';
import ProfileReview from './steps/profilereview';
import EditCustomer from './steps/editCustomer';
import CustomerCard from './steps/customerCard';
import BusinessDetails from './steps/businessDetails';
import { useAuth } from '../../../context/authContext';
import Loader from '../../../components/Loader';
import { roleStatus } from '../../../utils/index';
import * as UserApi from "../../../api/users.api"

const CustomerProfile = ({ cardDetailActive }) => {

	const [currentStep, setCurrentStep] = useState(0);
	const { refetch, user } = useAuth();
	const showLoader = false;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [newCardAdded, setNewCardAdded] = useState(false);
	const [defaultActiveTab, setDetaultActiveTab] = useState("Manage Account")
	const [ownerHasBusinessAccount, setOwnerHasBusinessAccount] = useState(false);

	useEffect(() => {
		// code added by manibha because phone number was not getting updated
		refetch()
	}, [currentStep])

	// This will set default tab to  card Detail when we are accessing this through url : "customer/card-detail-page"
	useEffect(() => {
		if (cardDetailActive) {
			setDetaultActiveTab("Card Details")
		}
	}, [])

	useEffect(() => {
		(async () => {
			if (user && user?.ownerId && user?.ownerId !== null) {
				const ownerUserInfo = await UserApi.getUserById(user.ownerId)
				if (ownerUserInfo && ownerUserInfo.isBusinessTypeAccount === true) {
					setOwnerHasBusinessAccount(true)
				}
			} else {
				if (user.isBusinessTypeAccount === true) {
					setOwnerHasBusinessAccount(true)
				}
			};
		})()
	}, []);


	const onNext = () => {
		setCurrentStep(currentStep + 1)
	}

	const prev = () => {
		console.log("its called..............", currentStep)
		setCurrentStep(currentStep - 1)
	}

	const handleActiveTab = (k) => {
		console.log("active kye", k)
		if (k.toLowerCase() === 'buy prepaid minutes') {
			refetch()
		}
		setDetaultActiveTab(k)
	}

	const steps = [{
		title: 'profileReview',
		content: <ProfileReview user={user} onNext={onNext} />,
	},
	{
		title: 'editCustomer',
		content: <EditCustomer user={user} values={user.customer} onNext={onNext} onPrev={prev} />,
	},
	{
		title: 'businessDetails',
		content: <BusinessDetails user={user} values={user.customer} onNext={onNext} onPrev={prev} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} newCardAdded={newCardAdded} setNewCardAdded={setNewCardAdded} showCards={true} />,
	},
	{
		title: 'customeCard',
		content: <CustomerCard user={user} values={user.customer} onNext={onNext} onPrev={prev} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} newCardAdded={newCardAdded} setNewCardAdded={setNewCardAdded} showCards={true} />,
	}];

	return (
		<React.Fragment>
			<Col md="12" className="">
				<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />

				<Col md="12" className="py-4 mt-1">
					<Col xs="12" className="p-0">

						<Tabs activeKey={defaultActiveTab} onSelect={handleActiveTab} id="uncontrolled-tab-example" className="mb-3 tabs-outer">

							<Tab eventKey="Manage Account" title="Manage Account" className="col-md-12 p-0">
								<ScreenSteps stepsContent={steps[0].content} />
							</Tab>

							{(user && user?.userType === "customer") && ownerHasBusinessAccount && user.roles[0] !== 'user' && (
								<Tab eventKey="Business Details" title="Business Details" className="col-md-12 p-0">
									<ScreenSteps stepsContent={steps[2].content} />
								</Tab>
							)}

							{user?.userType === "customer" &&
								user?.roles?.length > 0 && user.roles.indexOf(roleStatus.USER) === -1 && user.roles.indexOf(roleStatus.ADMIN) === -1 && (
									<Tab eventKey="Card Details" title="Card Details" className="col-md-12 p-0">
										<ScreenSteps stepsContent={steps[3].content} />
									</Tab>
								)}

						</Tabs>
					</Col>
				</Col>
			</Col>
		</React.Fragment>

	)
}

export default CustomerProfile
