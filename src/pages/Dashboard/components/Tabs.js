import React, { useEffect, useState } from 'react'

export const TabsHeader = ({ activeTab: _activeTab = 0, tabsArray = [] }) => {

    const [activeTab, setActiveTab] = useState(1)

    useEffect(() => {
        setActiveTab(_activeTab)
    }, [_activeTab])


    return (
        <div style={{ display: "flex", width: "100%", }}>
            {tabsArray.map((tabName, index) => <TabItem
                onClick={() => setActiveTab(index)}
                text={tabName} isActive={activeTab === index} />)}
        </div>
    )
}


const TabItem = ({ text, isActive, onClick, }) => {

    return (
        <h4 onClick={onClick} style={{
            cursor: "pointer",
            color: isActive ? "#475258" : "#1fc7c8", flex: 1, fontSize: "18px", borderBottom: isActive ? "4px solid #2cc" : "4px solid #e1eaef",
            paddingBottom: "20px", paddingLeft: "20px", marginBottom: 0,
            fontWeight: "bold"
        }}>{text}</h4>
    )
}