import React from 'react';

import maintenance from '../src/assets/images/maintenance.png';
import logo from '../src/assets/images/newLogoSmaller.png';
export default function MaintenancePage() {
  return (
    <div className="gradientBackground maintenance-page-parent-div">
      <div className="maintenance-page-header-div">
        <img src={logo} className="business-plan-header-img" />
    </div>
      <div className="maintenance-page-common-div d-flex flex-column ">
        <div className="maintenance-page-dashboard-text p-4">
          <div className='maintenace-page-dashboard-text1'>
            <a>Dashboard</a>
          </div>
        </div>
        <div className='maintenance-page-content d-flex flex-column align-items-center mx-auto mt-5'>
          <span className='maintenance-page-content-text text-center fs-5 fs-md-4'>
            Surprise! Our Geeks are upgrading your experience
          </span>
          <span className="maintenance-page-content-text text-center fs-6 fs-md-5">
            They'll be back soon!
          </span>
        </div>

        <div className='maintenance-page-inside-content-div d-flex align-items-center mx-auto mt-1'>
          <span className='maintenance-page-inside-content-div-text text-center fs-6 fs-md-5'>
            Geeker is temporarily unavailable while we create upgrades to improve your experience—but don't worry! Our Geeks perform at world-class speeds and will be ready to help soon.
          </span>
        </div>

        <div className='maintenance-page-image d-flex align-items-center mx-auto mt-2'>
          <img src={maintenance} className="img-fluid" alt="" />
        </div>
        <div className='maintenance-page-image-footer-div d-flex align-items-center mx-auto'>
          <span className='maintenance-page-image-footer-div-text text-center'>Please check back soon!</span>
        </div>
      </div>
      <div className='maintenance-page-footer'>

      </div>
    </div>
  );
}