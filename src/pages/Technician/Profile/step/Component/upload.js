import React, { useState, useEffect } from 'react';
import {
  Upload, message, Space, notification,
} from 'antd';
import {Button} from "react-bootstrap";
import PropTypes from 'prop-types';
import { InboxOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SERVER_URL } from '../../../../../constants';
import {useUser} from '../../../../../context/useContext';
import * as TechnicianService from '../../../../../api/technician.api';
const { Dragger } = Upload;

const UploadFile = props => {
  const {user} = useUser()
  const {
    title, description, type, setTechProfile, sectionName
  } = props;


  // const the_date = Math.random()
  const [defaultImage,setDefaultImage] = useState('')
  const [fileList, setFileList] = useState([]);
  const imageFileTypes = '.png, .jpg, .jpeg, .gif';
  const openNotificationWithIcon = (nType, header, nMessage) => {
    notification[nType]({
      message: header,
      description: nMessage,
    });
  };



  useEffect(()=>{

    if(sectionName === "confirmId"){
      // console.log(">>>user.technician.",user.technician)
      setDefaultImage(user.technician.profile.confirmId.imageUrl)
      // console.log(">this is the image url -----------",String(user.technician.profile.confirmId.imageUrl))
      // setFileList([user.technician.profile.confirmId.imageUrl])
    }

  },[])

  useEffect(() => {
    if (sectionName === 'profileImage') {
      setTechProfile(prev => ({
        ...prev,
        [sectionName]: {
          ...prev[sectionName],
          imageUrl: fileList[0]
            ? `${SERVER_URL}/images/${fileList[0].response}`
            : null,
          complete: fileList.length > 0,
        },
      }));
    } else {
      setTechProfile(prev => ({
        ...prev,
        [sectionName]: {
          ...prev[sectionName],
          imageUrl: fileList[0]
            ? `${SERVER_URL}/images/${fileList[0].response}`
            : null,
        },
      }));
    }
  }, [fileList, sectionName, setTechProfile]);

  const fileName = `${user.id}`

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: imageFileTypes,
    fileList,
    action: `${SERVER_URL}/api/uploads`,
    data:{"user":( sectionName==="confirmId"?`${fileName}-license` :`${fileName}` )},
    beforeUpload: file => {
      if (
        !(
          file.type === 'image/jpeg'
          || file.type === 'image/jpg'
          || file.type === 'image/gif'
          || file.type === 'image/png'
          || file.type === ''
        )
      ) {
        openNotificationWithIcon('error', 'Warning', 'Please upload a document of type JPEG, JPG, GIF, or PNG.');
        return false;
      }

      if (file.size / 1048576 > 10) {
        message.error('Image must be smaller than 10MB!');
        return false;
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', async event => {
          const loadedImageUrl = event.target.result;
          const image = document.createElement('img');
          image.src = loadedImageUrl;
          await new Promise((imageLoadResolve) => {
            image.addEventListener('load', () => {
              const { width, height } = image;
              if (width < 160 || width > 5000 || height < 160 || height > 5000) {
                openNotificationWithIcon(
                  'error',
                  'Warning',
                  'Please upload a document with dimensions between 160px and 5000px.',
                );
                reject();
              } else {
                resolve();
              }
              imageLoadResolve();
            });
          });
        });
      });
    },
    onChange(info) {
      const { status } = info.file;
      console.log(info.file,">>>.my infor")

      setFileList([info.file]);
      if (status === 'removed') {
        setFileList([]);
      }
      if (status === 'done') {
        console.log(">>>>>>>>fileName>>>>>",fileName)
        if(sectionName === "profileImage"){
            TechnicianService.updateTechnician(user.technician.id,{profileImage:{imageUrl:`${fileName}.${info.file.name.split('.').pop()}`}})
        }
        else if (sectionName === "confirmId"){
           TechnicianService.updateTechnician(user.technician.id,{profileImage:false,confirmId:{imageUrl:`${fileName}-license-.${info.file.name.split('.').pop()}`}})

          // TechnicianService.updateTechnician(user.technician.id,{profileImage:{imageUrl:false}},profile:{image:imageUrl:fileName+'.'+`${info.file.name.split('.').pop()}`})
        }
        
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        setFileList([]);
        message.error(`${info.file.name} file upload failed.`);
      }
    },

  };
  return (
    <DraggerContainer {...uploadProps}>

      {defaultImage && sectionName === "confirmId" ? (
        <UploadedImage

          src={`${SERVER_URL}/images/${defaultImage}`}
          type={type}
        />
      ) : (
        <Space direction="vertical" align="center">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{title}</p>
          <p className="ant-upload-hint">{description}</p>
          <Button className="btn app-btn"><span></span>Upload</Button>
        </Space>
      )}
    </DraggerContainer>
  );
};

UploadFile.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  type: PropTypes.string,
  setTechProfile: PropTypes.func,
  techProfile: PropTypes.object,
  sectionName: PropTypes.string,
};

UploadFile.defaultProps = {
  title: 'Drag & Drop or Upload Photo',
  description: 'Please upload photo.',
  type: 'profile',
  setTechProfile: () => {},
  techProfile: {},
  sectionName: 'profileImage',
};

const DraggerContainer = styled(Dragger)`
  background: #fff;
  .ant-upload .ant-upload-drag-container {
    justify-content: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;
const UploadedImage = styled.img`
  width: ${props => (props.type === 'profile' ? '250px' : '50%')};
  height: ${props => (props.type === 'profile' ? '250px' : '50%')};
  object-fit: cover;
  border-radius: ${props => (props.type === 'profile' ? '50%' : 'none')};
`;


export default UploadFile;
