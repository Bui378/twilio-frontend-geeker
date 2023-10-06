import styled from 'styled-components';
import { Col, Typography } from 'antd';

const { Text, Title } = Typography;

const PageTitle = styled(Title)`
  padding-bottom: 20px;
  text-align: left;
`;

const DescriptionText = styled(Text)`
  margin-bottom: 10px;
  display: block;
  font-size: 15px;
  text-align: left;
`;

const StepActionContainer = styled.div`
  width: 100%;
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
`;

const ItemContainer = styled(Col)`
  background: white;
  padding: 20px;
  justify-content: flex-start;
  display: flex;
  border-radius: 10px;
  margin: 10px;
  flex-direction: column;
  min-width: 45%;
  flex: 1;
  align-items: flex-start;
`;

const ItemTitle = styled(Text)`
  font-size: 15px;
  color: #8c8989;
  letter-spacing: 3px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export {
  PageTitle,
  DescriptionText,
  ItemContainer,
  ItemTitle,
  StepActionContainer,
};
