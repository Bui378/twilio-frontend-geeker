import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { Col } from 'react-bootstrap';
import { useServices } from '../../../context/ServiceContext';
import Loader from '../../../components/Loader';

const ActiveTechnicianTable = ({ user }) => {
	const [columns, setColumns] = useState([
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Softwares',
			dataIndex: 'software',
			key: 'software',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'address',
		}
	])

	const [data, setData] = useState([])
	const [showLoader, setShowLoader] = useState(true);
	const { getOnlineTechnicians, onlineTechs } = useServices()

	useEffect(() => {
		setData(onlineTechs)
	}, [onlineTechs])

	const fetchOnlineTechs = async () => {
		let softwares = user?.technician?.expertise.map(ele => ele.software_id)
		let techData = await getOnlineTechnicians({ "softwares": softwares, "userId": user.id })
		setShowLoader(false)
		console.log("techData>>>>>>", techData)
	}

	useEffect(() => {
		fetchOnlineTechs()
	}, [])

	return (
		<>
			<Col xs="12" className="">
				<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />
				<Col xs="12" className="pt-5 pb-3">
					<h1 className="large-heading">Active Technicians</h1>
				</Col>
				<Col xs="12" className="ant-table-structure-outer table-responsive">
					<div className="highlight-background"></div>
					<Table
						bordered={false}
						pagination={false}
						columns={columns}
						dataSource={data.map((item, index) => ({ ...item, key: index }))}
					/>
				</Col>
			</Col>
		</>
	)
};
export default ActiveTechnicianTable;