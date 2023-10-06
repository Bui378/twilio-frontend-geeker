/** @format */

import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import SubscriptionPlanCard from "./SubscriptionPlanCard";
import { getAllPlans } from "../../../../api/subscription.api";
import { Button } from "react-bootstrap";
import { isLiveUser } from "../../../../utils";

const SubscriptionPlanModal = ({
  chosenProdId,
  showSubscriptionPlanModal,
  setShowSubscriptionPlanModal,
  userLoggedIn,
  user,
}) => {
  const [allPlans, setAllPlans] = useState();
  let liveUser;

  useEffect(() => {
    (async () => {
      liveUser = await isLiveUser(user);
      let getAllPlansResponse = await getAllPlans({ liveUser: liveUser });
      console.log("getAllPlansResponse ", getAllPlansResponse.data);
      let sortedArr = getAllPlansResponse.data.sort((p1, p2) =>
        p1.metadata.display_order > p2.metadata.display_order
          ? 1
          : p1.metadata.display_order < p2.metadata.display_order
          ? -1
          : 0
      );
      setAllPlans(sortedArr);
    })();
  }, []);

  useEffect(() => {
    console.log("My console for allPlans state var", allPlans);
  }, [allPlans]);

  return (
    <>
      <Modal
        className='subscription-plan-modal TncIdentifier'
        footer={[
          <Button
            className='btn app-btn app-btn-light-blue modal-footer-btn'
            onClick={() => {
              setShowSubscriptionPlanModal(false);
            }}>
            <span></span>Close
          </Button>,
        ]}
        closable={false}
        visible={showSubscriptionPlanModal}
        maskStyle={{ backgroundColor: "#DCE6EDCF" }}
        // maskClosable={true}
        width={1200}>
        <div className='d-flex justify-content-between max-width-768-w-flex-direction-col'>
          {allPlans &&
            allPlans.map((ele, index) => {
              return (
                <SubscriptionPlanCard
                  key={index}
                  singlePlanInfo={ele}
                  chosenProdId={chosenProdId}
                  setShowSubscriptionPlanModal={setShowSubscriptionPlanModal}
                  userLoggedIn={userLoggedIn}
                />
              );
            })}
        </div>
      </Modal>
    </>
  );
};

export default SubscriptionPlanModal;
