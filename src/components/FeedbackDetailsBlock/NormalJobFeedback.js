import React from "react";

const NormalJobFeedback = ({ normalJobCost, isTechnicianSubmitFeedback }) => {
    return (
        <>
            <tr>
                <th>Total Job Cost</th>
                <td>
                    <span className="job-value">
                        {normalJobCost && normalJobCost.promoCodeAppied ?
                            <>
                                <strike>
                                    <span className="job-value totalAmount">{' '} $ {' '} {normalJobCost.totalCost}</span>
                                </strike>
                                <span className="job-value">{' '} $ {' '} {normalJobCost.discountedCost}{isTechnicianSubmitFeedback && <>- Pending Technician Review </>}</span>
                            </> :
                            <>
                                {' '} ${' '}{normalJobCost && normalJobCost.totalCost}{isTechnicianSubmitFeedback && <>- Pending Technician Review </>}
                            </>
                        }
                    </span>
                </td>
            </tr>

        </>
    )
}

export default NormalJobFeedback;