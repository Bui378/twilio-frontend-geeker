import React from 'react';
import { Route, Switch } from 'react-router-dom';
import MeetingFeedback from 'pages/Feedback';
import JobDetail from 'pages/JobDetail';
import CustomerProfile from 'pages/Customer/Profile';
import EditTech from 'pages/Technician/EditTech';
import PublicRoute from './routes/PublicRoute';
import MainPage from './pages/Dashboard';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import PrivateRoute from './routes/PrivateRoute';
import EmailVerification from './pages/Auth/VerifyEmail';
import { CUSTOMER, TECHNICIAN } from './constants';
import CustomerProfileSetup from './pages/Customer/ProfileSetup';
import AcceptJob from './pages/Customer/AcceptJob';
import TechnicianRegister from './pages/Technician/Register';
import TechnicianProfile from './pages/Technician/Profile';
import JobAlert from './pages/Technician/JobAlert';
import CustomerConfirmation from './pages/Technician/CustomerConfirmation';
import NotFound from './pages/NotFound';
import EarningsTech from './pages/Dashboard/steps/earnings';
import BillingReportsTech from './pages/Dashboard/steps/billingReports';
import CardDetails from 'pages/Customer/Billing/CardDetails';
import JobReports from './pages/Dashboard/steps/jobReports';
import HelpCenter from './pages/Support/HelpCenter';
import Subscription from './pages/Customer/Subscription';
import TechUniqeLink from './pages/Technician/TechnicianUniqueLink'
import BusinessPlan from 'pages/Customer/BusinessPlan';


const Routes = (props) => (
  <Switch>
    <PublicRoute
      exact
      path="/business-plan"
      component={BusinessPlan}
      props={props}
    />
    <PrivateRoute
      exact
      path="/buy-business-plan"
      component={BusinessPlan}
      props={props}
    />

    <PublicRoute
      exact
      path="/"
      component={Login}
      props={props}
    />

    <PublicRoute
      exact
      path="/login"
      component={Login}
      props={props}
    />

    <PublicRoute
      exact
      path="/forgot-password"
      component={ForgotPassword}
      props={props}
    />
    <PublicRoute
      exact
      path="/technician-details"
      component={TechUniqeLink}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician-details-setup"
      component={TechUniqeLink}
      props={props}
    />
    <PublicRoute
      exact
      path="/reset-password"
      component={ResetPassword}
      props={props}
    />
    <PrivateRoute
      exact
      path="/verify-email"
      component={EmailVerification}
      props={props}
    />

    <Route
      exact
      path="/customer/start-profile-setup"
      permission={CUSTOMER}
      component={CustomerProfileSetup}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/profile-setup"
      permission={CUSTOMER}
      component={CustomerProfileSetup}
      props={props}
    />

    <PrivateRoute
      exact
      path="/dashboard"
      component={MainPage}
      props={props}
    />

    <Route
      exact
      path="/customer/card-details"
      component={CardDetails}
      props={props}
    />

    <PrivateRoute
      exact
      path="/job-reports"
      component={JobReports}
      props={props}
    />

    <PrivateRoute
      exact
      path="/tech/earnings"
      component={EarningsTech}
      props={props}
    />
    <PrivateRoute
      exact
      path="/tech/billing-reports"
      component={BillingReportsTech}
      props={props}
    />

    <PublicRoute
      exact
      path="/customer/register/:jobId"
      component={BusinessPlan}
      // component={CustomerRegister}
      props={props}
    />

    <PublicRoute
      exact
      path="/customer/register/:jobId/:schedule"
      component={BusinessPlan}
      // component={CustomerRegister}
      props={props}
    />
    <PublicRoute
      exact
      path="/customer/register"
      component={BusinessPlan}
      // component={CustomerRegister}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/registered"
      component={BusinessPlan}
      // component={CustomerRegister}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/accept-job/:jobId"
      permission={CUSTOMER}
      component={AcceptJob}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/card-detail-page"
      permission={CUSTOMER}
      component={MainPage}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician/profile-edit"
      permission={TECHNICIAN}
      component={EditTech}
      props={props}
    />
    <PublicRoute
      exact
      path="/technician/register"
      component={TechnicianRegister}
      props={props}
    />

    <PrivateRoute
      exact
      path="/technician/register_steps"
      permission={TECHNICIAN}
      component={TechnicianRegister}
      props={props}
    />

    <PrivateRoute
      exact
      path="/technician/profile"
      permission={TECHNICIAN}
      component={TechnicianProfile}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/profile"
      permission={CUSTOMER}
      component={CustomerProfile}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician/new-job/:jobId"
      permission={TECHNICIAN}
      component={JobAlert}
      props={props}
    />

    <PrivateRoute
      exact
      path="/technician/customer-confirmed"
      permission={TECHNICIAN}
      component={CustomerConfirmation}
      props={props}
    />
    <PrivateRoute
      exact
      path="/meeting-feedback/:jobId"
      component={MeetingFeedback}
      props={props}
    />
    <PrivateRoute
      exact
      path="/job-details"
      component={JobDetail}
      props={props}
    />

    <Route
      exact
      path="/help-center"
      component={HelpCenter}
      props={props}
    />

    <PrivateRoute
      exact
      path="/subscription"
      component={Subscription}
      props={props}
    />

    <Route component={NotFound} />
  </Switch>
);

export default Routes;
