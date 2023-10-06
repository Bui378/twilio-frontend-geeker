import React from 'react';
import { Modal } from 'antd';
import {Button} from 'react-bootstrap';
const AfterSelectedSoftwareModal = ({ isSpecificSoftwareSelected, setIsSpecificSoftwareSelected, setGoToJobSummaryPage, isSoftwareEmailOrOutlook, setNextButton, setShowSpinner }) => {
    /**
   * Modal open when customer select subsoftware of  Local printer and scanner or software of Email\Outlook
   * @params = 
   * @response : it redirects the customer at the Job summary page .
   * @author : Mritunjay
  */

    const backToDashboard = () => {
        window.location.href = "/"
    };

    const goToJobSummaryPage = () => {
        setIsSpecificSoftwareSelected(false);
        setGoToJobSummaryPage(true);
    };

    return (
        <>
            <Modal
                style={{ top: 100 }}
                closable={true}
                onCancel={()=>{setIsSpecificSoftwareSelected(false); setNextButton(false); setShowSpinner(false);}}
                visible={isSpecificSoftwareSelected}
                maskStyle={{ backgroundColor: "#DCE6EDCF" }}
                maskClosable={true}
                width={764}
                className="select-software-info-popup"
                footer={[
                    <Button key="back" onClick={backToDashboard} className="btn app-btn app-btn-light-blue modal-footer-btn my-3">
                        <span></span>Back to dashboard
                    </Button>,
                    <Button
                        className={"btn app-btn modal-footer-btn my-3"}
                        onClick={goToJobSummaryPage}
                      >
                        <span></span>Continue
                    </Button>,
                ]}
            >
                <div className="specificSlectedSoftware">
                    <div className='specificSlectedSoftware-subHeading'>
                        <span>Please note that our experts specialize in resolving various {isSoftwareEmailOrOutlook ? "email issues" : "printer and scanner problems"}. However, there are a few issues that our experts may not be able to fix, including: </span>
                    </div>
                    <div className='software-solutions'>
                        {isSoftwareEmailOrOutlook ?
                            <>
                                <span>1. You can't remember your email address or password.</span>
                                <span>2. Your email is locked out.</span>
                                <span>3. Billing issues. Or you cancelled your subscription and need help with it.</span>
                            </>
                            :
                            <>
                                <span>1. The printer or scanner not powering on.</span>
                                <span>2. The printer or scanner cable not being connected.</span>
                            </>

                        }
                    </div>
                    <div className='specificSlectedSoftware-subHeading'>
                        {isSoftwareEmailOrOutlook ?
                           <div className='slectedSoftwareSubHeading'>
                            <span>We recommend you contact your email provider directly.</span><br/>
                            <span>You can still give us a try. If you would like to proceed and discuss your specific issue further, please continue.</span>
                           </div>
                            :
                            <span>We still encourage you to give it a try. If you would like to proceed and discuss your specific issue further, please continue.</span>
                        }

                    </div>
{/*<div className='specificSlectedSoftware-button mt-4'>
                        <Button onClick={backToDashboard} title="Back to dashboard" className="btn app-btn app-btn-light-blue modal-footer-btn" style="color:#fff" >Back to dashboard</Button>
                        <Button onClick={goToJobSummaryPage} title="Continue" className="btn app-btn modal-footer-btn" style="color:#fff">Continue</Button>
                    </div>*/}


                </div>
            </Modal>
        </>
    )
};
export default AfterSelectedSoftwareModal;
