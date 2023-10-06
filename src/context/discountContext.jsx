import React, { useState, useContext } from 'react';
import { getReferalDiscountHistory, getTotalReferalAmount } from '../api/referalDiscount.api';
import { useAuth } from './authContext';

const DiscountHistoryContext = React.createContext({});

function DiscountHistoryProvider(props) {
	const [discountHistory, setDiscountHistory] = useState([]);
	const { user } = useAuth();
	const [totalReferal, setTotalReferal] = useState(0);
	const [discountCount, setTotalDiscountCount] = useState(0);
	/**
	 * Context which sets the global variable for total Amount
	 * @param : data(Type:object)
	 * @response : Sets totalReferal Amont
	 * @author  Sahil
	 */
	async function totalReferalAmount(data) {
		try {
			console.log("referral data :::: >>>> ", data)
			let resp = await getTotalReferalAmount(data)
			console.log("response ::: getTotalReferal Amount :::", resp)
			if (resp.success) {
				setTotalReferal(resp.totalReferalAmount)
			}
			else {
				console.log("error in getTotalReferalAmount")
			}
			return true;
		}
		catch (err) {
			console.log("error in getTotalReferalAmount :::", err)
		}
	}
	/**
	 * Context that updates the state variable for referal account
	 * @params : {void}
	 * @response : updates the state variable
	 * @author : Sahil
	 */
	async function fetchDiscountHistory(page, pageSize) {
		try {
			if (user.userType == 'customer') {
				let params = {
					'customer': user.customer.id,
					'page': page,
					'pageSize': pageSize
				}
				let discountHistoryRes = await getReferalDiscountHistory(params)
				if (discountHistoryRes.success) {
					setDiscountHistory(discountHistoryRes.data)
					setTotalDiscountCount(discountHistoryRes.totalCount)
				}
				else {
					console.log(">>>>><<<<<<<<<<< discountHistoryRes< <<<<<<<<<< ", discountHistoryRes)
				}
			}
		}
		catch (err) {
			console.log("error in fetchDiscountHistory ::: ", err)
		}
	}

	return (
		<DiscountHistoryContext.Provider
			value={{
				discountHistory,
				fetchDiscountHistory,
				totalReferalAmount,
				totalReferal,
				setTotalReferal

			}}
			{...props}
		/>
	)
}

function useDiscountHistory() {
	const context = useContext(DiscountHistoryContext)
	if (context == undefined) {
		throw new Error("context is empty useDiscountHistory")
	}
	return context
}

export { DiscountHistoryProvider, useDiscountHistory }
