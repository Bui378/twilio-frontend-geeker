import React, { useEffect, useState } from 'react';
import { Table, Pagination } from 'antd';
import { Row, Col, Button } from 'react-bootstrap';
import { handleRefModal } from '../../../utils'
import { useDiscountHistory } from '../../../context/discountContext';
import Loader from '../../../components/Loader';

let intialRender = true
const ReferalRewardsTable = ({ user }) => {

	const [currentPage, setCurrentPage] = useState(1);
	const [columns, setColumns] = useState([
		{
			title: 'Type',
			dataIndex: 'spentType',
			key: 'spentType',
		},
		{
			title: 'Transaction Type',
			dataIndex: 'spentFor',
			key: 'spentFor',
		},
		{
			title: 'Intital Amount ($)',
			dataIndex: 'initalAmount',
			key: 'initalAmount',
		},
		{
			title: 'Spent Amount ($)',
			dataIndex: 'spentAmount',
			key: 'spentAmount',
		},
		{
			title: 'Net Amount ($)',
			dataIndex: 'newAmount',
			key: 'newAmount',
		},
	])
	
	const [data, setData] = useState([])
	const [showLoader, setShowLoader] = useState(true);

	const { discountHistory, fetchDiscountHistory, totalReferalAmount, totalReferal, discountCount } = useDiscountHistory()

	const handlePagination = async (page, pageSize) => {
		console.log(">>>>>>>>>true")
		setShowLoader(true);
		setCurrentPage(page);
		page = page;
		pageSize = pageSize;
		fetchDiscountHistory(page, pageSize)
	};

	useEffect(() => {
		if (user && user.customer) {
			totalReferalAmount({ query: { "customer": user.customer.id } })
			fetchDiscountHistory(1, 10)
			setShowLoader(false)
			intialRender = false
		}
	}, [user])

	useEffect(() => {
		if (discountHistory.length > 0) {
			setData(discountHistory)
			setShowLoader(false)
		}
	}, [discountHistory])

	return (
		<React.Fragment key="referReward">
			<Col xs="12" className="">
				<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />
				<Col xs="12" className="pt-5">
					<Col xs="12" className="py-3 div-highlighter">
						<Row>
							<Col md="4" className="pl-5 mb-4">
								<span className="d-block label-total-name">Available Balance</span>
								<span className="d-block label-total-value" title="Coming Soon...">${totalReferal}</span>
							</Col>
							<Col md="8" className="text-right mt-3">
								<Button onClick={handleRefModal} className="btn app-btn">
									<span></span> Refer person
								</Button>
							</Col>
						</Row>
					</Col>
				</Col>
				<Col xs="12" className="pt-5 pb-3">
					<h1 className="large-heading">Referral Rewards</h1>
				</Col>
				<Col xs="12" className="ant-table-structure-outer table-responsive">
					<div className="highlight-background"></div>
					<Table
						bordered={false}
						pagination={false}
						columns={columns}
						dataSource={data}
					/>
				</Col>
				{discountCount > 0 &&
					<Pagination
						style={{ float: "right", ",marginRight": "40px" }}
						current={currentPage}
						onChange={handlePagination}
						total={discountCount}
					/>
				}

			</Col>
		</React.Fragment>

	)
};
export default ReferalRewardsTable;