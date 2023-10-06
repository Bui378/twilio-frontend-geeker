import React, { useState } from "react"
import { Modal } from 'antd';
import HeadingText from "pages/Customer/BusinessPlan/Components/HeadingText";
import SubHeadingText from "pages/Customer/BusinessPlan/Components/SubHeadeingText";
import InputField from "pages/Customer/BusinessPlan/Components/InputField";
import BasicDropDown from "../../../components/common/BasicDropDown"
import BasicButton from "components/common/Button/BasicButton";
import { INDUSTRY, TEAM_SIZE } from "../../../constants/index"
import { openNotificationWithIcon } from "utils";
import { useSocket } from '../../../context/socketContext';
import * as CustomerApi from '../../../api/customers.api';
import * as BusinessApi from '../../../api/businessDetails.api'

const BusinessModal = ({ showBusinessModal, setShowBusinessModal, user }) => {

    const [businessName, setBusinessName] = useState(user?.businessName)
    const [businessWebsite, setBusinessWebsite] = useState("NA")
    const [otherIndustry, setOtherIndustry] = useState("NA")
    const [industry, setIndustry] = useState("NA")
    const [teamSize, setTeamSize] = useState("NA")
    const { socket } = useSocket();

    const handleSubmitForm = async () => {
        console.log("My console for business info after submit", { businessName, businessWebsite, industry, otherIndustry, teamSize })
        if (businessName === "" || businessName.trim() === "") {
            openNotificationWithIcon("error", "Info Missing", "Please provide your business name.")
            return
        }

        if (industry === "Others" && (otherIndustry === "" || otherIndustry.trim() === "" || otherIndustry === "NA")) {
            openNotificationWithIcon("error", "Info Missing", "Please provide your industry.")
            return
        }

        socket.emit('send-business-info-to-admin', {
            userName: `${user.firstName} ${user.lastName}`,
            businessName,
            businessWebsite,
            industry: industry !== "Others" ? industry : otherIndustry,
            teamSize,
        });

        if (user?.business_details?.id) {
            const dataToUpdate = {
                businessName: businessName,
                businessWebsite: businessWebsite,
                industry: industry,
                teamSize: teamSize
            }
            await BusinessApi.updateBusinessDetails(user?.business_details?.id, dataToUpdate)
        }
        await CustomerApi.updateCustomer(user.customer.id, { askedForBusiness: true })
        setShowBusinessModal(false)
    }

    const handleNotABusinessOwner = async () => {
        console.log("User is not a business owner")
        await CustomerApi.updateCustomer(user.customer.id, { askedForBusiness: true })
        setShowBusinessModal(false)
    }

    return <div>
        <Modal
            visible={showBusinessModal}
            closable={false}
            destroyOnClose={false}
            className="p-30-50 business-modal"
            footer={[]}
            width={700}
        >
            <div className="business-modal-outer-div d-flex flex-column justify-content-center align-items-center">
                <div className="mb-10 text-center">
                    <HeadingText firstBlackText={"Tell us about "} secondGreenText={" your business "} />
                </div>
                <span className="business-modal-sub-heading text-center">Let's integrate your business with amazing,</span>
                <span className="business-modal-sub-heading mb-30 text-center">tailored sevice designed to perfectly fit your needs.</span>
                <div className="mb-20 w-full d-flex justify-content-center ">
                    <div className="max-width-768-w-100per">
                        <SubHeadingText text={"Business Name*"} />
                        <InputField onChange={(e) => { setBusinessName(e.target.value) }} divPropClass={"max-width-768-w-100per"} defaultValue={user.businessName} disable={true} />
                    </div>
                </div>
                <div className="mb-20 w-full d-flex justify-content-center ">
                    <div className="max-width-768-w-100per">
                        <SubHeadingText text={"Business Website"} />
                        <InputField onChange={(e) => { setBusinessWebsite(e.target.value) }} divPropClass={"max-width-768-w-100per"} />
                    </div>
                </div>
                <div className="mb-20 w-full d-flex justify-content-center max-width-768-w-100per">
                    <div className="max-width-768-w-100per">
                        <SubHeadingText text={"Industry"} />
                        <BasicDropDown name={"industry"} dropDownOptions={INDUSTRY} setValue={setIndustry} divClass={"max-width-768-w-100per"} />
                    </div>
                </div>
                {industry === "Others" && <div className="mb-20 w-full d-flex justify-content-center ">
                    <div className="max-width-768-w-100per">
                        <SubHeadingText text={"Other industry"} />
                        <InputField onChange={(e) => { setOtherIndustry(e.target.value) }} divPropClass={"max-width-768-w-100per"} />
                    </div>
                </div>}
                <div className="mb-20 w-full d-flex justify-content-center ">
                    <div className="max-width-768-w-100per">
                        <SubHeadingText text={"Team"} />
                        <BasicDropDown name={"team"} dropDownOptions={TEAM_SIZE} setValue={setTeamSize} divClass={"max-width-768-w-100per"} />
                    </div>
                </div>
                <div className="business-plan-sign-in-button mb-1 w-full">
                    <BasicButton btnTitle={"Explore Dashboard"} height={"inherit"} width={"inherit"} background={"#01D4D5"} color={"white"} btnIcon={"arrow"} faFontSize={"18px"} arrowDirection={"right"} onClick={handleSubmitForm} />
                </div>
                <span className="no-business-text" onClick={handleNotABusinessOwner}>I'm not a business owner</span>
            </div>
        </Modal>
    </div>
}

export default BusinessModal