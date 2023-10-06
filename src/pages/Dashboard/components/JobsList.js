import React, { useState } from 'react'

export default function JobsList() {
    return (
        <div style={{
            boxShadow: "9px 9px 15px 1px rgb(170 170 170 / 75%)", borderRadius: "11px", background: "#fff", padding: "0.1rem"
        }}>
            <JobListHeader />
            <div style={{ marginTop: "1rem" }}>
                <JobListBodyRow />

                <JobListBodyRow />
                <JobListBodyRow />
            </div>
        </div>
    )
}

const JobListHeader = () => {
    const textStyle = {
        flex: 1, fontSize: "14px", fontWeight: "bold", marginBottom: 0
    }
    return (
        <div style={{ display: "flex", background: "rgb(220, 231, 237)", height: "40px", alignItems: "center", paddingLeft: "60px", paddingRight: "60px" }}>
            <h5 style={textStyle}>Date</h5>
            <h5 style={textStyle}>Time</h5>
            <h5 style={{ ...textStyle, flex: 3 }}>Issue</h5>
            <h5 style={textStyle}>Earnings</h5>

        </div>
    )
}

const JobListBodyRow = () => {
    const [hovered, setIsHOvered] = useState(false)
    const textStyle = {
        flex: 1, fontSize: "16px", fontWeight: "bold", marginBottom: 0, color: hovered ? "#2a3740" : "#74828d"
    }
    return (
        <div onMouseEnter={() => setIsHOvered(true)}
            onMouseLeave={() => setIsHOvered(false)}
            style={{
                height: "100px", marginLeft: "35px", marginRight: "35px", borderBottom: "3px solid #e1eaef",
                display: "flex", alignItems: "center",
                backgroundColor: hovered ? "#dce7ed" : "#fff",
                paddingLeft: "30px", paddingRight: "30px", borderRadius: "11px"
            }}>
            <h5 style={textStyle}>01/01/2021</h5>
            <h5 style={textStyle}>10:25 AM</h5>
            <h5 style={{ ...textStyle, flex: 3, fontSize: "14px" }}>Need excel VBA script writer to combine 750 sheets that are in one single sheet</h5>
            <h5 style={textStyle}>$55</h5>
        </div>
    )
}