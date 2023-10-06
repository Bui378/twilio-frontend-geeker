import React, { useState, useEffect } from "react"
import FooterBtns from "components/FooterBtns"
import MCQ from "components/MCQ"
import PreInterviewScreen from "components/PreInterviewScreen"
import ExamLoader from "./ExamLoader"
import * as InterviewQuestionApi from '../../../../api/interview.api';
import * as SoftwareApi from '../../../../api/software.api';
import * as TechnicianApi from '../../../../api/technician.api';
import { useUser } from '../../../../context/useContext';
import { useAuth } from '../../../../context/authContext';
import Loader from "../../../../components/Loader";
import { EmailOutlook } from "../../../../constants"
import ExamFail from "./ExamFail";
import { useGTMDispatch } from '@elgorditosalsero/react-gtm-hook'

const Exam = ({ register, onPrev, onNext, setShowProgress, setProgressBarPercentage }) => {
    const [showPreInterview, setShowPreInterview] = useState(true);
    const [previousTestSubmit, setPreviousTestSubmit] = useState(0);
    const [showResultPage, setShowResultPage] = useState(false);
    const [testComplete, setTestComplete] = useState(false);
    const [result, setResult] = useState('loader');
    const [question, setQuestion] = useState();
    const [selectedSoftwares, setSelectedSoftwares] = useState();
    const [test, setTest] = useState(0);
    const [fail, setFail] = useState(false);
    const { user } = useUser();
    const { refetch } = useAuth();
    const [showLoader, setShowLoader] = useState(true);
    const sendDataToGTM = useGTMDispatch()

    useEffect(() => {
        setShowProgress(true)
        setProgressBarPercentage(75)
    }, [])

    useEffect(() => {
        (async () => {
            if (register.technician.registrationStatus === 'exam') {
                let technician = await TechnicianApi.retrieveTechnician(register.technician.id)
                let testHistoryData = technician.testHistory.filter(item => item.software_id !== EmailOutlook);
                let temp = []
                for (let x in testHistoryData) {
                    temp.push(testHistoryData[x]["result"])
                }
                if (!temp.includes(undefined)) {
                    let check = await checkAllSoftwaresTest(technician.expertise, technician.testHistory)
                    if (check) {
                        if (temp.includes("Pass")) {
                            await TechnicianApi.updateTechnician(register.technician.id, {
                                registrationStatus: "finalize_profile",
                            })
                            window.location.href = '/dashboard'
                        } else {
                            await TechnicianApi.updateTechnician(register.technician.id, {
                                registrationStatus: "exam_fail",
                            });
                            window.location.href = '/dashboard'
                        }
                    }
                }
            }
            // if(register.technician.registrationStatus === 'finalize_profile' || register.technician.registrationStatus === 'exam_fail'){
            if (register.technician.registrationStatus === 'finalize_profile') {
                window.location.href = '/dashboard'
            }
        })()
    }, [register])

    const checkAllSoftwaresTest = async (arr, target) => {
        let new_arr = arr.filter((item) => item.software_id !== EmailOutlook);
        let checkcond;
        if (new_arr.length > 0) {
            let temp = [];
            for (let j in target) {
                let match_id = target[j].software_id
                temp.push(match_id)
            }
            for (let i in new_arr) {
                let check_id = new_arr[i].software_id
                checkcond = temp.includes(check_id)
            }
            return checkcond;
        } else {
            return true;
        }

    }

    useEffect(() => {
        (async () => {
            let technician = await TechnicianApi.retrieveTechnician(register.technician.id)
            let softwares = technician.expertise.filter(item => item.software_id !== EmailOutlook);
            let testHistoryData = technician.testHistory.filter(item => item.software_id !== EmailOutlook);
            console.log("testHistoryData arr", testHistoryData)
            if (testHistoryData.length > 0) {
                let checkFail = testHistoryData.every(el => el.result === "Fail");
                if (checkFail) {
                    setFail(true)
                }
            }
            if (softwares.some(el => el.result)) {
                setShowPreInterview(false)
            }
            let resp = [];
            let ques = [];
            let soft = [];
            for (let i = 0; i < softwares.length; i++) {
                if (softwares[i].result === null || softwares[i].result === undefined) {
                    const software = await SoftwareApi.retrievesoftware(softwares[i].software_id);
                    soft.push(software)
                    if (resp.includes(software.test)) {
                        continue
                    }
                    else {
                        resp.push(software.test)
                    }
                }
            }
            resp = resp.filter(item => item !== "")
            for (let n = 0; n < resp.length; n++) {
                const quest = await InterviewQuestionApi.getQuestionList(resp[n]);
                ques.push(quest)
            }
            setQuestion(ques)
            setSelectedSoftwares(soft)
            setShowLoader(false)
        })();
    }, []);

    useEffect(() => {
        if (question && question !== undefined) {
            // console.log("Here is ques length", question.length - 1, test)
        }
        if (showResultPage === true && question && question !== undefined && (question.length - 1) === test) {
            setTestComplete(true);
        }
    }, [question, test, showResultPage])

    useEffect(() => {
        if (previousTestSubmit > test) {
            setTest(test + 1);
        }
    }, [previousTestSubmit])

    /**
    * Function that handles the next button after completion of all tests & updates the registration status of the technician accordingly
    * @author : Kartik
    **/
    const handleNext = async (value) => {
        console.log("Interview Complete>>>>>>>>>")
        let technician = await TechnicianApi.retrieveTechnician(register.technician.id)
        let softwares = technician.expertise.filter(item => item.software_id !== EmailOutlook);
        let testHistoryData = technician.testHistory.filter(item => item.software_id !== EmailOutlook);
        let checkFail = testHistoryData.every(el => el.result === "Fail");
        console.log("checkFail:::>>>", checkFail)
        if (checkFail) {
            setFail(true)
            await TechnicianApi.updateTechnician(register.technician.id, {
                registrationStatus: "exam_fail",
            });
            await refetch()
            window.location.reload(true)
        }
        else {

            // Sending GA4 tag
            sendDataToGTM({
                event: 'tech_passed_exam',
                tech_id: register.technician.id,
                environment: process.env.REACT_APP_URL.split("/")[2]
            })

            await TechnicianApi.updateTechnician(register.technician.id, {
                registrationStatus: "finalize_profile",
            });
            await refetch()
            onNext()
        }
    }

    if (showLoader) return (<Loader />)
    
    return <div className="d-flex justify-content-center align-items-center flex-column">
        <div className="w-100p">
            {
                fail
                    ? <>
                        {setShowProgress(false)}
                        <ExamFail />
                    </>
                    : showPreInterview
                        ? <PreInterviewScreen onPrev={onPrev} setShowPreInterview={setShowPreInterview} user={user} setShowLoader={setShowLoader} />
                        : <>
                            {showResultPage === false && question && question !== undefined && selectedSoftwares !== undefined && question[test] && question[test].testId &&
                                <MCQ question={question[test]} testId={question[test].testId} selectedSoftwares={selectedSoftwares} previousTestSubmit={previousTestSubmit} setShowResultPage={setShowResultPage} setResult={setResult} register={register} setShowProgress={setShowProgress} setProgressBarPercentage={setProgressBarPercentage} setShowLoader={setShowLoader} />
                            }
                            {showResultPage === true &&
                                <ExamLoader setShowProgress={setShowProgress} previousTestSubmit={previousTestSubmit} setPreviousTestSubmit={setPreviousTestSubmit} setShowResultPage={setShowResultPage} result={result} setResult={setResult} testComplete={testComplete} register={register} />
                            }
                            {
                                testComplete && result !== "loader"
                                    ? <FooterBtns hidePrevBtn="yes" hideSaveForLater={true} onNext={handleNext} />
                                    : <></>
                            }
                        </>
            }
        </div>
    </div>
}

export default Exam

