import CheckInCircle from "components/CheckInCircle";
import React, { useEffect, useState } from "react"
import { Row, Col } from "react-bootstrap";
import { ColorRing } from 'react-loader-spinner'
import HeadingText from "../Components/HeadingText";
import ProgressBar from "../Components/ProgressBar";
import SubHeadingText from "../Components/SubHeadeingText";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BasicButton from "components/common/Button/BasicButton";
import Testimony from "../Components/Testimony";
import AvgInfo from "../Components/AvgInfo";
import { useHistory, useLocation } from 'react-router';
import { getAllPlans, buySubscription } from "../../../../api/subscription.api";
import Loader from '../../../../components/Loader';
import * as CustomerApi from '../../../../api/customers.api';
import * as UserApi from '../../../../api/users.api';
import CardLogo from "components/common/CardLogo";
import { Radio } from 'antd';
import stripeSecureLogo from "../../../../assets/images/stripe-secure-logo.png"
import * as JobApi from '../../../../api/job.api';
import { openNotificationWithIcon, isLiveUser, GAevent, decideEstimatesToShowUsingLD } from '../../../../utils';
import moment from 'moment';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { JOB_STATUS, SECRET_KEY } from '../../../../constants';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import mixpanel from 'mixpanel-browser';
import * as PromoApi from '../../../../api/promo.api';
import * as PublicApi from "../../../../api/public.api"
import { useJob } from '../../../../context/jobContext';
import { useSocket } from '../../../../context/socketContext';
import { Modal } from 'antd';
import { useAuth } from "context/authContext";
import { useNotifications } from '../../../../context/notificationContext';
import EditJobModal from "../../ProfileSetup/Components/EditJobModal";
import * as SoftwareApi from '../../../../api/software.api';
import * as PromocodeApi from '../../../../api/promoCode.api';
import * as StripeApi from '../../../../api/stripeAccount.api';
import * as AppliedCoupons from '../../../../api/appliedCoupons.api';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import SignUpHeading from "../../../../components/common/SignUpHeading";

const CompleteYourPurchase = ({ user, setbusinessPlanStepNumber, jobFlowStepsObj, setShowSubscriptionPlanModal, setShowtwentyPercentModal, job, isScheduleJob, isFirsJob }) => {
    const history = useHistory();
    const location = useLocation();
    const { refetch, getGuestUser } = useAuth();
    const queryParams = new URLSearchParams(location.search);
    const planId = queryParams.get('planId') ? queryParams.get('planId') : false;
    const jobIdFromUrl = queryParams.get("jobId") ? queryParams.get("jobId") : false
    const technicianId = queryParams.get("technicianId") ? queryParams.get("technicianId") : false
    const elements = useElements();
    const stripe = useStripe();
    let liveUser;
    const [planData, setPlanData] = useState()
    const [planInfo, setPlanInfo] = useState()
    const [promocode, setPromocode] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const [showCCForm, setShowCCForm] = useState(true)
    const [disableBtn, setDisableBtn] = useState(false)
    const [promoId, setPromoId] = useState("")
    const [showOverlayLoading, setShowOverlayLoading] = useState(false);
    const [showMessageDialog, setShowMessageDialog] = useState(false);
    const [couponId, setCouponId] = useState(queryParams.get("couponCode") ? queryParams.get("couponCode") : "")
    const [showPromoCodeInputField, setShowPromoCodeInputField] = useState(false)
    const [formData, setFormData] = useState({ zip: "" })
    const [showSubscriptionPlanModalTime, setShowSubscriptionPlanModalTime] = useState(150000)
    const [discountModalShown, setDiscountModalShown] = useState(false)
    const [totalCustomerWithThisSubscrition, setTotalCustomerWithThisSubscrition] = useState(0)
    const { updateJob, setJob, fetchJob, fetchJobAsGuest } = useJob();
    const [jobData, setJobData] = useState(true);
    const { socket } = useSocket();
    const { createNotification, fetchNotifications } = useNotifications();
    const [softwareList, setSoftwareList] = useState([]);
    const [showEditJobModal, setShowEditJobModal] = useState(false);
    const [promoCodeApplied, setIsPromocodeApplied] = useState({});
    const [calculatedPrices, setCalculatedPrices] = useState({});
    const [customersDefaultCC, setCustomersDefaultCC] = useState()
    const [customersDefaultCCBrand, setCustomersDefaultCCBrand] = useState()
    const [changeCreditCard, setChangeCreditCard] = useState(false)
    const [customersAllCC, setCustomersAllCC] = useState()
    const [selectedCreditCard, setSelectedCreditCard] = useState()
    const [isJobSummaryUpdate, setIsJobSummaryUpdate] = useState(false);
    const [couponDiscountedPrice, setCouponDiscountedPrice] = useState();
    const [couponAlreadyUsed, setCouponAlreadyUsed] = useState(false);

    useEffect(() => {
        if (!discountModalShown) {
            if (planId) {
                setTimeout(() => {
                    setShowtwentyPercentModal(true)
                    setDiscountModalShown(true)
                }, showSubscriptionPlanModalTime);
            }
        }
    }, [showSubscriptionPlanModalTime])

    useEffect(() => {
        (async () => {
            if (user.roles[0] !== "owner") {
                window.location.href = "/"
            }
            if (jobIdFromUrl) {
                console.log("My console from job summary", jobIdFromUrl)
                fetchJob(jobIdFromUrl)
                const res = await SoftwareApi.getSoftwareList();
                if (res) {
                    console.log("software api response from job summary component", res)
                    setSoftwareList(res.data)
                }
            }
        })();
    }, [])

    useEffect(() => {
        if (document.getElementsByClassName('loaderOverlay').item(0)) {
            document.getElementsByClassName('loaderOverlay').item(0).parentElement.style.background = 'rgba(255,255,255,0.7)';
            document.getElementsByClassName('loaderOverlay').item(0).getElementsByClassName('ant-modal-content').item(0).style.background = 'transparent';
            document.getElementsByClassName('loaderOverlay').item(0).getElementsByClassName('ant-modal-content').item(0).style.boxShadow = 'none';
            document.getElementsByClassName('loaderOverlay').item(0).getElementsByClassName('ant-modal-body').item(0).style.textAlign = 'center';
            document.getElementsByClassName('loaderOverlay').item(0).getElementsByClassName('ant-modal-footer').item(0).style.borderTop = 0;
        }

        if (showOverlayLoading) {
            setTimeout(() => {
                setShowOverlayLoading(false);
                setShowMessageDialog(true);
            }, 5000);
        }

    }, [showOverlayLoading]);

    useEffect(() => {
        if (document.getElementsByClassName('messageDialog').item(0)) {
            document.getElementsByClassName('messageDialog').item(0).parentElement.style.background = 'rgba(255,255,255,0.7)';
            if (document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-header').item(0)) {
                document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-header').item(0)
                    .remove();
            }

            document.getElementsByClassName('ant-modal-close-x').item(0).addEventListener('click', () => {
                setShowMessageDialog(false);
            });
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-content').item(0).style.background = 'white';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-content').item(0).style.boxShadow = 'none';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-content').item(0).style.borderRadius = '10px';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-content').item(0).style.padding = '20px';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-body').item(0).style.textAlign = 'center';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-body').item(0).style.display = 'flex';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-body').item(0).style.flexDirection = 'column';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-body').item(0).style.alignItems = 'center';
            document.getElementsByClassName('messageDialog').item(0).getElementsByClassName('ant-modal-footer').item(0).style.borderTop = 0;
        }
    }, [showMessageDialog]);

    useEffect(() => {
        if (job) {
            if (user) {
                if (job.status !== "Draft") window.location.href = "/"
            }
            if (user && user.email === "guest@geeker.co") {
                if (job?.guestJob) localStorage.removeItem(SECRET_KEY);
            }
        }
    }, [job])


    useEffect(() => {
        console.log("My console for customersDefaultCC", customersDefaultCC)
    }, [customersDefaultCC])

    useEffect(() => {
        (async () => {
            liveUser = await isLiveUser(user)
            console.log("Initial data in useEffect", { planId, user })
            //Checking if customer already have card added to account.
            if (user) {
                let customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
                    user: user,
                    liveUser: liveUser
                });
                if (!user.customer.askedForBusiness) {
                    await CustomerApi.updateCustomer(user.customer.id, { askedForBusiness: false })
                }
                console.log("My console for customer_info", customer_info)
                if (customer_info.has_card_or_subscription) {
                    setShowCCForm(false)
                    let cardsInfo = await CustomerApi.getStripeCustomerCardsInfo({ stripe_id: user.customer.stripe_id, liveUser: liveUser });
                    console.log("My console for all user's card", cardsInfo.data)

                    //Removing duplicate cards from array
                    const filteredDuplicateCreditCards = cardsInfo.data.filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.fingerprint === value.fingerprint
                        ))
                    )
                    console.log("My console for filteredArr", filteredDuplicateCreditCards)

                    setCustomersAllCC(filteredDuplicateCreditCards)

                    const defaultCard = cardsInfo.data.filter((card) => card.default_card === "yes")
                    console.log("My console for user's default card", defaultCard)

                    setCustomersDefaultCC(defaultCard[0])
                    let selectedCard = { data: defaultCard }
                    setSelectedCreditCard(selectedCard)
                    setCustomersDefaultCCBrand(defaultCard[0].brand)
                }
                //Fetching promocode data
                let promolist = await PromoApi.retrieveCustomerPromoCodes({ "customer_id": user.customer.id, "redeemed": true })

                console.log("promolist:::::", promolist)
            }
            if (jobIdFromUrl) {
                const jobRes = await JobApi.retrieveJob(jobIdFromUrl)
                setJobData(jobRes)
                setIsLoading(false)
            }

            //Getting subscriotion plan info.
            if (planId) {
                const totalCusotmer = await PublicApi.getTotalCustomerCount({ "subscription.plan_id": planId })
                console.log("totalCusotmer with current subscription plan ", totalCusotmer)
                setTotalCustomerWithThisSubscrition(totalCusotmer.totalCount)
                let allPlans = await getAllPlans({ "liveUser": user.customer.customerType === "live" })
                const currentPlan = allPlans.data.filter(item => item.id === planId)
                const keyFeatures = currentPlan[0].metadata.key_features.replace("[", "").replace("]", "").replaceAll(`"`, "").split(",")
                setPlanInfo(keyFeatures)
                setPlanData(currentPlan[0])
                setIsLoading(false)
                if (couponId !== "") {
                    console.log("Coupon code", couponId)
                    const couponCodeInfo = await StripeApi.getCouponInfo(couponId)
                    console.log("couponCodeInfo", couponCodeInfo)
                    const discountPercentage = couponCodeInfo.data.percent_off
                    console.log("couponCodeInfo 2", { currentPlan, discountPercentage })
                    if (discountPercentage === 100) {
                        console.log("100 % discount")
                        setCouponDiscountedPrice(0)
                    } else {
                        const finalDiscountedPrice = ((planData?.price?.unit_amount / 100) * ((100 - discountPercentage) / 100))
                        console.log("finalDiscountedPrice", finalDiscountedPrice)
                        setCouponDiscountedPrice(finalDiscountedPrice)
                    }
                    const previouslyAppliedCoupons = await AppliedCoupons.getusedCouponsByCustomerId(user.customer.id)
                    console.log("previouslyAppliedCoupons", previouslyAppliedCoupons)
                    for (let x in previouslyAppliedCoupons) {
                        if (previouslyAppliedCoupons[x].coupon_id === couponId) {
                            setCouponAlreadyUsed(true)
                            return
                        }
                    }
                }
            } else if (window.location.href.includes("registered")) {
                setIsLoading(false)
            }
            console.log("My console for live user", liveUser)
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if (!user) {
                //Login temporarily as guest user to make backend requests
                const guestUserRes = await getGuestUser();
                console.log("My console to check guest user", guestUserRes)
                //Fetch job data as guest user.
                const fetchUserRes = await fetchJobAsGuest(jobIdFromUrl, guestUserRes.token.accessToken)
                console.log("My console to fetch job as guest user", fetchUserRes)
                setJob(fetchUserRes)
                setCalculatedPrices(calculatePrice(fetchUserRes.software))
                setJobData(fetchUserRes)
                if (fetchUserRes?.guestJob) {
                    console.log("tetch token removed from component jobSummary index")
                    localStorage.removeItem(SECRET_KEY);
                }
                console.log("My con from job summary component if", showCCForm)
                setDisableBtn(false)
                const featureResponse = await decideEstimatesToShowUsingLD(guestUserRes?.user, jobIdFromUrl);
            } else {
                const jobRes = await JobApi.retrieveJob(jobIdFromUrl)
                setJobData(jobRes)
                setCalculatedPrices(calculatePrice(jobRes.software))
                console.log("My con from job summary component else", jobRes)
                setDisableBtn(false)
            }
            const res = await SoftwareApi.getSoftwareList();
            if (res) {
                console.log("software api response from job summary component", res)
                setSoftwareList(res.data)
            }
            if (user) {
                const featureResponse = await decideEstimatesToShowUsingLD(user, jobIdFromUrl);
            }
        })();
    }, [isJobSummaryUpdate])



    const calculatePrice = (softwareData, hire_expert = false, forfreeMinutes = false) => {
        let initPriceToShow = 0;
        let finalPriceToShow = 0;
        try {
            let price_per_six_min = softwareData.rate
            let time1 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
            let time2 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)
            let main_price = ''
            if (hire_expert) {
                main_price = softwareData.twoTierEstimatePrice
            } else {
                main_price = softwareData.estimatedPrice
            }
            console.log("> main price >>>>>>>>> ", main_price)
            let price1 = (softwareData && String(main_price).indexOf('-') !== -1 ? parseInt(String(main_price).split("-")[0]) : 0)
            let price2 = (softwareData && String(main_price).indexOf('-') !== -1 ? parseInt(String(main_price).split("-")[1]) : 0)

            price1 = (price1 ? price1 : price_per_six_min)
            price2 = (price2 ? price2 : price_per_six_min)
            initPriceToShow = forfreeMinutes ? (Math.ceil(time1 / 6) - 1) * parseInt(price1) : Math.ceil(time1 / 6) * parseInt(price1)
            finalPriceToShow = forfreeMinutes ? (Math.ceil(time2 / 6) - 1) * parseInt(price2) : Math.ceil(time2 / 6) * parseInt(price2)

            initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 0)
            finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 0)

            console.log("initPriceToShow >>>>>>>>>> ", initPriceToShow)
        }
        catch (err) {
            console.error("issue in calculating price :::: ", err)
        }
        return { initPriceToShow: initPriceToShow, finalPriceToShow: finalPriceToShow }
    }


    const handlePromocode = async () => {

        const couponInfo = await StripeApi.getCouponInfo(promoId)
        console.log("My console for couponInfo", couponInfo)
        if (couponInfo.success) {
            setCouponId(promoId)
            openNotificationWithIcon("success", "Success", "Promocode applied successfulyy")
        } else {
            openNotificationWithIcon("error", "Invalid Promocode", couponInfo.errorMsg)
        }

    }

    const buySubscriptionPlan = async (cardsInfo, price_id, plan_id, plan_name, total_minutes, discount, subscriptionHistory = [], promoId = '', couponId = '') => {
        openNotificationWithIcon("info", "Info", 'Buying subscription ....')
        console.log("My console for cardsInfo ", cardsInfo)
        let cardObj

        // Look for default card if cardInfo contains more than one card
        if (cardsInfo.length > 1) {
            cardObj = cardsInfo.data.find(o => o.default_card === "yes");
        } else {
            cardObj = cardsInfo.data[0]
        }
        console.log("My console for cardsInfo 2", cardObj)
        let purchaseDate = moment().format('MM/DD/YYYY hh:mm a');
        let subscribeDataToSend = {
            'customer_id': cardObj['customer'],
            'price_id': price_id,
            'product_id': plan_id,
            'email': user.email,
            'name': user.firstName + ' ' + user.lastName,
            "liveUser": user.customer.customerType === "live",
            'plan_purchased_date': moment(purchaseDate).format('MM-DD-YYYY'),

        }
        if ((promoId !== "" || couponId !== "")) {
            subscribeDataToSend.promoId = promoId
            subscribeDataToSend.couponId = couponId
        }
        console.log("subscribeDataToSend>>>>>>>>>>", subscribeDataToSend)
        let sRes = await buySubscription(subscribeDataToSend);

        console.log('sRes Data', sRes)
        if (sRes && sRes.success) {
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
            openNotificationWithIcon("success", "Success", sRes.messageToDisplay)
            setbusinessPlanStepNumber(jobFlowStepsObj['GotOurGeeks'])
        } else if (sRes && sRes.success == false) {
            if (sRes.errorMessage) {
                openNotificationWithIcon("error", "Error", sRes.errorMessage)
            } else {
                openNotificationWithIcon("error", "Error", sRes.messageToDisplay)
            }
            setShowCCForm(true)
            setDisableBtn(false)
        }
    }

    const handlePurchase = async () => {
        if (couponAlreadyUsed) {
            openNotificationWithIcon("error", "Error", "You already used up this coupon")
            return
        }
        setShowSubscriptionPlanModalTime(150000)
        setDisableBtn(true)

        //if customer already have a card
        if (!showCCForm) {
            console.log("Customer have card")
            let subscriptionHistory = user.customer.subscription_history;
            buySubscriptionPlan(selectedCreditCard, planData.price.id, planData.id, planData.name, planData.metadata.total_minutes, planData.metadata.discount, subscriptionHistory, promoId, couponId)
        } else {
            console.log("No card")
            if (jobIdFromUrl && promocode && promoCodeApplied) {
                const requiredData = {
                    "promoCodeId": promoCodeApplied.id,
                    "promoCode": promoCodeApplied.promo_code,
                    "discountType": promoCodeApplied.discount_type,
                    "couponcodeDiscount": promoCodeApplied.discount_value
                }
                console.log("Promocode Discount Details- Guest User Side", requiredData)
                await window.sessionStorage.setItem("promo-code-details", JSON.stringify(requiredData))
            }
            const cardElement = elements.getElement(CardNumberElement);
            var dataToStripe = {}
            dataToStripe['metadata'] = formData
            if (!stripe || !elements) {
                setDisableBtn(false)
                return;
            }
            stripe.createToken(cardElement, dataToStripe).then(
                async (payload) => {
                    console.log('payload>>>>>>>>>>>>>>>>>>>>', payload)
                    if (payload['error']) {
                        setDisableBtn(false)
                        openNotificationWithIcon("error", "Error", payload['error']['message'])
                        return;
                    } else {
                        if (formData.zip === "") {
                            setDisableBtn(false)
                            openNotificationWithIcon("error", "Error", "Zip cannot be left empty")
                            return
                        } else {
                            await UserApi.updateUser({ userId: user.id, zip: formData.zip })
                        }
                        // retrieve customer's strip id to Db
                        let retrieve_cust = await CustomerApi.retrieveCustomer(user?.customer?.id);
                        console.log('addCardForm handleSubmit retrieve_cust::', retrieve_cust)
                        if (!retrieve_cust.stripe_id || retrieve_cust.stripe_id === '' || retrieve_cust.stripe_id == null) {
                            checkCardAndAddCardToCustomer(cardElement, dataToStripe, payload, true, false)
                        } else {
                            checkCardAndAddCardToCustomer(cardElement, dataToStripe, payload, false, retrieve_cust.stripe_id)
                        }
                    }

                }
            );
        }
    }
    async function checkCardAndAddCardToCustomer(cardElement, data, payload, newCustomer, stripe_customer_id) {

        let updatedCustomer
        if (newCustomer) {
            console.log('addCardForm handleSubmit createCustomerStripe ::')
            // creating customer's stripe id
            const result_customer = await CustomerApi.createCustomerStripe({
                email: user.email,
                liveUser: user.customer.customerType === "live"
            })

            var customer_id = result_customer.id
            // updating customers strip id in DB
            updatedCustomer = await CustomerApi.updateCustomer(user.customer.id, { "stripe_id": customer_id })
            stripe_customer_id = customer_id
            if (job && job.id) {
                // updating job.id
                JobApi.updateJob(job.id, { tech_search_start_at: new Date() });
            }
        }
        //adding card to customer's strip.id
        let result_card = await CustomerApi.addCardToCustomerStripe({
            liveUser: user?.customer?.customerType === "live",
            stripe_id: stripe_customer_id,
            token_id: payload.token.id,
            planId: planId ? planId : "NA",
            jobId: job && job.id ? job.id : "NA"
        })

        if (result_card['error'] != undefined) {
            setDisableBtn(false)
            openNotificationWithIcon("error", "Error", result_card['error']['message'])
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Card not added due to some error in card.');
            // mixpanel code//
        } else {
            // Making the new card as default card  
            if (result_card["id"]) {
                await CustomerApi.updateDefaultCard({
                    liveUser: user?.customer?.customerType === "live",
                    card_id: result_card["id"],
                    customer_id: stripe_customer_id,
                });
            }

            openNotificationWithIcon("success", "Success", "Card details has been saved.")
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Card details added.');
            // mixpanel code//
            if (jobIdFromUrl) {
                // Holding $100 Dollars here from customer which will be refunded or deducted depnding on customer action
                const custObj = {
                    "stripe_id": stripe_customer_id,
                    'liveUser': user?.customer?.customerType === "live",
                    'jobId': job?.id
                }
                console.log("custObj:::", custObj)
                const holdChargeResponse = await CustomerApi.holdChargeFromCustomer(custObj);
                // mixpanel code//
                mixpanel.identify(user.email);
                mixpanel.track('Customer - Hold $100 from customer', holdChargeResponse);
                // mixpanel code//

                // This condition check if $100 hold is not successful then redirect to dashboard
                if (holdChargeResponse.status !== "Successful") {
                    openNotificationWithIcon("error", "Error", holdChargeResponse.message)
                    setDisableBtn(false);
                    return;
                } else {
                    refetch()
                    let promoCodeDetails = await window.sessionStorage.getItem("promo-code-details");
                    promoCodeDetails = JSON.parse(promoCodeDetails)
                    console.log("Checking Parsed Data is Available--", promoCodeDetails)
                    await updatePromoCodeDetails(promoCodeDetails, jobIdFromUrl);
                    if (localStorage.getItem("isScheduleJob")) {
                        localStorage.removeItem("isScheduleJob")
                        // updating scheduled job into DB
                        const updatedJob = await JobApi.updateJob(jobIdFromUrl, {
                            status: JOB_STATUS.SCHEDULED,
                            customer: user.customer.id,
                        })
                        console.log("My console to see updatedJob", updatedJob)
                        await emitSocketCreateFetchNotification(updatedJob)
                        setTimeout(() => {
                            window.location.href = '/dashboard?&scheduleJobId=' + jobIdFromUrl;
                            setDisableBtn(false)
                        }, 2000);
                    } else {
                        console.log("Going to Page helpIsOnTheWay")
                        await JobApi.updateJob(jobIdFromUrl, {
                            status: "Pending",
                            tech_search_start_at: new Date(),
                            customer: user.customer.id,
                        })

                        window.location.href = `/customer/profile-setup?page=tech-search&jobId=${jobIdFromUrl}`
                        setDisableBtn(false)
                    }
                }
                if (user && job && job.GA_conversion_event_called === undefined) {
                    GAevent('Conversion', isScheduleJob ? 'scheduled_job' : 'new_job', 'Conversion', user.customer.id ? user.customer.id : user.customer)
                    JobApi.updateJob(job.id, { GA_conversion_event_called: 'yes' });
                }
            } else {
                if (planId) {
                    let cardsInfo
                    if (updatedCustomer) {
                        cardsInfo = await CustomerApi.getStripeCustomerCardsInfo({ stripe_id: updatedCustomer.stripe_id, liveUser: user?.customer?.customerType === "live", });
                    } else {
                        cardsInfo = await CustomerApi.getStripeCustomerCardsInfo({ stripe_id: user.customer.stripe_id, liveUser: user?.customer?.customerType === "live", });
                    }
                    console.log("Customer have card cardsInfo", cardsInfo)
                    let subscriptionHistory = user.customer.subscription_history;
                    buySubscriptionPlan(cardsInfo, planData.price.id, planData.id, planData.name, planData.metadata.total_minutes, planData.metadata.discount, subscriptionHistory, promoId, couponId)
                }
                else {
                    window.location.href = "/"
                }
            }
        }
    }
    // Update Details of User and JobID in Promocode Database
    const updatePromoCodeDetails = async (promoCodeDetails, jobId) => {
        try {
            console.log("Checking Parsed Data is Available--", promoCodeDetails)
            if (promoCodeDetails && promoCodeDetails.promoCodeId) {
                const updateData = {
                    user_id: user && user.id,
                    job_id: jobId,
                    used_date: new Date()
                }
                console.log('updateData', updateData)
                // updating promocode details to db
                const updateResponse = await PromocodeApi.updatePromoData(promoCodeDetails.promoCodeId, updateData);
                if (updateResponse) {
                    const updateUser = {
                        "coupon_id": promoCodeDetails.promoCodeId,
                        "coupon_code": promoCodeDetails.promoCode,
                        "discount_type": promoCodeDetails.discountType,
                        "coupon_code_discount": promoCodeDetails.couponcodeDiscount
                    }
                    await updateJob(jobId, updateUser)
                    sessionStorage.removeItem('promo-code-details')
                    return;

                }
            } else {
                return;
            }

        } catch (error) {
            console.error("updating job details with promocode if applied  : error ", error)
        }
    }

    /**
      * emit send-schedule-alerts socket and create / fetch notification customer notifications
      * @params : jobStats(Type:Object): Have job details
      * @returns : null
      * @author : Ridhima Dhir
      */
    const emitSocketCreateFetchNotification = async (jobStats) => {
        try {
            console.log("send-schedule-alerts :::::::::::", jobStats)
            //Notification for customer
            const notificationData = {
                user: user.id,
                job: jobStats.id,
                read: false,
                actionable: false,
                title: 'We are finding a technician for you. We will inform you when we find the technician',
                type: 'Scheduled Job',
            };
            console.log("notificationData ::::::::", notificationData)
            await createNotification(notificationData);
            await fetchNotifications({ user: user.id });

            console.log("My console to see now")

            // call send-schedule-alerts socket from backend.
            // It will find available techs and send alerts by sms/email/notification
            socket.emit('search-for-tech', {
                jobId: jobStats.id,
                customerTimezone: user.timezone,
                jobData: jobStats,
                primaryTime: jobStats.primarySchedule,
                phoneNumber: user.customer.phoneNumber,
                customerName: user.firstName,
                customerEmail: user.email,
                technicianId: technicianId ? technicianId : false,
            });
        } catch (err) {
            mixpanel.identify(user.email);
            mixpanel.track('There is catch error while create/fetch notification', { jobStats: jobStats, errMessage: err.message });
            console.error('There is catch error while create/fetch notification  :::: ' + err.message)
        }
    }
    const handleChange = () => {
        setShowSubscriptionPlanModal(true)
        setShowSubscriptionPlanModalTime(150000)
    }
    const handleJobEdit = () => {
        setShowEditJobModal(true);
        setIsJobSummaryUpdate(false);
    }


    const handleRadioButtonChange = (e) => {
        console.log("My console for handleRadioButtonChange", e.target.value)
        let selectedCard = { data: [e.target.value] }
        setSelectedCreditCard(selectedCard)
        setCustomersDefaultCC(e.target.value)
    }

    const handleCreditCardChange = () => {
        setChangeCreditCard(true)
    }

    if (isLoading) return <Loader height="500px" />;

    return <div className="custom-container  min-height-inherit">
        <Modal
            footer={[]}
            centered
            bodyStyle={{ borderRadius: "10px", borderBottom: "0px" }}
            title="We're Sorry"
            className="paypal-confirm-modal messageDialog"
            closable
            visible={showMessageDialog}
        >
            <h1 style={{ fontWeight: "bold", fontSize: 32 }}>😞 We're Sorry.</h1>
            <p style={{ fontSize: 22, fontWeight: "bold", width: "250px" }}>
                Pay with Paypal isn't working at the moment.
            </p>
            <BasicButton
                onClick={() => {
                    setShowMessageDialog(false);
                }}
                btnTitle={"Pay with Credit Card"}
                height={"67px"}
                width={"190px"}
                background={"#01D4D5"}
                color={"#fff"}
            />
        </Modal>
        <Modal
            centered
            className="app-confirm-modal loaderOverlay"
            closable={false}
            footer={[]}
            visible={showOverlayLoading}
        >
            <ColorRing
                colors={["#01D4D5", "#01D4D5", "#01D4D5", "#01D4D5", "#01D4D5"]}
            />
        </Modal>
        <Row className="min-height-inherit d-flex justify-content-center align-items-center parent-row">
            <Col md={9} xs={12} className="d-flex flex-column min-height-inherit max-width-768-mb-20px">
                {planId && <ProgressBar currentStep={3} />}
                <div className="d-flex flex-column justify-content-center align-items-center min-height-inherit">
                    <div className="mb-1 text-center">
                        {planId ?
                            <HeadingText firstBlackText={"Complete "} secondGreenText={" your purchase"} />
                            :
                            <HeadingText firstBlackText={"Add your "} secondGreenText={" card"} />
                        }
                    </div>
                    <div className="mb-50">
                        <SubHeadingText text={"*This is to verify your card. You won’t be charged until you get help! "} />
                    </div>
                    {planId && <div className="selected-plan-summary mb-20">
                        <Row>
                            <Col md={6} sm={12} xs={12} className={`selected-plan-summary-col  ${disableBtn ? "my-pe-none" : ""}`} >
                                <div className="mb-2">
                                    <div>
                                        <span className="small-team-text">{planData?.name}</span>
                                    </div>
                                    <div className="mb-25">
                                        <span className="purchase-number">{totalCustomerWithThisSubscrition > 30 ? totalCustomerWithThisSubscrition : "30"} Purchased this plan!</span><span className="clap-emoji">👏🏻</span>
                                    </div>
                                    {!queryParams.get("couponCode") && <div className="mb-0.5">
                                        <span className="actual-price">${planData?.metadata?.reg_price}</span>&nbsp;&nbsp;
                                        <span className="discounted-price">${planData?.price?.unit_amount / 100}</span>
                                    </div>}
                                    {queryParams.get("couponCode") && <div className="mb-0.5">
                                        <span className="actual-price">${planData?.price?.unit_amount / 100}</span>&nbsp;&nbsp;
                                        <span className="discounted-price">${couponDiscountedPrice}</span>
                                    </div>}
                                    <span className="change-text" onClick={handleChange}>
                                        Edit
                                    </span>
                                </div>
                            </Col>
                            <Col md={6} sm={12} xs={12} className="selected-plan-summary-col pr-0-imp" >
                                <div className="">
                                    {planInfo && planInfo.map((ele) => {
                                        return <div className="d-flex align-items-center">
                                            <CheckInCircle bgColor={"turcose"} style={{ height: "13px", width: "13px" }} checkStyle={{ color: "black" }} />
                                            &nbsp;&nbsp;
                                            <span className="text-with-check">{ele}</span>
                                        </div>
                                    })}
                                </div>
                            </Col>
                        </Row>
                    </div>}
                    {/* {jobIdFromUrl && <div className="selected-plan-summary mb-20 max-w-500px w-100p mb-2">
                        <Row>
                            <Col className="d-flex align-items-center justify-content-between p-2">
                                <SignUpHeading heading={"Job Summary"} fontSize={"20px"} color={"#01D4D5"} boldText={true} />
                                <div className="edit-icon-div" title="Update job summary" onClick={handleJobEdit}>
                                    <FontAwesomeIcon className="editJobSummary" icon={faPencilAlt} />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} sm={12} xs={12} className={`selected-plan-summary-col  ${disableBtn ? "my-pe-none" : ""}`} >
                                <div className="">
                                    <div className="mb-8">
                                        <span className="jobSummaryLabel">Software:</span>
                                    </div>
                                    <div>
                                        <span className="jobSummaryInfo">{jobData?.software?.name}</span>
                                    </div>
                                    <div className="mb-8">
                                        <span className="jobSummaryLabel">Area:</span>
                                    </div>
                                    <div>
                                        <span className="jobSummaryInfo">{jobData?.subOption}</span>
                                    </div>
                                    <div className="mb-8">
                                        <span className="jobSummaryLabel">Details:</span>
                                    </div>
                                    <div>
                                        <span className="jobSummaryInfo">{jobData?.issueDescription}</span>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6} sm={12} xs={12} className="selected-plan-summary-col pr-0-imp" >
                                <div className="">
                                    <div className="mb-8">
                                        <span className="jobSummaryLabel">Estimated Wait Time:</span>
                                    </div>
                                    <div>
                                        <span className="jobSummaryInfo">{`${jobData?.software?.estimatedWait} min`}</span>
                                    </div>
                                    <div className="mb-8">
                                        <span className="jobSummaryLabel">Most jobs like yours take between:</span>
                                    </div>
                                    <div>
                                        <span className="jobSummaryInfo">{`${jobData?.software?.estimatedTime} min`}</span>
                                    </div>
                                    <div className="mb-8">
                                        <span className="jobSummaryLabel">Most jobs like yours cost between:</span>
                                    </div>
                                    <div>
                                        {user.roles[0] === "owner" ? <>
                                            {user && !isFirsJob &&
                                                <span className="job-summary-value">
                                                    ${calculatedPrices.initPriceToShow}-${calculatedPrices.finalPriceToShow}
                                                </span>
                                            }
                                            {(!user || isFirsJob) &&
                                                <span className="strike-through">
                                                    ${calculatedPrices.initPriceToShow}-${calculatedPrices.finalPriceToShow}
                                                </span>
                                            }{" "}
                                            {(!user || isFirsJob) &&
                                                <span className="job-summary-value">
                                                    ${(Number(calculatedPrices.initPriceToShow ? calculatedPrices.initPriceToShow - job?.software?.rate : ""))}-${(Number(calculatedPrices.finalPriceToShow ? calculatedPrices.finalPriceToShow - job?.software?.rate : ""))}
                                                </span>
                                            }</>
                                            : "NA"}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div> } */}

                    {!showCCForm && customersDefaultCC && !changeCreditCard && <div className="max-w-500px w-100p mb-2">
                        <SubHeadingText text={"Payment Method"} />
                        <div className="business-plan-cc-div pt-pb-20-imp">
                            <div className="business-plan-cc-custom-container">
                                <Row>
                                    <Col>
                                        <div className="d-flex justify-content-between">
                                            <div className="d-flex align-items-center">
                                                <CardLogo cardType={customersDefaultCCBrand} imgClass={"card-logo mr-3"} />
                                                <span className="CC-last-four-digits">********{customersDefaultCC.last4}</span>
                                            </div>
                                            <span className="CC-change-text" role="button" onClick={handleCreditCardChange}>Change</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>}

                    {changeCreditCard && customersAllCC && <div className="max-w-500px w-100p mb-2">
                        <SubHeadingText text={"Saved Credit Cards"} />

                        <Radio.Group name={"test"} className="mb-35 ml-5 w-100p CC-radio-btns" value={customersDefaultCC}>
                            {customersAllCC.map((singleCard, index) => {
                                return <div className="business-plan-cc-div pt-pb-20-imp mb-3">
                                    <div className="business-plan-cc-custom-container">
                                        <Radio value={singleCard} onChange={handleRadioButtonChange} className="d-flex min-width-100p">
                                            <Row>
                                                <Col>
                                                    <div className="d-flex align-items-center">
                                                        <CardLogo cardType={singleCard.brand} imgClass={"card-logo mr-3 ml-1"} />
                                                        <span className="CC-last-four-digits">********{singleCard.last4}</span>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Radio>
                                    </div>
                                </div>
                            })
                            }
                        </Radio.Group>
                    </div>}
                    {showCCForm && <div className="max-w-500px w-100p mb-2">
                        <SubHeadingText text={"Credit Card Details"} />
                        <div className="business-plan-cc-div">
                            <div className="business-plan-cc-custom-container">
                                <Row>
                                    <Col md={6} sm={12} className="d-flex justify-content-center align-items-center max-width-768-mb-20px">
                                        <div>
                                            <FontAwesomeIcon icon={faCreditCard} className="business-plan-cc-icon" />
                                        </div>
                                        <CardNumberElement className="" options={{ placeholder: "Card Number" }} />
                                    </Col>
                                    <Col md={6} sm={12} className="d-flex justify-content-center max-width-280-flex-wrap max-width-280-justify-content-start align-items-center">
                                        <CardExpiryElement className="mt-28-imp max-width-280-mb-10" options={{ placeholder: "MM / YY" }} disabled={true} />
                                        <CardCvcElement className="mt-28-imp max-width-280-mb-5" options={{ placeholder: "CVC" }} />
                                        <input id="zip-input" type="text" placeholder="ZIP" onChange={(e) => setFormData({ zip: e.target.value })} className="business-plan-CC-zip" />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>}
                    {queryParams.get("couponCode")
                        ?
                        <div className="max-w-500px w-100p mt-20 mb-20">
                            <span className="business-plan-promo-code">Promo Code</span>&nbsp;
                            <span className="business-plan-click-here">{queryParams.get("couponCode")}</span>&nbsp;
                            <span className="business-plan-promo-code">Applied</span>&nbsp;
                        </div>
                        :
                        !showPromoCodeInputField && (planId || jobIdFromUrl) && <div className="max-w-500px w-100p mt-20 mb-20">
                            <span className="business-plan-promo-code">Promo Code?</span>&nbsp;
                            <span className="business-plan-click-here">
                                <a onClick={() => { setShowPromoCodeInputField(true) }}>
                                    Click here
                                </a>
                            </span>
                        </div>
                    }
                    {showPromoCodeInputField && <div className={`max-w-500px w-100p business-plan-promocode-div mb-20 mt-10 ${disableBtn ? "my-pe-none" : ""}`}>
                        <input type="text" value={promoId} className="business-plan-promocode-input" placeholder="promo code" onChange={(e) => setPromoId(e.target.value)} />
                        <span className="business-plan-apply" onClick={handlePromocode}>Apply</span>
                    </div>}
                    <div className="max-w-500px w-100p d-flex flex-space-between flex-wrap">
                        <BasicButton style={{ backgroundColor: 'transparent', backgroundImage: 'url("/Button.png")', backgroundPosition: '0 -5px', backgroundSize: '245px' }} background="" moreClasses={'mr-10 text-dark'} onClick={() => { setShowOverlayLoading(true) }} btnTitle={""} height={"68px"} width={"246px"} color={"#fff"} />
                        <BasicButton id="add-card-btn" btnTitle={planId ? "Purchase my plan" : "Add Card"} height={"63px"}
                            width={"244px"} background={"#01D4D5"} color={"white"} btnIcon={planId ? "arrow" : ""} faFontSize={"18px"} arrowDirection={"right"} onClick={handlePurchase} disable={disableBtn} showSpinner={disableBtn} />
                        <div className="mt-2 d-flex justify-content-between flex-wrap">
                            <span className="business-plan-contract-text">No contract, cancel anytime</span>
                        </div>
                    </div>
                    <div className="max-w-500px w-100p">
                        <img className="w-100p" src={stripeSecureLogo} />
                    </div>
                </div>
            </Col>
            <Col md={3} xs={12} className="sign-in-side-column">
                <AvgInfo />
                <Testimony testimonyBy={"stacy"} />
            </Col>
        </Row>
        {jobIdFromUrl && <EditJobModal softwareList={softwareList} jobData={jobData} showEditJobModal={showEditJobModal} setShowEditJobModal={setShowEditJobModal} user={user} setIsJobSummaryUpdate={setIsJobSummaryUpdate} />}
    </div>
}

export default CompleteYourPurchase