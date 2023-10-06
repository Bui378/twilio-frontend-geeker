import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
// import { Typography } from 'antd';
import Header from '../../components/Header';
import StepButton from 'components/StepButton';
import Box from 'components/common/Box';
// import { useJitsiMeet } from 'context/jitsiMeetContext';
import Loader from 'components/Loader';
// const { Title } = Typography;
let api = null;
export default function () {
    const [hasUserLeft, setHasUserLeft] = useState(false)
    const { roomId } = useParams()
    // const [isLoading, setIsLoading] = useState(false)
    const isLoading = false;
    /*const {
        getJitsiMeet, createMeeting, meetingInfo, meetingId,
    } = useJitsiMeet();*/


    const jitsiContainerId = '6063bd22202fb514ce26346b123';

    const loadJitsiScript = () => {
        let resolveLoadJitsiScriptPromise = null;

        const loadJitsiScriptPromise = new Promise((resolve) => {
            resolveLoadJitsiScriptPromise = resolve;
        });

        const script = document.createElement('script');
        // script.src =
        //   "https://shard1-tetch-front.panthermediasystem.net/external_api.js"; //mytestroom
        script.src = 'https://winkit.ml/external_api.js'; // winkit.ml mytestroom
        script.async = true;
        script.onload = () => initialiseJitsi();
        document.body.appendChild(script);

        return loadJitsiScriptPromise;
    };
    // console.log('serrrr', user);


    const initialiseJitsi = async () => {
        try {
            if (!window.JitsiMeetExternalAPI) {
                await loadJitsiScript();
            }


            // console.log('meetingLink: ', meetingLink);
            // console.log('meetingJWT: ', meetingJWT);

            api = new window.JitsiMeetExternalAPI(
                'winkit.ml',
                {
                    interfaceConfigOverwrite: {
                        SHOW_PROMOTIONAL_CLOSE_PAGE: false,

                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,

                    },
                    configOverwrite: {
                        brandingRoomAlias: "https://google.com",
                        startScreenSharing: false,
                        startWithAudioMuted: true,
                        notifications: [],
                        startWithVideoMuted: true,
                        toolbarButtons: [
                            'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'shareaudio', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'select-background', 'download', 'help', 'mute-everyone', 'mute-video-everyone', 'security',
                        ],
                    },

                    parentNode: document.getElementById(jitsiContainerId),
                    roomName: roomId,

                    displayname: 'Screen Sharing',
                    userInfo: {
                        displayName: "Guest",
                        id: 1,
                    },
                },
            );

            api.on('videoConferenceLeft', () => {
                if (api) {
                    api.executeCommand('hangup');
                }
                setHasUserLeft(true)


            });


        } catch (error) {
            console.log("error", error)
            //    console.log('error from initialize jitsi');
        }
    };

    useEffect(() => {
        loadJitsiScript()
    }, []);

    return (
        <div className="w-85">
            <Header link="/" display />
            <CustomerShareScreenWrapper>

                <ShareScreenWrapperStyled>

                    <Box
                        display="flex"
                        direction="column"
                        alignItems="center"
                        height="75vh"
                    >
                        {hasUserLeft ? (
                            <Box marginBottom={10} marginTop={10}>
                                <StyledButton >
                                    You have left the meeting, reload the browser if you want to rejoin
                                </StyledButton>
                            </Box>
                        ) : (
                            <div style={{ position: "relative", width: "100%" }}>
                                {isLoading && (
                                    <div style={{ "top": "0", "left": "0", "position": "absolute", "bottom": "0", "right": "0", "background": "rgba(0,0,0,0.5)" }}>
                                        <Loader height={"50vh"} />
                                    </div>
                                )}
                                <ScreenShareContainer id={jitsiContainerId} />
                            </div>
                        )}


                    </Box>


                </ShareScreenWrapperStyled>
            </CustomerShareScreenWrapper>
        </div>
    );
};

const CustomerShareScreenWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  position: relative;
`;

const ShareScreenWrapperStyled = styled.div`
  margin-left: 10px;
  width: 100%;
`;

const ScreenShareContainer = styled.div`
  width: 100%;
  object-fit: cover;
  height: 75vh;
`;

const StyledButton = styled(StepButton)`
  width: 250px !important;
   margin-top:20px;
  span {
    white-space: break-spaces;
  }
`;
