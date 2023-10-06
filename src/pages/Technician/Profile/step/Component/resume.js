import { Upload, message,notification,} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import {  Button } from 'react-bootstrap';
import { useUser } from '../../../../../context/useContext';
import { SERVER_URL } from '../../../../../constants';
import * as TechnicianService from '../../../../..//api/technician.api';
import { useAuth } from '../../../../../context/authContext';
const EditResume = ()=>{
  const {user} = useUser();
  const {refetch} = useAuth();
  const [showEditor,setShowEditor] = useState(false)
  const [haveResume,setHaveResume] = useState(true)
  const [fileList, setFileList] = useState([]);
  const openNotificationWithIcon = (nType, header, nMessage) => {
    notification[nType]({
      message: header,
      description: nMessage,
    });
  };

  useEffect(()=>{
    if(user){
      console.log("user.technician.resume :::::::",user.technician.resume)
      console.log("condition :::::",user.technician.resume != undefined && user.technician.resume === "")
      if(user.technician.resume === undefined){
        console.log("inside if")
          setShowEditor(true)
          setHaveResume(false)
      }
    }
  },[user])
  const fileTypes = '.png, .jpg, .jpeg, .pdf, .doc';
  const { Dragger } = Upload;
  let fileName = `${user.id}_resume`

  const props = {
    name: 'file',
    multiple: false,
    fileList:fileList,
    accept:fileTypes,
    action: `${SERVER_URL}/api/uploads`,
    data:{"user":`${fileName}` },
    maxCount :1,
    beforeUpload: file => {
      if(fileList.length >= 1){
        openNotificationWithIcon('error', 'Warning', 'Only one file is allowed. Please delete remove the previous one first');
        return false;
      }
      if (
        !(
          file.type === 'image/jpg'
          || file.type === 'application/pdf'
          || file.type === 'image/png'
          || file.type === 'image/jpeg'
          || file.type === 'application/msword'
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
          console.log(">>>>>>>>>>>>>>file name :::" ,fileName)
          openNotificationWithIcon('success','Success',`${info.file.name} file uploaded successfully.`);
          await TechnicianService.updateTechnician(user.technician.id,{resume:`${fileName}-.${info.file.name.split('.').pop()}`})
          await refetch()
          
          setShowEditor(false)
          setHaveResume(true)
          // window.location.href = "/"
      } else if (status === 'error') {
        setFileList([])
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove (){
      setFileList([])
    }
  };

  return (
      <>
        <div className="col-12 mx-auto">
        {!showEditor ? 
        <div className='row'>
        <div className="col-md-6 col-xs-6 d-flex justify-content-around mt-2">
          <h6>
            <a href={`${SERVER_URL}/images/${user.technician.resume}`} download="myresume">
              Download your resume
            </a>
          </h6>
          </div>

          <div className='col-md-6 col-xs-6'>
          <Button onClick={()=>{setShowEditor(true)}} className="btn app-btn app-btn-super-small">
            Edit Resume
          </Button>
          </div>
        </div>
        :<><Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click this area to upload your resume</p>
            </Dragger>
            <div className="mt-2">
              {haveResume && <Button onClick={()=>{setShowEditor(!showEditor)}} className="btn app-btn app-btn-small" > Cancel </Button>}
            </div>
            </>
         }
             
        </div>
      </>
    )

}
export default EditResume;