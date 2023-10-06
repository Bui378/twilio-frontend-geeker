import React from "react"
import start from "../../../../assets/images/star.png"
import uniGlassEmoji from "../../../../assets/images/uniGlassEmoji.png"
import clock from "../../../../assets/images/clock.png"

const AvgInfo = () => {
    return<>
        <div className="rating-div mb-20">
            <img src={start} className="mr-20" />
            <div>
                <span className="rating-text">Avg Star Rating</span>
                <img src={start} className="small-star mr-13" />
                <img src={start} className="small-star mr-13" />
                <img src={start} className="small-star mr-13" />
                <img src={start} className="small-star mr-13" />
                <img src={start} className="small-star" />
            </div>
        </div>
        <div className="rating-div mb-20">
            <img src={uniGlassEmoji} className="mr-20" />
            <div>
                <span className="issue-resolved-text" >Avg Issues Resolved</span>
                <span className="issue-resolved-percentage" >97.5%</span>
            </div>
        </div>
        <div className="rating-div mb-20">
            <img src={clock} className="mr-20" />
            <div>
                <span className="issue-resolved-text" >Avg Response Time</span>
                <span className="issue-resolved-percentage" >10 minutes</span>
            </div>
        </div>
    </>
}

export default AvgInfo