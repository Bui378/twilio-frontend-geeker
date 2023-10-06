import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Row, Col, Button, Card, Container } from 'react-bootstrap';
import { Spin, Modal } from 'antd';
import { getAllPlans, buySubscription, cancelSubscription, createSubscriptionHistory } from "../../../api/subscription.api";
import { useAuth } from '../../../context/authContext';
import Loader from '../../../components/Loader';
import { openNotificationWithIcon, isLiveUser, getStripeObject, getCookie, PushUserDataToGtm } from '../../../utils';
import * as CustomerApi from '../../../api/customers.api';
import { Elements } from '@stripe/react-stripe-js';
import { popularSoftwareIdTest, popularSoftwareIdLive } from '../../../constants';
import AddCardForm from '../Profile/steps/addCardForm';
import mixpanel from 'mixpanel-browser';
import "react-widgets/styles.css";
import SubscriptionPlansModal from "./components/SubscriptionPlansModal"
import SubscriptionFlipCard from 'components/SubscriptionFlipCard';
import TimerSharpIcon from '@mui/icons-material/TimerSharp';
import AvTimerSharpIcon from '@mui/icons-material/AvTimerSharp';
import { useSocket } from '../../../context/socketContext';
import axios from 'axios';

let stripePromise = '';

let liveUser;
const Subscription = ({ user }) => {
    const { refetch } = useAuth();
    const [plans, setPlans] = useState([]);
    const [refinePlans, setRefinePlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cardInfoUpdated, setCardInfoUpdated] = useState([]);
    const [startClicked, setStartClicked] = useState([]);
    const [isPlanAvailable, setIsPlanAvailable] = useState(false);
    const [activeSubscription, setActiveSubscription] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCardAdded, setNewCardAdded] = useState(false);
    const [highestPlanRate, setHighestPlanRate] = useState(0);
    const [clickedPlan, setClickedPlan] = useState([]);
    const [cancelSignal, setCancelSignal] = useState(true)
    const [promoAppliedFor, setPromoAppliedFor] = useState()
    const [promoId, setPromoId] = useState("")
    const [couponId, setCouponId] = useState("")
    const [showSubscriptionPlansModal, setShowSubscriptionPlansModal] = useState(false)
    const [disableBtn, setDisableBtn] = useState(false)
    const { socket } = useSocket();
    const getMeasurementId = process.env.REACT_APP_GA_MEASUREMENT_ID
    const mes_id = getMeasurementId ? getMeasurementId.split("-")[1] : false
    const [showSpinner, setShowSpinner] = useState(false)
    const [popularSoftwareId, setPopularSoftwareId] = useState(user?.customer.customerType === 'live' ? popularSoftwareIdLive : popularSoftwareIdTest)

    const sendSubscriptionGTMTag = async (buySubscriptionRes) => {
        try {
            const client_id = String(getCookie('_ga').split(".")[2] + "." + getCookie('_ga').split(".")[3]);
            const session_id = String(getCookie(`_ga_${mes_id}`).split(".")[2]);
            const facebook_fbp = String(getCookie("_fbp"));
            const facebook_fbc = String(getCookie("_fbc"));
            const ip = await getIPData();

            let dataToSend = {}
            dataToSend.tagName = "subscriptionStarted";
            dataToSend.client_id = client_id;
            dataToSend.eventObject = buySubscriptionRes;
            dataToSend.facebook_fbp = facebook_fbp;
            dataToSend.facebook_fbc = facebook_fbc;
            dataToSend.customer_id = user.customer.id;
            dataToSend.session_id = session_id;
            dataToSend.value = buySubscriptionRes.paidPrice;
            dataToSend.user_agent = navigator.userAgent;
            dataToSend.customer_ip = ip;
            dataToSend.customerUserInfo = user;

            const updatedCustomer = await CustomerApi.retrieveCustomer(user.customer.id)
            console.log("My console for updated subscription", { updatedCustomer, user })

            if (updatedCustomer) {
                dataToSend.customerInfo = updatedCustomer;
                console.log("sendSubscriptionGTMTag sending updated customer", dataToSend)
            } else {
                dataToSend.customerInfo = user.customer;
                console.error("sendSubscriptionGTMTag sending old customer", dataToSend)
            }
            socket.emit('send-GTM-data', { dataToSend });
            if (process.env.REACT_APP_URL) {
                const appUrl = process.env?.REACT_APP_URL?.split("/")[2] || false;
                PushUserDataToGtm('subscription_started', user, appUrl, dataToSend.value);
            }
        } catch (error) {
            console.error("Some error occured in sendSubscriptionGTMTag", { error: error })
        }
    }

    /**
     * Following function is to get ip address of customer
     * @params : none
     * @return : none
     * @author : Vinit
     **/
    const getIPData = async () => {
        try {
            const res = await axios.get(" https://geolocation-db.com/json/");
            console.log("Customer's ip is ", res.data);
            return res.data.IPv4;
        } catch (error) {
            console.log("Err occured while getting ip", { error })
            return '';
        }
    };

    /**
     * Following function is used to cancel the current subscription of user.
     * @author : Vinit
     */
    const cancelUserSubscription = async () => {
        if (user && user?.customer) {

            const data = {
                plan_id: user?.customer?.subscription?.plan_id,
                plan_name: user?.customer?.subscription?.plan_name,
                total_minutes: user?.customer?.subscription?.total_minutes,
                total_seconds: user?.customer?.subscription?.total_seconds,
                time_used: user?.customer?.subscription?.time_used,
                invoice_id: user?.customer?.subscription?.invoice_id,
                subscription_id: user?.customer?.subscription?.subscription_id,
                status: 'Canceled',
                plan_purchased_date: user?.customer?.subscription?.plan_purchased_date,
                plan_inactive_date: new Date(),
            }

            await createSubscriptionHistory({ cust_id: user.customer.id, "subscription_history": data })
            await CustomerApi.updateCustomer(user.customer.id, { $unset: { "subscription": 1 }, cancelSignal });
            await cancelSubscription({ 'subscription_id': user.customer.subscription.subscription_id, 'liveUser': liveUser });

            window.location.reload();

        }
    }

    useEffect(() => {
        (async () => {
            if (user) {
                liveUser = await isLiveUser(user)
                stripePromise = await getStripeObject(user)
            }
        })();
    }, [user])

    useEffect(() => {
        if (newCardAdded) {
            refetch();
            console.log("::::::: checking User ::::::::::::::::", user.customer);
            if (user.customer && user.customer.stripe_id && user.customer.stripe_id !== '') {
                buyPlanInit(clickedPlan['plan_id'], clickedPlan['plan_name'], clickedPlan['price_id'], clickedPlan['total_minutes'], clickedPlan['discount']);
                setNewCardAdded(false);
            }
        }
    }, [newCardAdded, user, refetch]);

    useEffect(() => {
        (async () => {
            await refetch()
            let allPlans = await getAllPlans({ "liveUser": liveUser });
            setPlans(allPlans.data);
            if (allPlans && allPlans.data && allPlans.data.length > 0) {
                let highestPlanPrice = Math.max.apply(Math, allPlans.data.map(function (o) { return o.price.unit_amount; }))
                setHighestPlanRate(highestPlanPrice)
            }

            for (let i = 0; i <= allPlans.data.length - 1; i++) {
                if (typeof allPlans.data[i]['metadata']['key_features'] === 'string') {
                    allPlans.data[i]['metadata']['key_features'] = JSON.parse(allPlans.data[i]['metadata']['key_features'])
                }
                if (typeof (allPlans.data[i]['metadata'])['key_features_submenu'] === 'string') {
                    allPlans.data[i]['metadata']['key_features_submenu'] = JSON.parse(allPlans.data[i]['metadata']['key_features_submenu'])
                }
                let type = allPlans.data[i]['metadata']['product_type'].charAt(0).toUpperCase() + allPlans.data[i]['metadata']['product_type'].slice(1);
                if (!(type in refinePlans)) {
                    refinePlans[type] = [];
                }
                refinePlans[type].push(allPlans.data[i]);
                refinePlans.Business.sort((p1, p2) => p1.price.unit_amount - p2.price.unit_amount);
            }
            setRefinePlans(refinePlans);
            Object.keys(refinePlans).map(function (type) {
                refinePlans[type].map((p, idx) => {
                    if (p.metadata.key_features_submenu) {
                        Object.keys(p.metadata.key_features_submenu).map(function (submenus_key) {
                            console.log(">>>>>>>> submenus_key", submenus_key);
                            p.metadata.key_features_submenu[submenus_key].map((psd, idx) => {
                                console.log(idx, psd);
                            })
                        })
                    }
                })
            })

            setTimeout(() => {
                setIsLoading(false);
            }, 800)
        })();
    }, [])

    useEffect(() => {
        (async () => {

            if (user && plans && plans.length > 0) {
                if (user.customer && user.customer.subscription && user.customer.subscription.plan_id) {
                    let activePlan = plans.find(o => o.id === user.customer.subscription.plan_id);
                    console.log("activePlan in useEffect ::", activePlan)
                    if (activePlan) {
                        let activePlanData = { ...activePlan }
                        activePlanData['total_amount'] = parseFloat(activePlanData.price.unit_amount / 100) - (0.05 * parseFloat(activePlanData.price.unit_amount / 100)).toFixed(2)
                        setActiveSubscription(activePlanData);
                        setIsPlanAvailable(true);
                    } else {
                        openNotificationWithIcon("error", "Error", "Your active plan is no more available.")
                    }
                }
            }

            if (user && plans && plans.length > 0) {

                for (let i = 0; i <= plans.length - 1; i++) {
                    if (typeof plans[i]['metadata']['key_features'] === 'string') {
                        plans[i]['metadata']['key_features'] = JSON.parse(plans[i]['metadata']['key_features'])
                    }
                    if (typeof plans[i]['metadata']['key_features_submenu'] === 'string') {
                        plans[i]['metadata']['key_features_submenu'] = JSON.parse(plans[i]['metadata']['key_features_submenu'])
                    }
                }
            }
        })();
    }, [user, plans, refetch])

    const buyPlanInit = async (plan_id, plan_name, price_id, total_minutes, discount) => {
        if (user) {
            let temp = [];
            temp.push(plan_id);
            setStartClicked(temp)

            if (user.customer && user.customer.stripe_id && user.customer.stripe_id !== '') {
                console.log("My console to chk step 1")
                let cardsInfo = await CustomerApi.getStripeCustomerCardsInfo({ stripe_id: user.customer.stripe_id, liveUser: liveUser });
                cardsInfo = (cardsInfo.data ? cardsInfo.data : [])
                console.log("cardsInfo>>>>>>>>>>>", cardsInfo)
                if (cardsInfo.length > 0) {
                    console.log("My console to chk step 2")
                    console.log("activeSubscription", activeSubscription)
                    if (user.customer.subscription && user.customer.subscription.subscription_id) {
                        if (Object.keys(activeSubscription).length !== 0 && activeSubscription.metadata.valid_for === "one_month") {
                            let buyDate = new Date(user.customer.subscription.plan_purchased_date)
                            let nowDate = new Date()
                            let diffDays = getDifferenceInDays(buyDate, nowDate)
                            if (diffDays > 30) {
                                cancelOldAndBuyNewOne(cardsInfo, price_id, plan_id, plan_name, total_minutes, discount)
                            }
                            else {
                                askModalConfimation(cardsInfo, price_id, plan_id, plan_name, total_minutes, discount)
                            }
                        }

                    } else {
                        let subscriptionHistory = user.customer.subscription_history;
                        buyPlan(cardsInfo, price_id, plan_id, plan_name, total_minutes, discount, subscriptionHistory, promoId, couponId)
                    }
                } else {
                    console.log("My console to chk step 3")
                    let temp = [];
                    setStartClicked(temp)
                    setIsModalOpen(true)
                    setClickedPlan({ 'plan_id': plan_id, 'plan_name': plan_name, 'price_id': price_id, 'total_minutes': total_minutes, 'discount': discount })
                }
            } else {
                console.log("My console to chk step 4")
                let temp = [];
                setStartClicked(temp)
                setIsModalOpen(true)
                setClickedPlan({ 'plan_id': plan_id, 'plan_name': plan_name, 'price_id': price_id, 'total_minutes': total_minutes, 'discount': discount })
            }
        } else {
            openNotificationWithIcon("info", "Info", "Looking like your session is expired. Please reload your page and try again.")
        }
    }

    /**
     * Function will ask confirmation from client while buying subscription. Since the old subscription is still active.
     * @params =  cardsInfo(Type:Object),price_id(Type:String), plan_id(Type:String), plan_name(Type:String),total_minutes(Type:String),discount(Type:String)
     * @response : no response
     * @author : Manibha
     */
    const askModalConfimation = (cardsInfo, price_id, plan_id, plan_name, total_minutes, discount) => {
        Modal.confirm({
            title: 'Your previous subscription will get expired and we will add the remaining minutes to your new subsctiption. Are you sure you want to buy new subscription?',
            okText: "Yes",
            cancelText: "No",
            className: 'app-confirm-modal',
            onOk() {
                setShowSpinner(true)
                cancelOldAndBuyNewOne(cardsInfo, price_id, plan_id, plan_name, total_minutes, discount)
            },
            onCancel() {
                setStartClicked([])
                setShowSpinner(false)
            }
        })
    }

    /**
     * Function will ask confirmation from client while canceling subscription, since the current subscription is still active.
     * @author : Vinit
     */
    const cancelAskModalConfirmation = () => {
        // mixpanel code//
        mixpanel.identify(user?.email);
        mixpanel.track('Customer - cancel subscription.');
        // mixpanel code//
        Modal.confirm({
            title: 'Are you sure you want to cancel your current subscription ?',
            okText: "Yes",
            cancelText: "No",
            className: 'app-confirm-modal',
            onOk() {
                cancelUserSubscription();
                // mixpanel code//
                mixpanel.identify(user?.email);
                mixpanel.track('Customer - clicked yes in cancel confirmation.');
                // mixpanel code//
            },
            onCancel() {
                // mixpanel code//
                mixpanel.identify(user?.email);
                mixpanel.track('Customer - clicked no in cancel confirmation.');
                // mixpanel code//
            }

        })
    }

    /**
    * Function is used to calculate difference in days between two dates.
    * @params =  date1(Type:DateObject),date2(Type:DateObject)
    * @response : returns difference in days between two dates
    * @author : Manibha
    */
    function getDifferenceInDays(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60 * 60 * 24);
    }

    /**
     * Function will new subscription and will keep the old active subscription in subscription history.
     * @params =  cardsInfo(Type:Object),price_id(Type:String), plan_id(Type:String), plan_name(Type:String),total_minutes(Type:String),discount(Type:String)
     * @response : no response
     * @author : Manibha
     */
    const cancelOldAndBuyNewOne = async (cardsInfo, price_id, plan_id, plan_name, total_minutes, discount) => {

        let subscriptionHistory = user.customer.subscription_history;
        const buySubscriptionResponse = await buyPlan(cardsInfo, price_id, plan_id, plan_name, total_minutes, discount, subscriptionHistory)
        console.log("My console for buySubscriptionResponse", buySubscriptionResponse)
        if (buySubscriptionResponse && buySubscriptionResponse.success) {
            let cancelDataToSend = {
                'subscription_id': user.customer.subscription.subscription_id,
                'liveUser': liveUser
            }
            console.log("CANCELLLLLLL AND BUY NEW ONEEEE")
            let cRes = await cancelSubscription(cancelDataToSend);
            console.log('cRes :::', cRes)
            if (cRes && cRes.success) {
                let oldPlanDetails = user.customer.subscription;
                oldPlanDetails['status'] = cRes.data.status;
                oldPlanDetails['plan_inactive_date'] = new Date()
                console.log('look at old data', oldPlanDetails);
                subscriptionHistory.push(oldPlanDetails);
                await createSubscriptionHistory({ cust_id: user.customer.id, "subscription_history": oldPlanDetails })
            } else {
                let temp = [];
                setStartClicked(temp)
                openNotificationWithIcon("error", "Error", "Failed to cancel old subscription and upgrade new subscription. Please reload your page and try again.")
            }
        }
    }
    const buyPlan = async (cardsInfo, price_id, plan_id, plan_name, total_minutes, discount, subscriptionHistory = [], promoId = '', couponId = '') => {

        openNotificationWithIcon("info", "Info", 'Buying subscription ....')
        console.log("couponId to buy plan", couponId)
        let cardObj = cardsInfo.find(o => o.default_card === "yes");
        let purchaseDate = moment().format('MM/DD/YYYY hh:mm a');
        let subscribeDataToSend = {
            'customer_id': cardObj['customer'],
            'price_id': price_id,
            'product_id': plan_id,
            'email': user.email,
            'name': user.firstName + ' ' + user.lastName,
            "liveUser": liveUser,
            'plan_purchased_date': moment(purchaseDate).format('MM-DD-YYYY'),

        }
        if ((promoId !== "" || couponId !== "") && plan_name === promoAppliedFor) {
            subscribeDataToSend.promoId = promoId
            subscribeDataToSend.couponId = couponId
        }
        console.log("subscribeDataToSend>>>>>>>>>>", subscribeDataToSend)
        let sRes = await buySubscription(subscribeDataToSend);

        console.log('Bought subscription response', sRes)
        if (sRes && sRes.success) {
            console.log("My console to check res at if")
            sendSubscriptionGTMTag(sRes)

            let cust_id = user.customer.id;
            let planDetails = {}
            total_minutes = parseInt(total_minutes);
            planDetails['plan_id'] = plan_id;
            planDetails['plan_name'] = plan_name;
            planDetails['plan_purchased_date'] = new Date();
            planDetails['total_minutes'] = total_minutes;
            planDetails['total_seconds'] = total_minutes * 60;
            planDetails['time_used'] = 0;
            planDetails['invoice_id'] = sRes.data.latest_invoice;
            planDetails['subscription_id'] = sRes.data.id;
            planDetails['discount'] = discount;
            planDetails['status'] = sRes.data.status;
            planDetails['paidPrice'] = sRes.paidPrice
            planDetails['priceOff'] = sRes.priceOff

            if (user?.customer?.subscription) {
                console.log("My console to chk for subs 1", { sub: user?.customer?.subscription })
                if (user?.customer?.subscription?.time_from_previous_subscription) {
                    console.log("My console to chk for subs time_from_previous_subscription", { sub: user?.customer?.subscription })
                    planDetails['time_from_previous_subscription'] = user?.customer?.subscription?.time_from_previous_subscription + (user?.customer?.subscription?.total_seconds - user?.customer?.subscription?.time_used)
                } else {
                    console.log("My console to chk for subs time_from_previous_subscription not exists", { sub: user?.customer?.subscription })
                    planDetails['time_from_previous_subscription'] = user?.customer?.subscription?.total_seconds - user?.customer?.subscription?.time_used
                }

                console.log("My console to chk for subs 2", { sub: user?.customer?.subscription })
                if (user?.customer?.subscription?.time_from_previous_subscription) {
                    console.log("My console to chk for subs grand_total_seconds", { sub: user?.customer?.subscription })
                    planDetails['grand_total_seconds'] = user?.customer?.subscription?.time_from_previous_subscription + (user?.customer?.subscription?.total_seconds - user?.customer?.subscription?.time_used) + total_minutes * 60
                } else {
                    console.log("My console to chk for subs grand_total_seconds 2", { sub: user?.customer?.subscription })
                    planDetails['grand_total_seconds'] = (user?.customer?.subscription?.total_seconds - user?.customer?.subscription?.time_used) + total_minutes * 60
                }
            } else {
                planDetails['grand_total_seconds'] = total_minutes * 60
            }

            if (subscriptionHistory && subscriptionHistory.length > 0) {
                await CustomerApi.updateCustomer(user.customer.id, { "subscription": planDetails })
            } else {
                await CustomerApi.updateCustomer(user.customer.id, { "subscription": planDetails })
            }
            await refetch()

            // Sending GTM tag for buy subscription event
            sendSubscriptionGTMTag(sRes)

            openNotificationWithIcon("success", "Success", sRes.messageToDisplay)
            let temp = [];
            setStartClicked(temp);

            let activePlan = plans.find(o => o.id === plan_id);

            let activePlanData = { ...activePlan }
            activePlanData['total_amount'] = parseFloat(activePlanData.price.unit_amount / 100) - (0.05 * parseFloat(activePlanData.price.unit_amount / 100)).toFixed(2)
            setActiveSubscription(activePlan);
            setIsPlanAvailable(true);
            setPlans([...plans]);
            setShowSpinner(false)
            return sRes

        } else if (sRes && sRes.success == false) {
            console.log("My console to check res at else if")
            await refetch()
            openNotificationWithIcon("error", "Error", sRes.messageToDisplay)
            let temp = [];
            setStartClicked(temp)
            setDisableBtn(false)
            setShowSpinner(false)
            return sRes
        } else {
            console.log("My console to check res at else")
            openNotificationWithIcon("error", "Error", "Something went wrong, please try again.")
            let temp = [];
            setStartClicked(temp)
            setDisableBtn(false)
            setShowSpinner(false)
        }
        setPromoId('')
        setCouponId('')
    }

    const handleBuySubscription = (planData) => {
        console.log("Buy subscription initiated", planData)
        buyPlanInit(planData.id, planData.name, planData.price.id, planData.metadata.total_minutes, planData.metadata.discount)
    }


    if (isLoading) {
        return (<React.Fragment key="findTech">
            <Col md="12" className="px-4 pt-2 text-center">
                <Loader height="100%" className="mt-5" />
            </Col>
            <Col md="12" className="px-4 pb-5 pt-3 text-center">
                <h3>Finding active subscription ...</h3>
            </Col>
        </React.Fragment>
        )
    }

    return (<div className='d-flex mt-5 col-12 w-100 justify-content-evenly flex-wrap'>
        {!isPlanAvailable && refinePlans && refinePlans.Business && refinePlans.Business.map((ele) => {
            console.log("My console for single plan data", ele)
            return <SubscriptionFlipCard popular={ele.id === popularSoftwareId} planData={ele} onYes={handleBuySubscription} setDisableBtn={setDisableBtn} disableBtn={disableBtn} />
        })}
        {!isLoading && isPlanAvailable &&
            <Card className="text-left">
                <Card.Header className="bg-light-blue max-width-991px-white-background">
                    <h5 className="m-0 font-weight-bold">Active Subscription</h5>
                </Card.Header>
                <Card.Body>
                    <Card.Title></Card.Title>
                    <div className='d-flex align-items-start flex-wrap'>
                        <div className='mr-250p'>
                            <h1 className='font-weight-bold'>Subscription Details</h1>
                            <hr />
                            <table cellPadding="10" className="my-subscription-table">
                                <tbody>
                                    <tr>
                                        <td>Subscription Name</td>
                                        <td className="text-success font-weight-bold">
                                            <div className='hignlighted-plan-name d-flex justify-content-center'>
                                                {activeSubscription.name}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="">
                                        <td>Subscription Cost</td>
                                        <td>{activeSubscription.price.currency === 'usd' ? '$' : activeSubscription.price.currency}{activeSubscription.price.unit_amount / 100}</td>
                                    </tr>

                                    {
                                        user?.customer?.subscription?.priceOff > 0 &&
                                        <tr className="">
                                            <td>Coupon Applied</td>
                                            <td style={{ color: "green" }}>{activeSubscription.price.currency === 'usd' ? '$' : activeSubscription.price.currency}<span>{user.customer.subscription.priceOff}</span></td>
                                        </tr>
                                    }
                                    <tr className="">
                                        <td>You paid </td>
                                        <td>{activeSubscription.price.currency === 'usd' ? '$' : activeSubscription.price.currency}<span>{user.customer.subscription.paidPrice}</span></td>
                                    </tr>

                                    <tr className="">
                                        <td>Purchased date</td>
                                        <td>{moment(user.customer.subscription.plan_purchased_date).format('ddd, MMM DD, YYYY, HH:mm')}</td>
                                    </tr>
                                    <tr>
                                        <td>Status</td>
                                        <td className={(user.customer.subscription.status === 'active' || user.customer.subscription.status === 'paid') ? 'text-success' : 'red-text' + "  text-capitalize"}>Active</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h1 className='font-weight-bold'>Timing Details</h1>
                            <hr />
                            <table cellPadding="10" className="my-subscription-table">
                                <tbody>
                                    <tr>
                                        <td className='d-flex justify-content-center align-items-center'>
                                            <TimerSharpIcon className='mr-10' />
                                            TimerTotal Subscription Time
                                        </td>
                                        <td>{
                                            user.customer.subscription.grand_total_seconds ?
                                                moment.utc((user.customer.subscription.grand_total_seconds) * 1000).format('HH:mm')
                                                :
                                                moment.utc((user.customer.subscription.total_seconds) * 1000).format('HH:mm')
                                        }</td>
                                    </tr>
                                    <tr>
                                        <td className='d-flex justify-content-start align-items-center'>
                                            <AvTimerSharpIcon className='mr-10' />
                                            Subscription Time used
                                        </td>
                                        <td>{moment.utc(user.customer.subscription.time_used * 1000).format('HH:mm')}</td>
                                    </tr>
                                    <tr>
                                        <td className='d-flex justify-content-start align-items-center'>
                                            <AvTimerSharpIcon className='mr-10' />
                                            Subscription Time left
                                        </td>
                                        <td>{
                                            user.customer.subscription.grand_total_seconds ?
                                                moment.utc((user.customer.subscription.grand_total_seconds - user.customer.subscription.time_used) * 1000).format('HH:mm')
                                                :
                                                moment.utc((user.customer.subscription.total_seconds - user.customer.subscription.time_used) * 1000).format('HH:mm')
                                        }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Button className="btn app-btn app-btn-light-blue mr-15" onClick={() => setShowSubscriptionPlansModal(true)} disabled={startClicked.length > 0}
                    >
                        {showSpinner ? <Spin className='subscription-spinner' /> :
                            <>
                                <span />
                                {activeSubscription.price.unit_amount === highestPlanRate &&
                                    <>Change</>
                                }
                                {highestPlanRate < activeSubscription.price.unit_amount &&
                                    <>Change</>
                                }
                                {highestPlanRate === 0 &&
                                    <>Upgrade</>
                                }
                                {highestPlanRate > activeSubscription.price.unit_amount &&
                                    <>Upgrade</>
                                }
                            </>
                        }
                    </Button>
                    <Button className="btn app-btn app-btn-light-blue ml-5" onClick={() => cancelAskModalConfirmation()} disabled={startClicked.length > 0}><>Cancel</></Button>
                </Card.Body>
            </Card>

        }
        <SubscriptionPlansModal buyPlanInit={buyPlanInit} user={user} showSubscriptionPlansModal={showSubscriptionPlansModal} setShowSubscriptionPlansModal={setShowSubscriptionPlansModal} />
        {stripePromise !== '' &&
            <Elements stripe={stripePromise}>
                <AddCardForm user={user} cardsInfo={cardInfoUpdated} setCardsInfo={setCardInfoUpdated} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setNewCardAdded={setNewCardAdded} source={"subscription"} setDisableBtn={setDisableBtn} />
            </Elements>
        }
    </div>)
};

export default Subscription;
