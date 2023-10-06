import React, { useCallback, useEffect, useState } from "react"
import { Modal } from 'antd';
import { Player } from '@lottiefiles/react-lottie-player';
import { useAuth } from '../../../../context/authContext'
import * as SoftwareApi from '../../../../api/software.api';

const ExamFail = () => {

    const { logout } = useAuth()
    const [additionalSoftwareList, setAdditionalSoftwareList] = useState([]);

    /**
    * Return All active additional softwarelist
    * @author : Mritunjay Chaurasia
    **/
    useEffect(() => {
        (async () => {
            const additionalSoftwareListResponse = await SoftwareApi.getOtherSoftwareList();
            console.log('Addtional Software List : ', additionalSoftwareListResponse)
            if (additionalSoftwareListResponse && additionalSoftwareListResponse?.data) {
                setAdditionalSoftwareList(additionalSoftwareListResponse?.data.filter((software) => software.status === 'Active'))
            }
        })();
    }, [])

    /**
    * Function that handles the logout button to logout the user
    * @author : Kartik
    **/
    const Logout = useCallback(() => {
        Modal.confirm({
            title: 'Logout Now?',
            okText: 'Logout',
            cancelText: 'Cancel',
            className: "logout-modal",
            onOk() {
                logout();
            },
        });
    }, [logout]);

    return (
        <>
            <div className="w-100p">
                <div className="exam-fail-logout-btn-div w-100p d-flex justify-content-end">
                    <a href="#" onClick={Logout} className="logout-btn">
                        Logout
                    </a>
                </div>
                <div className="exam-fail-animation-div w-100p">
                    <Player
                        autoplay
                        keepLastFrame={true}
                        src="https://assets9.lottiefiles.com/packages/lf20_ckcn4hvm.json"
                        className="exam-fail-animation"
                    >
                    </Player>
                </div>
                <div className="exam-fail-message-div w-100p">
                    <h1 className="mt-0 mb-2 ">Thanks for taking the time to join Geeker!!</h1>
                    <h5>Unfortunately, you can't proceed further as you didn't cleared our first round of interview.</h5>
                </div>
                <div className="exam-fail-message-div w-100p mt-5">
                    <div>
                        <h5 className="mb-3">You can try to qualify for a different area.</h5>
                        <div className='additionalSoftwaresList'>
                            {additionalSoftwareList && additionalSoftwareList.length > 0 && additionalSoftwareList.map((additionalSoftwareList, i) => {
                                return (
                                    <img
                                        className="additionalSoftwareImage"
                                        alt={additionalSoftwareList.name}
                                        src={additionalSoftwareList.blob_image}
                                        title={additionalSoftwareList?.name}
                                    />
                                )
                            })}
                        </div>
                    </div>
                    <h5 className="mt-5">For additional details, please contact{" "}
                        <a href="mailto:info@Geeker.co">
                            <span className="geekerMailInfo">info@Geeker.co</span>
                        </a>. All the best!</h5>
                </div>

            </div>
        </>
    )
}

export default ExamFail
