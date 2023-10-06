import { Row, Col, Typography,Button } from 'antd';
import styled from 'styled-components';
const ActionButton = styled(Button)`
background: black!important;
font-size: 15px !important;
align-items: center !important;
display: flex !important;
font-weight: bold !important;
border-radius: 10px !important;
height: 40px !important;
width: 100px !important;
justify-content: center;
margin-left: 10px !important;
margin-top:10px;
border-color: ${props => props.theme.primary} !important;
color: ${props => (props.type === 'back' ? props.theme.primary : '#fff')} !important;
&:hover {
  background: ${props => (props.type === 'back' ? '#fff' : '#908d8d')} !important;
  color: ${props => (props.type === 'back' ? '#464646' : '#fff')} !important;
  border-color: ${props => props.theme.primary} !important;
}
&:active {
  background: ${props => (props.type === 'back' ? '#fff' : '#908d8d')} !important;
  color: ${props => (props.type === 'back' ? '#464646' : '#fff')} !important;
  border-color: ${props => props.theme.primary} !important;
}
&:focus {
  background: ${props => (props.type === 'back' ? '#fff' : '#908d8d')} !important;
  color: ${props => (props.type === 'back' ? '#464646' : '#fff')} !important;
  border-color: ${props => props.theme.primary} !important;
} `

export default ActionButton;