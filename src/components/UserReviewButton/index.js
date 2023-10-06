import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Form, Input, Checkbox, notification, Button as ButtonAntd } from 'antd';
import { QuestionCircleFilled, CloseOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import styled from 'styled-components';
import { useSocket } from '../../context/socketContext';
import { Button } from 'react-bootstrap';
import { useUser } from '../../context/useContext';
import mixpanel from 'mixpanel-browser';
import Draggable from 'react-draggable';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
const UserReviewButton = () => {
    const { socket } = useSocket();
    const { user } = useUser();
    const [alertMessagePhone, setAlertMessagePhone] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userTypeStatus, setUserTypeStatus] = useState('');
    const [checked, setChecked] = useState(false);
    const [iconChange, setIconChange] = useState(false);
    const [hideButton, setHideButton] = useState(false);

    useEffect(() => {
        if (user) {
            setName((user.firstName + ' ' + user.lastName))
            if (user.userType === "customer" && user.customer) {
                setPhoneNumber(user?.customer?.phoneNumber);
                setUserTypeStatus(user.customer.customerType);
            }
            else if (user.userType === "technician" && user.technician) {
                setPhoneNumber(user?.technician?.profile?.confirmId?.phoneNumber);
                setUserTypeStatus(user.technician.technicianType);
            }
        }
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
      * This function handles submission of form in the user review slider where a user submits request for a callback.
      * @params : User details filled in form
      * @response : Emits event through socket to send mail to the admin
      * @author : Kartik ,Mritunjay
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
            userTypeStatus: userTypeStatus
        });
        setIconChange(false)
        setHideButton(true)
        localStorage.setItem("HideReviewModal", true)
        mixpanel.identify(user?.email);
        mixpanel.track('Request for a callback');
        notification['success']({
            message: 'Success',
            description:
                'Request for a callback submitted successfully',
        });
    };
    /**
    * This function handles the value of user input of phone number & set its value in state variable named phoneNumber.
    * @params : none
    * @response : sets the value of phoneNumber
    * @author : Kartik
    */
    const HandlePhoneNumber = (e) => {
        setPhoneNumber(`+${e}`);
        setAlertMessagePhone("");
    };

    /**
    * This function handles the close button of user review slider & sets item in localStorage after checking if Don't show again is checked or not.
    * @params : none
    * @response : Hides the modal
    * @author : Kartik
    */
    const handleButtonChange = () => {
        setIconChange(!iconChange);
        if (checked) {
            localStorage.setItem("HideReviewModal", true);
            mixpanel.identify(user.email);
            mixpanel.track("User selected don't show again for review modal");
        }
    }

    return (
        <>
            {(localStorage.getItem("HideReviewModal"))
                ? <></>
                : <>
                    {(hideButton) ? <></> : <Draggable><ButtonAntd type="primary" shape="circle" icon={iconChange ? <CloseOutlined style={styles.icon} /> : <QuestionCircleFilled style={styles.icon} />} size="large" style={styles.button} onClick={handleButtonChange} /></Draggable>}
                    <CSSTransition in={iconChange} timeout={500} classNames="slide" unmountOnExit>
                        <div className='slider'>
                            <h5 className='text-center pt-3'>Questions? Comments?</h5>
                            <hr className='pb-1' />
                            <p className='text-center pb-3'>Request a callback from our executive team! Press the button below to get started.</p>
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
                                    <Input defaultValue={name} onChange={(e) => { setName(e.target.value) }} style={{ height: '45px', border: '1px solid #CACACA' }} />
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

                                <Form.Item {...tailFormItemLayout} className="mt-5 mb-0">
                                    <Button type="primary" htmlType="submit" size='large' style={{ backgroundColor: '#00d7d4', border: 'none', fontWeight: '600', fontSize: '16px', width: '150px', height: '50px', borderRadius: '6px' }} >
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Checkbox className='p-3' checked={checked} onChange={(e) => { setChecked(e.target.checked) }}>Don't Show Again</Checkbox>
                        </div>
                    </CSSTransition>
                </>
            }
        </>
    );
};

export default UserReviewButton;

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

export const styles = {
    icon: {
        color: '#000',
        fontSize: '28px',
        margin: '0px',
        padding: '5px'
    },
    button: {
        backgroundColor: '#3ed7d3',
        border: 'none',
        width: '60px',
        height: '60px',
        position: 'fixed',
        bottom: '15px',
        left: '15px',
        zIndex: '3',
    }
}
