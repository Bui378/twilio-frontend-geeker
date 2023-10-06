import { Upload, message,notification,} from 'antd';
import { InboxOutlined,} from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { FaUserCircle } from "react-icons/fa"
import {  Button } from 'react-bootstrap';
import { useUser } from '../../../../../context/useContext';
import { SERVER_URL } from '../../../../../constants';
import * as TechnicianService from '../../../../../api/technician.api';
import { useSocket } from '../../../../../context/socketContext';
import { useAuth } from '../../../../../context/authContext';
import { useTools } from 'context/toolContext';
let r = (Math.random() + 1).toString(36).substring(7);
const UploadAvatar =({setTechProfile,techProfile,setProfilePicUpdated}) => {

  const {user,setUser} = useUser();
  const {refetch} = useAuth();
  const { socket } = useSocket();
  const [showEditor,setShowEditor] = useState(false)
  const [geekImage,setGeekImage] = useState();
  const [profileImage,setProfileImage]= useState(true)
  const [fileList, setFileList] = useState([]);
  const {imageupload, 
		setImageupload,imageChange, setImageChange} = useTools();
 
  const openNotificationWithIcon = (nType, header, nMessage) => {
    notification[nType]({
      message: header,
      description: nMessage,
    });
  };
  useEffect(()=>{
    if(user && user?.technician?.profile?.image)
    setGeekImage(user && user.technician.profile.image.length > 0 ? user.technician.profile.image : "" )
  },[user])
  const fileTypes = '.png, .jpg, .jpeg';
  const { Dragger } = Upload;
  let  fileNameImage = `${user.id}_userProfile_${r}`;

  const props = {
    name: 'file',
    multiple: false,
    fileList:fileList,
    accept:fileTypes,
    action: `${SERVER_URL}/api/uploads`,
    data:{"user":`${fileNameImage}` },
    maxCount :1,
    beforeUpload: file => {
      if(fileList.length > 0){
        openNotificationWithIcon('error', 'Warning', 'Only one file is allowed.Please delete remove the previous one first');
        return false;
      }
      if (
        !(
          file.type === 'image/jpg'
          || file.type === 'image/png'
          || file.type === 'image/jpeg'
        )
      ) {
        openNotificationWithIcon('error', 'Warning', 'File Type Not Supported');
        return false;
      }

      if (file.size / 1048576 > 10) {
        openNotificationWithIcon('error', 'Warning', 'file should be smaller than 10mb');
        return false;
      }
    },
    async onChange(info) {

      
      const { status } = info.file;
      console.log("info.file ::::::",info.file)
      if (status !== 'uploading') {

        console.log(info.file, info.fileList);
      }
      if (status === 'uploading') {
        setFileList([info.file]);
      }
      if (status === 'done') {
        openNotificationWithIcon('success','Success',`${info.file.name} file uploaded successfully.`);
        let finalImage = `${fileNameImage}-.${info.file.type.split('/').pop()}`;
        console.log(">>>>>>>>>>>>>>file name :::" ,finalImage)
          let techUpdate = await TechnicianService.updateTechnicianWithParams( user.technician.id ,{"profile.image":`${SERVER_URL}/images/${finalImage}`})
          setImageupload(true);
          setImageChange(`${SERVER_URL}/images/${finalImage}`);
          setFileList([info.file]);
          setGeekImage(`${SERVER_URL}/images/${finalImage}`)
          setShowEditor(false)
          setProfileImage(true);
         
      } else if (status === 'error') {
        setFileList([])
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    async onRemove (){
      setFileList([])
      setImageChange("");
      setImageupload(false);
      setGeekImage("")
      let techUpdate = await TechnicianService.updateTechnicianWithParams( user.technician.id ,{"profile.image":""})
       refetch()
      r = (Math.random() + 1).toString(36).substring(7);
         
    }
  };

  return (
    <div className="col-12 mx-auto">
      
        <><Dragger {...props}>
          
        { geekImage ? 
          <img src={geekImage}  className="geekImageSetting"></img>
          :
          <FaUserCircle className="geekImageSetting" />
        }
              <p className="ant-upload-text">Click this area to upload your Image</p>
            </Dragger>
          
            </>
         
             
        </div>
  );
};



export default UploadAvatar;