import React, { useEffect, useState } from "react"
import { Modal, Checkbox } from 'antd';
import HeadingText from "pages/Customer/BusinessPlan/Components/HeadingText";
import InputField from "pages/Customer/BusinessPlan/Components/InputField";
import BasicButton from "components/common/Button/BasicButton";
import { openNotificationWithIcon } from "utils";
import * as UserApi from '../../../api/users.api';

const AskIfBusinessAccountModal = ({ user, showUpdateBusinessNameModal, setShowUpdateBusinessNameModal }) => {

    const [checkBoxValue, setCheckBoxValue] = useState(true)
    const [businessName, setBusinessName] = useState("")
    const [showSpinner, setShowSpinner] = useState(false)

    useEffect(() => {
        console.log("My conosle for user at AskIfBusinessAccountModal")
    }, [])

    const handleCheckboxChange = (e) => {
        setCheckBoxValue(e.target.checked)
    };

    const handleBusinessNameOnChange = (e) => {
        setBusinessName(e.target.value)
    }

    const handleSubmitForm = async () => {
        setShowSpinner(true)
        console.log("My console for ", checkBoxValue, businessName)
        const businessNameInput = businessName.trim()

        // Checking if checkbox is checked and business name is not provided.
        if (checkBoxValue && businessNameInput === "") {
            setShowSpinner(false)
            openNotificationWithIcon("error", "Info", "Please either provide your business name or uncheck the checkbox to continue")
            return
        }

        let dataToUpdate = {}

        // If checkbox is checked
        if (checkBoxValue) {
            dataToUpdate = {
                userId: user.id,
                isBusinessTypeAccount: true,
                businessName: businessName
            }
        }

        // If checkbox is unchecked
        if (!checkBoxValue) {
            dataToUpdate = {
                userId: user.id,
                isBusinessTypeAccount: false,
                businessName: ""
            }
        }

        const updateUserRes = await UserApi.updateUser(dataToUpdate)
        if (updateUserRes) {
            openNotificationWithIcon("success", "Success", "Data saved successfuly!")
            setShowSpinner(false)
        }
        setShowUpdateBusinessNameModal(false)
    }

    return <div>
        <Modal
            visible={showUpdateBusinessNameModal}
            closable={false}
            destroyOnClose={false}
            className="p-30-50 business-modal"
            footer={[]}
            width={700}
        >
            <div className="d-flex justify-content-center flex-column align-items-center text-center">

                <div className="d-flex justify-content-center w-100p mb-5">
                    <HeadingText firstBlackText={"Please add your business name"} />
                </div>

                <Checkbox className="personalUseCheckbox mb-2" onChange={handleCheckboxChange} checked={checkBoxValue}>
                    <span>
                        I’m using this account for business use
                    </span>
                </Checkbox>

                <InputField placeholder={"Business Name"} divPropClass={""} onChange={handleBusinessNameOnChange} value={businessName} disable={!checkBoxValue} />
                <span className="no-business-text color-red-imp mb-4" >You can't undo once converted to business account</span>
                <div className="ask-if-busines-account-modal-btn-div mb-15">
                    <BasicButton btnTitle={"Submit"} height={"inherit"} width={"inherit"} background={"#01D4D5"} color={"white"} onClick={handleSubmitForm} disable={showSpinner} showSpinner={showSpinner} />
                </div>
            </div>
        </Modal>
    </div>
}

export default AskIfBusinessAccountModal