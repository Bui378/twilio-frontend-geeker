import React , { useEffect, useState }from "react"
import * as UserApi from "../../api/users.api"
import Loader from '../../components/Loader';
import {soshanaContactDetails} from '../../constants/index'

const AccountManagerReference = ({user}) => {

    const [ownerInformation, setOwnerInformation] = useState()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [geekerAdminAssigned, setGeekerAdminAssigned] = useState(false)
    const [ showLoader, setShowLoader ] = useState(true)

    useEffect(()=>{
        (async()=>{
            if(user){
                console.log("userOwnerId : user info in sidebar is ",user)
                let userOwnerId = (user?.roles.indexOf('owner') !== -1) ? user.id : user.ownerId;
                console.log("userOwnerId info in sidebar is ",userOwnerId)
                const ownerUserInfo = await UserApi.getUserById(userOwnerId)
                if(ownerUserInfo){
                    console.log("My console for ownerUserInfo from AccountManagerReference", ownerUserInfo)
                    setOwnerInformation(ownerUserInfo)
                    if(ownerUserInfo.geekerAdmin){
                        if(typeof ownerUserInfo.geekerAdmin.first_name !== String){
                            setFirstName(ownerUserInfo.geekerAdmin.first_name[0])
                        }else{
                            setFirstName(ownerUserInfo.geekerAdmin.first_name)
                        }
                        setLastName(ownerUserInfo.geekerAdmin.last_name)
                        setEmail(ownerUserInfo.geekerAdmin.email)
                        setGeekerAdminAssigned(true)
                        setShowLoader(false)
                    }else{
                        setShowLoader(false)
                    }
                }else{
                    setShowLoader(false)
                }
            }else{
                setShowLoader(false)
            }
        })()
    },[])

    if (showLoader) return <Loader height="40%"/>;

    return <div className="account-manager-ref-div">
        <span>
            Hi, I'm your Geeker Account Manager, please reach out to me with any issues or questions
        </span>
        <hr></hr>
        <div className="d-flex flex-column text-right">
        {geekerAdminAssigned ?
            <>
                <span>{firstName + " " + lastName}</span>
                <span>
                    <a href={`mailto:${email}`}>
                        {email}
                    </a>
                </span>
                {email === soshanaContactDetails.email ? <span>{soshanaContactDetails.phoneNumber}</span> : ""}
            </>
            :
            <>
                <span>{soshanaContactDetails.name}</span>
                <span>
                    <a href={`mailto:${soshanaContactDetails.email}`}>
                        {soshanaContactDetails.email}
                    </a>
                </span>
                <span>{soshanaContactDetails.phoneNumber}</span>
            </>
        }
        </div>
    </div>
}

export default AccountManagerReference