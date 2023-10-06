import React, { useEffect, useState } from "react"
import {JOB_STATUS, monthName} from "../../constants"
import * as InvitesApi from "../../api/invite.api"
import * as UserApi from "../../api/users.api"
import * as JobApi from "../../api/job.api"
import Loader from '../../components/Loader';
import { Collapse } from 'antd';

const BusinessInfo = ({user}) => {

    const [ subscriptionTimeLeft, setsubscriptionTimeLeft ] = useState("00:00")
    const [ businessName, setBusinessName ] = useState("")
    const [ renewTime, setRenewTime ] = useState()
    const [ numberOfUsers, setNumberOfUsers ] = useState(0)
    const [ completedJobs, setCompletedJobs ] = useState(0)
    const [ liveJobs, setLiveJobs ] = useState(0)
    const [ subscriptionName, setsubscriptionName ] = useState("")
    const [ subscriptionStatus, setsubscriptionStatus ] = useState("")
    const [ showLoader, setShowLoader ] = useState(true)
    const [ ownerInfo, setOwnerInfo ] = useState()
    const [ managerName, setManagerName ] = useState("")
    const [ managerEmail, setManagerEmail ] = useState("")

    useEffect(()=>{
        (async () => {
            // setShowLoader(true)

            //This if is for organisation owner 
            // if(user.customer.subscription){
            if(user.roles[0] === "owner"){
                //Fetching all the live jobs from an organisation.
                const liveJobsRes = await JobApi.findAllJobsByParams({
                                                                        ownerId:user.id,
                                                                        $or:[
                                                                            {status : JOB_STATUS.PENDING}, 
                                                                            {status : JOB_STATUS.IN_PROGRESS}, 
                                                                            {status : JOB_STATUS.LONGJOB}, 
                                                                            {status : JOB_STATUS.WAITING}, 
                                                                            {status : JOB_STATUS.SCHEDULED}
                                                                        ]
                                                                    })
                console.log("My console for liveJobsRes ", liveJobsRes)
                setLiveJobs(liveJobsRes.jobs.totalCount)

                //Fetching all the completed jobs of user
                const completeJobsRes = await JobApi.findAllJobsByParams({
                                                                            ownerId:user.id,
                                                                            status:JOB_STATUS.COMPLETED
                                                                        })
                console.log("My console for completeJobsRes ", completeJobsRes)
                setCompletedJobs(completeJobsRes.jobs.totalCount)

                //Fetching all the invited users and admins
                const totalUsersRes = await UserApi.getTotalUserOfOrg(user.id)
                // console.log("My console for inviteRes", {inviteRes, data:inviteRes.invites.data})
                if(totalUsersRes && totalUsersRes.totalUsers){
                    // const allUsers = inviteRes.invites.data.filter((item) => item.role === "user")
                    // console.log("My console for inviteRes 2", {allUsers})
                    setNumberOfUsers(totalUsersRes.totalUsers)
                }

                setBusinessName(user.businessName)
                setManagerName(user.firstName + " " + user.lastName)
                setManagerEmail(user.email)

                if(user.customer.subscription){
                    setsubscriptionName((user.customer && user.customer.subscription) ? user.customer.subscription.plan_name : "NA")
                    setsubscriptionStatus((user.customer && user.customer.subscription) ? user.customer.subscription.status : "NA")
                    setRenewTime(user.customer.subscription ? new Date(user.customer.subscription.plan_purchased_date) : "NA")
                    /*setsubscriptionTimeLeft(user.customer.subscription.grand_total_seconds ?
                        ((user.customer.subscription.grand_total_seconds - user.customer.subscription.time_used)/60) % 1 === 0 
                            ? 
                                ((user.customer.subscription.grand_total_seconds - user.customer.subscription.time_used)/60) + " mins"
                            :
                                ((user.customer.subscription.grand_total_seconds - user.customer.subscription.time_used)/60).toFixed(2) + " mins"
                        :
                        ((user.customer.subscription.total_seconds - - user.customer.subscription.time_used)/60) % 1 === 0
                            ?
                                ((user.customer.subscription.total_seconds - - user.customer.subscription.time_used)/60) + " mins"
                            :
                                ((user.customer.subscription.total_seconds - - user.customer.subscription.time_used)/60).toFixed(2) + " mins"
                    )   */                            

                    let time_used_in_seconds = user.customer.subscription ? user.customer.subscription.time_used :"NA"
                    let remaining_seconds = 0

                    if(user.customer.subscription.grand_total_seconds){
                        remaining_seconds  = (user.customer.subscription.grand_total_seconds) - time_used_in_seconds
                    }else{
                        remaining_seconds  = (user.customer.subscription.total_seconds) - time_used_in_seconds
                    }
                    // let remaining_minutes = (remaining_seconds/60).toFixed(2);
                    let converted_format = convertTime(remaining_seconds)
                    setsubscriptionTimeLeft(converted_format)
                }

                setShowLoader(false)
            }
            //Following else if is for organisatios user/admin
            else if(user.ownerId && user.ownerId !== null){
                const ownerUserInfo = await UserApi.getUserById(user.ownerId)
                console.log("My console for ownerUserInfo ", ownerUserInfo)
                setOwnerInfo(ownerUserInfo)
                setBusinessName(ownerUserInfo.businessName)
                setManagerName(ownerUserInfo.firstName + " " + ownerUserInfo.lastName)
                setManagerEmail(ownerUserInfo.email)

                //Fetching all the live jobs from an organisation.
                const liveJobsRes = await JobApi.findAllJobsByParams({
                                                                        ownerId:ownerUserInfo.id,
                                                                        $or:[
                                                                            {status : JOB_STATUS.PENDING}, 
                                                                            {status : JOB_STATUS.IN_PROGRESS}, 
                                                                            {status : JOB_STATUS.LONGJOB}, 
                                                                            {status : JOB_STATUS.WAITING}, 
                                                                            {status : JOB_STATUS.SCHEDULED}
                                                                        ]
                                                                    })
                console.log("My console for liveJobsRes ", liveJobsRes)
                setLiveJobs(liveJobsRes.jobs.totalCount)

                //Fteching all the completed jobs of user
                const completeJobsRes = await JobApi.findAllJobsByParams({
                                                                            ownerId:ownerUserInfo.id,
                                                                            status:JOB_STATUS.COMPLETED
                                                                        })
                console.log("My console for completeJobsRes ", completeJobsRes)
                setCompletedJobs(completeJobsRes.jobs.totalCount)

                //Fetching all the invited users and admins
                // const inviteRes = await InvitesApi.findAllInvitesByParams({parentId:ownerUserInfo.id, status:"completed"})
                const totalUsersRes = await UserApi.getTotalUserOfOrg(user.ownerId)
                // console.log("My console for inviteRes", {inviteRes, data:inviteRes.invites.data})
                if(totalUsersRes && totalUsersRes.totalUsers){
                    // const allUsers = inviteRes.invites.data.filter((item) => item.role === "user")
                    // console.log("My console for inviteRes 2", {allUsers})
                    setNumberOfUsers(totalUsersRes.totalUsers)
                }
                
                if(ownerUserInfo.customer.subscription){
                    setsubscriptionName((ownerUserInfo.customer && ownerUserInfo.customer.subscription) ? ownerUserInfo.customer.subscription.plan_name : "NA")
                    setsubscriptionStatus((ownerUserInfo.customer && ownerUserInfo.customer.subscription) ? ownerUserInfo.customer.subscription.status : "NA")
                    setRenewTime(new Date(ownerUserInfo.customer.subscription.plan_purchased_date))
                    let remaining_seconds = ownerUserInfo.customer.subscription.grand_total_seconds ?
                        ownerUserInfo.customer.subscription.grand_total_seconds - ownerUserInfo.customer.subscription.time_used
                        :
                        ownerUserInfo.customer.subscription.total_seconds - ownerUserInfo.customer.subscription.time_used
                                            

                    // let remaining_minutes = (remaining_seconds/60).toFixed(2);
                    let converted_format = convertTime(remaining_seconds)
                    setsubscriptionTimeLeft(converted_format)
                }
                setShowLoader(false)
            }else{
                setBusinessName(user.businessName)
                setShowLoader(false)
            }
        })()
    },[user])

    function convertTime(sec) {
	    var hours = Math.floor(sec/3600);
	    (hours >= 1) ? sec = sec - (hours*3600) : hours = '00';
	    var min = Math.floor(sec/60);
	    (min >= 1) ? sec = sec - (min*60) : min = '00';
	    (sec < 1) ? sec='00' : void 0;

	    (min.toString().length == 1) ? min = '0'+min : void 0;    
	    (sec.toString().length == 1) ? sec = '0'+sec : void 0;    

	    if(hours >= 1 && hours <= 9){
	    	hours = '0'+hours
	    }
		// This will check if seconds are of nan type if so then replace it with 00
		if (sec.toString() == "NaN") {
			sec = '00'
		}
	    return hours+':'+min+':'+sec;
	}

    const { Panel } = Collapse;

    if (showLoader) return <Loader height="40%"/>;

    return <Collapse className="business-info-class" defaultActiveKey={['1']}>
                <Panel header="Business Info" key="1" className="grey-background-imp py-2 px-2">
                     <table className="business-info-table table">
                        <tbody>
                            <tr className="">
                                <td colSpan="2">
                                    <div className="d-flex justify-content-center business-info-name">
                                        {businessName}
                                    </div>
                                </td>
                            </tr>

                            {/* Check if user/owner has subscription */}
                            {(user?.customer?.subscription || ownerInfo?.customer?.subscription) &&  <>
                                <tr>
                                    <td>Subscription </td>
                                    <td>
                                        {
                                        subscriptionStatus === "active" ? <><span className="color-green-imp        font-weight-bold">Active </span>({subscriptionName})</> 
                                                                        : <><span className="color-red-imp font-weight-bold">Inactive </span>({subscriptionName})</>
                                        }
                                    </td>
                                </tr>

                                {/* Visible only to owner and admin */}
                                {(user.roles[0] === "owner" || user.roles[0] === "admin") &&<tr>
                                    <td>Minutes Remaining </td>
                                    <td>{subscriptionTimeLeft}</td>
                                </tr>}

                                {/* Visible only to owner and admin */}
                                {(user.roles[0] === "owner" || user.roles[0] === "admin") &&<tr>
                                    <td>Renews on </td>
                                    <td>{`${new Date(renewTime).getDate()} ${monthName[new Date(renewTime).getMonth() + 1]} ${new Date(renewTime).getFullYear()}`}</td>
                                </tr>}
                            </>}

                            <tr>
                                <td>Manager </td>
                                <td>
                                    <a href={`mailto:${managerEmail}`} className="admin-name" > {managerName}</a>
                                </td>
                            </tr>

                            {/* Visible only to owner and admin */}
                            {(user.roles[0] === "owner" || user.roles[0] === "admin") &&<>
                                <tr>
                                    <td>Users </td>
                                    <td>{numberOfUsers}</td>
                                </tr>
                                <tr>
                                    <td>Completed Jobs </td>
                                    <td>{completedJobs}</td>
                                </tr>
                                <tr>
                                    <td>Live/Schedule Jobs </td>
                                    <td>{liveJobs}</td>
                                </tr>
                            </>}
                        </tbody>
                    </table>
                </Panel>
            </Collapse>
}

export default BusinessInfo