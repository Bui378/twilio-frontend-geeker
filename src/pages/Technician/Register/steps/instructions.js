import React from "react";
import { useState, useRef } from "react";
// import {Button,Col} from 'react-bootstrap';
//@ author Utkarsh Dixit
const Instructions = ({ setScrollBottom, setModal1Visible, user, currentStep,setIsChecked,isChecked}) => {
	// const listInnerRef = useRef();

	// const [boxChanged, setBoxChanged] = useState(false);
	
	const handleScroll = () => {
		// setScrollBottom(true);
		// setModal1Visible(false);
		setIsChecked(!isChecked);

	};
     
	return (
		<div
			style={{ overflowY: "auto" , height:currentStep ==111 ?'600px':"500px", textAlign:"left",paddingRight:"10px"} } className={currentStep ==111 && 'pl-2'}
		>
			<header>
				<p style={{ fontSize: currentStep ==111 && '25px'}} className={currentStep == 111 && 'text-center mt-2'}>
					<b>Welcome to the Geeker team! </b>
				</p>
				<p>
					Here at Geeker, we help clients quickly solve their software and IT
					problems. We’re excited to have you on board. As a Geek, you’ll earn
					competitive pay while helping people navigate all sorts of IT problems
					and popular systems such as Microsoft Office, Google Suite, Quickbooks
					Online, and more.
				</p>
				<p>
					Create your own schedule and work when you want. Whether you’re
					looking to earn a little extra income on the side or using the
					platform as your primary source of income, you’ll get paid for all of
					the cases you resolve.
				</p>
				<p>
					Before we begin, make sure to head on over to our YouTube Channel and
					subscribe to access our videos with useful tips & tricks.{" "}
				</p>
			</header>
			<hr />
			<div>
				<div style={{ textAlign: "center", fontWeight: "bold" }}>
					<p style={{fontSize: currentStep ==111 && '20px'}}>Common Questions/Issues</p>
				</div>
				<ul style={{listStylePosition:currentStep ==111 && 'inside'}}>
					<li>Transfers</li>
					<li>Time Limit</li>
					<li>Screen Share</li>
					<li>Remote Access/Control of Customer’s Computer</li>
					<li>Summarize the issue on the dashboard</li>
					<li>Converting to Long Call</li>
				</ul>
			</div>

			<div>
				<div style={{ textAlign: "center", fontWeight: "bold" }}>
					<p style={{fontSize: currentStep ==111 && '20px'}}>Steps for each call</p>
				</div>
				<ul style={{listStylePosition:currentStep ==111 && 'inside'}}>
					<li>Login to the system</li>
					<li> Accept Job</li>
					<li>Wait for the Customer to Connect</li>
					<li>Introduce yourself</li>
					<li>Summarize the issue on the dashboard</li>
					<li>Resolve the issue</li>
					<li>Ending the Call</li>
				</ul>
			</div>
			<hr />
			<div>
				<p>
					<b>Step 1: Login to the system</b>
				</p>
				<ul>
					<li>
						Head over to the Geeker login system (https://app.geeker.co/login)
						and make yourself active on the dashboard so that you can begin to
						receive jobs.
					</li>
					<img src={require("./instructionimages/unnamed (1).png")} width="700px" className="img-fluid" alt="instruction1"/>
					
				</ul>
			</div>
			<div>
				<p>
					<b>Step 2: Accept Job</b>{" "}
				</p>
				<ul>
					<li>
						When a client logs on with an issue, our system will work to connect
						them with a Geek experienced in that area. If that’s you, you will
						receive an email and a notification on your Geeker dashboard. This
						will give you a description of the issue the customer needs
						assistance with.
					</li>
					<li>
						Click Accept Job so that you can be connected. The system will wait
						for the customer to start the call, so hang tight :-){" "}
					</li>
					<img src={require("./instructionimages/unnamed.png")} width="700px" className="img-fluid" alt="instruction2" />

				</ul>
			</div>
			<div>
				<p>
					<b>Step 3: Wait for the Customer to Connect</b>
				</p>
				<ul>
					<li>
						Give the customer 1-2 minutes to connect to the call. If they do not
						connect, click the Start Call button and it will call the customer’s
						cell phone.
					</li>
					<img src={require("./instructionimages/unnamed (2).png")} width="700px" className="img-fluid" alt="instruction3"/>

					<li>
						Instruct the Customer to click JOIN on their screen in order to join
						the meeting.{" "}
					</li>
					<img src={require("./instructionimages/unnamed (3).png")} width="700px" className="img-fluid" alt="instruction4" />

					<li>
						They can choose to stay on the phone with you OR switch to Computer
						Audio. If they want to switch, they will just click the Computer
						Audio button on their screen.
					</li>

					<img src={require("./instructionimages/unnamed (4).png")} width="700px" className="img-fluid" alt="instruction5" />

				</ul>
			</div>
			<div>
				<p>
					<b>Step 4: Introduce yourself</b>
				</p>
				<ul>
					<li>Once connected, introduce yourself and confirm the issue.</li>
					<li>
						<b>Example :</b>{" "}
						<p>
							Hi (Customer Name), Thanks for connecting with Geeker, my name is
							(Name) and before we begin, I just want to confirm that you need
							help with (explain the issue they listed). Is that correct?. Ok,
							let’s get started.
						</p>
					</li>
					<li></li>

					<img src={require("./instructionimages/unnamed (5).png")} width="700px" className="img-fluid" alt="instruction6" />

				</ul>
			</div>
			<div>
				<p>
					<b>Step 5: Summarize the issue on the dashboard</b>
				</p>
				<ul>
					<li>
						Summarize the issue with the client on the dashboard and click Add.
						Please note that the clock will not start until after these details
						are added
					</li>
					<li>
						<p>
							**It should not take longer than 3 minutes to confirm and verify
							that you can assist a customer with an issue. If you realize that
							this is outside of your scope, please put the customer back in the
							cue (click the Transfer button) so another technician can assist
							them**
						</p>
					</li>
					<li>After you add all of the details, click Submit.</li>

					<img src={require("./instructionimages/unnamed (6).png")} width="700px" className="img-fluid" alt="instruction7"/>

					<li>
						Once you submit the details, the customer will be prompted to select
						the issue and click Confirm.
					</li>
					<img src={require("./instructionimages/unnamed (7).png")} width="700px" className="img-fluid" alt="instruction8"/>

				</ul>
			</div>
			<div>
				<p>
					<b>Step 6: Resolve the issue</b>
				</p>
				<ul>
					<li>
						When working with your customer, make sure to address the specific
						issue they are having. Also make sure to ask if they would prefer
						for you to take over their screen or if they would like you to walk
						them through the process.
					</li>
					<li>
						If the customer would like you to take over their screen, they need
						to click Enable Remote on their screen. This has to be started on
						the Customers side. Once they click this, you are good to go.
					</li>
					<li>
						The first time you connect Remote with a Customer, you will have to
						know this. Click HERE.
					</li>
					<img src={require("./instructionimages/unnamed (8).png")} width="700px" className="img-fluid" alt="instruction9" />

					<p>
						In order to PAUSE a Remote Session, you will need to look at the
						bottom right of the screen to see the bar.
					</p>
					<p>
						IMPORTANT: If you are in the middle a Remote Session and the free 6
						minutes is up for a new customer, you MUST pause the Screen Share
						until they enter their Credit Card info to continue with the
						session.
					</p>
					<img src={require("./instructionimages/unnamed (9).png")} width="700px" className="img-fluid" alt="instruction10"/>

					<p>
						If at any point you realize you need to Convert to a Long Call,
						CLICK HERE for instructions on this portion.
					</p>
				</ul>
			</div>
			<div>
				<p>
					<b>Step 7: Ending the Call</b>
				</p>
				<ul>
					<li>
						Before ending the call, make sure to ask the customer the following
						questions:
						<ul>
							<li>Have I resolved your issue?</li>
							<li>Are you satisfied with the results of this call? </li>
							<li>
								If so, would you be willing to take 30 seconds to give feedback
								in the system once the call ends?
							</li>
							<li>
								The customer will automatically be prompted to give you a
								rating, so encourage them to do so.
							</li>
							<img src={require("./instructionimages/unnamed (10).png")} width="700px" className="img-fluid" alt="instruction11"/>

						</ul>
					</li>
				</ul>
			</div>
			<hr />
			<div>
				<div style={{ textAlign: "center", fontWeight: "bold" }}>
					<p style={{fontSize: currentStep ==111 && '25px'}}>Common Questions/Issues</p>
				</div>
				<p style={{fontSize: currentStep ==111 && '20px'}}>
					<b>1. Transfers</b>
				</p>
				<p>
					If you realize that the issue they are having is not something you can
					assist with, click the Transfer button on the bottom right to transfer
					it to the appropriate technician.
				</p>
				<img src={require("./instructionimages/unnamed (11).png")} width="700px" className="img-fluid" alt="instruction12"/>

				<p style={{fontSize: currentStep ==111 && '20px'}}>
					<b>2. Time Limit</b>
				</p>
				<p>
					Here at Geeker, we put our customers first. We want to ensure that we
					find a resolution quickly and easily. If a customer call is taking
					longer than usual (more than 30 minutes), then make sure to let them
					know that it is out of scope. We want to ensure that we address each
					customer’s questions. If they would like additional help, they are
					welcome to call back.
				</p>
				<p style={{fontSize: currentStep ==111 && '20px'}}>
					<b>3. Screen Share</b>
				</p>
				<p>
					In order to screen share with a customer, they must initiate that on
					their side. Have them click the Share button on their screen to do
					this.
				</p>
				<p>
					The customer will be prompted to download Zoho. Make sure to let them
					know and tell them it’s a quick download.
				</p>
				<img src={require("./instructionimages/unnamed (12).png")} width="700px" className="img-fluid" alt="instruction13" />

				<p>
					Let the Customer know that they must click Join in order to start the
					Remote Session.
				</p>
				<p style={{fontSize: currentStep ==111 && '20px'}}>
					<b>4. Remote Access/Control of Customer’s Computer</b>
				</p>
				<p>
					The first time a Technician enables Remote access, they will see this
					pop up. You must click Always allow pop-ups and redirects
				</p>
				<img src={require("./instructionimages/unnamed (13).png")} width="700px" className="img-fluid" alt="instruction14"/>

				<p>
					In order to take control of a customer’s screen, click Enable Remote.{" "}
				</p>
				<img src={require("./instructionimages/unnamed (14).png")} width="700px" className="img-fluid" alt="instruction15" />

				<p style={{fontSize: currentStep ==111 && '20px'}}>
					<b>5. Converting to Long Calls</b>
				</p>
				<ul>
					<li>
						If a job requires more time, you can suggest to the customer to
						extend the call.{" "}
					</li>
				</ul>
				<p style={{fontSize: currentStep ==111 && '20px'}}>
					<b>They have 2 options:</b>
				</p>
				<ul>
					<li>
						Fixed Hours: This is for a job that will take a long amount of time.{" "}
					</li>
					<li>
						Calculate per 6 minutes: This is for someone who needs to run but
						only needs a few more minutes to get their job done. They can leave
						the call as you complete their job.
					</li>
					<img src={require("./instructionimages/unnamed (15).png")} width="700px" className="img-fluid" alt="instruction16" />

					<li>
						The Customer will receive a notification on their side to approve
						the request. They must click APPROVE.
					</li>
					<img src={require("./instructionimages/unnamed (16).png")} width="700px" className="img-fluid" alt="instruction17" />

					<li>
						Once the customer hits approve, the End Meeting button for the
						technician will change to Back to Dashboard
					</li>

					<li>
						The technician will find their extended job on their Dashboard under
						Available Jobs
					</li>
					<img src={require("./instructionimages/unnamed (19).png")} width="700px" className="img-fluid" alt="instruction18" />

					
					<li>On the job, click Details</li>
					<li>
						Under the Conversations tab, you can chat with the Customer. This is
						the ONLY place where you will keep contact with the customer. Do NOT
						send emails to them.
					</li>
					<img src={require("./instructionimages/unnamed (17).png")} width="700px" className="img-fluid" alt="instruction19"/>

					<li>
						This is where the customer can send excel sheets or any other
						documents they need help with.
					</li>
					<li>
						Important: Do NOT open any files until you go to
						https://www.virustotal.com/gui/home/upload to ensure it does not
						have any viruses. Once you upload the file, it will quickly let you
						know if the file is infected or not.
					</li>
					<img src={require("./instructionimages/unnamed (18).png")} width="700px" className="img-fluid" alt="instruction20" />

					<li>
						When you are done, go to the top of the dashboard and click Submit
						for Approval. If you need to speak with the customer regarding their
						project, click Join.{" "}
					</li>
					<li>
						The Customer must Approve this on their end. They will receive an
						email notification to finalize the last step.
					</li>
					
						<img src={require("./instructionimages/unnamed21.png")} width="700px" className="img-fluid" alt="instruction21"/>
					
				</ul>
			</div>
			<hr />
			<div>
				<p>
					Unlike other support teams, who mainly use chat sessions, we help with
					live calls and screen sharing. This way, our customers feel fully
					supported with direct communication and hands-on, step-by-step
					guidance from you.
				</p>
				<p>
					As a Geek, you’ll earn money around your schedule and at the pace you
					set. Simply log in and work whenever - and wherever! - works best for
					you.Our payment structure is based on the amount of cases you
					successfully resolve. The more cases you complete, the more you earn.{" "}
				</p>
				<p>
					Ready to help people resolve their program issues? We’re ready to have
					you on board.
				</p>
				<div style={{ textAlign: "center" }}>
					<p>Welcome to Geeker…</p>
				</div>
				{currentStep ==111 ? '' :
					// <div className="text-center d-flex  justify-content-center flex-wrap">
					// 	<div>
					// 			<input
					// 			type="checkbox"
					// 			// value=""
					// 			checked={isChecked}
					// 			onChange={handleScroll}
					// 			style={{width:"20px",height:"20px"}}
					// 			/>
					// 		</div>
					// 		&nbsp; &nbsp; 
					// 	 <div>
					// 		<span className="instruction-label">
					// 			I have read and understood the instructions
					// 		</span>
					// 	 </div>

					// </div>
					<div  className="text-center d-flex  justify-content-center flex-wrap">
					<label
                    className="ml-2 tech-signup-check-container"
                    htmlFor="privacy&cookies"
                    style={{ fontSize: "15px", fontWeight: "400", margin: 0 }}
                  >
                    <input
                      type="checkbox"
                      id="privacy&cookies"
                      onChange={handleScroll}
                      className="tech-signup-checkbox"
                      style={{
                        width: "24px",
                        height: "24px",
                        border: "2px solid #2F3F4C",
                      }}
                    />
                    <span className="tech-signup-checkmark"></span>I have read and 
					understood the instructions
                    <a
                      style={{ color: "#01D4D5" }}
                    >
                      {" "}
                     
                    </a>{" "}
                    {" "}
                  </label>
               </div>
		
				}

			</div>
		</div>
	);
};

export default Instructions;