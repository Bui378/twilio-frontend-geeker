import { TOTAL_FREE_SECONDS } from '../constants/index';
import * as CustomerApi from '../api/customers.api'

/**
 * 
 * @param {*} job 
 * @returns  { totalCost, discountedCost, promoCodeAppied, freeSessionCost, isFreeSession }
 * @description : 1) Total cost : It is the total_cost of Job and other things like promocode , firstJob has no effect to it
 *                2) DiscountedCost and PromocodeApplied : DiscountedCost is the discounted cost after applying promocode ,
 *                   freeJob discount etc. and PromocodeApplied tract that customer applied promocode or not.
 *                3) freeSessionCost,isFreeSession : freeSessionCost is used to track is owner have first job.If so then we will 
 *                   dave 6 min free to that customer and isFreeSession is used to track is this job have free session or not.
 *  @author : Jagroop  
 */
export const calculatePrice = async (job) => {
    let totalCost = job?.total_cost;
    let discountedCost = 0;
    let promoCodeAppied = false;
    let freeSessionCost = 0;
    let isFreeSession = false;

    const jobHaveCouponcode = job?.coupon_code;
    const isFirstJob = job?.is_free_job;
    const isLongJob = job?.is_long_job

    // If this job is first job then we will show price as per calculated cost.
    if (isFirstJob) {
        isFreeSession = true;
        freeSessionCost = job?.free_session_total;
    }

    // If customer applied promocode and job is not long job type then we will calculate the cost as per the promocode and other parameters
    if (jobHaveCouponcode && !isLongJob) {
        let calculatedDiscountedCost;

        // If there is first job and total job time is greater than 6 min then we will calculate discountedCost 
        if (isFirstJob && job?.total_seconds > TOTAL_FREE_SECONDS) {
            calculatedDiscountedCost =  totalCostAfterCouponCode(job, freeSessionCost);
        }

        // If it is not a first job then we will calculate discountedPrice using totalCost
        if (!isFirstJob) {
            calculatedDiscountedCost =  totalCostAfterCouponCode(job, totalCost);
        }

        discountedCost = calculatedDiscountedCost;
        promoCodeAppied = true;
    }

    console.log("Total Calculated Costs", { totalCost, discountedCost, promoCodeAppied, freeSessionCost, isFreeSession })
    const result = { totalCost, discountedCost, promoCodeAppied, freeSessionCost, isFreeSession }
    return result;
}



/**
 * 
 * @param {*} job 
 * @param {*} totalCost 
 * @returns {discountedCost}
 * @description : This function is used to calculate the discounted Cost after applying promocode
 * @author : Jagroop
 */
const totalCostAfterCouponCode = (job, totalCost) => {
    let discountedCost = 0;
    try {

        const promoCodeDiscountType = job?.discount_type
        const promoCodeDiscount = job?.coupon_code_discount

        if (promoCodeDiscountType == "fixed") {
            discountedCost = Number(totalCost) - Number(promoCodeDiscount);
            return discountedCost < 0 ? 0 : discountedCost;
        }
        
        if (promoCodeDiscountType == "percentage") {
            discountedCost = Number(totalCost) - (Number(totalCost) * Number(promoCodeDiscount)) / 100
            return discountedCost.toFixed(2);
        }

        return discountedCost;
    } catch (error) {
        console.log("error while calculating discountedCost", error);
        return discountedCost;
    }

}

/**
 * 
 * @param {job, user}  
 * @returns {object}
 * @description : This function is called in Feedback Page and all the information shown in feedback page is dependent on this function
 * @author : Jagroop
 */
export const claculateParametersForSubscription = async(job, user) => {
    try {
        const totalSeconds = job?.total_seconds
    
        // If there is owner id for customer it means he is child of owner account so here I fetch subscription of owner account ancd calculate the required parameters
        if (user?.ownerId) {
            const getOwnerSubDetails = await findSubScriptionDetails(user?.ownerId);
            const haveSubscription = getOwnerSubDetails && getOwnerSubDetails?.status == "active"
            const subscriptionDetails = getOwnerSubDetails
            const deductedFromsubScription = job?.total_subscription_seconds
    
            if(haveSubscription){
                const result = calculateSubscriptionTimeDeduction(subscriptionDetails,deductedFromsubScription,totalSeconds,job)
                return result;
            }
    
        } else {
            const haveSubscription = user?.customer?.subscription && user?.customer?.subscription?.status == "active"
            const subscriptionDetails = user?.customer?.subscription
            const deductedFromsubScription = job?.total_subscription_seconds
    
            if(haveSubscription){
                const result = calculateSubscriptionTimeDeduction(subscriptionDetails,deductedFromsubScription,totalSeconds,job)
                return result;
            }
        }
    } catch (error) {
        console.log("error while claculateParametersForSubscription",error)
        return false;
    }



}


/**
 * 
 * @param { subscriptionDetails,deductedFromsubScription,totalSeconds, job}
 * @returns {subscriptionTimeDeducted,totalCost,chargedWithCardAlso,amountChargedFromCard,promoCodeAppied,discountedCost}
 * @description  : Details that are shown to customer in feedback page for subscription is totally dependent on this function
 * @author  : Jagroop
 * 
 */
const calculateSubscriptionTimeDeduction = (subscriptionDetails, deductedFromsubScription, totalSeconds, job) => {
    // Below are the details required for  showing subscription details
    let subscriptionTimeDeducted = '';
    let totalCost = job?.total_cost;
    let chargedWithCardAlso = false;
    let amountChargedFromCard = 0;
    let promoCodeAppied = false;
    let discountedCost = 0;

    try {
        const softwareRate = job?.software?.rate
        const jobHaveCouponcode = job?.coupon_code;

        // If Feedback is filled by Technician it means how much amount is deducted is stored in db. So here i use that value and
        // calculate  valid values
        if (deductedFromsubScription) {
            const formattedSubtimeUsed = new Date(deductedFromsubScription * 1000).toISOString().slice(11, 19);
            subscriptionTimeDeducted = formattedSubtimeUsed;

            // If subscription seconds is not equal to total seconds of job it means , we have deducted from card as well
            if (deductedFromsubScription != totalSeconds) {
                const costPaid = totalSeconds - deductedFromsubScription
                amountChargedFromCard = calculateCost(costPaid, softwareRate);

                 // Is somehow promocode is applied then discounted cost is calculated herer
                if (jobHaveCouponcode) {
                    promoCodeAppied = true
                    discountedCost = totalCostAfterCouponCode(job, amountChargedFromCard)
                }
                chargedWithCardAlso = true
                console.log("Feedback Details :: technician filled feedback", { amountChargedFromCard, subscriptionTimeDeducted })
            }

        } else {

            const timeUsed = subscriptionDetails?.time_used
            const totalSubScriptionSeconds = subscriptionDetails?.grand_total_seconds ? subscriptionDetails?.grand_total_seconds : subscriptionDetails?.total_seconds
            const subTimeRemaining = Number(totalSubScriptionSeconds) - Number(timeUsed)

            // If Subscription remaining time is 0 it means subscription minutes are over but subscription is still active in that case we deducted amount from card only
            if (subTimeRemaining == 0) {
                // Deducted from card only
                chargedWithCardAlso = true;
                amountChargedFromCard = totalCost
                subscriptionTimeDeducted = '00:00:00'
            }
            else if (subTimeRemaining >= totalSeconds) {
                // Deducted from Subscription only
                subscriptionTimeDeducted = job?.total_time
                chargedWithCardAlso = false;

            } else {
                // Deducted from card and subscription
                const formattedSubtimeUsed = new Date(subTimeRemaining * 1000).toISOString().slice(11, 19);
                subscriptionTimeDeducted = formattedSubtimeUsed

                const costPaid = totalSeconds - subTimeRemaining
                amountChargedFromCard = calculateCost(costPaid, softwareRate)
                
                // Is somehow promocode is applied then discounted cost is calculated herer
                if (jobHaveCouponcode) {
                    promoCodeAppied = true
                    discountedCost = totalCostAfterCouponCode(job, amountChargedFromCard)
                }

                chargedWithCardAlso = true
                console.log("Feedback Details :: technician didn't filled feedback yet", { softwareRate, subscriptionTimeDeducted, amountChargedFromCard })
            }

        }
        // These are the resultant parameters on which shows details regarding suscription in Feedback Page
        const result = { subscriptionTimeDeducted, totalCost, chargedWithCardAlso, amountChargedFromCard, promoCodeAppied, discountedCost };
        return result;

    } catch (error) {
        console.log("error while calculation in subscription", error);
        const result = { subscriptionTimeDeducted, totalCost, chargedWithCardAlso, amountChargedFromCard, promoCodeAppied, discountedCost };
        return result;

    }

}

// This function will calculate the total cost from minutes using software rate : Jagroop
function calculateCost(costPaid, rate) {
    const minutes = (costPaid / 60)
    const intervals = Math.ceil(minutes / 6); // Round up to the nearest 6-minute interval
    return intervals * rate;
  }


/**
 * 
 * @param {*} userId 
 * @returns subscription Object
 * @description : This function is used to extract the subscription details of owner id
 * @author : Jagroop
 */
const findSubScriptionDetails = async (userId) => {
    try {
        const subscriptionDetails = await CustomerApi.retrieveCustomerByParams({ "user": userId });
        if (subscriptionDetails && subscriptionDetails.length >0 && subscriptionDetails[0]?.subscription) {
            console.log("haveSubscription subscriptionDetails",subscriptionDetails[0]?.subscription)
            return subscriptionDetails[0]?.subscription;
        }
    } catch (error) {
        console.log("error while retrieveing subscription:", error);
        return false;
    }
}