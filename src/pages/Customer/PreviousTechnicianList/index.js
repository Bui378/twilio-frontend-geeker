import React, { useEffect, useState } from "react";
import { Button, Col, Row } from 'react-bootstrap';
import * as JobApi from '../../../api/job.api';
import { Table, Pagination } from "antd";
import mixpanel from 'mixpanel-browser';
import Loader from '../../../components/Loader';
const PreviousTechList = ({ user }) => {
    const [previousTechList, setPreviousTechList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
      This useEffect is responsible to fetch all the relevant techs that techs completed job with this customer
      @param:user
      @returns:returns a list of relevant techs(whether online/offline)
      @author:Mritunjay
    **/
    useEffect(() => {
        try {
            (async () => {
                if (user && user?.customer) {
                    let allCustomerJobsRes = await JobApi.findAllJobsByParams({ customer: user?.customer?.id });
                    let temp = [];
                    let techArray = [];
                    allCustomerJobsRes.jobs.data.map((item) => {
                        if (item?.technician?.id !== undefined && item?.technician?.id !== "") {
                            let techId = item?.technician?.id;

                            let value = item?.technician?.user?.id;
                            let label = `${item?.technician?.user?.firstName} ${item?.technician?.user?.lastName}`;
                            let rating = item?.technician?.rating;
                            if (!techArray.includes(value)) {
                                techArray.push(value)
                                temp.push({ techId, value, label, rating })
                            };
                        };
                    })

                    if (temp.length > 0) {
                        const allTechId = temp.map((item) => item.techId);
                        const techCountMap = new Map();
                        allCustomerJobsRes.jobs.data.forEach((item) => {
                            allTechId.forEach((techId) => {
                                if (item?.technician?.id.includes(techId)) {
                                    if (techCountMap.has(techId)) {
                                        techCountMap.set(techId, techCountMap.get(techId) + 1);
                                    } else {
                                        techCountMap.set(techId, 1);
                                    };
                                };
                            });
                        });
                        temp.forEach((technicianId) => {
                            const count = techCountMap.get(technicianId.techId);
                            const technician = temp.find((item, id) => item.techId === technicianId.techId);
                            if (technician) {
                                technician.count = count;
                            };
                        });
                        setPreviousTechList([...temp]);
                    };
                    setIsLoading(false)
                };
            })()
        } catch (error) {
            console.log("Error occurs during fetching all previous technicians ", error);
        };
    }, [user]);

    const push_to_profile_detail = (data) => {
        if (user && user.email) {
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Click on profile view button.');
        };
        const newPageUrl = `/technician-details-setup?technicianId=${data}&medium=technician-profile`
        window.open(newPageUrl, "_blank")
    };


    const columns = [
        {
            title: 'Name',
            dataIndex: 'label',
            key: 'label',
            render: text => (
                (text ? text : '')
            ),
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            width: '30%',
            key: 'rating',
            render: text => (
                (text ? text : '')
            ),
        },
        {
            title: 'Total Jobs',
            dataIndex: 'count',
            key: 'count'

        },
        {
            title: 'Action',
            dataIndex: 'value',
            key: 'value',
            render: value => {
                if (value) {
                    return (
                        <>
                            <Button className="mb-2 btn app-btn  app-btn-super-small" onClick={() => { push_to_profile_detail(value) }} title="Technician profile.">View Profile<span></span></Button>
                        </>
                    )
                }
            },

        },
    ];
    return (
        <React.Fragment>
            <Col xs="12">
                <Loader height="100%" className={(isLoading ? 'loader-outer' : 'd-none')} />
                <Col className="py-4 mt-1 table-responsive">
                    <Col className="ant-table-structure-outer previousTechList table-responsive p-0">
                        <div className="highlight-background" />
                        <Table
                            dataSource={previousTechList}
                            pagination={true}
                            columns={columns}
                            rowKey={(record) => record.techId}
                            className="previousTechnician-table"
                        />
                    </Col>
                </Col>
            </Col>
        </React.Fragment>
    )
};
export default PreviousTechList