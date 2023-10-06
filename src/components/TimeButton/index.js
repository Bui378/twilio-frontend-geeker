import styled from 'styled-components';
import { Button } from 'antd';

const TimeButton = styled(Button)`
  background: ${props => props.type === 'unselected' ? '#fff' : props.theme.primary};
  font-size: 15px !important;
  align-items: center !important;
  display: flex !important;
  font-weight: bold !important;
  border-radius: 10px !important;
  padding: 0 20px !important;
  height: 40px !important;
  justify-content: center !important;
  margin-left: 20px !important;
  border-color: ${props => props.theme.primary} !important;
  color: ${props => props.type === 'unselected' ? props.theme.primary : '#fff'} !important;
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

export default TimeButton;
