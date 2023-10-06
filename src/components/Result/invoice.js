import React from "react";
import { useAuth } from "../../context/authContext";
import { useServices } from "../../context/ServiceContext";
import { Container, Row, Col, Table } from "react-bootstrap";
import getTotalJobTime from '../../components/common/TotalTimeFunction'

const InvoicePage = (props) => {
	const job = props.job;
	const subscriptionData = props.subscriptionData;
	const chargeData = props.chargeData;
	const { user } = useAuth();
	const { convertTime } = useServices();

	const convertDateTime = (t) => {
		if (t != undefined) {
			const nth = function (d) {
				if (d > 3 && d < 21) return "th";
				switch (d % 10) {
					case 1:
						return "st";
					case 2:
						return "nd";
					case 3:
						return "rd";
					default:
						return "th";
				}
			};

			let date = new Date(t);
			if (date) {
				const month = [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December",
				];
				let h = date.getHours();
				return (
					date.getDate() +
					nth(date.getDate()) +
					" " +
					month[date.getMonth()] +
					"," +
					" " +
					date.getFullYear() +
					" " +
					date.getHours() +
					":" +
					date.getMinutes() +
					" " +
					(h > 12 ? "PM" : "AM")
				);
			}
		} else {
			return false;
		}
	};


	/**
	 * This function gets date to show in invoice for earning and billing reports.
	 * @params : no params
	 * @response: returns the date in human readable format
	 * @author : Manibha
	  */
	const getDate = () => {
		if (chargeData && chargeData.createdAt != undefined) {
			return convertDateTime(chargeData.createdAt)
		}
		else if (job && job.meeting_end_time != undefined) {
			return convertDateTime(job.meeting_end_time)
		} else if (job && job.updatedAt != undefined) {
			return convertDateTime(job.updatedAt)
		} else {
			return "NA"
		}
	}

	/**
	 * This function gets billed/earned amount to show in invoice for billing and earning reports.
	 * @params : no params
	 * @response: returns the amount
	 * @author : Kartik
	*/
	const getBilledEarnedAmount = () => {
		if (user.userType == "customer") {
			if (
				(job.total_subscription_seconds !== 0 && job.total_subscription_seconds === job.total_seconds)
				|| (job.total_subscription_seconds !== 0 && job.total_subscription_seconds < job.total_seconds && job.is_free_job && job.discounted_cost === 0)) {
				return "$ 0"
			}
			else if (job.total_subscription_seconds !== 0 && job.total_subscription_seconds < job.total_seconds && job.discounted_cost > 0) {
				return "$ " + job.discounted_cost.toFixed(2)
			}
			else if (job.is_free_job && job.free_session_total === 0) {
				return "$ 0"
			} else if (job.total_discounted_cost && job.total_discounted_cost != undefined) {
				console.log("Verifying the discounted Cost is Availbale", job.total_discounted_cost)
				return "$ " + job.total_discounted_cost.toFixed(2)
			}
			else {
				return "$ " + (chargeData.total_amount && chargeData.total_amount > 0 ? chargeData.total_amount.toFixed(2) : 0)
			}
		}
		else {
			return "$ " + (chargeData.amount_earned && chargeData.amount_earned > 0 ? chargeData.amount_earned.toFixed(2) : 0)
		}
	}

	const showTotalAmount = () => {
		return "$ " + job.total_cost
	}

	return (
		<div>
			{job || chargeData ? (
				<Container className="p-4">
					<Row>
						<Col xs={12} style={{ textAlign: "center", paddingBottom: "2rem" }}>
							<img
								src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png"
								alt="tetch"
								width="150"
							/>
						</Col>
						<Col xs={12} style={{ textAlign: "center", fontSize: "30px" }}>
							<b>Thanks for using Geeker service.</b>
						</Col>
					</Row>
					<Row style={{ marginTop: "5rem", fontSize: "16px" }}>
						<Col xs={9}>
							<div>
								<p>
									<b>Invoice ID : </b> {chargeData ? chargeData.id : subscriptionData && subscriptionData.plan_id ? subscriptionData.plan_id : "NA"}
								</p>
								<p>
									<b>Customer : </b> {user.firstName + " " + user.lastName}
								</p>
								<p>
									<b>Date : </b>
									{getDate()}
								</p>
								{user.userType == "customer" && user.customer.phoneNumber ? (
									<>
										<p>
											<b>Phone : </b>
											{user.customer.phoneNumber}
										</p>
									</>
								) : (
									""
								)}
								<p>
									<b>Payment status :</b>
									{(subscriptionData && subscriptionData.plan_id && subscriptionData.plan_id.includes("prod_")) || (job && job.payment_status === "Successful") ? " Successful" : " Technician denied to charge customer"}
								</p>
							</div>
						</Col>

					</Row>
					<Row style={{ marginTop: "10rem", fontSize: "16px" }}>
						<Col>
							<Table striped bordered>
								<thead>
									<tr>
										<th><b>Job Id</b></th>
										<th><b>Software Name</b></th>
										<th><b>Issue Summary</b></th>
										<th><b>Total time</b></th>
										{user.userType === "customer" && job.total_subscription_seconds > 0 && job.is_long_job === false ?
											<th><b>Time used from subscription</b></th>
											: null}
										<th><b>Is Long Job</b></th>
										<th><b>Total Amount</b></th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{job ? job.JobId : ""}</td>
										<td>{job && job.software ? job.software.name : ""} {job && job.subSoftware ? "(" + job.subSoftware.name + ")" : ""}</td>
										<td className='invoiceDes'>{job ? job.issueDescription : ""}</td>
										<td>{job ? job.is_long_job && job.long_job_with_minutes === "no" ? job.long_job_hours + " hours" : (job.total_time ? job.total_time : getTotalJobTime(job).totalTime) : ""}</td>
										{user.userType === "customer" && job.total_subscription_seconds > 0 && job.is_long_job === false ?
											<td>{convertTime(job.total_subscription_seconds)}</td>
											: null}
										<td>{job && job.is_long_job ? "Yes" : "No"}</td>
										<td>{user.userType === "customer" ? showTotalAmount() : "$ 0"}</td>
									</tr>
								</tbody>
							</Table>
						</Col>
					</Row>


					<Row
						style={{
							marginTop: "3rem",
							fontSize: "24px",
							backgroundColor: "#f6fbfe",
						}}
					>
						<Col xs={9}>
							<b>
								{user.userType == "customer" ? "Billed Amount" : "Amount Earned"}
							</b>
						</Col>
						{chargeData != null ? (
							<>
								<Col xs={3}>
									{getBilledEarnedAmount()}
								</Col>
							</>
						) : (
							"0"
						)}
					</Row>
				</Container>
			) : (
				<>
					<h1 className="text-center p-5">No payment details available.</h1>
				</>
			)}
		</div>
	);
};

export default InvoicePage;
