import RoundBtn from "components/RoundBtn"
import React, { useEffect, useState } from "react"

const SoftwareStrength = ({ title, callBack, expertiseLevel, software }) => {
    const [active, setActive] = useState(false)
    const [currentOption, setCurrentOption] = useState({})
    let [strengthArr, setStrengthArr] = useState([
        {
            "title": 1,
            "content": "I'm not very familiar"
        },
        {
            "title": 2,
            "content": "Basic knowledge but never used professionally"
        },
        {
            "title": 3,
            "content": "Pretty fluent & limited use professionally"
        },
        {
            "title": 4,
            "content": "Very fluent and a lot of use professionally"
        },
        {
            "title": 5,
            "content": "I do this in my sleep!"
        }
    ])

    useEffect(() => {
        const currentSoftware = expertiseLevel.find(item => item.software_id === software.id)
        const subOption = currentSoftware?.sub_options
        const currentLevel = subOption && subOption.find(item => item.option === title)
        currentLevel && setCurrentOption(currentLevel)
        currentLevel && currentLevel.option === title ? setActive(true) : setActive(false)
    }, [expertiseLevel])

    return <>
        <div className="d-flex w-100p mb-25 software-strength-container" onClick={callBack}>
            <div className="speciality-software-column d-flex align-items-center justify-content-start">
                <span className="speciality-software-column-span">{title}</span>
            </div>
            <div className="speciality-strength-column d-flex align-items-center justify-content-around pr-5" >
                {strengthArr.map((item, index) => {
                    return <RoundBtn key={index} active={active && currentOption.current_num == item.title} title={item.title} toolTipContent={item.content} />
                })}
            </div>
        </div>
    </>
}

export default SoftwareStrength