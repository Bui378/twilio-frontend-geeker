import React,{useEffect,useState} from "react";
import { Row, Col, Button, Modal, Alert } from "react-bootstrap";
import moment from "moment";
import { Form, Select, Spin } from "antd";
import FormItem from "../components/FormItem";
import { useFetchInvites, useInviteUserMutation,fetchInvites } from "../api/invite.api";
import Input from "../components/AuthLayout/Input";
import Box from "../components/common/Box";
import { useUser } from "../../src/context/useContext";
import { openNotificationWithIcon, roleStatus } from "../utils/index";
import * as userService from '../api/users.api'
import { useAuth } from '../context/authContext';
const { Option } = Select;

const Invite = () => {
  const { resetPasswordHandler } = useAuth();
  const [showAction,setShowAction] = useState(false)
  const [userRole,setUserRole] = useState('user')
  const { user } = useUser();
  const [showAdminBtn,setShowAdminBtn] = useState(false)
  const [showInviteModal, setShow] = React.useState(false);
  let { data: inviteList } = useFetchInvites();
  const [mainData,setMainData] = useState(inviteList)
  const [loader, setLoader] = useState(false);
  const currentInvite = inviteList?.data?.find(
    (inv) => inv.email === user.email
  );
  let [invites,setInvites] = useState([])
  let {
    mutate: inviteNewUser,
    isLoading,
    isSuccess,
    data,
  } = useInviteUserMutation();
  const [inviteData, setInviteData] = React.useState({
    email: "",
    role: "user",
    businessName : ''
  });
  const handleClose = () => {
    setShow(false);
    data = {}
  };
  useEffect(()=>{
    let invites = mainData?.data?.filter((inv) => inv.email !== user.email);
      if (currentInvite) {
        invites.unshift(currentInvite);
      }
      setInvites(invites)
  },[mainData])

  useEffect(()=>{
    if(user.roles.includes("admin") && inviteList){
      let inv_arr = inviteList.data.filter((ele)=>ele.parentId === user.id && ele.status === "completed")
      if(inv_arr.length > 0){
        setShowAdminBtn(true)
      }
    }
    setMainData(inviteList)
  },[inviteList])

  React.useEffect(() => {
    if (data?.success) {
      handleClose();
    }
  }, [data, isSuccess]);

  useEffect(()=>{
    setUserRole(user.roles[0])
    if(user.roles.includes("owner")){
      setShowAction(true)
    }

  },[user])

  const onChange = (key, value) => {
    setInviteData({ ...inviteData, [key]: value });
  };
  const handleBlockEvents = async(blockStatus,id)=>{
    const data = {userId:id,blocked:blockStatus}
    await userService.updateUser(data)
    let inviteData = await fetchInvites()
    inviteList = inviteData
    setMainData(inviteData)
  }
  const onSubmit = (values) => {
    const businessName = user?.businessName ? user?.businessName : ''
    console.log("my console for checking data for business name",{...inviteData, businessName})
    inviteNewUser({...inviteData, businessName});
  };

  // This function will resend email to sub child of owner
  const reSendInvite = async (email, role) => {
    try {
      const businessName = user?.businessName ? user?.businessName : ''
      setInviteData({ email: email,
      role: role,
      businessName :businessName})
      setLoader(true);
      console.log("my console for reSendInvite", { businessName, email, role })
      await inviteNewUser({ businessName, email, role });
      openNotificationWithIcon("success", "Successfully Invited !!");
      setTimeout(()=>{
        setLoader(false)
      },2000)
    } catch (error) {
      console.log("error  while resending email", error);
      setLoader(false)
    }
  };

  const handleResetPassword = (inviteEmail) => {
    console.log("My console for inviteEmail to reset password", inviteEmail)
    resetPasswordHandler({email:inviteEmail})
    openNotificationWithIcon('success', 'Success', 'Email with link to reset password sent successfully.');
  }

  return (
    <>
      <Row className="col-md-12">
        <Col xs="12" className="">
          {data?.success && (
            <Alert variant="success" className="w-100">
              {data.message}
            </Alert>
          )}
          <Col
            xs="12"
            className="pt-5 pb-3 d-flex justify-content-between align-items-center"
          >

            <h1 className="large-heading">Users List</h1>

            <Button
              onClick={() => setShow(true)}
              className="btn app-btn btn btn-primary"
            >
              Invite
            </Button>
          </Col>

          <Col md="12" className="py-4 mt-1 table-responsive">
            <Col xs="12" className="table-structure-outer table-responsive">
              <table className="w-100">
                <thead>
                  <tr>
                    <th className="label-name">Email</th>
                    <th className="label-name">Status</th>

                    <th className="label-name">Invited Date</th>
                    <th className="label-name">Role</th>
                    <th className="label-name">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-primary">
                    <td className="cell-value">
                      {user.roles.indexOf(roleStatus.OWNER) > -1
                        ? user.email
                        : mainData?.parent?.email}
                    </td>
                    <td className="cell-value">Completed</td>
                    <td className="cell-value">N/A</td>
                    <td className="cell-value">owner</td>
                    <td className="cell-value"></td>
                  </tr>
                  {invites?.length > 0 ? (
                    invites.map((invite, i) => (
                      <tr
                        className={
                          user.email === invite.email ? "table-active" : ""
                        }
                        key={i}
                      >
                        <td className="cell-value">
                          {user.email === invite.email
                            ? `${invite.email} (You)`
                            : invite.email}
                        </td>

                        <td className="cell-value" style={{textTransform : 'capitalize'}}>{invite.status}</td>
                        <td className="cell-value">
                          {moment(invite.createdAt).format(
                            "MM/DD/yyyy, H:mm a"
                          )}
                        </td>

                        <td className="cell-value">{invite.role}</td>
                        {(showAction || (userRole == 'admin' || userRole == 'owner')) && (user.email != invite.email) && invite.status=="completed" ? 
                        <>
                          <td  className="cell-value">
                          {invite.userId && invite.userId.blocked && invite.userId.blocked 
                            ?<Button onClick={()=>{handleBlockEvents(false,invite.userId.id)}} className="btn btn-success app-btn-small mr-2">Unblock</Button> 
                            :<Button onClick={()=>{handleBlockEvents(true,invite.userId.id)}} className="btn btn-danger app-btn-small mr-2">Block</Button>
                          }
                          <Button onClick={()=>handleResetPassword(invite.email)} className="btn btn-warning app-btn-small">Reset Password</Button>
                          </td>
                        </>
                          :
                          <>
                            {
                              showAdminBtn ? 
                              <td className="cell-value"></td>
                              :(invite.status == "pending"  &&   <td  className="cell-value">
                                  <Button onClick={() => reSendInvite(invite.email, invite.role)} disabled={loader && invite.email ==inviteData.email}
						                   	 className={`btn btn-success app-btn-small ${loader && invite.email ==inviteData.email ? "resend-email-style-blocked" :"resend-email-style"}`}> {loader  && invite.email ==inviteData.email ? <Spin  /> : "Resend Invite"}</Button> 
                              </td>)
                            }
                          </>
                        }
                      </tr>
                    ))
                  ) : (
                  <>
                    {user.roles.indexOf(roleStatus.OWNER) > -1
                        ?  <></>
                      :
                      <tr>
                        <td colspan="3" align="middle">
    
                            <Box>
                              <div className="divarea">
                                <p>No data available.</p>
                              </div>
                            </Box>
    
                          </td>
                        </tr>
                    }
                  </>)}
                  
                </tbody>
              </table>
            </Col>
          </Col>
        </Col>
      </Row>
      <Modal show={showInviteModal} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Invite New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data && !data.success && (
            <Alert variant="danger" className="w-100">
              {data.message}
            </Alert>
          )}
          <Form className="items-center" onFinish={onSubmit}>
            <FormItem
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Please input your E-mail.",
                },
              ]}
            >
              <Input
                name="email"
                size="large"
                placeholder="Email"
                className="email-login-class px-3"
                onChange={(e) => onChange("email", e.target.value)}
              />
            </FormItem>
            <Select
              size="large"
              style={{ width: "100%", borderRadius: 20 }}
              placeholder="Role type"
              defaultValue={inviteData.role}
              onChange={(value) => onChange("role", value)}
            >
              <Option value="user">User</Option>
              {!user.roles ||
                (user?.roles.indexOf(roleStatus.ADMIN) === -1 && (
                  <Option value="admin">Admin</Option>
                ))}
            </Select>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={false}
              className="btn app-btn mt-3"
              disabled={!!isLoading}
            >
              <span />
              {isLoading ? <Spin /> : "Send Invite"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Invite;
