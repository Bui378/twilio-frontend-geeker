import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Button as ButtonAntd } from 'antd';
import { WechatOutlined, CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUser } from '../../context/useContext';
import { useTools } from 'context/toolContext';
const ChatButton = () => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [hideExpand, setHideExpand] = useState(false);
 
  const {iconChange, setIconChange ,expanded, setExpanded ,isVisible, setIsVisible,showIframe,setShowIframe} = useTools();

  // useEffect(() => {
  //     if (user) {
  //         setName((user.firstName + ' ' + user.lastName))
  //         if (user.userType === "customer" && user.customer) {
  //             setPhoneNumber(user?.customer?.phoneNumber);
  //             setUserTypeStatus(user.customer.customerType);
  //         }
  //         else if (user.userType === "technician" && user.technician) {
  //             setPhoneNumber(user?.technician?.profile?.confirmId?.phoneNumber);
  //             setUserTypeStatus(user.technician.technicianType);
  //         }
  //     }
  // }, [user])

  useEffect(() => {
    const div = document.getElementById("slide-div");

    if (isVisible) {
      // Show the div by setting its height to its scrollHeight
      div.style.height = `${div.scrollHeight}px`;
      div.style.boxShadow = '1px 1px 20px 1px #888888';
    } else {
      // Hide the div by setting its height to 0
      div.style.height = "0px";
      div.style.boxShadow = 'none';
    }
  }, [isVisible]);

  const handleExpandCollapse = () => {
    setExpanded(!expanded);
  };

  const onHandleIframe = () => {
    setIsVisible(!isVisible);
    setIconChange(!iconChange);
    setShowIframe(true);
  }

  /**
  * @author : Kartar Singh
  */

  return (
    <>

      <div className={`slider1 tran-eff slider-div1 `} id="slide-div" style={{ width: `${expanded ? '70%' : '380px'}`, height: `${expanded ? '86%' : isVisible ? "696px" : 0}` }}>
        {/* {expanded
          ?
          <ShrinkOutlined onClick={handleExpandCollapse} className={'tran-eff shrinkOutlined'} />
          :
          <ArrowsAltOutlined onClick={handleExpandCollapse} className={'tran-eff shrinkOutlined'} />
        } */}

        {/* <div id='head' className={`tran-eff-2 head-bot`} style={{ width: `${expanded ? '100%' : '380px'}`, height: `${expanded ? '' : '60px'}` }}>
          <h2 className='geek-logo'>Geeker</h2></div> */}

        {showIframe && (
          <iframe
            src="https://fxo.io/m/proactive-monitored-7140"
            id="iframe"
            name="myIFrame"
            className='tran-eff-2 flowxo-iframe'
            style={{ width: `${expanded ? '100%' : '380px'}`, height: `${expanded ? '93%' : '636px'}` }}>
          </iframe>
        )}  

      </div>

      <ButtonAntd type="primary" shape="circle" icon={iconChange ? <CloseOutlined style={styles.icon} />
        : <WechatOutlined style={styles.icon} />} size="large" style={styles.button} onClick={onHandleIframe} />
    </>
  );
};

export default ChatButton;

export const styles = {
  icon: {
    color: 'white',
    fontSize: '28px',
    margin: '0px',
    padding: '5px'
  },
  button: {
    backgroundColor: '#3ed7d3',
    border: 'none',
    width: '60px',
    height: '60px',
    position: 'fixed',
    bottom: '15px',
    right: '15px',
    zIndex: '3',
    boxShadow: 'rgb(136, 136, 136) 1px 1px 10px 1px'
  }

}