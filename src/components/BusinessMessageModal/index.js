import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import {updateUser, getUserById } from "../../api/users.api"
import { BsX } from "react-icons/bs";
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import { roleStatus } from '../../utils/index';
import { useSocket } from '../../context/socketContext';
function MyVerticallyCenteredModal(props) {
    const { socket } = useSocket();
    const [message, setMessage] = useState('');

    useEffect(() => {
        (async () => {
            if (props?.user && props?.user?.userType === 'customer') {
                const haveOwnerId = props?.user?.ownerId;
                let userDetails;
                if (haveOwnerId && haveOwnerId !== null) {
                    userDetails = await getUserById(props.user.ownerId)
                } else {
                    userDetails = await getUserById(props.user.id)
                };
                setMessage(userDetails?.business_details?.businessInfoMessage);
            }
        })()
    }, [props.user])

    useEffect(() => {
        (async () => {
             socket.on("updated-business-message",(data) => {
                   if(data && (data?.userId === props?.user?.id) || (data?.userId === props?.user?.ownerId)){
                    setMessage(data?.businessInfoMessage);
                   }
             })
        })()
    }, [socket])

    return (
        <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Business Message
                </Modal.Title>
                <Modal.Title
                    title='Close'
                    onClick={props.onHide}
                    style={{ cursor: 'pointer' }}
                ><BsX /></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div dangerouslySetInnerHTML={{ __html: message }}></div>
            </Modal.Body>
        </Modal>
    );
}

const BusinessMsgModal = ({ user}) => {
    const { socket } = useSocket();
    const [modalShow, setModalShow] = useState(false);
    const [showOwner,setShowOwner] = useState(false)
    const [showAdmin,setShowAdmin] = useState(false)
    const [showUser,setShowUser] = useState(false)

    useEffect(() => {
        (async () => {
            socket.on("seen-current-message", (data) => {
                if (data && (data?.id === user?.id) || (data?.id === user?.ownerId) && data?.businessMessNofication) {
                    setShowOwner(data?.businessMessNofication?.ownerNotify)
                    setShowAdmin(data?.businessMessNofication?.adminNotify)
                    setShowUser(data?.businessMessNofication?.userNotify)
                }
            })

            socket.on("updated-business-message", (data) => {
                if (data  && (data?.userId === user?.id) || (data?.userId === user?.ownerId)) {
                    setShowOwner(true)
                    setShowAdmin(true)
                    setShowUser(true)
                }
            })
        })()
    }, [user,socket]);

    let customerUserId;
    if (user && user?.ownerId && user?.ownerId !== null) {
        customerUserId = user?.ownerId
    } else {
        customerUserId = user.id
    };
    useEffect(()=>{
        (async()=>{
            const userData = await getUserById(customerUserId)
            if(userData && userData?.businessMessNofication){
                setShowOwner(userData?.businessMessNofication?.ownerNotify)
                setShowAdmin(userData?.businessMessNofication?.adminNotify)
                setShowUser(userData?.businessMessNofication?.userNotify)
            }
        })()
    },[customerUserId])

    const handleClickModal = async() => {
        setModalShow(true)
        if(user.roles.includes(roleStatus.OWNER)){
            await updateUser({ userId: customerUserId,businessMessNofication:{ownerNotify:false}}) 
        }else if(user.roles.includes(roleStatus.ADMIN)){
            await updateUser({ userId: customerUserId,businessMessNofication:{adminNotify:false}})
        }else if(user.roles.includes(roleStatus.USER)){
            await updateUser({ userId: customerUserId,businessMessNofication:{userNotify:false}})
        }
        socket.emit("show-business-message",{
            userId:customerUserId
        })
    };

    return (
        <>
            <div
                className='businessMessModal'
                onClick={handleClickModal}
                title='Business Message'
            >
                <Badge color="secondary" variant="dot" className="MuiBadge-badge"  invisible={user.roles.includes(roleStatus.OWNER) ? !showOwner : user.roles.includes(roleStatus.ADMIN) ? !showAdmin : user.roles.includes(roleStatus.USER) ? !showUser : "" }>
                    <MailIcon />
                </Badge>
                <span className='pl-3'>Business Message</span>
            </div>

            <MyVerticallyCenteredModal
                user={user}
                show={modalShow}
                onHide={() => setModalShow(false)}
            />
        </>
    );
}

export default BusinessMsgModal;