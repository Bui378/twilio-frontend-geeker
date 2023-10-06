
import React, { useState, useEffect, useCallback } from 'react';
import * as AuthApi from '../api/auth.api';
import { SECRET_KEY, JobTags } from '../constants';
import Loader from '../components/Loader';
import { openNotificationWithIcon, roleStatus, isLiveUser } from '../utils';
import * as UserApi from '../api/users.api';
import * as JobCycleApi from '../api/jobCycle.api';
import { retrieveTechnicianBysomeParams, updateTechnician } from '../api/technician.api';
import * as JobApi from '../api/job.api';
import * as CustomerApi from '../api/customers.api';
import * as SettingsApi from '../api/settings.api';
import { useHistory, useLocation } from 'react-router-dom';
import mixpanel from 'mixpanel-browser';
import { send_email_to_customer } from '../api/serviceProvider.api';
import Cookies from 'js-cookie';
import { SERVER_URL, VERSION } from "../constants";
import socketClient from "socket.io-client";
import { notification } from 'antd';
import { useJob } from './jobContext';
import { useTools } from './toolContext';
const AuthContext = React.createContext({});
let loginRetried = 0
let signupRetry = 0

export const socket = socketClient(`${SERVER_URL}`, {
    'forceNew': true,
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax': 10000,
    'reconnectionAttempts': 50
});

const retryRequests = () => {
    try {
        const myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, 5000);
        });

        return myPromise
    }
    catch (err) {
        console.log("error in retryRequests ::::: ", err)
        return false
    }
}

function AuthProvider(props) {
    console.log('i am here AuthProvider')
    const location = useLocation()
    const [currentUser, setCurrentUser] = useState()
    const [chatUser, setChatUser] = useState()
    const [user, setUser] = useState();
    const { updateJob } = useJob();
    const { setJobId, setTypeForDetails, setStepDeciderDashboard, setActiveMenu, jobId, stepDeciderForDashboard, jobFlowsDescriptions, setJobFlowStep, ifScheduleJob } = useTools()
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    let detailsJobId = false
    let jobStatus = false
    let params = new URLSearchParams(location.search)

    if (params.get("jobId")) {
        detailsJobId = params.get("jobId")
    }
    if (params.get("status")) {
        jobStatus = params.get("status")
    }

    const refetch = useCallback(async () => {
        try {
            const res = await AuthApi.getCurrentUser();
            console.log("res ::::::::: user", res);
            const versioning = await SettingsApi.getSettingsList();
            if (res['success'] !== false) {
                setUser(res);
                setCurrentUser(res)
            }
            let db_version = (versioning && versioning.data && versioning.data[0] ? versioning.data[0]['version'] : '')
            let react_version = VERSION
            let dbArray = (db_version ? db_version.split(".") : []);
            let reactArray = (react_version ? react_version.split(".") : []);
            let dbIntArray = dbArray.map(function (x) { return parseInt(x, 10) });
            let dbIntNumber = parseInt(dbIntArray.join(''))
            let reacIntArray = reactArray.map(function (x) { return parseInt(x, 10) });
            let reactIntNumber = parseInt(reacIntArray.join(''))
            Cookies.set('user_id', res.id, { "path": '/', "domain": process.env.REACT_APP_COOKIE_DOMAIN })
            window.user_email = res.email
            if (db_version == react_version) {
            } else if (reactIntNumber < dbIntNumber) {
                openNotificationWithIcon('error', 'Error', 'You are using an old version of app. Please use Ctrl+F5 to refresh your browser.');
            }
        }
        catch (err) {
            console.log("Error in function refetch (AuthProvider) ::", err)
        }
    }, [setUser]);

    const fetch = useCallback(async () => {
        try {
            setIsLoading(true);
            await refetch();
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
        }
    }, [refetch]);

    useEffect(() => {
        fetch();
    }, [fetch]);


    /** 
     * detect if the user timezone is correct
     * @params : res
     * @return : {void}
     * @author : sahil
     */

    async function checkForTheCorrectTimezone(res) {
        try {
            if (res.user.timezone == undefined || res.user.timezone == null || res.user.timezone == '') {
                let updatedUser = await UserApi.updateUser({ "userId": res.user.id, "timezone": Intl.DateTimeFormat().resolvedOptions().timeZone })
                return true
            }
        }
        catch (err) {
            console.log("error in checkfor the correcttimezone :: ", err)
            return false
        }
    }

    /** 
     * function that sends checks and create promocode
     * @params : technicianId(Type:String)
     * @return : {void}
     * @author : sahil
     **/
    async function checkOrCreatePromoCode(res) {
        try {
            let technician = await retrieveTechnicianBysomeParams({ "user": res.user.id })
            console.log("technician <<<<<<<<<<<< ", technician)
            if (technician[0].promo_code == undefined || technician[0].promo_code == null || technician[0].promo_code == '') {
                await updateTechnician(technician[0].id, {
                    'promo_code': (`${res.user.firstName}${res.user.lastName}`).replace(/ /g, '').toLocaleUpperCase(),

                })
                return true
            }
        }
        catch (err) {
            console.log("error in checkOrCreatePromoCode ::: ", err)
            return false
        }
    }

    function setToken(token) {
        localStorage.setItem(SECRET_KEY, token);
        let cookieVariable = `user_access=${token}; path=/; domain=${process.env.REACT_APP_COOKIE_DOMAIN};`
        console.log("this is cookie variable in setToken :::::::;;", cookieVariable)
        document.cookie = cookieVariable
    }

    function removeToken() {
        console.log("tetch token removed from authContext.jsx")
        localStorage.removeItem(SECRET_KEY);
        localStorage.removeItem('pageNum'); //Removing pageNum from localStorage when logout.
    }

    async function login({ email, password, jobId, status, slackJobid, message, customerId }, postedJobId, isMobilePost) {
        try {
            localStorage.removeItem('CurrentStep')

            setStepDeciderDashboard(0)
            setActiveMenu('home')
            const res = await AuthApi.login({ email, password });
            console.log("Login res ::", res)
            if (res && res.success === true) {
                if (res.user.userType == 'technician') {
                    await checkOrCreatePromoCode(res)
                }
                mixpanel.identify(email);
                mixpanel.track(`${res.user.userType} Log In Sucessfully`, { 'Email': email });
            }
            if (res && res.success) {
                if (jobId && status === 'acceptjob') {
                    const { user } = res;
                    await retrieveTechnicianBysomeParams({ "user": user.id })
                    send_email_to_customer(jobId)
                }
                let cookieVariable = `user_id=${res.user.id}; path=/; domain=${process.env.REACT_APP_COOKIE_DOMAIN};`
                console.log("this is cookie variable in setToken :::::::;;", cookieVariable)
                console.log("isMobilePost :::::::::", isMobilePost)
                loginCallback(res, jobId, status, postedJobId, isMobilePost, slackJobid, message, customerId);
                await checkForTheCorrectTimezone(res);
                return res;
            } else {
                return res;
            }
        } catch (err) {
            if (loginRetried < 3) {
                loginRetried = loginRetried + 1
                let sendReqAgain = await retryRequests()
                if (sendReqAgain) {
                    await login({ email, password, jobId, status }, postedJobId, isMobilePost)
                }
            }
            console.log("Error in login (AuthContext)::", err)
        }
    }

    function setUserToken({ user, token }) {
        setUser(user);
        console.log(">user :::::::::::: ", user)
        setToken(token.accessToken);
    }

    async function register(data) {
        console.log("register function hit for guest user..... ***** ")
        try {
            const res = await AuthApi.register(data);

            if (res) {
                console.log('register function AuthContext::res,data', res, data, data.email)
                if (res.success !== undefined && res.success === false) {
                    return res
                } else {
                    setUserToken(res);
                    await verificationEmailHandler({ email: data.email })
                    Cookies.set('user_id', res?.user?.id, { "path": '/', "domain": process.env.REACT_APP_COOKIE_DOMAIN })
                    if (res?.user?.userType === 'customer') {
                        console.log("res")
                        if (data.jobId && data.jobId !== '') {
                            if (data.scheduleJob) {
                                console.log('scheduleeeeeeeeeee')
                                window.location.href = `/customer/create-job/${data.jobId}` + `?jobId=${data.jobId}&newpost=no&schedule=yes`;
                            } else {
                                window.location.href = '/customer/create-job/' + data.jobId + '?jobId=' + data.jobId + '&newpost=yes';
                            }
                        } else {
                            window.location.href = '/';
                        }
                    }
                    else {
                        console.log('seems like an error in register::res', res)
                    }
                    return res?.user;
                }
            } else {
                console.log("Inside else part of register function response ..")
            }
        } catch (err) {
            if (signupRetry < 3) {
                signupRetry = signupRetry + 1
                let sendReqAgain = await retryRequests()
                if (sendReqAgain) {
                    await register(register)
                }
            }
            notification.destroy()
            openNotificationWithIcon('error', 'Error', "Please try after sometime");
            console.log('register function AuthContext::error', err)
            return { 'success': false, 'message': err.message }
        }
        return null;
    }

    async function verificationEmailHandler(data) {
        try {
            const res = AuthApi.verifyEmail(data)
            res.then((result) => {
            })
        }
        catch (err) {
            console.log("Error in verificationEmailHandler (AuthContext)::", err)
        }
    }

    async function loginFacebook(data) {
        try {
            const res = await AuthApi.loginFacebook({
                accessToken: data.accessToken,
                userID: data.userID,
            });

            if (res) {
                loginCallback(res);
            }
        } catch (err) {
            const { response: { data: { error: { message } = {} } = {} } = {} } = { ...err };
            openNotificationWithIcon('error', 'Error', message);
        }
    }

    async function loginGoogle(data) {
        try {
            const res = await AuthApi.login({
                tokenId: data.tokenId,
            });

            if (res) {
                loginCallback(res);
            }
        } catch (err) {
            const { response: { data: { error: { message } = {} } = {} } = {} } = { ...err };
            openNotificationWithIcon('error', 'Error', message);
        }
    }

    async function promiseCallBack() {
        try {
            let resolved = new Promise((resolve, reject) => {
                setTimeout(() => {
                    setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
                    return resolve(true)
                })
            }, 2000)
        }
        catch (err) {
            console.log("error in promiseCallBack")
        }
    }

    async function loginCallback(res, job_id_param = false, status = false, postedJobId = false, isMobilePost = false, slackJobid = false, message = false, customerId = false) {
        const { token, user } = res;
        let job_id = params.get('jobId') || jobId || job_id_param
        console.log("condition 1 :::::::::::", postedJobId !== false)
        console.log("user :::::::::::1212 ", user)
        if (location.search) {
            let params = new URLSearchParams(location.search)

            let email = params.get('email')
            let t = params.get('t')
            if (user.email === email) {
                setJobId(job_id)
                setTypeForDetails("apply")
                setStepDeciderDashboard(6)
            }
            if (t === "sub") {
                setStepDeciderDashboard(10)
                window.location.href = '/dashboard?t=' + t
            }
        }
        setUser(user);
        setToken(token.accessToken);
        if (postedJobId === false) {
            await refetch()
        }

        if (slackJobid) {
            if (user?.customer && user?.customer?.id === customerId) {
                setJobId(slackJobid)
                setTypeForDetails("apply")
                setStepDeciderDashboard(6)
            }
            if (user && user?.userType === 'technician') {
                setTypeForDetails("apply")
                setJobId(slackJobid)
                setStepDeciderDashboard(6)
            }
        }

        if (message) {
            console.log('inside the message when login 3', message)
            setStepDeciderDashboard(15)
            setActiveMenu('messages')
        }

        Cookies.set('user_id', user.id, { "path": '/', "domain": process.env.REACT_APP_COOKIE_DOMAIN })
        socket.emit("loggedIn", { userId: user.id, userType: user.userType, user: user })

        if (user.userType === 'customer') {
            console.log('inside the refresh-twilio-unread-messages customer', { id: user?.id, type: user?.userType })
            socket.emit("refresh-twilio-unread-messages", {
                customerUserId: user?.id,
                technicianUserId: ""
            })
        } else {
            console.log('inside the refresh-twilio-unread-messages tech', { id: user?.id, type: user?.userType })
            socket.emit("refresh-twilio-unread-messages", {
                customerUserId: "",
                technicianUserId: user?.id
            })
        }

        if (postedJobId !== false) {
            const res = await AuthApi.getCurrentUser();
            if (res['success'] !== false) {
                setToken(token.accessToken);
                if (res && res.customer) {
                    console.log("isMobilePost :::::::::", isMobilePost)
                    if (isMobilePost == false || isMobilePost == null) {
                        await JobApi.updateJob(postedJobId, { "customer": res.customer.id })
                    }
                    await JobCycleApi.create(JobTags.USER_LOGIN, postedJobId);
                    if (ifScheduleJob === true) {
                        window.location.href = `/customer/start-profile-setup` + `?jobId=${postedJobId}&newpost=no&schedule=yes`
                    } else {
                        let wait2Sec = await promiseCallBack()
                        console.log("wait2Sec >>>>", wait2Sec)
                        window.location.href = `/customer/start-profile-setup` + `?jobId=${postedJobId}&newpost=yes`
                    }
                }
                setUser(res)
            }
        }
        if (job_id && status === 'foundin30min') {
            window.location.href = '/customer/accept-job/' + job_id
        }

        if (job_id && status === 'notfoundin30min') {
            window.location.href = '/customer/job-tech-not-found/' + job_id
        }

        if (job_id && status === 'acceptjob') {
            ChangeToJobDetailsPage(job_id)
        }

        let jobItem = window.localStorage.getItem("checkjobdata")
        console.log("jobItem :::::::::", jobItem)

        if (job_id && jobItem === 'true') {
            const jobResult = await JobApi.retrieveJob(job_id);
            console.log('check correct user for details', jobResult);
            if (res.user.userType === 'technician') {
                if (res.user.id === jobResult.technician.user.id) {
                    setActiveMenu("job-reports")
                    ChangeToJobDetailsPage(job_id)
                } else {
                    window.location.href = '/dashboard'
                }
            } else {
                if (res.user.userType === 'customer' && res.user.id === jobResult.customer.user.id) {
                    setActiveMenu("job-reports")
                    ChangeToJobDetailsPage(job_id)
                } else {
                    window.location.href = '/dashboard'
                }
            }

        }
    }


    /**
     * If the technician accepts job from email then this function is called to change the page to job detail. 
     * @params = ''
     * @response : Will take the technician to job details page.
     * @author : Manibha
    */
    async function ChangeToJobDetailsPage(jobId) {
        let type = "noapply"
        let theJob = JobApi.retrieveJob(jobId)
        theJob.then((res) => {
            if (res.technician == undefined || res.technician === "" || res.technician == null) {
                type = "apply"
            }
            setJobId(jobId)
            setTypeForDetails(type)
            setStepDeciderDashboard(6)
            setActiveMenu("job-reports")
            localStorage.removeItem('checkjobdata');
        })
    }
    async function ChangePasswordHandler(data) {

        try {
            const res = AuthApi.resetPassword(data)
            res.then((result) => {
            })
        }
        catch (err) {
            console.log('Error in ChangePasswordHandler (AuthContext)::', err);
        }
    }

    async function resetPasswordHandler(data) {
        try {

            const res = await AuthApi.forgotPassword(data)
            return res
        }
        catch (err) {
            console.log('Error in resetPasswordHandler (AuthContext)::', err);
            return { 'success': false, 'message': err.message }
        }
    }

    async function updateUserInfo(data) {
        try {
            console.log('data:::: business', data)
            const res = await UserApi.updateUser(data);
            return res;
        } catch (err) {
            openNotificationWithIcon('error', 'Error', err.message);
        }
    }
    async function updateUserBusinessDetailsInfo(data) {
        try {
            const res = await UserApi.updateUserBusinessDetails(data);
            return res;
        } catch (err) {
            openNotificationWithIcon('error', 'Error', err.message);
        }
    }

    function logout() {
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track(`${user.userType}` == 'technician' ? `${user.userType} Log Out` : `${user.userType} Logout`);
        // mixpanel code//
        localStorage.removeItem('CurrentStep')
        localStorage.removeItem('promo-code-details')
        socket.emit("loggedOut", { userId: user.id, userType: user.userType })
        removeToken();
        window.location.href = '/login';
    }

    function hasPermission(permission) {
        return user?.userType === permission;
    }

    async function getGuestUser() {
        try {
            const res = await AuthApi.getGuestUser();
            return res;

        } catch (err) {
            console.log("Error in getGuestUser (AuthContext)::", err);
        }
    }

    async function getCustomerSubscription(customer) {
        try {
            let responseData = {}
            console.log("getCustomerSubscription data:", customer)
            if (customer && customer.subscription && customer.subscription.plan_id) {
                responseData['subscription'] = customer.subscription;
                responseData['subscriptionOwnerId'] = customer.id;
                return responseData;
            } else {

                if (customer.user.roles && customer.user.roles.length > 0) {
                    let data = {};
                    data['user_id'] = customer.user.id;
                    data['user_role'] = customer.user.roles[0]
                    data['user_parent'] = customer.user.parentId
                    let liveUser = isLiveUser(customer.user)
                    data['liveUser'] = liveUser
                    const res = await CustomerApi.getCustomerSubscription(data);
                    console.log("res in subs context :::", res)
                    return res && res.subscription ? res : responseData

                } else {
                    return responseData
                }
            }
        } catch (err) {
            openNotificationWithIcon('error', 'Error', 'Failed to find subscription.');
        }
    }
    if (isLoading) {
        return <Loader />;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                register,
                isLoading,
                refetch,
                updateUserInfo,
                updateUserBusinessDetailsInfo,
                setUserToken,
                hasPermission,
                loginFacebook,
                setIsLoading,
                loginGoogle,
                resetPasswordHandler,
                ChangePasswordHandler,
                verificationEmailHandler,
                getGuestUser,
                getCustomerSubscription,
                setChatUser,
                chatUser,
                setToken,
                setUser,
            }}
            {...props}
        />
    );
}

function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}

export { AuthProvider, useAuth };
