import React from 'react';
import StyledText from '../StyledText';
import StyledTitle from '../StyledTitle';
import Box from '../../common/Box';

export default function DashboardStats() {
  return (
    <Box display="flex" padding={20} marginVertical={30} background="#efefef">
      <Box
        justifyContent="center"
        alignItems="center"
        flex={1}
        display="flex"
        direction="column"
      >
        <StyledText size="12px" type="secondary">
          Current Balance
        </StyledText>
        <StyledTitle
          margin="8px 0 -5px 0"
          weight="600"
          color="#454545"
          spacing="1px"
          level={3}
        >
          $150.00
        </StyledTitle>
      </Box>
      <Box
        justifyContent="center"
        alignItems="center"
        flex={1}
        display="flex"
        direction="column"
        borderRight="1px solid #45454520"
        borderLeft="1px solid #45454520"
      >
        <StyledText size="12px" type="secondary">
          Total Amount Earned
        </StyledText>
        <StyledTitle
          margin="8px 0 -5px 0"
          weight="600"
          color="#454545"
          spacing="1px"
          level={3}
        >
          $1230.00
        </StyledTitle>
      </Box>
      <Box
        justifyContent="center"
        alignItems="center"
        flex={1}
        display="flex"
        direction="column"
      >
        <StyledText size="12px" type="secondary">
          Total Amount Of Time
        </StyledText>
        <StyledTitle
          margin="8px 0 -5px 0"
          weight="600"
          color="#454545"
          spacing="1px"
          level={3}
        >
          280 hrs
        </StyledTitle>
      </Box>
    </Box>
  );
}
