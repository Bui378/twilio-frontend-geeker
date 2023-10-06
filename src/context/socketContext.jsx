import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { useJob } from "./jobContext";
import { useUser } from "./useContext";
import {socket} from './authContext';
import NotificationModal from "../components/NotificationModal";
import {useTools} from "./toolContext";
import * as WebSocket from '../api/webSocket.api';
import mixpanel from 'mixpanel-browser';
import {useNotifications} from './notificationContext';
import { openNotificationWithIcon } from '../utils';
import useSound from 'use-sound';
import notificationSound from '../assets/sounds/notification.mp3';
import * as JobApi from '../api/job.api'
let updated = []
const SocketContext = React.createContext({});
let globalArr = []
let cronArr = []
let socketsSend = []
let techUser = []
let techEmailChange;

function SocketProvider({ children, ...props }) {

    const [play] =  useSound(notificationSound)
    const { user } = useUser();
    const {sethideBadge,setOpenMobileDialogBox} = useTools();
    const {fetchNotifications} = useNotifications()
    const history = useHistory();
    const {setMethod,setJobIds,jobIds} = useJob();
    const [techAlert, setTechAlert] = useState({})
    const [isOpen, setIsOpen] = useState(false);
    const [techEmail, setTechEmail] = useState();
    const [notificationShowing, setNotificationShowing] = useState(false);
    const techAlertData =  useMemo(()=>{
        if(techEmail!== ''){
        mixpanel.identify(techEmail);
        mixpanel.track(` ${techAlert.customer_email}job alert sent to technician `,{'JobId':techAlert.job_id,'JobAlertSentTechnician':techEmail});
        clearTimeout(techEmailChange)
     }
    },[techEmail])
    
    useEffect(() => {
        if (user !== undefined  && (user.customer !== undefined || user.technician !== undefined)) {
            socket.emit("join-user", user.id);
            socket.on("new-jobs",(receiver)=>{
                // let tech_arrays = Object.keys(receiver)
                let jobs = []
                if(user.technician && user.technician.status !== "Busy"){
                    // console.log("Get notification for new-jobs",receiver)
                    jobs = receiver[user.technician.id]
                    setJobIds(jobs)
                    /*if(jobs !== undefined && jobs.length > 0){
                        if(user.technician && user.technician.status !== "Busy"){
                            console.log(">>>>>new-jobs >>>>>>",user.technician)
                        }
                    }*/
                }
            })
            socket.on("new-job-alert", async ({ receiver, job,user_id ,user_email}) => {
                if(user && user?.userType == 'technician'){
                    console.log("Job Alert Sent to the technician with userId ::: :::::::::: ",user_email)
                    console.log("new-job-alert ::: socket.ts ")
                    const techalertobj = {};
                    techalertobj['techemail'] = user_email;
                    techalertobj['customer_email'] = job?.jobData?.customer?.user?.email;
                    techalertobj['job_id'] = job.jobData.id ;
                    setTechAlert(techalertobj)
                    techEmailChange = setTimeout(()=>{
                        setTechEmail(user_email)
                    },3000)
                    // if (receiver.indexOf(user.id) === -1) return;
                    // console.log("job (new-job-alert) ::",job)
                    let jobId = job.jobData.id;
                    // mixpanel code//
                    //  job.jobData.customer.user.email
                    // mixpanel.identify(user_email);
                    // mixpanel.track(`${job.jobData.customer.user.email}- job alert sent to technician`,{'JobId':jobId,'JobAlertSentTechnician':user_email});
                    // mixpanel code//


                    // console.log("receiving the job alert >>>>>>>>>>>>",globalArr,">>>>>user id",user_id,">>>job id>>>",job)
                    if(jobIds){
                        // let temp = []
                        setJobIds((prevState)=>{if(prevState!==undefined){return[jobId]}})
                    }
                    if(user && user.id !== user_id && user.technician ){
                        return;
                    }
                    // console.log("user in new-job-alert ::::",user)
                    // console.log("condition 2 :::: ", globalArr.includes(user_id+"-"+jobId))
                    if(user &&  user.technician && user.technician.status !== "Busy" && user.id === user_id && globalArr.includes(user_id+"-"+jobId) === false ){
                        techUser.push(user_id);
                        
                        globalArr.push(user_id+"-"+jobId);
                        
                        console.log("Job Alert Sent to the technician with userId Not Busy :::: ",user_email)
                    }
                }

            });
            socket.io.on("reconnect", (attempt) => {
              console.log("reconnecting the socket ",attempt)
            });
            socket.io.on("reconnect_attempt", (attempt) => {
                console.log("attempting to reconnect the socket",attempt)
            });
            socket.io.on("reconnect_failed", () => {
                console.log("reconnection failed for the socket ")  
            });
            socket.io.on("reconnect_error", (error) => {
                console.log("error in reconnection of socket :::",error)
            });



            socket.on("ten-min-meeting",async(data)=>{
                let jobId = data.job.id;

                if(user && user.customer && user.customer.id === data.customer.id && globalArr.includes(user.id+"-"+jobId) === false ){
                    console.log("socketContext ::::: inside creating notification for customer :::::")
                    globalArr.push(user.id+"-"+jobId)
                    // await createNotification(notificationData)
                    await fetchNotifications({"user":user.id})
                    // console.log("fetching for customers ---------------")
                }
                if(user && user.technician && user.technician.id === data.technician.id && globalArr.includes(user.id+"-"+jobId) === false ){
                    globalArr.push(user.id+"-"+jobId)
                    // await createNotification(notificationData)
                    await fetchNotifications({"user":user.id})
                    // console.log("fetching for technicians ---------------")
                }
                else{
                    return;
                }
            })



            socket.on("checkingForusers",(data)=>{
                if(user && !cronArr.includes(user.id+"-"+data.random)){
                    cronArr.push(user.id+"-"+data.random)
                    socket.emit("present",{userId:user.id,userType:user.userType,user:user})
                }
            })
            socket.on("clearUsers",(data)=>{
            cronArr = []
            })

            socket.on("new-appointment-request", async({ receiver, job,technician,web_socket_id,singleCustomer }) => {
                 let forSingleCustomer = false
                if(singleCustomer != undefined){
                    forSingleCustomer = singleCustomer
                }
               
                // console.log("receiver :::",receiver)
                console.log("new-appointment-request of job ::::: ",job)
                console.log("technician ::: ",technician)
                // console.log("web_socket_id ::: ",web_socket_id)
                // console.log("receiving the socket but not doing anything why..?page")
                if(user && user.customer && receiver === user.customer.id){
                    // let webSocket = await WebSocket.updateSocket(web_socket_id,{'hitFromCustomerSide':true})
                    await WebSocket.updateSocket(web_socket_id,{'hitFromCustomerSide':true})
                }
                if(user && user.customer && receiver === user.customer.id && globalArr.includes(user.id+"-"+job) === false){
                    
                    globalArr.push(user.id+"-"+job)

                    /*let notificationData = {
                        "user":user.id,
                        "job":job,
                        "actionable":true,
                        "title":"We found a Technician for your Job",
                        "type":"Scheduled Job",
                        "read":false
                    }*/
                   
                }
                if ((!user || !user.customer || receiver !== user.customer.id) && !forSingleCustomer ) {
                    if(user && user.technician !== null && !updated.includes(user.id) ){
                        updated.push(String(user.id))
                        // console.log(">receivers >>>>>>>>>>",receiver)
                        // console.log(">>>i am in socket function for updating the notifications")
                        // console.log("this code is working")
                        await fetchNotifications({"user":user.id})
                    }
                    // console.log("returned")
                    return;
                }
                // console.log(user,"this is the user")
                // if(user && user.technician !=null ){
                    //   console.log(">>>i am in socket function for updating the notifications")
                    //   console.log("this code is working")
                    //   await fetchNotifications({"user":user.id})
                // }
               
                const updatedJob = await JobApi.retrieveJob(job)

                if( updatedJob?.customer?.id === user?.customer?.id ){
                    // console.log(">>>>>>>hy this is if>>>>>>>>>>>>>>>>>>>>>>>")
                    history.push(`/customer/accept-job/${job}`);
                    return;
                }
                else{
                    setOpenMobileDialogBox(true)
                }
                
            });

            socket.on("get-method",function(data){
                // console.log(">i got the socket   the changed the data")
                setMethod(data)
            })
            socket.on("refresh-notifications",function(data){
                // var notification = new Notification("Hi there!",{body: 'Have a good day',icon: ''});
                // console.log("its my notification ::: ",notification)    
                if(user.userType == 'technician' && user?.technician?.id === data?.techId){
                    fetchNotifications({"user":user.id})
                    // play()
                }else{
                    if(!data){
                        fetchNotifications({"user":user.id})
                        // play()
                    }
                }
            })
            // socket.on("refresh-notifications-technicians",function(data){
                // play()
            // var notification = new Notification("Hi there!",{body: 'Have a good day',icon: ''});
            // console.log("its my notification ::: ",notification)
        //     if(user.userType == 'technician'){
        //         fetchNotifications({"user":user.id})
        //     }
        // })
            socket.on("notificationToCustomer",(data)=>{
                if(user &&  user.customer && user.customer.id === data.customerId){
                    if(!socketsSend.includes(data.socketId)){
                        if(!notificationShowing){
                            play()
                            socketsSend.push(data.socketId)
                            openNotificationWithIcon("info","Alert",`Technician is waiting for your job. Please start the meeting. Reload your page if unable to join`)
                            setNotificationShowing(true)
                            setTimeout(()=>{
                                setNotificationShowing(false)
                            },5000)
                        }
                    }                    
                }
            })
            socket.on("decline-technician",(result)=>{
                // console.log("inside the declined-technician code >>>",result)
                if(user.technician && result.res != undefined){
                    // console.log("inside the declined-technician code >>>")
                    if(user.technician.id === result.res.id){
                        sethideBadge(true)
                        try {
                            WebSocket.updateSocket(result.websocket_id,{'hitFromTechnicianSide':true})
                        }
                        catch(err) {
                            console.log('decline-technician error in SocketContext page>>>',err)
                        }

                        window.location.href= "/"
                    }
                }
            })

        }
    
    }, [user]);


  
    /*const sendTechnicianToPage = async (job,receiver)=>{
        // console.log("inside tech func")    
        setTimeout(()=>{
            return true
        },2000)
        // history.push(`/technician/new-job/${job}`, { userIds: receiver,appendedJob:job });      
    }*/
    /*const getEstEarning = (softwareData) => {


        const time1 = (softwareData !== undefined && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
        const time2 = (softwareData !== undefined && String(softwareData.estimatedTime).indexOf('-') !== -1  ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)

        let price_Arr = softwareData.estimatedPrice? softwareData.estimatedPrice.split("-"): []
        console.log("price_Arr :: ",price_Arr)
        if(price_Arr.length > 0){
            let initPriceToShow = (time1/6)*parseInt(price_Arr[0])
            initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 'NA')
            let finalPriceToShow = (time2/6)*parseInt(price_Arr[1])
            finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 'NA')
            return '$'+initPriceToShow+'-'+finalPriceToShow
        }else{
            return '';
        }
    }*/
    const memoChild = useMemo(()=>{
        return <>{children}</>
    },[props])
    const memoValue = useMemo(()=>({
        socket
	}),[socket])
    return (
        <>
        <SocketContext.Provider
          value={memoValue}
          {...props}
        >
            {memoChild}
            <NotificationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </SocketContext.Provider>
        </>
    );
}

function useSocket() {
    const context = React.useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}
SocketProvider = React.memo(SocketProvider)
export {SocketProvider , useSocket };