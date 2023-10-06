import React from 'react';
import {
    Col
} from 'antd'


const RoundSelectors = ({ software, isActive, onClick, isBtn = true }) => {
    const gridStyle = active => ({
        'height': '47px',
        /* UI Properties */
        'border': '2px solid #DCE6ED',
        'borderRadius': '23px',
        'opacity': 1,
        'padding': '14px 40px',
        'marginRight': '20px',
        'marginBottom': '10px',
        'width': 'auto !important',
        'transition': 'all 0.3s',
        'float': 'left',
        'overflow': 'hidden'
    });

    return (
        <Col onClick={onClick}>
            <div position="relative" className="font-nova" >
                <div style={gridStyle(isActive)} className={"max-width-406-round-selector software-card " + (isActive ? "active" : "not-active") + (isBtn ? " onBtnHover cursor-pointer" : "cursor-alias")}>
                    <div className="card-text-css"><span>{software?.name ? software?.name : software}</span></div>
                </div>
            </div>
        </Col>
    );

};
export default RoundSelectors;