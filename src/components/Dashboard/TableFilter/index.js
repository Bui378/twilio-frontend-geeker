import React from 'react';
import { Row, Col } from 'antd';
import StyledText from '../StyledText';
import SelectField from '../../common/Select';
import Box from '../../common/Box';

function TableFilters() {
  return (
    <Box marginVertical={50}>
      <Row gutter={[10, 0]}>
        <Col span={6}>
          <StyledText type="secondary" size="12px">
            Transaction Period
          </StyledText>
          <SelectField
            margin="10px 0 0 0"
            width="100%"
            placeholder="Select Period"
            options={[
              {
                label: '01/12/2020 - 01/12/2021',
                value: '01/12/2020 - 01/12/2021',
              },
            ]}
          />
        </Col>
        <Col span={6}>
          <StyledText type="secondary" size="12px">
            Transaction Type
          </StyledText>
          <SelectField
            width="100%"
            margin="10px 0 0 0"
            options={[
              {
                label: 'All',
                value: 'All',
              },
            ]}
            placeholder="Select Type"
          />
        </Col>
        <Col span={6} offset={6}>
          <StyledText type="secondary" size="12px">
            Sort By
          </StyledText>
          <SelectField
            width="100%"
            bg="transparent"
            border="1px solid #d5d5d5"
            radius="40px"
            placeholder="Select Sorting"
            margin="10px 0 0 0"
            options={[
              {
                label: 'Payment: Low To High',
                value: 'Payment: Low To High',
              },
            ]}
          />
        </Col>
      </Row>
    </Box>
  );
}
export default TableFilters;
