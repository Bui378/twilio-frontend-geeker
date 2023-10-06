import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as CustomerApi from '../../../../api/customers.api';
import { getStripeObject, isLiveUser } from '../../../../utils/'
import { Elements } from '@stripe/react-stripe-js';
import MyCheckoutForm from './checkoutForm';
let stripePromise = '';
let liveUser = true;
const CustomerCard = ({ user, value, onNext, onPrev, isModalOpen, setIsModalOpen, newCardAdded, setNewCardAdded, showCards, setDisableButton }) => {
  const customer = (user ? user.customer : {})
  const [cardsInfo, setCardsInfo] = useState([])

  useEffect(() => {
    if (user) {
      fetchMyCardsInfo()

    }
  }, [user])

  useEffect(() => {
    (async () => {
      if (user) {
        liveUser = await isLiveUser(user)
        stripePromise = await getStripeObject(user)
      }
    })();
  }, [user])

  async function fetchMyCardsInfo() {
    if (user && user.customer && user.customer.stripe_id !== "") {
      const customer_info = await CustomerApi.getStripeCustomerCardsInfo({
        liveUser: liveUser,
        stripe_id: user.customer.stripe_id,
      })
      setCardsInfo(customer_info.data)
      console.log('customer_info.data :::', customer_info.data)
    }
  }

  return (
    <div>
      <SectionEmail>
        {stripePromise !== '' &&
          <Elements stripe={stripePromise}>
            <MyCheckoutForm user={user} values={customer} onNext={onNext} onPrev={onPrev} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} cardsInfo={cardsInfo} setCardsInfo={setCardsInfo} newCardAdded={newCardAdded} setNewCardAdded={setNewCardAdded} fetchMyCardsInfo={fetchMyCardsInfo} showCards={showCards} setDisableButton={setDisableButton} />
          </Elements>
        }
      </SectionEmail>


    </div>
  );
};

const SectionEmail = styled.section`
  width:100%
  margin: auto;

  & .ant-col-12{
    display:inline-block;
    width: 40%;
    margin-left: 15px;
    padding:30px;
    margin-top:20px;
  }

  & .ant-col-20{
    padding-left: 20px;
  }
`;

CustomerCard.propTypes = {};

export default CustomerCard;
