import React, { useEffect} from 'react';
import { LANDING_PAGE_URL } from '../../constants';
const LandingPage = ()=>{

	useEffect(()=>{
		window.location.href =  LANDING_PAGE_URL;
	},[])

	return (

		<>
			{/*<iframe src={"https://www.geeker.co/"} style={{height:"100%", width:"100%"}} title="Geeker"></iframe>*/}
			{/*<iframe src={"http://137.184.20.103/?p="+PLATFORM} style={{height:"100%", width:"100%"}} width="900" height="700" allow="fullscreen" title="Geeker"></iframe>*/}
			
		</>
	)
}

export default LandingPage;
