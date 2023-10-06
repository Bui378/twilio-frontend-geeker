import { Typography, Select } from 'antd';
import styled from 'styled-components';

const { Text } = Typography;

const BodyContainer = styled.div`
  background: ${props => props.background};
  margin-bottom:30px !important;
  border-radius: 10px;
  flex-direction: column;
  justify-content:space-around;
  align-items: center;
  padding: 0px 50px;
  @media screen and (max-width: 991px) {
    padding:30px !important;
  }
  box-shadow :${props => props.boxshadow ? props.boxshadow :''}
`;

const StepActionContainer = styled.div`
  width: 100%;
  margin-top: 24px !important;
  display: flex;
  justify-content: flex-end;

`;

const IssueSelect = styled(Select)`

@media screen and (max-width: 763px) {
  width: 100% !important;
}
.ant-select-selection-item{
  text-align:left;
}
.ant-select-arrow{
    font-size: 12px;
  padding-right: 19px;
  color: black;
}
`;

const StepTitle = styled.h2`
  margin-bottom: 50px;
  color:${props => props.color ? props.color :"black" };
  font-size: 32px;
  font-weight: 600;
  text-align: center;
`;

const StepHeader = styled.h3`
  color:${props => props.color ? props.color :"black" };
  font-size: 35.6364px;
  font-weight: 700;
  line-height: 43px;
  text-align: center;
  margin-bottom: 0; 
`;

const SectionTitle = styled(Text)`

  text-align: left;
  font: normal normal 600 18px/40px Proxima Nova;
  letter-spacing: 0.09px;
  color: #293742;
  opacity: 1;
  margin-bottom:20px;

  // font-size: 25px;
  // font-family:Arial !important;
  // color:${props => props.color? props.color:"black"}  !important;
  // font-weight : bold; 
  // // margin-left:${props => props.marginleft?props.marginleft:"0px"};
  // padding-bottom: 28px;
  // margin:auto;

`;

const TitleContainer = styled.div`

  width:100%

`


const WarningText = styled(Text)`
  color: #b12222 !important;
  font-size: 15px;
  font-family: Open-sans, serif;
  // position: absolute;
  top: calc(100% + 10px);
  left: 0;
  text-align: left !important;
`;

const infoText = styled(Text)`
  color: #b12222 !important;
  font-size: 15px;
  font-family: Open-sans, serif;
  // position: absolute;
  top: calc(100% + 10px);
  left: 0;
  text-align: right !important;
`;

export {
  StepActionContainer,
  StepTitle,
  StepHeader,
  IssueSelect,
  BodyContainer,
  SectionTitle,
  WarningText,
  TitleContainer,
  infoText
};
