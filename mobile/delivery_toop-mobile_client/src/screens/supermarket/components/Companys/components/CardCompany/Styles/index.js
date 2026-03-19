import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';
import { Colors, Typography } from '../../../../../../../styles';

export const Container = styled.TouchableOpacity`
  border-radius: 7px;
  border-width: 0.3px;
  margin-bottom: 15px;
  border-color: ${Colors.GREY_LIGHT};
  height: ${props => (props.haveCoupon ? '120px' : '100px')};
`;

export const Content = styled.View`
  flex-grow: 1;
  align-items: center;
  flex-direction: row;
  margin-top: ${props => (props.haveCoupon ? '10px' : '0px')};
`;

export const ViewImage = styled.View`
  width: 60px;
  height: 60px;
  margin-left: 10px;
  margin-right: 10px;
  align-items: center;
  justify-content: center;
`;

export const ImageFast = styled(FastImage)`
  width: 60px;
  height: 60px;
  margin-right: 10px;
  border-radius: 7px;
  opacity: ${props => (props.isClosed ? '0.3' : '100')};
`;

export const TextImage = styled.Text.attrs({ transform: [{ rotate: '-15deg' }] })`
  padding: 2px;
  opacity: 0.6;
  min-width: 65px;
  text-align: center;
  position: absolute;
  border-radius: 3px;
  color: ${Colors.PRIMARY};
  background-color: ${Colors.WARNING};
  font-size: ${Typography.FONT_SIZE_12 + 'px'};
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
`;

export const ViewData = styled.View`
  margin-left: 5px;
`;

export const TextCompany = styled.Text`
  color: ${Colors.BLACK};
  font-size: ${Typography.FONT_SIZE_15 + 'px'};
  font-family: ${Typography.FONT_FAMILY_LIGHT};
`;

export const ViewInfo = styled.View`
  justify-content: space-between;
`;

export const ViewInfoLine = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ViewInfoItem = styled.View`
  width: 110px;
  margin-top: 10px;
  flex-direction: row;
`;

export const Image = styled.Image``;

export const TextInfo = styled.Text`
  margin-left: 10px;
  color: ${Colors.DARK_LIGHT};
  font-size: ${Typography.FONT_SIZE_11 + 'px'};
  font-family: ${Typography.FONT_FAMILY_LIGHT};
`;

export const Footer = styled.View`
  height: 25px;
  margin-top: 10px;
  border-width: 0.3px;
  justify-content: center;
  border-bottom-left-radius: 7px;
  border-bottom-right-radius: 7px;
  border-color: ${Colors.GREY_LIGHT};
  background-color: ${Colors.GREY_BACKGROUND};
`;

export const TextFooter = styled.Text`
  color: ${Colors.PRIMARY};
  margin-left: 10px;
  font-size: ${Typography.FONT_SIZE_12 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;
