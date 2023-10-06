import React, { useCallback, useState, useEffect } from 'react';
import * as NotificationApi from '../api/notification.api';
import { APP_URL } from '../constants'
import useSound from 'use-sound';
import { useTools } from './toolContext'
import notificationSound from '../assets/sounds/notification.mp3';
const NotificationContext = React.createContext({});

function NotificationProvider(props) {

	const [play] = useSound(notificationSound)
	const { browserNotificationShown } = useTools()
	const [allNotifications, setallNotifications] = useState();
	const [playSound, setPlaySound] = useState(false);

	/**
	* This useEffect will run to play notification sounds.
	* @params =  no params
	* @response : no response
	* @author : Kartik
	*/
	useEffect(() => {
		if (playSound) {
			play()
			setTimeout(setPlaySound(false), 3000)
		}
	}, [playSound])

	const fetchNotifications = useCallback(async (data = {}) => {
		console.log("fetchNotifications :::::: data ::::::::", data)
		try {
			const res = await NotificationApi.findNotificationByParams(data);
			let notification_data = res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			console.log(">>notification data >>>>>>>>", notification_data)
			if (notification_data[0] != undefined && notification_data[0]['shownInBrowser'] == false && notification_data[0]['read'] == false && !browserNotificationShown.includes(notification_data[0].id)) {
				await browserNotificationShown.push(notification_data[0].id)
				let body = `${notification_data[0]['title']}`
				var options = {
					body: body
				}
				await NotificationApi.updateByParams({ "_id": notification_data[0].id, "shownInBrowser": true })
				setPlaySound(true)
				var notification = new Notification("New Notification", options)
				notification.onClick = function (event) {
					event.preventDefault()
					window.open(APP_URL);
				}
			}
			setallNotifications(notification_data)
		}
		catch (err) {
			console.log("error in fetchNotifications Notification Provider >>>>> ", err)
		}
	}, [allNotifications])

	const createNotification = useCallback(async (data = {}) => {
		try {
			const res = await NotificationApi.create(data);

			console.log(res, ">>this is response")
		}
		catch (err) {
			console.log("error in createNotification Notification Provider >>>>> ", err)
		}
	})

	const updateReadStatus = useCallback(async (data) => {
		try {
			const res = await NotificationApi.updateReadStatus(data);
			const fetchObj = {}
			fetchObj['user'] = data['user']
			fetchNotifications(fetchObj)
		}
		catch (err) {
			console.log("error in Notification update Read status provider  >>>>> ", err)
		}
	})

	return (
		<NotificationContext.Provider value={{
			createNotification,
			fetchNotifications,
			allNotifications,
			updateReadStatus
		}}
			{...props}
		/>
	)
}

function useNotifications() {
	const context = React.useContext(NotificationContext);
	if (context === undefined) {
		throw new Error('useJob must be used within a JobProvider');
	}
	return context;
}

export { NotificationProvider, useNotifications };