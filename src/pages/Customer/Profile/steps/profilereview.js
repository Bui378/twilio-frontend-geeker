import React, { memo, useEffect, useState } from 'react';
import { Row, Input, Select, Modal, Checkbox } from 'antd';
import styled from 'styled-components';
import {
  ItemContainer,
  ItemTitle,
} from './style';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import H4 from '../../../../components/common/H4';
import * as CustomerService from '../../../../api/customers.api';
import editIcon from '../../../../assets/images/edit.png';
import PhoneInput from 'react-phone-input-2';
import { Button } from 'react-bootstrap';
import { languages } from '../../../../constants';
import { useAuth } from 'context/authContext';
import { openNotificationWithIcon } from '../../../../utils';
import * as JobApi from 'api/job.api';
import { deleteUserByParam } from 'api/users.api';

function ProfileReview({ user, onNext }) {
  const [showInput, setShowInput] = useState(false)
  const { email, customer: { id: customerId, phoneNumber } } = user;
  const [editedPhoneNumber, setEditedPhoneNumber] = useState(phoneNumber)
  const [showNameInput, setShowNameInput] = useState(false)
  const { updateUserInfo, updateUserBusinessDetailsInfo } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const { Option } = Select;
  const [language, setLanguage] = useState(user.customer.language)
  const [additionalLanguage, setAdditionalLanguage] = useState(user.customer.additionalLanguage)
  const [showlangInput, setShowlangInput] = useState(false)
  const [showAddlangInput, setShowAddlangInput] = useState(false)
  const [dialCode, setDialCode] = useState("")
  const [showBusinessNameInput, setShowBusinessNameInput] = useState(false)
  const [showChangeToBusinessAccount, setShowChangeToBusinessAccount] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [businessNameWhileConvertion, setBusinessNameWhileConvertion] = useState('')
  const [isOwnerAccount, setIsOwnerAccount] = useState(false)
  const { logout } = useAuth();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [disableDeleteButton, setDisableDeleteButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkBoxValue, setCheckBoxValue] = useState(false)
  const [isBusinessAccount, setIsBusinessAccount] = useState(user.isBusinessTypeAccount)
  const { refetch } = useAuth();

  const handleCheckboxChange = (e) => {
    setCheckBoxValue(e.target.checked)
  };

  useEffect(() => {

    setEditedPhoneNumber(user.customer.phoneNumber)
    // This will decide to show Business Name Edit Field Or not
    const userRolesArray = user?.roles
    const isOwner = userRolesArray.includes("owner");
    if (userRolesArray && isOwner) {
      setIsOwnerAccount(true)
      setIsBusinessAccount(user.isBusinessTypeAccount)
    }
    const userDetail = user?.businessName ? user?.businessName : 'NA'
    setBusinessName(userDetail)
  }, [user])

  useEffect(() => {
    (async () => {
      let pendingJobs;
      try {
        if (user && user.customer) {
          setLoading(true);
          pendingJobs = await JobApi.latestJobForCustomer({ "customer": user.customer.id })

          console.log("checking pending jobs", pendingJobs[0]?.status, pendingJobs)
          if (pendingJobs.length > 0) {
            const hasInProgressJob = pendingJobs.some(job => {
              return (
                job?.status === "Inprogress" ||
                job?.status === "long-job" ||
                job?.status === "Accepted" ||
                job?.status === "Pending" ||
                job?.status === "Scheduled" ||
                job?.status === "Waiting" ||
                job?.schedule_accepted
              );
            });
            setDisableDeleteButton(hasInProgressJob);
          } else {
            //Check if there is a change in the job status before updating the state
            setDisableDeleteButton(false)
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user])

  const HandlePhoneNumber = (e, data) => {
    setEditedPhoneNumber(`+${e}`);
    setDialCode(data.dialCode)
  }

  const inputHandler = () => {
    setEditedPhoneNumber(user.customer.phoneNumber)
    onNext()
    setShowInput(!showInput)
  }
  const handleNumberChange = () => {
    if (editedPhoneNumber === "" || editedPhoneNumber.length === (dialCode.length + 1)) {
      return openNotificationWithIcon('error', 'Error', "Phone Number is required")
    } else if (editedPhoneNumber.length < (11 + dialCode.length)) {
      return openNotificationWithIcon('error', 'Error', "Phone Number is invalid")
    }
    CustomerService.updateCustomer(customerId, { "phoneNumber": editedPhoneNumber })
    openNotificationWithIcon("success", "Success", "Changes saved successfully.")
    setShowInput(false)
  }
  const handleLangChange = () => {
    CustomerService.updateCustomer(customerId, { "language": language })
    openNotificationWithIcon("success", "Success", "Changes saved successfully.")
    setShowlangInput(false)
  }


  const handleAddLangChange = () => {
    CustomerService.updateCustomer(customerId, { "additionalLanguage": additionalLanguage })
    openNotificationWithIcon("success", "Success", "Changes saved successfully.")
    setShowAddlangInput(false)
  }

  const handleNameChange = () => {
    let valid = /^[a-zA-Z ]*$/;

    if (!valid.test(String(firstName))) {
      return openNotificationWithIcon("error", "Error", "No numbers & special characters are allowed.");
    }
    if (!valid.test(String(lastName))) {
      return openNotificationWithIcon("error", "Error", "No numbers & special characters are allowed.");
    }
    const trimmedValue1 = firstName.trim()
    if (trimmedValue1.split(" ").length > 1) {
      return openNotificationWithIcon("error", "Error", "No empty space allowed in First Name.")
    }
    const trimmedValue2 = lastName.trim()
    if (trimmedValue2.split(" ").length > 1) {
      return openNotificationWithIcon("error", "Error", "No empty space allowed in Last Name.")
    }
    if (trimmedValue1 !== '' && trimmedValue2 !== '') {
      updateUserInfo({
        "userId": user.id,
        "firstName": firstName.replace(/\s/g, ''),
        "lastName": lastName.replace(/\s/g, '')
      });
      openNotificationWithIcon("success", "Success", "Changes saved successfully.");
      setShowNameInput(false);
    } else {
      openNotificationWithIcon("error", "Error", "One of the names seems to be empty.");
    }
  };


  const handleBusinessNameChangeWhileConvertion = async () => {
    const businesNameTrimmed = businessNameWhileConvertion.trim()
    if (businesNameTrimmed !== "") {
      const updatedUser = await updateUserInfo({
        userId: user.id,
        businessName: businesNameTrimmed,
        isBusinessTypeAccount: true
      });
      openNotificationWithIcon("success", "Success", "Changes saved successfully.");
      if (updatedUser && updatedUser.business_details === '') {
        await updateUserBusinessDetailsInfo({
          userId: user.id,
          businessName: businesNameTrimmed,
          isBusinessTypeAccount: true
        })
      }
      if (updatedUser) {
        setIsBusinessAccount(user.isBusinessTypeAccount)
      }
      refetch()
    } else {
      openNotificationWithIcon("error", "Error", "Please enter your business name.");
    }
  }
  const handleBusinessNameChange = () => {
    const trimmedValue = businessName.trim()

    if (trimmedValue !== '') {
      updateUserInfo({
        "userId": user.id,
        "businessName": trimmedValue,
        "isBusinessTypeAccount": true
      });
      openNotificationWithIcon("success", "Success", "Changes saved successfully.");
      setShowBusinessNameInput(false);
    } else {
      openNotificationWithIcon("error", "Error", "Please enter your business name.");
    }

  };



  const editNameInputHandler = () => {
    if (showNameInput) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      onNext()
      setShowNameInput(false)
    } else {
      setShowNameInput(true)
    }
  }

  const editBusinessNameHandler = () => {
    if (showBusinessNameInput) {
      const businessName = user?.businessName ? user?.businessName : 'NA'
      setBusinessName(businessName)
      onNext()
      setShowBusinessNameInput(false);
    } else {
      setShowBusinessNameInput(true);
    }
  }

  const editLangInputHandler = () => {
    if (showlangInput) {
      setLanguage(user.customer.language)
      onNext()
      setShowlangInput(false)
    } else {
      setShowlangInput(true)
    }
  }

  const editAddLangInputHandler = () => {
    if (showAddlangInput) {
      setAdditionalLanguage(user.customer.additionalLanguage)
      onNext()
      setShowAddlangInput(false)
    } else {
      setShowAddlangInput(true)
    }
  }

  const changeFirstname = (e) => {
    setFirstName(e.target.value)
  }

  const changeBusinessName = (e) => {
    setBusinessName(e.target.value)
  }

  const changeBusinessNameWhileConvertion = (e) => {
    setBusinessNameWhileConvertion(e.target.value)
  }

  const changeLastname = (e) => {
    setLastName(e.target.value)
  }

  const openConfirmationModal = async () => {
    const pendingJobs = await JobApi.latestJobForCustomer({ "customer": user.customer.id })
    if (pendingJobs.length > 0) {
      const hasInProgressJob = pendingJobs.some(job => {
        return (
          job?.status === "Inprogress" ||
          job?.status === "long-job" ||
          job?.status === "Accepted" ||
          job?.status === "Pending" ||
          job?.status === "Scheduled" ||
          job?.status === "Waiting" ||
          job?.schedule_accepted
        );
      });
      setDisableDeleteButton(hasInProgressJob);
      if (hasInProgressJob) {
        setShowConfirmationModal(false);
      } else {
        setShowConfirmationModal(true);
      }
    } else {
      //Check if there is a change in the job status before updating the state
      setDisableDeleteButton(false)
      setShowConfirmationModal(true);
    }
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const deleteUser = async () => {
    try {
      console.log("user info: ", JSON.stringify(user));

      const userInfo = {
        _id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.customer.phoneNumber,
        customerId: user.customer.id,
        createdAt: user.customer.createdAt,
        customerType: user.customer.customerType

      };
      if (user?.customer && user?.customer?.stripe_id) {
        userInfo.stripe_id = user.customer.stripe_id;
      }
      const response = await deleteUserByParam(userInfo);
      console.log('User deleted successfully', response);
      if (response.success) {
        console.log('inside user info if ');
        logout();
      }
      setShowConfirmationModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const editChangeToBusinessAccount = () => {
    setShowChangeToBusinessAccount(!showChangeToBusinessAccount)
  }

  return (
    <>
      <Container>
        <BodyContainer>
          <Section>
            <ItemContainer className="editContainer">
              <ItemTitle>NAME</ItemTitle>
              <Row>
                {!showNameInput ? <H4>{firstName} {lastName}</H4> :

                  <React.Fragment key="cusprofile">
                    <label className="font-weight-bold">First Name</label>
                    <Input placeholder="Enter First Name" onChange={changeFirstname} value={firstName} className="customer-edit-profile-input" />
                    <label className="font-weight-bold">Last Name</label>
                    <Input placeholder="Enter Last Name" onChange={changeLastname} value={lastName} className="customer-edit-profile-input" />
                    <Button onClick={handleNameChange} className="app-btn small-btn btn mt-3 customer-edit-profile-btn">
                      <FontAwesomeIcon icon={faCheck} /><span></span>
                    </Button>
                  </React.Fragment>}
              </Row>
              <div className="EditIcons" >
                <img onClick={editNameInputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
              </div>
            </ItemContainer>
            <ItemContainer className="editContainer">
              <ItemTitle>EMAIL</ItemTitle>
              <Row>
                <H4>{email}</H4>
              </Row>
            </ItemContainer>
          </Section>
          <Section>
            <ItemContainer className="editContainer">
              <ItemTitle>Primary Language</ItemTitle>
              <Row >
                {!showlangInput ? <H4>{language}</H4> :
                  <React.Fragment key="primarylg" >
                    <Select
                      showSearch
                      optionFilterProp="children"
                      style={{ width: 200, textAlign: 'left' }}
                      defaultValue={language}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={(value, option) => {
                        setLanguage(option.children)
                      }}
                      className="background-class"
                    >
                      {languages.map((item, index) => {
                        if (index === 2) {
                          return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                        }
                        else {
                          return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                        }
                      })}
                    </Select>

                    <Button onClick={handleLangChange} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                      <FontAwesomeIcon icon={faCheck} /><span></span>
                    </Button>
                  </React.Fragment>
                }
                <div className="EditIcons" >
                  <img onClick={editLangInputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
                </div>
              </Row>
            </ItemContainer>
          </Section>

          <Section>
            <ItemContainer className="editContainer">
              <ItemTitle>Additional Languages</ItemTitle>
              <Row >
                {!showAddlangInput ? <H4>{additionalLanguage}</H4> :
                  <React.Fragment key="additional">
                    <Select
                      showSearch
                      optionFilterProp="children"
                      style={{ width: 200, textAlign: 'left' }}
                      defaultValue={additionalLanguage}
                      filterOption={(input, option) =>

                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={(value, option) => {
                        setAdditionalLanguage(option.children)
                      }}
                      className="background-class"
                    >
                      {languages.map((item, index) => {
                        if (index === 2) {
                          return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                        }
                        else {
                          return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                        }
                      })}
                    </Select>

                    <Button onClick={handleAddLangChange} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                      <FontAwesomeIcon icon={faCheck} /><span></span>
                    </Button>
                  </React.Fragment>
                }
                <div className="EditIcons" >
                  <img onClick={editAddLangInputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
                </div>
              </Row>
            </ItemContainer>
          </Section>

          <Section className="phone-edit-outer">
            <ItemContainer className="editContainer">
              <ItemTitle>Phone Number</ItemTitle>
              <Row >

                {!showInput ? <H4>{editedPhoneNumber}</H4> :
                  <React.Fragment key="editPhone">
                    <InputWithLabel>
                      <PhoneInput value={editedPhoneNumber} countryCodeEditable={false} onChange={HandlePhoneNumber} country="us" onlyCountries={['in', 'gr', 'us', 'ca', 'gb']} />
                    </InputWithLabel>
                    <Button onClick={handleNumberChange} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                      <FontAwesomeIcon icon={faCheck} /><span></span>
                    </Button>

                  </React.Fragment>}
                <div className="EditIcons" >
                  <img onClick={inputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
                </div>
              </Row>
            </ItemContainer>

            {user.roles && user.roles[0] && ((user?.roles[0] === "user") || (user?.roles[0] === "owner" && !user.isBusinessTypeAccount)) && (
              <ItemContainer className="editContainer">
                <ItemTitle>Delete account </ItemTitle>
                <Button onClick={openConfirmationModal} className={`app-btn small-btn btn ${disableDeleteButton ? 'delete-disabled' : 'red-button-delete'} mt-3`}
                  disabled={disableDeleteButton || loading}
                >
                  Delete My Account
                </Button>
                {disableDeleteButton && (
                  <span className='customer-account-delete-button-text'>You need to complete your pending jobs to perform this action</span>
                )}
              </ItemContainer>
            )}
            {isOwnerAccount && user.isBusinessTypeAccount && (
              <ItemContainer className="editContainer">
                <ItemTitle>Delete account </ItemTitle>
                <Button className={`app-btn small-btn btn delete-disabled mt-3`}
                  disabled="true">
                  Delete My Account
                </Button>
                <span className='customer-account-delete-button-text'>Please contact geeker support at sarah@geeker.co to delete your account.</span>
              </ItemContainer>
            )}

          </Section>
          {isOwnerAccount && user.isBusinessTypeAccount &&
            <Section>
              <ItemContainer className="editContainer">
                <ItemTitle>BUSINESS NAME</ItemTitle>
                <Row>
                  {!showBusinessNameInput ? <H4>{businessName}</H4> :

                    <React.Fragment key="additional">
                      <Input placeholder="Enter Business Name" onChange={changeBusinessName} value={businessName} className="customer-edit-profile-input" style={{ width: 200, margin: 0 }} />
                      <Button onClick={handleBusinessNameChange} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                        <FontAwesomeIcon icon={faCheck} /><span></span>
                      </Button>
                    </React.Fragment>}
                  <div className="EditIcons" >
                    <img onClick={editBusinessNameHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
                  </div>
                </Row>
              </ItemContainer>
            </Section>}

          {/* Providing user an option to change to businss account */}
          {isOwnerAccount && !isBusinessAccount &&
            <Section>
              <ItemContainer className="editContainer">
                <ItemTitle>Change to Business Account</ItemTitle>
                <Row className="d-flex flex-column justify-content-start align-items-start">
                  {!showChangeToBusinessAccount ?
                    <span className='change-account-text'>Click on edit icon to change your personal account to business account</span>
                    :
                    <React.Fragment key="additional">
                      <Checkbox className="personalUseCheckbox mb-2" onChange={handleCheckboxChange}>
                        <span>
                          {/* I’m using this account for business use  */}
                          Convert my account to business account.
                        </span>
                      </Checkbox>

                      {checkBoxValue && <> <div>
                        <Input placeholder="Enter Business Name" onChange={changeBusinessNameWhileConvertion} value={businessNameWhileConvertion} className="customer-edit-profile-input" style={{ width: 200, margin: 0 }} />

                        <Button onClick={handleBusinessNameChangeWhileConvertion} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                          <FontAwesomeIcon icon={faCheck} /><span></span>
                        </Button>
                      </div>
                        <span className="no-business-text color-red-imp" >You can't undo once converted to business account</span>
                      </>}

                    </React.Fragment>}
                  <div className="EditIcons" >
                    <img onClick={editChangeToBusinessAccount} src={editIcon} width="20px" height="20px" alt="Edit" />
                  </div>
                </Row>
              </ItemContainer>
            </Section>}
        </BodyContainer>
      </Container>
      <Modal
        closable={false}
        visible={showConfirmationModal}
        onCancel={closeConfirmationModal}
        maskStyle={{ backgroundColor: "#DCE6EDCF" }}
        maskClosable={true}
        width={window.innerWidth > 768 ? 800 : '90%'}
        bodyStyle={{ height: 'auto', paddingTop: '2rem', paddingBottom: '2rem' }}
        footer={[
          <Button key="cancel" onClick={closeConfirmationModal} className="btn app-btn app-btn-light-blue modal-footer-btn">
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={deleteUser} className="btn app-btn job-accept-btn modal-footer-btn red-button-delete">
            Confirm
          </Button>,
        ]}
      >
        <div className="delete-text-container">
          <span className="div-font-deleteText">Are you sure you want to delete your account?</span>
          <span className='div-font-deleteSub' style={{ display: 'block' }} >This action is irreversible and will permanently delete all your account information, including your personal data, jobs, credit cards, and subscriptions history. Please note that you will no longer be able to access your account and its associated features.</span>
          <span className="div-font-deleteTextLast" style={{ display: 'block' }}>To proceed with the account deletion, please click on the Confirm button.</span>
        </div>
      </Modal>
    </>
  );

}

const Container = styled.div`
  background: transparent;  

  & .margin-class{
    margin-top:10px;
  }

  & .background-class{
      background-color:transparent;
      border-bottom: solid 1px #999;
  }

  & .margin-class-left{
    margin-left:15px;
  }
`;

const BodyContainer = styled.div`
  background: transparent;
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  // padding: 40px;
  flex: 1;
`;

const Section = styled(Row)`
  width: 100%;
`;
const InputWithLabel = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  marginRight: 30px;
  position: relative;
  &:last-child {
    marginRight: 0;
  }
  & input{
    height:50px;
    padding:10px;
    border-radius: 10px;
    margin-top: 15px;
    border : 2px solid #F3F3F3;
    margin-top:15px;
    margin-left:20px;
  }
  & .react-tel-input .form-control {
    height:50px;   
  }
`;

export default memo(ProfileReview);
