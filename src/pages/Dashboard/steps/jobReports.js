import React, { useEffect, useState } from 'react';
import { DatePicker, Table, Select, Input, Pagination } from 'antd';
import { Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../../../context/authContext';
import { useServices } from '../../../context/ServiceContext';
import Loader from '../../../components/Loader';
import * as SoftwareApi from '../../../api/software.api';
import { useJob } from '../../../context/jobContext';
import * as UserApi from '../../../api/users.api';

const JobReports = ({ setcurrentStep, setjobId, setType }) => {
	const { Option } = Select;
	const moment = require('moment');
	const { user, refetch } = useAuth();
	const { RangePicker } = DatePicker;
	const { totalTimeSeconds, totalEarnings } = useServices();
	const [allJobsReports, setAllJobs] = useState([]);
	const [showLoader, setShowLoader] = useState(true);
	const [children, setchildren] = useState([]);
	const [fromDate, setFromDate] = useState(null);
	const [toDate, setToDate] = useState(null);
	const [filteredSoftwares, setFilteredSoftwares] = useState([]);
	const [filteredStatus, setFilteredStatus] = useState([]);
	const [filteredInput, setFilteredInput] = useState('');
	const { fetchJobByParams, fetchJob, totalJobs } = useJob();
	const [currentPage, setCurrentPage] = useState(localStorage.getItem('pageNum') ? Number(localStorage.getItem('pageNum')) : 1);
	const [queryParam, setQueryParam] = useState({});
	const [userIsOwner, setUserIsOwner] = useState(true)
	const [ownerHaveSubscription, setOwnerHaveSubscription] = useState(false)
	const [ownerInfo, setOwnerInfo] = useState()

	let children_status = [];

	useEffect(() => {
		(async () => {
			if (user && user.ownerId && user.ownerId !== null) {
				setUserIsOwner(false)
				const ownerInfoObject = await UserApi.getUserById(user.ownerId)
				if (ownerInfoObject) {
					setOwnerInfo(ownerInfoObject)
					if (ownerInfoObject.customer && ownerInfoObject.customer.subscription) {
						setOwnerHaveSubscription(true)
					}
				}
			}
			refetch()
		})()
	}, [])

	if (user && user.userType === 'technician') {
		children_status = [<Option key="status_1" value="Completed">Completed</Option>, <Option key="status_3" value="Cancelled">Cancelled</Option>, <Option key="status_4" value="Scheduled">Scheduled</Option>, <Option key="status_6" value="Waiting">Waiting</Option>, <Option key="status_7" value="Inprogress">Inprogress</Option>];
	} else if (user && user.userType === 'customer') {
		children_status = [<Option key="status_1" value="Completed">Completed</Option>, <Option key="status_2" value="Pending">Pending</Option>,
		<Option key="status_3" value="Cancelled">Cancelled</Option>, <Option key="status_4" value="Scheduled">Scheduled</Option>, <Option key="status_6" value="Waiting">Waiting</Option>, <Option key="status_7" value="Inprogress">Inprogress</Option>];
	}



	const push_to_job_detail = (e) => {
		const jobid = e.currentTarget.name;
		fetchJob(jobid)
		setjobId(jobid)
		setType("details")
		setcurrentStep(6)
	};

	const filterizationForJobReports = (all_data) => {
		console.log("ALLL DATA::::>>>", all_data)
		let new_data = []
		if (user.userType === 'technician' && filteredStatus.length === 1 && filteredStatus.includes('Declined')) {
			for (let i = 0; i <= all_data.length - 1; i++) {
				all_data[i].action = <Button className="mb-2 btn app-btn  app-btn-super-small" onClick={push_to_job_detail} name={`${all_data[i].id}`} title="Click to see job details.">Details<span></span></Button>
				if (all_data[i].tech_declined_ids && all_data[i].tech_declined_ids.includes(user.technician.id)) {
					all_data[i].status = 'Cancelled by you';
					new_data.push(all_data[i])
				} else if (all_data[i].declinedByCustomer && all_data[i].declinedByCustomer.includes(user.technician.id)) {
					all_data[i].status = 'Cancelled by customer';
					new_data.push(all_data[i])
				}

			}

			setAllJobs(new_data);
		}
		else if (user.userType === 'technician') {

			for (let i = 0; i <= all_data.length - 1; i++) {
				all_data[i].action = <Button className="mb-2 btn app-btn  app-btn-super-small " onClick={push_to_job_detail} name={`${all_data[i].id}`} title="Click to see job details.">Details<span></span></Button>

				if (all_data[i].tech_declined_ids && all_data[i].tech_declined_ids.includes(user.technician.id)) {
					all_data[i].status = 'Cancelled by you';
				} else if (all_data[i].declinedByCustomer && all_data[i].declinedByCustomer.includes(user.technician.id)) {
					all_data[i].status = 'Cancelled by customer';
				}
			}
			setAllJobs(all_data);
		}
		if (user.userType === 'customer') {
			for (let i = 0; i <= all_data.length - 1; i++) {
				all_data[i].action = <Button className="mb-2 btn app-btn  app-btn-super-small" onClick={push_to_job_detail} name={`${all_data[i].id}`} title="Click to see job details.">Details<span></span></Button>
			}
			setAllJobs(all_data);
		}
	}

	const handlePagination = async (page, pageSize) => {
		setShowLoader(true)
		setCurrentPage(page)
		let pagination = { page: page, pageSize: pageSize }
		console.log("queryParam :::: ", queryParam)
		console.log("pagination object ::: ", pagination)
		const res = await fetchJobByParams(queryParam, pagination)
		let all_data = res.jobs.data
		filterizationForJobReports(all_data)
		setShowLoader(false)
		localStorage.setItem('pageNum', page) //Saving current page number from pagination in localStorage.
		console.log("handlePagination is working ")
	}

	const filter_date = (dates) => {
		if (dates != null) {
			if (dates[0] != null && dates[1] != null) {
				setShowLoader(true)
				let start_date = moment(dates[0]).format('YYYY-MM-DD');
				let end_date = moment(dates[1]).format('YYYY-MM-DD');
				let from_dt = `${start_date} 00:00:00`;
				let to_dt = `${end_date} 23:59:59`;
				setTimeout(() => {
					setShowLoader(false)
				}, 5000)
				setFromDate(from_dt);
				setToDate(to_dt);
			}
		} else {
			setFromDate(null);
			setToDate(null);
		}

	};

	const final_filter_function = async () => {
		let filter_dict = {};
		let res = false
		if (user.userType === 'customer') {
			filter_dict.customer = user.customer?.id;
		} else {
			if (user && user.technician) {
				filter_dict.$or = [{ technician: user.technician.id }, { tech_declined_ids: { $in: [user.technician.id] } }, { declinedByCustomer: { $in: [user.technician.id] } }];
			}
		}


		if (filteredStatus.length > 0) {
			if (user.userType === 'technician' && filteredStatus.includes('Declined')) {
				let new_filter_status = [...filteredStatus];
				let indexofdecline = new_filter_status.indexOf('Declined')
				new_filter_status.splice(indexofdecline, 1);
				if (new_filter_status.length > 0) {
					filter_dict = {}
					filter_dict.$or = [
						{
							$and: [{ status: { $in: new_filter_status } }, { technician: user.technician.id }]
						},
						{ tech_declined_ids: { $in: [user.technician.id] } }
						,
						{ declinedByCustomer: { $in: [user.technician.id] } }
					]
				} else {
					filter_dict.$or = [{ tech_declined_ids: { $in: [user.technician.id] } }, { declinedByCustomer: { $in: [user.technician.id] } }];
				}
			} else {
				filter_dict.status = { $in: filteredStatus };
			}
		}


		if (fromDate != null && toDate != null) {
			filter_dict.createdAt = { $gte: fromDate, $lte: toDate };
		}

		if (filteredSoftwares.length > 0) {
			filter_dict.software = { $in: filteredSoftwares };
		}


		if (filteredInput !== '') {
			filter_dict.issueDescription = { $regex: filteredInput };
		}
		console.log("filter_dict :::: ", filter_dict)
		if (Object.keys(filter_dict).length !== 0) {
			setQueryParam(filter_dict)
			res = await fetchJobByParams(filter_dict);
		}

		if (res) {
			setShowLoader(false);
			const all_data = res.jobs.data;

			if (user.userType === 'technician') {

				for (let i = 0; i <= all_data.length - 1; i++) {
					all_data[i].action = <Button className="mb-2 btn app-btn  app-btn-super-small" onClick={push_to_job_detail} name={`${all_data[i].id}`} title="Click to see job details.">Details<span></span></Button>

					if (all_data[i].tech_declined_ids && all_data[i].tech_declined_ids.includes(user.technician.id)) {
						all_data[i].status = 'Cancelled by you';
					} else if (all_data[i].declinedByCustomer && all_data[i].declinedByCustomer.includes(user.technician.id)) {
						all_data[i].status = 'Cancelled by customer';
					}
				}

				const filteredResponse = all_data.filter((item) => !(item?.is_transferred_notification_sent && item?.tech_declined_ids.includes(user?.technician?.id)));
				console.log('filteredResponse', filteredResponse)
				setAllJobs(filteredResponse);
			}

			if (user.userType === 'customer') {
				for (let i = 0; i <= all_data.length - 1; i++) {
					all_data[i].action = <Button className="mb-2 btn app-btn  app-btn-super-small" onClick={push_to_job_detail} name={`${all_data[i].id}`} title="Click to see job details.">Details<span></span></Button>
				}
				setAllJobs(all_data);
			}
		}
		else {
			setShowLoader(false);
		}

		if (children.length === 0) {
			const soft_res = await SoftwareApi.getSoftwareList();
			const softwares = soft_res.data;
			const child_array = [];
			for (let i = 0; i < softwares.length; i++) {
				child_array.push(<Option key={i} value={softwares[i].id}>{softwares[i].name}</Option>);
			}
			setchildren(child_array);
		}

	}

	useEffect(() => {
		final_filter_function();
	}, [toDate, filteredSoftwares, filteredStatus, filteredInput]);

	const handleChangeSoftware = (value) => {
		setShowLoader(true);
		setFilteredSoftwares(value);
	};
	const handleChangeStatus = (value) => {
		setShowLoader(true);
		setFilteredStatus(value);
	};

	const inputChange = (e) => {
		setShowLoader(true);
		setFilteredInput(e.target.value);
	};

	const hms_convert = (t) => {
		if (t) {
			const d = Number(t);
			const h = Math.floor(d / 3600);
			const m = Math.floor(d % 3600 / 60);
			const s = Math.floor(d % 3600 % 60);
			const hFormat = h <= 9 ? `0${h}` : h;
			const mFormat = m <= 9 ? `0${m}` : m;
			const sFormat = s <= 9 ? `0${s}` : s;
			const hDisplay = h > 0 ? `${hFormat}:` : '00:';
			const mDisplay = m > 0 ? `${mFormat}:` : '00:';
			const sDisplay = s > 0 ? sFormat : '00';
			return hDisplay + mDisplay + sDisplay;
		}
		return '00:00:00';
	};

	const columns = [{
		title: 'Date',
		dataIndex: 'createdAt',
		render: text => (
			<span>
				{' '}
				{moment(text).format('MM-DD-YYYY')}
			</span>
		),
	},
	{
		title: 'Software',
		render: (text, record) => (
			(record.software ? record.software.name : '')
		),
	},

	{
		title: 'Issue Desc',
		dataIndex: 'issueDescription',
		width: '30%',
		render: text => (
			<p padding="10px 5px" title={text} className="issue-description">
				{(text.length > 100 ? `${text.substring(0, 50)}...` : text)}
			</p>
		),
	},
	{
		title: 'Status',
		dataIndex: 'status',
		render: text => (
			<span padding="10px 5px" title={text}>
				{(text === "Declined" ? 'Cancelled' : (text === 'long-job' ? 'Long Job' : (text === 'Inprogress' ? 'InProgress' : text)))}
			</span>
		)

	},
	{
		title: 'Tech',
		render: (text, record) => (
			<>
				{record && record.technician
					? `${record.technician.user?.firstName} ${record.technician.user?.lastName}` : 'NA'}
			</>
		),

	},
	{
		title: 'Action',
		dataIndex: 'action',
	},
	];

	return (
		<React.Fragment key="JobReports">
			<Col xs="12" className="">
				<Loader height="100%" className={(showLoader ? 'loader-outer' : 'd-none')} />
				<Col xs="12" className="pt-5 pb-3">
					<h1 className="large-heading">Job Reports</h1>
				</Col>
				<Col xs="12" className="">
					<Col xs="12" className="py-3 div-highlighter">
						<Row>
							<Col md="4" className="pl-5">
								<span className="d-block label-total-name">Total Number of Jobs</span>
								<span className="d-block label-total-value" title="">{(totalJobs ? totalJobs : 0)}</span>
							</Col>
							<Col md="4" className="pl-5 div-highlighter-border">
								<span className="d-block label-total-name">
									Total Amount{" "}
									{(user && user.userType === 'technician' ? 'Earned' : 'Billed')}
								</span>
								<span className="d-block label-total-value">
									{(userIsOwner || !ownerHaveSubscription)
										?
										user?.technician?.tag !== 'employed'
											?
											(totalEarnings != null ? '$' + totalEarnings : '$' + 0)
											:
											"NA"
										:
										"NA"
									}
								</span>
							</Col>
							<Col md="4" className="pl-5">
								<span className="d-block label-total-name">Total Amount of Time</span>
								<span className="d-block label-total-value">
									{hms_convert(totalTimeSeconds)}
								</span>
							</Col>
						</Row>
					</Col>
				</Col>

				<Col md="12" className="filters-outer py-4 mt-2 job-report-filters">
					<Row>
						<Col xs="12" lg="3">
							<label className="label-name">Transactions date</label>
							<RangePicker onCalendarChange={filter_date} className="form-control bottom-border-only" />
						</Col>
						<Col xs="12" lg="3">
							<label className="label-name">Status</label>
							<Select
								mode="multiple"
								showArrow="true"
								style={{ width: '100%' }}
								placeholder="Select Status"
								onChange={handleChangeStatus}
								className="form-control bottom-border-only filter-element job-report-selection"
							>
								{children_status}
							</Select>
						</Col>
						<Col xs="12" lg="3">
							<label className="label-name">Softwares</label>
							<Select
								mode="multiple"
								showArrow="true"
								style={{ width: '100%' }}
								placeholder="Select Software"
								onChange={handleChangeSoftware}
								className="form-control bottom-border-only filter-element job-report-selection"
							>
								{children}
							</Select>

						</Col>
						<Col xs="12" lg="3" className="float-right">
							<label className="label-name">Search</label>
							<Input placeholder="Issue description" onPressEnter={inputChange} className="form-control bottom-border-only filter-element" />
						</Col>
					</Row>
				</Col>

				<Col md="12" className="py-4 mt-1 table-responsive">
					<Col xs="12" className="ant-table-structure-outer table-responsive p-0">
						<div className="highlight-background" />
						<Table dataSource={allJobsReports} pagination={false} columns={columns} rowKey="id" className="jobreports-table" />
						{/* Added a new attribute in pagination i.e. defaultCurrent */}
						{totalJobs !== 0 && <Pagination style={{ "float": "right", "marginRight": "40px" }} current={currentPage} defaultCurrent={currentPage} onChange={handlePagination} total={totalJobs} />}

					</Col>
				</Col>
			</Col>
		</React.Fragment>

	);
};

export default JobReports;
