import React from "react"
import testimonyByBrian from "../../../../assets/images/TestimonialBrian.png"
import testimonyByJennifer from "../../../../assets/images/TestimonialJennifer.png"
import testimonyByStacy from "../../../../assets/images/TestimonialStacy.png"

const Testimony = ({testimonyBy}) => {
    return<div className="w-full">
        <img src={
            testimonyBy === "brian" ? 
                                    testimonyByBrian 
                                    : 
                                    testimonyBy === "jennifer" ? 
                                                                testimonyByJennifer 
                                                                : testimonyBy === "stacy" ? 
                                                                                                testimonyByStacy 
                                                                                            :  ""
            
            } className="w-full" />
    </div>
}

export default Testimony