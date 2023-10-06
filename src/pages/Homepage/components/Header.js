import React  from 'react';

const Header = ()=>{
	return (
		<React.Fragment key="header">
		<header>
            <div className="nav-menu">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="brand-navbar">
                                    <a className="navbar-brand" href="index.html">
                                        <img src="images/logo.png" alt="Logo" data-aos="zoom-in" className="aos-init" />
                                    </a>
                                </div>
                                <div className="d-flex align-items-center header-right">
                                   <a href="register.html" className="btn aos-init" data-aos="fade-left"  data-toggle="modal" data-target="#register">
                                        Join Now
                                   </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
		</React.Fragment>

		)

};


export default Header;