import React, { useState, useEffect } from "react"
import { Radio, Modal } from 'antd';
import HeadingAndSubHeading from "../../components/HeadingAndSubHeading"
import FooterBtns from "../../components/FooterBtns"
import { openNotificationWithIcon } from "../../utils";
import * as TechnicianApi from "../../api/technician.api";
import * as InterviewQuestionApi from '../../api/interview.api';
import { useUser } from "../../context/useContext";
import mixpanel from 'mixpanel-browser';

const MCQ = ({ question, selectedSoftwares, testId, previousTestSubmit, setShowResultPage, setResult, register, setShowProgress, setProgressBarPercentage, setShowFooter, callHandleComplete, setCallHandleComplete, handleNextButton, refetch }) => {
    const [inputs, setInputs] = useState({});
    const [softwareArr, setSoftwareArr] = useState();
    const [marks, setMarks] = useState(0);
    const { user } = useUser();

    useEffect(() => {
        setProgressBarPercentage(75)
    }, [])

    useEffect(() => {
        if (callHandleComplete) {
            console.log('check state??', callHandleComplete)
            handleComplete()
        }
    }, [callHandleComplete])

    useEffect(() => {
        (async () => {
            const softArr = selectedSoftwares.filter((soft) => {
                return soft.test === question.testId
            }
            );
            setSoftwareArr(softArr)
        })();
    }, [testId]);

    /**
    * Function that handles the input values from selected radio buttons of mcq's and sets it in input object
    * @author : Kartik
    **/
    const handleChange = (event) => {
        const name = event.target.name;
        const value = JSON.parse(event.target.value).val;
        const mark = JSON.parse(event.target.value).marks;
        const option = JSON.parse(event.target.value).option;
        setInputs(values => ({ ...values, [name]: { ans: value, mark: mark, option: option } }))
    }
    /**
    * Function that handles the submission of the test and calculate the result as pass or fail to update the technician object
    * @author : Kartik
    **/
    const handleComplete = (e) => {
        Modal.confirm({
            title: 'Are you sure you want to submit this test?',
            okText: 'Yes',
            cancelText: 'No',
            className: 'app-confirm-modal',
            async onOk(e) {
                if (setShowFooter !== undefined) {
                    setShowFooter(false)
                }
                let score = 0;
                Object.keys(inputs).forEach(async function (key, index) {
                    score += inputs[key].mark;
                    await InterviewQuestionApi.createResponse({
                        test: testId,
                        question: key,
                        option: inputs[key].option,
                        response: inputs[key].ans,
                        technician: register.technician.id,
                    });
                });
                setMarks(((score / (question.totalCount)) * 100).toFixed(2))
                if (((score / (question.totalCount)) * 100) >= question.passPercent) {
                    setTimeout(() => { setResult('pass') }, 5000)
                    for (let i = 0; i < softwareArr.length; i++) {
                        console.log('submit test array', softwareArr)
                        let result = await TechnicianApi.updateTechnicianResult(register.technician.id, { software_id: softwareArr[i].id, result: "Pass" });
                        // mixpanel code//
                        console.log('result data in if >>>>>', result)
                        mixpanel.identify(user.email);
                        mixpanel.track('Technician - passed exam for software');
                        // mixpanel code//
                    }
                }
                else {
                    setTimeout(() => { setResult('fail') }, 5000)
                    for (let i = 0; i < softwareArr.length; i++) {
                        console.log('submit test array else', softwareArr)
                        let result = await TechnicianApi.updateTechnicianResult(register.technician.id, { software_id: softwareArr[i].id, result: "Fail" });
                        // mixpanel code//
                        console.log('result data in else >>>>>', result)
                        mixpanel.identify(user.email);
                        mixpanel.track('Technician - failed exam for software');
                        // mixpanel code//
                    }
                }
                if (setCallHandleComplete !== undefined) {
                    setCallHandleComplete(false)
                }
                setShowResultPage(true)
                setResult('loader')
                if (refetch !== undefined) {
                    refetch();
                }

                openNotificationWithIcon('success', 'Success', 'Test submitted successfully.');
                Modal.destroyAll()
            },
            async onCancel(e) {
                if (setCallHandleComplete !== undefined) {
                    setCallHandleComplete(false)
                }
            }
        });
    }

    return <>
        <HeadingAndSubHeading heading={"Exam"} subHeading={"Please answer the following questions"} />
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ minWidth: '100%' }}>
            <div className="d-flex justify-content-center align-items-center w-100p mt-22">
                {softwareArr && softwareArr !== undefined &&
                    softwareArr.map((soft, index) => {
                        return (
                            <React.Fragment key={index}>
                                {
                                    <>
                                        <img src={soft.blob_image} className="sw-img" alt="softwareImage" />
                                        <span>{soft.name.toUpperCase()}{softwareArr.length === (index + 1) ? <></> : <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</span>
                                    </>
                                }
                            </React.Fragment>
                        )
                    })
                }
            </div>
            <div className="d-flex justify-content-start align-items-center w-90p flex-column exam-main-div">
                {
                    question.data.map((item, index) => {
                        return (
                            <div key={index} className="d-flex justify-content-start align-items-center flex-column text-left mt-30 min-width-100p max-width-100p">
                                <>
                                    {
                                        <div className="exam-question d-flex flex-wrap w-100p">
                                            &nbsp;{index + 1}.&#41;&nbsp;{item.question}</div>
                                    }
                                </>
                                <Radio.Group name={item.id} className="mb-35 ml-5 w-100p">
                                    <Radio value={JSON.stringify({ 'val': item.option_a, 'marks': item.option_a === item.answer ? 1 : 0, 'option': 'option_a' })} onChange={handleChange} className="exam-radio-ans min-width-100p">{item.option_a}</Radio>
                                    <Radio value={JSON.stringify({ 'val': item.option_b, 'marks': item.option_b === item.answer ? 1 : 0, 'option': 'option_b' })} onChange={handleChange} className="exam-radio-ans min-width-100p">{item.option_b}</Radio>
                                    <Radio value={JSON.stringify({ 'val': item.option_c, 'marks': item.option_c === item.answer ? 1 : 0, 'option': 'option_c' })} onChange={handleChange} className="exam-radio-ans min-width-100p">{item.option_c}</Radio>
                                    <Radio value={JSON.stringify({ 'val': item.option_d, 'marks': item.option_d === item.answer ? 1 : 0, 'option': 'option_d' })} onChange={handleChange} className="exam-radio-ans min-width-100p">{item.option_d}</Radio>
                                </Radio.Group>
                            </div>
                        )
                    })
                }
            </div>
        </div>
        <FooterBtns onNext={handleComplete} hideSaveForLater={true} hidePrevBtn="yes" hideNextBtn={handleNextButton} />
    </>
}

export default MCQ