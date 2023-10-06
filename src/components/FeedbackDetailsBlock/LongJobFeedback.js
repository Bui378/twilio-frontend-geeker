import React from "react";

const LongJobFeedback = ({ longJobCost, isTechnicianSubmitFeedback }) => {
    return (
        <>
            <tr>
                <th>Total Job Cost</th>
                <td>
                    <span className="job-value">
                        <>
                            {' '} ${' '}{longJobCost && longJobCost.totalCost}{isTechnicianSubmitFeedback && <>- Pending Technician Review </>}
                        </>
                    </span>
                </td>
            </tr>
        </>
    )
}

export default LongJobFeedback;