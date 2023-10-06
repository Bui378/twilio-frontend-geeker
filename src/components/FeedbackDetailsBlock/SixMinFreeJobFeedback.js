import React from "react";

const SixMinFreeJobFeedback = ({ sixMinFreeJobCost, isTechnicianSubmitFeedback }) => {
    return (
        <>
            <tr>
                <th>Total Job Cost</th>
                <td>
                    <span className="job-value">
                        <>
                            {' '} ${' '}{sixMinFreeJobCost && sixMinFreeJobCost.totalCost}
                        </>
                    </span>
                </td>
            </tr>
            <tr>
                <th>Amount to be Paid</th>
                <td>
                    <span className="job-value">
                        {sixMinFreeJobCost && sixMinFreeJobCost.promoCodeApplied ?
                            <>

                                <strike>
                                    <span className="job-value totalAmount">{' '} $ {' '} {sixMinFreeJobCost.amountToBePaid}</span>
                                </strike>
                                <span className="job-value">{' '} $ {' '} {sixMinFreeJobCost.discountedCost}{isTechnicianSubmitFeedback && <>- Pending Technician Review </>}</span>
                            </> :
                            <>
                                {' '} ${' '}{sixMinFreeJobCost && sixMinFreeJobCost.amountToBePaid}{isTechnicianSubmitFeedback && <>- Pending Technician Review </>}
                            </>
                        }
                    </span>
                </td>
            </tr>

        </>
    )
}

export default SixMinFreeJobFeedback;