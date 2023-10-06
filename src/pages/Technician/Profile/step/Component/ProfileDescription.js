import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import mixpanel from 'mixpanel-browser';
import messages from '../../messages';
import { Row, Col, Form } from 'antd';
import { openNotificationWithIcon } from '../../../../../utils';
import { useUser } from '../../../../../context/useContext';
import * as TechnicianApi from '../../../../../api/technician.api';
import BasicButton from 'components/common/Button/BasicButton';
import ReactQuill from 'react-quill'
import 'quill/dist/quill.snow.css'
function ProfileDescription(props) {
    const digitRegex = /(\d{801,})|([A-Za-z]{801,})/;
    const { setTechProfile, techProfile } = props;
    const { user } = useUser();
    const [technicianProfileDesc, setTechnicianProfileDesc] = useState('');
    const [isTechReview, setIsTechReview] = useState(false)
    const [exceedsLimit, setExceedsLimit] = useState(false)
    const [showSpinner, setShowSpinner] = useState(false);
    const quillRef = useRef(null);
    useEffect(() => {
        const temptechProfile = { ...techProfile };
        temptechProfile.profileDescription.complete = true;
        setTechProfile(temptechProfile);
    }, []);

    useEffect(() => {
        (async () => {
            if (user && user.id) {
                const TechdData = await TechnicianApi.retrieveTechnicianBysomeParams({ "user": user.id });
                if(TechdData && TechdData.length > 0 && TechdData[0]?.profileDescription){
                    setTechnicianProfileDesc(TechdData[0].profileDescription);
                }
            }
        })()
    }, [user]);


    const validateContent = (content) => {
        if (digitRegex.test(content)) {
            setExceedsLimit(true);
        } else {
            setExceedsLimit(false);
        }
    };


    const handlePaste = (event) => {
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');
        if (digitRegex.test(pastedText)) {
            setExceedsLimit(true);
        } else {
            setExceedsLimit(false);
        }
    };

    const handleComplete = async () => {
        try {
            if (user && user.email) {
                mixpanel.identify(user.email);
                mixpanel.track('Technician - Update profile description');
            }
            if (quillRef.current) {
                const quillEditor = quillRef.current?.getEditor();
                const htmlContent = quillEditor?.root.innerHTML;
                // Convert HTML to plain text
                const parser = new DOMParser();
                const parsedHtml = parser.parseFromString(htmlContent, 'text/html');
                const plainText = parsedHtml.body.textContent || '';
                const enterText = plainText.trim()
                console.log("enter text length>>",enterText.length)
                if (enterText == '') {
                    setIsTechReview(true);
                } else {
                    setIsTechReview(false)
                    if (enterText.length > 800) {
                        setExceedsLimit(true);
                    } else {
                        setExceedsLimit(false);
                        setShowSpinner(true)
                        await TechnicianApi.updateTechnician(user.technician.id, { profileImage: false, profileDescription: technicianProfileDesc }).then((res) => {
                            if (res) {
                                setTimeout(() => {
                                    setShowSpinner(false);
                                    setTechProfile(prev => ({
                                        ...prev,
                                        profileDescription: {
                                            ...prev.profileDescription,
                                            complete: true,
                                        },
                                    }));
                                    openNotificationWithIcon('success', 'Success', 'Profile review submitted successfully.');
                                }, 800)
                            }
                        });
                    }
                };
            };
        } catch (e) {
            console.log("Error occurs while technician submit his profile description.", e)
        };
    };

    let modules = {
        toolbar: [
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
                { align: [] }
            ],
            [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
        ]
    };

    let formats = [
        "header", "height", "bold", "italic",
        "underline", "strike", "blockquote",
        "list", "color", "bullet", "indent",
        "link", "align", "size",
    ];

    return (
        <>
            <Form>
                <div className='w-100 mb-3'>
                    <Row>
                        <Col className='w-100'>
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={technicianProfileDesc}
                                modules={modules}
                                formats={formats}
                                placeholder="write your profile description.."
                                onChange={(text) => {
                                    setTechnicianProfileDesc(text);
                                    validateContent(text);
                                }}
                                onPaste={handlePaste}
                            />
                        </Col>
                    </Row>
                    {isTechReview && (
                        <div className="error-message" style={{ color: "red" }}>
                            <FormattedMessage {...messages.profileDescription} />
                        </div>
                    )}
                    {exceedsLimit && (
                        <div className="error-message" style={{ color: "red" }}>
                            <FormattedMessage {...messages.profileDescExceedsLimit} />
                        </div>
                    )}
                </div>
                <BasicButton disable={showSpinner} onClick={handleComplete} btnTitle={"Save"} height={"50px"} width={"166px"} background={"#01D4D5"} color={"#FFFFFF"} showSpinner={showSpinner} />
            </Form>
        </>
    );
};

export default ProfileDescription;
