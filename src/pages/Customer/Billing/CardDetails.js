import React,{useState, useEffect} from 'react';
import {Container,Row,Col} from 'react-bootstrap';
import { useUser } from '../../../context/useContext';
import { useJob } from '../../../context/jobContext';
import LeftSidebar from '../../../components/Sidebar/LeftSidebar';
import RightSidebar from '../../../components/Sidebar/RightSidebar';
import CustomerTopBar from '../../../components/TopBar/CustomerTopBar';
import Loader from '../../../components/Loader';


const CardDetails = (url) => {
	const { user } = useUser();
	const { techJobs,settechJobs } = useJob();
	const [showLoader] = useState(false);

	useEffect(() => {
	    const script = document.createElement('script');

	    script.src = 'https://js.stripe.com/v3/';
	    script.async = true;

	    document.body.appendChild(script);

	    return () => {
	      document.body.removeChild(script);
	    }
  	}, [url]);

	return (
		<Container fluid>
            <Row>
				<Col md="2" className="sidebar-left-outer">
                    <LeftSidebar user={user} activeMenu="home" />
                </Col>

                <Col md="7">
                	<Row>
                        <Loader height="100%" className={(showLoader ? 'loader-outer' : 'd-none')} />
                        <Col xs="12">
                            <CustomerTopBar/>
                        </Col>
                        <div className="pt-5 pb-3 col-12">
                        	<h1 className="large-heading">Add Payment Method</h1>
                        </div>
                        <Col md="12" className="py-4 mt-1">
                            <Col xs="12" className="p-0">
                                
							      	<input id="cardholder-name" type="text"/>
									
									<div id="card-element"></div>
									<div id="card-result"></div>
									<button id="card-button">Save Card</button>
							    
                            </Col>
                        </Col>
                    </Row>
                </Col>

                <Col md="3" className="sidebar-right-outer pt-4 px-5">
                    <RightSidebar user={user} techJobs ={techJobs} settechJobs={settechJobs}/>
                </Col>
			</Row>
		</Container>
	)
}
export default CardDetails;