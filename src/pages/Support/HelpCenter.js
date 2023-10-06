import React from 'react';
import {Col} from 'react-bootstrap';

// import {useAuth} from '../../context/authContext';

// import LeftSidebar from '../../components/Sidebar/LeftSidebar';
// import RightSidebar from '../../components/Sidebar/RightSidebar';
import Loader from '../../components/Loader';

const HelpCenter = ()=>{
	
	// const {user} = useAuth();
	// const [showLoader, setShowLoader] = useState(false);
    const showLoader = false;

	return (
		
        <>
            <Col md="12" className="">
        		<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />

            	<Col xs="12" className="pt-5 pb-3">
                    <h1 className="large-heading">Help Center</h1>
                </Col>

                <Col xs="12" className="">
                	<Col xs="12" className="py-3 text-center">
                		<h4>Please type your query in the chat box below.</h4>
                    </Col>
                </Col>
            </Col>
        </>
	)
};
export default HelpCenter;