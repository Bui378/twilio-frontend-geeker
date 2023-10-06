import React, { useEffect} from 'react';
import { Card} from 'react-bootstrap';
import {Spin} from 'antd';
import moment from 'moment';
import {getSubscriptionHistory} from "../../../../api/subscription.api";
import "react-widgets/styles.css";

const SubscriptionHistory =  ({user, setNewSubscriptionHistory,newSubscriptionHistory,cancelPendingSubscriptionWithId,subscriptionHistorySignal}) => {
    const fetchSubscriptionHistory = async () => {
        let data = await getSubscriptionHistory(user.customer.id);
        setNewSubscriptionHistory(data)
    }

    useEffect(()=>{
        if(user && user.customer && user.customer.id){
            fetchSubscriptionHistory()
        }
    },[subscriptionHistorySignal])

    return(
        <>
            <Card className="text-left mt-4">
                <Card.Header className="">
                    <h5 className="m-0 font-weight-bold">Subscription History</h5>
                </Card.Header>
                <Card.Body className="table-responsive">
                    
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Subscription ID</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Purchased Date</th>
                                <th>Inactive Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                newSubscriptionHistory.reverse().map((s,i)=>{
                                    return (
                                        <tr key={i}>
                                            <td>{s.subscription_id}</td>
                                            <td className="text-success font-weight-bold">{(s.plan_name ? s.plan_name : "NA")}</td>
                                            <td className="text-capitalize">{s.status} { s.status  == 'Pending' ?  <Spin/> :'' }</td>                                            
                                            <td>{moment(s.plan_purchased_date).format('Do MMM, YYYY HH:mm')}</td>
                                            <td>{moment(s.plan_inactive_date).format('Do MMM, YYYY HH:mm')}</td>
                                            <td>{ s.status  == 'Pending' ? <button className="btn app-btn app-btn-super-small" onClick={()=>cancelPendingSubscriptionWithId(user.customer.id,s.invoice_id)} >Cancel</button>:''} </td>
                                        </tr>
                                    )
                                })
                            }

                        </tbody>
                    </table>
                </Card.Body>
            </Card>
        </>
    )
}

export default SubscriptionHistory;
    