import React, { useEffect, useState } from 'react';
import {
	useStripe,
	useElements,
	CardNumberElement,
	CardExpiryElement,
	CardCvcElement
} from "@stripe/react-stripe-js";
import * as CustomerApi from '../../../../api/customers.api';
import * as UserApi from '../../../../api/users.api';
import { openNotificationWithIcon, isLiveUser } from '../../../../utils';
import mixpanel from 'mixpanel-browser';
import { Input, Spin, Modal } from 'antd';
import { Row, Col, Button } from 'react-bootstrap';
import { useUser } from '../../../../context/useContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { PAYMENT_DETAILS_MESSAGE } from '../../../../constants/index';
import stripeSecureLogo from "../../../../assets/images/stripe-secure-logo.png"

let liveUser = true;
const AddCardForm = ({ user, cardsInfo, setCardsInfo, isModalOpen, setIsModalOpen, setNewCardAdded, setDisableButton = false, source, setDisableBtn }) => {
	const stripe = useStripe();
	const elements = useElements();
	const [zip, setZip] = useState('')
	const [isDisabled, setIsDisabled] = useState(false)
	const { refetch } = useUser();
	const { PAYMENT_DETAILS_MAIN_HEAD_SUBSCRIPTION, PAYMENT_DETAILS_MAIN_HEAD, PAYMENT_DETAILS_SUB_HEAD, PAYMNET_DETAILS_TITLE } = PAYMENT_DETAILS_MESSAGE

	useEffect(() => {
		(async () => {
			if (user) {
				liveUser = await isLiveUser(user)
			}
		})()
	}, [user])

	const handleSubmit = async (event) => {
		// Block native form submission.
		event.preventDefault();

		if (!isDisabled) {
			setIsDisabled(true);
			if (zip === "") {
				openNotificationWithIcon("error", "Info missing", "Please enter zip!")
				setIsDisabled(false)
				return
			} else {
				await UserApi.updateUser({ userId: user.id, zip: zip })
			}

			if (!stripe || !elements) {
				// Stripe.js has not loaded yet. Make sure to disable
				// form submission until Stripe.js has loaded.
				return;
			}

			// Get a reference to a mounted CardElement. Elements knows how
			// to find your CardElement because there can only ever be one of
			// each type of element.
			var data = {}
			const cardElement = elements.getElement(CardNumberElement);
			data['zipcode'] = zip

			// Use your card Element with other Stripe.js APIs
			stripe.createToken(cardElement, data).then(
				async (payload) => {
					console.log('payload>>>>>>>>>>>>>>>>>>>>', payload)
					if (payload['error']) {
						openNotificationWithIcon("error", "Error", payload['error']['message'])
						setIsDisabled(false);
						setNewCardAdded(false);
						return;
					} else {
						let retrieve_cust = await CustomerApi.retrieveCustomer(user.customer.id);
						if (!retrieve_cust.stripe_id || retrieve_cust.stripe_id === '' || retrieve_cust.stripe_id == null) {
							checkCardAndAddCardToCustomer(cardElement, data, payload, true, false)

						} else {
							checkCardAndAddCardToCustomer(cardElement, data, payload, false, retrieve_cust.stripe_id)
						}
					}

				}
			);
		}
	};

	async function checkCardAndAddCardToCustomer(cardElement, data, payload, newCustomer, stripe_customer_id) {
		stripe.createToken(cardElement, data).then(
			async (payloadTwo) => {
				console.log('payloadTwo>>>>>>>>>>>>>>>>>>>>', payloadTwo)
				if (payloadTwo['error']) {
					openNotificationWithIcon("error", "Error", payloadTwo['error']['message'])
					setIsDisabled(false);
					setNewCardAdded(false);
					return;
				} else {
					if (newCustomer) {
						console.log('addCardForm handleSubmit createCustomerStripe ::')
						const result_customer = await CustomerApi.createCustomerStripe({
							email: user.email,
							liveUser: liveUser
						})

						var customer_id = result_customer.id
						CustomerApi.updateCustomer(user.customer.id, { "stripe_id": customer_id })
						stripe_customer_id = customer_id
					}



					const result_card = await CustomerApi.addCardToCustomerStripe({
						liveUser: liveUser,
						stripe_id: stripe_customer_id,
						token_id: payload.token.id,
						jobId: 'NA'
					})

					if (result_card['error'] != undefined) {
						openNotificationWithIcon("error", "Error", result_card['error']['message'])
						setIsDisabled(false)
						// mixpanel code//
						mixpanel.identify(user.email);
						mixpanel.track('Customer - Card not added due to some error in card.');
						// mixpanel code//
					} else {
						/* This  Condition is for if user has already added card and now adding new card
							then we will mark this new card as default card */
						if (result_card["id"]) {
							await CustomerApi.updateDefaultCard({
								liveUser: liveUser,
								card_id: result_card["id"],
								customer_id: stripe_customer_id,
							});

							// mixpanel code//
							mixpanel.identify(user.email);
							mixpanel.track('Customer - Mark Upcoming Card As Default Card.');
						}
						// Here we are holding $100 from customer's account
						const holdChargeResponse = await holdPaymentFromcustomerCard(stripe_customer_id, liveUser)
						// This condition check if $100 hold is not successful then show error message
						if (holdChargeResponse.status !== "Successful") {
							openNotificationWithIcon("error", "Error", holdChargeResponse.message);
							const card_id = holdChargeResponse?.response?.source?.id
							const stripe_id = holdChargeResponse?.response?.payment_intent?.customer
							console.log("checking we are getting details or not", { stripe_id, card_id });
							if (card_id && stripe_id) {
								await removeCard(card_id, stripe_id);
							}
							setTimeout(() => {
								setIsDisabled(false)
								setIsModalOpen(false)
								setNewCardAdded(false);
							}, 1000);

						}
						else {
							if (cardsInfo) {
								let temp_data = []
								if (cardsInfo && cardsInfo != null && Array.isArray(cardsInfo)) {
									temp_data = [...cardsInfo]
								}
								if (newCustomer) {
									result_card['default_card'] = true;
								}
								temp_data.push(result_card)
								setCardsInfo(temp_data)
							}
							const refundedMoney = await refundHoldedMoney(holdChargeResponse);
							// mixpanel code//
							mixpanel.identify(user.email);
							mixpanel.track('Customer - Card details added and refunded holded money', refundedMoney);
							// mixpanel code//
							await refetch()
							openNotificationWithIcon("success", "Success", "Card details has been saved.")
							setIsDisabled(false)
							setIsModalOpen(false)
							setNewCardAdded(true);
						}
					}
				}
			})
	}

	const changeZip = (e) => {
		setZip(e.target.value)
	}

	// This function is used to refund the holded amount to the customer back after authorization
	const refundHoldedMoney = async (holdChargeResponse) => {
		// This will refund the hold money from customer account
		if (holdChargeResponse?.payment_id && holdChargeResponse?.payment_status == "requires_capture") {
			const obj = {
				payment_hold_id: holdChargeResponse?.payment_id,
				isDeduct: false,
				jobId: "NA",
				stripe_id: holdChargeResponse?.stripe_id
			}
			const cancelledResponse = await CustomerApi.deductOrRefundHoldMoney(obj);
			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Refund $100 from customer', cancelledResponse);
			// mixpanel code//
			return cancelledResponse;
		}
	}

	// This function will hold the amount from card during authorization of card of customer
	const holdPaymentFromcustomerCard = async (stripe_customer_id, liveUser) => {
		// Holding $100 Dollars here from customer which will be refunded or deducted depnding on customer action
		const custObj = {
			"stripe_id": stripe_customer_id,
			'liveUser': liveUser,
			'jobId': "NA",
		}
		console.log("Logging customer object for verification:", custObj)
		const holdChargeResponse = await CustomerApi.holdChargeFromCustomer(custObj);
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Customer - Hold $100 from customer', holdChargeResponse);
		// mixpanel code//
		return holdChargeResponse;
	}

	// This function will remove the card if it fails to hold the amount
	const removeCard = async (card_id, stripe_id) => {
		const response = await CustomerApi.removeCard({
			liveUser: liveUser,
			card_id: card_id,
			customer_id: stripe_id,
		});
		return response;

	}



	return (
		<Modal
			title={<><div className='text-center mb-3'><span>{source === "subscription" ? PAYMENT_DETAILS_MAIN_HEAD_SUBSCRIPTION : PAYMENT_DETAILS_MAIN_HEAD}</span><br />
				<span className='text-center'>{source === "subscription" ? "" : PAYMENT_DETAILS_SUB_HEAD}</span><br /><span className='text-center'>{source === "subscription" ? "" : PAYMNET_DETAILS_TITLE}</span>
			</div><br />
			</>}
			visible={isModalOpen}
			onOk={() => { }}
			onCancel={() => { setIsModalOpen(false); if (setDisableButton) { setDisableButton(false) } }}
			closable={false}
			maskClosable={false}
			keyboard={false}
			className="add-card-modal-outer"
			footer={[
				<div className='d-flex justify-content-between align-items-center flex-wrap'>
					<img className="w-40p max-width-768-w-100per" src={stripeSecureLogo} />
					<div>
						<Button key="back" onClick={() => {
							setIsModalOpen(false); if (setDisableBtn) { setDisableBtn(false) }; if (setDisableButton) { setDisableButton(false) }
						}} className="btn app-btn app-btn-light-blue modal-footer-btn">
							<span></span>Close
						</Button>
						<Button
							loading={false}
							className={"btn app-btn modal-footer-btn " + (isDisabled ? "disabled-btn" : "")}
							disabled={isDisabled}
							onClick={handleSubmit}
						>
							<span></span>
							{isDisabled
								?
								<Spin />
								:
								<>Add Card</>
							}
						</Button>
					</div>
				</div>
			]}
		>
			<Col md="12" className="pb-4 m-auto add-card-form-outer text-left">
				<form>
					<Row>
						<Col md="12" className="card-element-outer mt-2 mb-4">
							<Col xs="12" className="pl-0 pb-2">
								<label className="label-name">Card Number</label>
							</Col>
							<Col xs="12" className="card-element-inner pb-3 iframe-outer" >
								<CardNumberElement options={{ placeholder: "CC#" }} />
							</Col>
						</Col>

						<Col md="4" className="card-element-outer mt-2 mb-4">
							<Col xs="12" className="pl-0 pb-2">
								<label className="label-name">Expiry Date</label>
							</Col>
							<Col xs="12" className="card-element-inner pb-3 iframe-outer" >
								<CardExpiryElement />
							</Col>
						</Col>

						<Col md="4" className="card-element-outer mt-2 mb-4 cvv-item-outer">
							<Col xs="12" className="pl-0 pb-2">
								<label className="label-name">CVV</label>
							</Col>
							<Col xs="12" className="card-element-inner pb-3 iframe-outer" >
								<CardCvcElement />
								<FontAwesomeIcon icon={faQuestionCircle} className="card-icon" title="CVV code mentioned on the back of the Credit & Debit Card." />
							</Col>
						</Col>

						<Col md="4" className="card-element-outer mt-2 mb-4">
							<Col xs="12" className="pl-0">
								<label className="label-name">Zip</label>
							</Col>
							<Col xs="12" className="card-element-inner" >
								<Input onFocus={(e) => { e.target.style.boxShadow = 'none' }} placeholder="XXX" onChange={changeZip} required />
							</Col>
						</Col>

						{isDisabled ? <span></span> : ''}
					</Row>
				</form>
			</Col>
		</Modal>
	);
};

export default AddCardForm;