import styled from 'styled-components';
import { Button } from 'antd';

const StepButton = styled(Button)`

  font-size: 15px !important;
  align-items: center !important;
  display: flex !important;
  font-weight: bold !important;
  border-radius: 10px !important;
  height: 60px !important;
  width: 250px !important;
  justify-content: center;
  margin-left: 20px !important;
  background-color : ${props => props.backgroundColor ? props.backgroundColor : props.theme.primary}  !important;
  border-color: ${props => props.border_color ? props.border_color : props.theme.primary} !important;
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
  }
`;

export default StepButton;
