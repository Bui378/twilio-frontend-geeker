import styled from 'styled-components';

const Box = styled.div`
  display: ${props => props.display ? props.display : 'block'};
  // overflow-x:hidden;
  align-items: ${props => props.alignItems ? props.alignItems : ''};
  justify-content: ${props => props.justifyContent ? props.justifyContent : ''};
  box-shadow:${props =>props.boxshadow ? props.boxshadow : ''};
  height: ${props => props.height ? props.height : 'initial'};
  ${props => props.wrap && 'flex-wrap: wrap'}
  ${props => props.direction && `flex-direction: ${props.direction};`}
  ${props => props.flex && `flex: ${props.flex};`}

  ${props => props.padding && `padding: ${props.padding}px;`}
  ${props => props.paddingTop && `padding-top: ${props.paddingTop}px;`}
  ${props => props.paddingBottom && `padding-bottom: ${props.paddingBottom}px;`}
  ${props => props.paddingLeft && `padding-left: ${props.paddingLeft}px;`}
  ${props => props.paddingRight && `padding-right: ${props.paddingRight}px;`}
  ${props => props.paddingHorizontal && `
    padding-right: ${props.paddingHorizontal}px;
    padding-left: ${props.paddingHorizontal}px;
  `}
  ${props => props.paddingVertical && `
    padding-top: ${props.paddingVertical}px;
    padding-bottom: ${props.paddingVertical}px;
  `}

  ${props => props.marginTop && `margin-top: ${props.marginTop}px;`}
  ${props => props.marginBottom && `margin-bottom: ${props.marginBottom}px;`}
  ${props => props.marginLeft && `margin-left: ${props.marginLeft}px;`}
  ${props => props.marginRight && `marginRight: ${props.marginRight}px;`}
  ${props => props.marginHorizontal && `
    marginRight: ${props.marginHorizontal}px;
    margin-left: ${props.marginHorizontal}px;
  `}
  ${props => props.marginVertical && `
    margin-top: ${props.marginVertical}px;
    margin-bottom: ${props.marginVertical}px;
  `}
  ${props => props.marginAuto && 'margin: auto;'}

  ${props => props.position && `position: ${props.position};`}
  ${props => props.top !== undefined && `top: ${props.top}px;`}
  ${props => props.left !== undefined && `left: ${props.left}px;`}
  ${props => props.right !== undefined && `right: ${props.right}px;`}
  ${props => props.bottom !== undefined && `bottom: ${props.bottom}px;`}

  ${props => props.width && `width: ${props.width};`}
  ${props => props.height && `height: ${props.height};`}

  ${props => props.radius && `border-radius: ${props.radius}px;`}
  ${props => props.background && `background: ${props.background};`}
  ${props => props.maxWidth && `max-width: ${props.maxWidth}px;`}

  ${props => props.borderTop && `border-top: ${props.borderTop};`}
  ${props => props.borderLeft && `border-left: ${props.borderLeft};`}
  ${props => props.borderRight && `border-right: ${props.borderRight};`}
  ${props => props.borderBottom && `border-bottom: ${props.borderBottom};`}

  & .ant-alert-with-description{
    margin-bottom:20px;
  }


  & .myspindiv{
    margin-top:20px;
    width:100%;
    text-align:center;
    background-color:#f4f4f4;
    padding:20px;
  }
  & .myspindiv .ant-spin-dot-item{
    background-color:#5d5050;
  }


  & .divarea{
    background-color:white;
    padding:50px;
    font-size: 19px;
  }


  & .halftext{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  font-weight:bold;
  cursor:pointer;
  font-size: 18px;
  padding-right: 14px;
}
`;

export default Box;
