import React, { useEffect } from "react"
import { Player } from '@lottiefiles/react-lottie-player';
import loader from "../../../../assets/animations/Checking Exam.json"
import pass from "../../../../assets/animations/Pass.json"
import fail from "../../../../assets/animations/Fail.json"
import FooterBtns from "../../../../components/FooterBtns"

const ExamLoader = ({ setShowProgress, previousTestSubmit, setPreviousTestSubmit, setShowResultPage, result, setResult, testComplete, register }) => {

    useEffect(() => {
        setShowProgress(false)
    }, [])

    /**
    * Function that handles the next button to proceed to the next test and hide the result page
    * @author : Kartik
    **/
    console.log('result exam', result);
    const handleNext = (e) => {
        setPreviousTestSubmit(previousTestSubmit + 1);
        setShowResultPage(false)
        setResult('loader')
    }

    const loaderHeading = `Hang on we are checking your Exam`
    const passHeading = "Congrats! You passed"
    const failHeading = "You failed. Thank you for trying"

    return <div className="text-center">
        <span className="tech-on-boarding-heading">
            {result === "loader" ? loaderHeading
                : result === "pass" ? passHeading
                    : result === "fail" ? failHeading
                        : ""
            }
        </span>
        <Player
            autoplay
            keepLastFrame={true}
            src={result === "loader" ? loader
                : result === "pass" ? pass
                    : result === "fail" ? fail
                        : ""
            }
            style={result === "fail" ? { height: '60%', width: '60%' } : { height: '80%', width: '80%' }}
        >
        </Player>
        {
            result === "loader" || testComplete
                ? <></>
                : <FooterBtns onNext={handleNext} hideSaveForLater={true} hidePrevBtn="yes" />
        }
    </div>
}

export default ExamLoader