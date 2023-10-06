import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { Row, Col, Button } from 'react-bootstrap';
import { useServices } from '../../../context/ServiceContext';
import Loader from '../../../components/Loader';
import { useEarningDetails } from '../../../context/earningDetailsContext';
import '.././index.css'

const TechnicianTransactons = ({ user }) => {
	const [showLoader, setShowLoader] = useState(true)
	const [payPeriodData, setPayPeriodData] = useState([]);
	const { getStripeAccountStatus, generateAccountLink, createStripeAccount, detailSubmission, disable, getStripeAccountLoginLink } = useServices()
	const [columns, setColumns] = useState([
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Pay Period',
			dataIndex: 'payPeriod',
			key: "payPeriod"
		},
		{
			title: 'Earnings ($)',
			dataIndex: 'earnings',
			key: "earnings"
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
		},
		{
			title: 'PayDate',
			dataIndex: 'payDate',
			key: 'payDate',
		},
	])
	const { fetchTransactions, getDetailsOfPaycycles, totalPaidAmount } = useEarningDetails()

	useEffect(() => {
		(async () => {
			if (user && user.technician) {

				let query = {}
				query['technician'] = user.technician.id
				fetchTransactions(query)
				setTimeout(() => {
					setShowLoader(false);
				}, 1000);
			}
		})();
	}, [user])

	useEffect(() => {
		(async () => {
			if (user.technician && user.technician.accountId) {
				await getStripeAccountStatus(user.technician.accountId)
			}
		})();
	}, [detailSubmission])

	useEffect(() => {
		(async () => {
			if (user) {
				let res = await getDetailsOfPaycycles(user.id, user.technician.id)
				if (res?.payperiodArr) {
					setPayPeriodData(res.payperiodArr)
				}
			}
		})();
	}, [user])

	return (
		<React.Fragment key="technicianTrans">
			<Col xs="12" className="">
				<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />
				<Col xs="12" className="mt-3">
					<Col xs="12" className="py-3">
						<Row>
							{user && user.technician && !user.technician.accountId &&
								(<Col md={{ span: 4, offset: 8 }}>
									<Button className='btn app-btn' disabled={disable} size="lg"
										onClick={() => {
											createStripeAccount(user)
										}} >Create Stripe Account</Button>
								</Col>)
							}
							{detailSubmission === false &&
								(<Col md={{ span: 4, offset: 8 }}>
									<Button className='btn app-btn' disabled={disable} size="lg"
										onClick={() => {
											generateAccountLink(user)
										}}
										target="_blank"
									>
										Complete your stripe account</Button>
								</Col>)
							}
							{detailSubmission === true &&
								(<Col md={{ span: 3, offset: 9 }}>
									<Button className='btn app-btn' disabled={disable} size="lg"
										onClick={() => {
											getStripeAccountLoginLink(user)
										}}
									>
										Stripe Login</Button>
								</Col>)
							}
						</Row>
					</Col>
				</Col>

				<Col md="12" className="py-4 mt-1 table-responsive">
					<Col xs="12" className="table-structure-outer table-responsive p-0">
						<Col xs="12" className="ant-table-structure-outer table-responsive p-0">
							<div className="highlight-background"></div>
							<Table
								bordered={false}
								pagination={false}
								columns={columns}
								dataSource={payPeriodData}
								className="earnings-table"
							/>
						</Col>
					</Col>
				</Col>
			</Col>
		</React.Fragment>
	)
};

export default TechnicianTransactons;