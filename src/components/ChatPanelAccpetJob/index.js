import './style.css'
import React from 'react'
import { Collapse, Col, Spin } from 'antd';

const { Panel } = Collapse;
const ChatPanelAccpetJob = ({ inboxRef, showLoaderForChat, techStyle, handelCallBackPanel, refetchChat, socketHits }) => {

	return (
			<div style={{ display: "flex", justifyContent: "center" }}>
				<Col xs="12" className="ant-collapse-outer mt-4" style={{ width: "1300px", position: 'relative' }}>
							<Col md="12" className="mt-3 mb-4">
								{showLoaderForChat ? (
									<div style={{ margin: "auto", width: "0px" }}>
										<Spin size="large" />
									</div>
								) : (
									<div
										style={{
											width: techStyle === 'fromTech' ? "970px" : "1000px",
											height: "500px",
											margin: "auto"
										}}
										ref={inboxRef}
									></div>
								)}
							</Col>
				</Col>
			</div>

		
	)
}

export default ChatPanelAccpetJob
