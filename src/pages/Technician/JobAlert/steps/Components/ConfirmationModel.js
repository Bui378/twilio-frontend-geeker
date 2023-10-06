import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
import { Modal, Spin } from 'antd';
import yes from '../../../../../assets/images/yes.png'
import no from '../../../../../assets/images/no.png'
import maybe from '../../../../../assets/images/maybe.png'
import { openNotificationWithIcon } from '../../../../../utils';

function ConfirmationModel({ acceptClicked, acceptJobEvent, open, setOpen, handleAccept }) {
    const [selectedOpt, setSelectedOpt] = useState("");
    let objArr = [
        {
            optionValue: "Yes",
            image: yes,
            optionText: "I feel comfortable moving forward with the job",
        },
        {
            optionValue: "No",
            image: no,
            optionText: "I am not able to assist",
        },
        {
            optionValue: "Maybe",
            image: maybe,
            optionText: "I am willing to try. Advise Customer if they would like to proceed.",
        }
    ]

    const handleSubmit = () => {
        if(selectedOpt === "No") {
            // openNotificationWithIcon('error', 'Error', 'You won\'t able to accept this job.');
            window.location.href = '/dashboard';
            return;
        }
        if(selectedOpt === "Yes" || selectedOpt === "Maybe") handleAccept(acceptJobEvent)
        else openNotificationWithIcon('error', 'Error', 'Select an Option above.');
    }
  return (
        <Modal
        title=""
        visible={open}
        width={750}	
        closable={false}
        footer={null}
        onCancel={()=>setOpen(false)}
        bodyStyle={{ padding: 50, paddingBottom: 85, boxShadow: '-1px -1px 7px #FDFDFD, 3px 3px 14px #D2DBE2', background: '#FFFFFF', borderRadius: 8 }}
        >
        <div className="confirm-modal-for-job-outer-div align-items-center">
            <div className="confirm-modal-for-job-heading d-flex flex-column align-items-center">
                <div className="confirm-modal-for-job-heading1 d-flex flex-column mb-2">
                <span>Remember the "1st Minute Rule"</span>
                </div>
                <div className="confirm-modal-for-job-heading2">
                Are you able to assist the customer with their issue?
                </div>
            </div>
            
            <div className="confirm-modal-for-job-content d-flex align-items-center flex-wrap">
             {
                   objArr.map((obj, i)=>(
                    <div key={i} className={`confirm-modal-for-job-content-card ${selectedOpt === obj.optionValue ? 'selectedCard-before-meeting' : ''}`} onClick={() => setSelectedOpt(obj.optionValue)}>
                    <span className="confirm-modal-for-job-content-card-title mt-5">
                    <img src={obj.image} alt="some caption" /> 
                    </span>
                    <b><strong>{" "} {obj.optionValue}</strong></b>
                    <span className="confirm-modal-for-job-content-description"> {obj.optionText}</span>
                    </div>
                ))
            }
            </div>
            <div className="confirm-modal-for-job-btn-div justify-content-center d-flex ">
              <Button className="confirm-modal-for-job-button job-accept-btn" title="OK" onClick={!acceptClicked ? handleSubmit : ()=>{}}>
              <span />
              {acceptClicked
                        ?
                        <Spin />
                        :
                        <>Ok</>
                    }
                </Button>
            </div>
        </div>
        {/*<div className='before-meeting-popup'>
            <div className='before-meeting-popup-heading'>
                <div>
                    Remember the "1st Minute Rule"
                </div>
                <span>Are you able to assist the customer with their issue?</span>
            </div>
            <div className='before-meeting-popup-content'>
                {objArr.map((obj, i) => (
                    <div key={i} className={`before-meeting-popup-content-card ${selectedOpt === obj.optionValue ? 'selectedCard-before-meeting' : ''}`} onClick={() => setSelectedOpt(obj.optionValue)}>
                        <span className='before-meeting-popup-content-title'><img src={obj.image} alt="some caption" /> {" "} {obj.optionValue}</span>
                        <span className='before-meeting-popup-content-description'>{obj.optionText}</span>
                    </div>
                ))}
            </div>
            <div>
                <Button className="before-meeting-popup-button job-accept-btn" title="OK" onClick={!acceptClicked ? handleSubmit : ()=>{}}>
                    <span />
                    {acceptClicked
                        ?
                        <Spin />
                        :
                        <>Ok</>
                    }
                </Button>
            </div>
        </div>*/}
    </Modal>
  )
}

export default ConfirmationModel