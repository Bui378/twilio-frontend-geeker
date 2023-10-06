import Styled from 'styled-components';

const CustomImage = Styled.img`
  padding:${p => p.padding} !important;
  border-left:${p => p.borderLeft} !important;
  border-right:${p => p.borderRight} !important;
  border-bottom:${p => p.borderBottom} !important;
  border:${p => p.border} !important;
  width:${p => p.width};
  position:${p => p.position};
  top:${p => p.top};
  left:${p => p.left};
  border-radius:${p => p.radius}
`;

export default CustomImage;
