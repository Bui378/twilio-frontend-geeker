import React, { useState ,useEffect} from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';

const FeedbackCompulsionModal = ({user,isModalOpen,jobId}) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const[isDisabled, setIsDisabled]= useState(false)


	useEffect(()=>{
		console.log('isModalOpen>>>>>>>>>>>',isModalOpen)
		setIsModalVisible(isModalOpen)
		
	},[isModalOpen])
		
	const locationChangeToFeedback = () => {
		setIsDisabled(true)
		if(jobId && isModalOpen){
			window.location.href =  `/meeting-feedback/${jobId}`;
		}
	}

  return (
    <>
      <Modal title="Please provide feedback first" visible={isModalVisible} className="feedback-first title-bold" closable={false} footer={null}>
		<div className="section_one">
            <div className="section_sub_one">
            	<p>Please provide the feedback to old job first.Click on the following button to give feedback.</p>
		        <Button className={(isDisabled ? "disabled-btn" : "") + "btn app-btn"} disabled={isDisabled} onClick={locationChangeToFeedback}>
					Feedback
				</Button>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default FeedbackCompulsionModal;



