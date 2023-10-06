import {
  Button, Typography, Select, Checkbox, Steps,
} from 'antd';
import styled from 'styled-components';
// import H2 from '../../../../components/common/H2';

const { Text, Title } = Typography;
const { Step } = Steps;

const ActionNextButton = styled(Button)`
  background: #464646;
  font-size: 15px;
  align-items: center;
  display: flex;
  font-weight: bold;
  border-radius: 10px;
  padding: 30px 75px;
  &:hover {
    background: #908d8d;
  }
`;


const BodyContainer = styled.div`
  background: ${props => props.background};
  margin-bottom: 50px !important;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content:space-around;
  align-items: center;
  padding: 30px 40px;
  min-height:315px;
  box-shadow :${props => props.boxshadow ? props.boxshadow :''}
`;


const ActionPrevButton = styled(Button)`
  padding: 0 40px;
  margin: 0 8px;
`;
const StepActionContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom:10px;
  &.steps-action {
    marginRight :90px;
  }
`;

const LabelText = styled(Text)`
  margin-bottom: 10px;
  display: block;
  font-size: 15px;
`;

const TechSelect = styled(Select)`
  .ant-select-selector {
    min-width: 300px !important;
    height: 45px !important;
    border: 0px none !important;
    background-color: transparent !important;

    align-items: center;
    border-bottom : 1px solid #7A8994 !important;

  }
  .ant-select-selection-item {
    display: flex;
    cursor:pointer !important;
  }
  .ant-select-selection-search {
    display: flex;
    align-items: center;
    cursor:pointer !important;
  }
  .ant-select-selection-placeholder {
    text-align: left;
    color:#7A8994 !important;
    cursor:pointer !important;
  }
`;

const ExpertiseTitle = styled(Title)`
  padding-bottom: 50px;
  text-align: left;
`;

const AreaCheckbox = styled(Checkbox)`
  font-size: 18px;
  .ant-checkbox {
    margin-right: 10px;
  }
`;

const StepTitle = styled.div`
  height: 60px;
  text-align:center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  & p{
    font-family: 'Proxima Nova';
    font-style: normal;
    font-weight: 700;
    line-height: 39px;
    
    color: #2F3F4C;
    width : ${props => props.width ?props.width :"276px"}
    margin : ${props => props.margin ?props.margin :"0"}
    margin-bottom : 0px !important;
    font-size: ${props => props.font_size? props.font_size :"32px"};
    @media screen and (max-width: 763px) {
      font-size:30px !important;
    }
  }

  & span {
    font-family: 'Proxima Nova';
    font-style: normal;
    font-weight: 400;
    line-height: 25px;

    color: #708390;
    width : ${props => props.width ?props.width :"294px"}
    margin : ${props => props.margin ?props.margin :"0"}
    margin-bottom : 0px !important;
    font-size: ${props => props.font_size? props.font_size :"15px"};
  }
`;

const RateTabContainer = styled.div`
  width: 100%;
  margin-top: 30px;
`;
const RateStepsTab = styled(Steps)``;
const RateStep = styled(Step)`
  .ant-steps-item-content {
    display: flex;
    justify-content: center;
    line-height: 17px;
  }
  .ant-steps-item-description {
    font-size: 14px;
  }
`;
export {
  ActionNextButton,
  ActionPrevButton,
  StepActionContainer,
  LabelText,
  TechSelect,
  ExpertiseTitle,
  AreaCheckbox,
  RateTabContainer,
  RateStepsTab,
  RateStep,
  StepTitle,
  BodyContainer
};
