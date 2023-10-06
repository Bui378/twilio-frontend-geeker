import React from "react";

const SubscriptionBasedFeedback = ({ subscriptionCost, isTechnicianSubmitFeedback, checkForOwner, userIsOwner, ownerHaveSubscription }) => {
    return (
        <>
            {checkForOwner && (userIsOwner || !ownerHaveSubscription) &&
                <tr>
                    <th>Total Job Cost</th>
                    <td>
                        <span className="job-value">
                            <>
                                {' '} ${' '}{subscriptionCost && subscriptionCost.totalCost}
                            </>
                        </span>
                    </td>
                </tr>
            }
            {subscriptionCost.chargedWithCardAlso ?
                checkForOwner && (userIsOwner || !ownerHaveSubscription) &&
                <tr>
                    <th>Amount to be Paid</th>
                    <td>
                        <span className="job-value">
                            {subscriptionCost && subscriptionCost.promoCodeAppied ?
                                <>

                                    <strike>
                                        <span className="job-value totalAmount">{' '} $ {' '} {subscriptionCost.amountChargedFromCard}</span>
                                    </strike>
                                    <span className="job-value">{' '} $ {' '} {subscriptionCost.discountedCost}{isTechnicianSubmitFeedback && <>- Pending Technician Review </>}</span>
                                </> :
                                <>
                                    {' '} ${' '}{subscriptionCost && subscriptionCost.amountChargedFromCard}{isTechnicianSubmitFeedback && <>- Pending Technician Review </>}
                                </>
                            }
                        </span>
                    </td>
                </tr>
                :
                null}
            <tr>
                <th>Subscription time deducted</th>
                <td>
                    <span className="job-value">
                        {' '}
                        {subscriptionCost.subscriptionTimeDeducted ? subscriptionCost.subscriptionTimeDeducted : '00:00:00'}
                    </span>
                </td>
            </tr>

        </>
    )
}
export default SubscriptionBasedFeedback;