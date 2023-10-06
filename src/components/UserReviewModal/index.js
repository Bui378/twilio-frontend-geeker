import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Checkbox, notification } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import styled from 'styled-components';
import { useSocket } from '../../context/socketContext';
import { Button } from 'react-bootstrap';
import { useJob } from '../../context/jobContext';
import mixpanel from 'mixpanel-browser';

const UserReviewModal = ({ user }) => {

    const { socket } = useSocket();
    const [alertMessagePhone, setAlertMessagePhone] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [checked, setChecked] = useState(false);
    const { getTotalJobs, getTotalJobsTechnician } = useJob();

    useEffect(() => {
        (async () => {
            if (user) {
                setName((user.firstName + ' ' + user.lastName))
                if (user.userType === "customer" && user.customer) {
                    setPhoneNumber(user.customer.phoneNumber)
                    var totalJobsCount = await getTotalJobs({ customer: user.customer.id });
                }
                else if (user.userType === "technician" && user.technician) {
                    setPhoneNumber(user.technician.profile.confirmId.phoneNumber)
                    var totalJobsCount = await getTotalJobsTechnician({ technician: user.technician.id });
                }
                if (totalJobsCount >= 1) {
                    setShowReviewModal(true)
                }
            }
        })()
    }, [user])

    const formItemLayout = {
        labelCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 8,
            },
        },
        wrapperCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 16,
            },
        },
    };
    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 8,
            },
        },
    };

    const [form] = Form.useForm();

    /**
      * This function handles submission of form in the user review modal where a user submits request for a callback.
      * @params : User details filled in form
      * @response : Emits event through socket to send mail to the admin
      * @author : Kartik
      */
    const onFinish = (values) => {
        setAlertMessagePhone("")
        if (isPossiblePhoneNumber(phoneNumber) === false && isValidPhoneNumber(phoneNumber) === false) {
            // return 
            setAlertMessagePhone("Phone Number Not Valid!")
            return false;
        }
        console.log('Received values of form: ', values);
        socket.emit('send-user-review-email', {
            name: name,
            phoneNumber: phoneNumber,
        });
        setShowReviewModal(false)
        localStorage.setItem("HideReviewModal", true)
        mixpanel.identify(user.email);
        mixpanel.track('Request for a callback');
        notification['success']({
            message: 'Success',
            description:
                'Request for a callback submitted successfully',
        });
    };

    const HandlePhoneNumber = (e) => {
        setPhoneNumber(`+${e}`);
        setAlertMessagePhone("");
    };

    /**
    * This function handles the close button of user review modal & sets item in localStorage after checking if Don't show again is checked or not.
    * @params : none
    * @response : Hides the modal
    * @author : Kartik
    */
    const onCancel = () => {
        if (checked) {
            localStorage.setItem("HideReviewModal", true);
            setShowReviewModal(false);
            mixpanel.identify(user.email);
            mixpanel.track("User selected don't show again for review modal");
        }
        setShowReviewModal(false);
    };


    return (
        <>
            {(localStorage.getItem("HideReviewModal"))
                ? <></>
                : <Modal title="How can we do better? Have someone of Geeker Executive team call you" className="title-bold" visible={showReviewModal} closable={true} closeIcon={<CloseCircleFilled style={{ marginTop: "18px", fontSize: "20px" }} />} destroyOnClose={true} footer={null} onCancel={onCancel}>
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        scrollToFirstError
                    >

                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[
                                {
                                    required: name === '' ? true : false,
                                    message: 'Please input your name!',
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input defaultValue={name} onChange={(e) => { setName(e.target.value) }} />
                        </Form.Item>

                        <Form.Item
                            name="phonenumber"
                            label="Phone Number"
                            className={"mt-3 mb-1 p-0 suffix" + (alertMessagePhone !== '' ? ' red-border-bottom-input' : '')}
                            rules={[
                                {
                                    required: phoneNumber == '' ? true : false,
                                    message: 'Please input your phone number!',
                                },
                            ]}
                        >
                            <InputWithLabel>
                                <PhoneInput value={phoneNumber} countryCodeEditable={false} onChange={HandlePhoneNumber} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} className="p-0" />
                            </InputWithLabel>
                        </Form.Item>
                        {alertMessagePhone !== '' &&
                            <div className="input-error-msg mt-0" style={{ marginLeft: '160px' }}>{alertMessagePhone}</div>
                        }

                        <Form.Item {...tailFormItemLayout} className="mt-5">
                            <Button type="primary" htmlType="submit" >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                    <Checkbox checked={checked} onChange={(e) => { setChecked(e.target.checked) }}>Don't Show Again</Checkbox>
                </Modal>
            }
        </>
    );
};

export default UserReviewModal;

export const InputWithLabel = styled.div`
	display: flex;
	flex-direction: column;
	text-align: left;
	marginRight: 30px;
	position: relative;
	&:last-child {
		marginRight: 0;
	}
	& input{
		height:50px;
		padding:10px;
		border-radius: 10px;
		margin-top: 15px;
		border : 2px solid #F3F3F3;
		margin-top:15px;
		margin-left:20px;
	}
	& .react-tel-input .form-control {
		height:50px;   
	}
`;
