
import React, { useState, useEffect } from 'react';
import * as CustomerApi from '../../../../api/customers.api';
import * as JobApi from '../../../../api/job.api';
import { isLiveUser } from '../../../../utils';
import { Table, Modal } from 'antd';
import { Row, Col, Button } from 'react-bootstrap';
import { openNotificationWithIcon } from '../../../../utils';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from '@fortawesome/free-regular-svg-icons';
import AddCardForm from './addCardForm';

let liveUser = true;
const CheckoutForm = ({ user, value, onNext, onPrev, isModalOpen, setIsModalOpen, cardsInfo, setCardsInfo, newCardAdded, setNewCardAdded, showCards, setDisableButton }) => {

    const [cardInfoUpdated, setCardInfoUpdated] = useState(cardsInfo);
    const [cards_to_display, setCardsToDisplay] = useState([]);
    const [isInprogressJobs, setIsInprogressJobs] = useState(false);

    useEffect(() => {
        setCardInfoUpdated(cardsInfo)
    }, [cardsInfo])

    useEffect(() => {

        const pendingJobs = async () => {
            const pendingJobsFinal = await JobApi.getPendingJobs({ id: user.customer.id })
        }
        if (user && user.customer) {
            const inProgressJobs = async () => {
                const pendingJobsFinal = await JobApi.getInprogressJobs({ id: user.customer.id })
                if (pendingJobsFinal > 0) {
                    // setIsInprogressJobs(true)
                }
            }
            inProgressJobs()
        }
        pendingJobs()

    }, [user])

    useEffect(() => {
        (async () => {
            if (user) {
                liveUser = await isLiveUser(user)
            }
        })()
    }, [user])

    const showModal = () => {
        // setIsModalVisible(true);
    };

    const markCardAsDefault = (card_id) => {
        Modal.confirm({
            title: 'Are you sure you want to make this card as default?',
            okText: 'Yes',
            className: 'app-confirm-modal',
            cancelText: 'No',
            async onOk() {

                await CustomerApi.updateDefaultCard({
                    liveUser: liveUser,
                    card_id: card_id,
                    customer_id: user.customer.stripe_id,
                })

                fetchMyCardsInfo()

            },
        });
    }

    const removeCustomerCard = (card_id) => {
        Modal.confirm({
            title: 'Are you sure you want to remove this card?',
            okText: 'Yes',
            className: 'app-confirm-modal',
            cancelText: 'No',
            async onOk() {

                await CustomerApi.removeCard({
                    liveUser: liveUser,
                    card_id: card_id,
                    customer_id: user.customer.stripe_id,
                })

                fetchMyCardsInfo()

            },
        });
    }

    const columns = [
        {
            title: '',
            dataIndex: 'last4',
            render: (text, record) => (
                <>
                    {record.default_card ?
                        <a href="#"><FontAwesomeIcon icon={faCreditCard} className="mr-2" />{'Credit Card ************' + text}<span className="default_card_tag">Default</span></a>
                        : <><FontAwesomeIcon icon={faCreditCard} className="mr-2" />{'Credit Card ************' + text} </>
                    }
                </>
            ),
        },
        {
            title: '',
            dataIndex: 'exp_year',
            render: (text, record) => (
                <>
                    {!record.default_card &&
                        <div>
                            <Button className="btn app-btn app-btn-light-blue app-btn-small mr-md-3" onClick={(e) => { isInprogressJobs ? callNotification() : markCardAsDefault(record.id) }}>Mark as default<span></span></Button>
                            <Button className="btn app-btn app-btn-light-blue app-btn-small " onClick={(e) => { removeCustomerCard(record.id) }} >Remove<span></span></Button>

                        </div>
                    }
                </>
            ),
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        showModal()
                    }
                };
            }
        },
    ];

    async function fetchMyCardsInfo() {
        if (user && user.customer.stripe_id && user.customer.stripe_id !== '') {
            const customer_info = await CustomerApi.getStripeCustomerCardsInfo({
                liveUser: liveUser,
                stripe_id: user.customer.stripe_id,
            })
            if (customer_info && customer_info.data) {
                setCardsInfo(customer_info.data)
                setCardInfoUpdated(() => {
                    return [...customer_info.data]
                })
            }
        }
    }

    useEffect(() => {
        fetchMyCardsInfo()
    }, [user])

    const callNotification = () => {
        return openNotificationWithIcon('error', 'Error', 'Please complete your pending meeting.');
    }

    useEffect(() => {
        const seen = new Set();
        if (cardInfoUpdated.length > 0) {
            const cards_data = cardInfoUpdated.filter(el => {
                const duplicate = seen.has(el.fingerprint);
                seen.add(el.fingerprint);
                return !duplicate;
            });
            setCardsToDisplay(cards_data)
        }
    }, [cardInfoUpdated])

    return (
        <Row>

            <AddCardForm user={user} cardsInfo={cardInfoUpdated} setCardsInfo={setCardInfoUpdated} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setNewCardAdded={setNewCardAdded} setDisableButton={setDisableButton} />
            {showCards &&
                <Col md="12" className="payment-methods-outer p-0 pb-4">
                    <Row>
                        <Col md="8" className="text-left pl-5 py-3">
                            <h6>Payment Methods</h6>
                        </Col>
                        <Col md="4" className="text-right pr-md--5 py-3">
                            <Button
                                className="btn app-btn app-btn-small app-btn-light-blue-remove"
                                onClick={() => isInprogressJobs ? callNotification() : setIsModalOpen(true)}
                            >
                                Add Method<span></span>
                            </Button>
                        </Col>

                        <Col md="12" className="px-4 px-md-5">
                            {cardInfoUpdated.length > 0
                                ?
                                <>
                                    <Table dataSource={cards_to_display} columns={columns} rowKey="id" className="myCardTable" pagination={true} />
                                </>
                                :
                                <table className="table empty-table">
                                    <tbody>
                                        <tr>
                                            <td colSpan="2" className="text-center">No cards available. Please click on Add Method button to add card.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            }
                        </Col>
                    </Row>
                </Col>
            }
        </Row>
    );
};

export default CheckoutForm;