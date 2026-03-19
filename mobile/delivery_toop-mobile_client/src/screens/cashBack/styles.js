import {TouchableOpacity} from 'react-native';
import {RectButton, ScrollView} from 'react-native-gesture-handler';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import styled from 'styled-components/native';
import {Typography, Colors} from '../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.GREY_BACKGROUND};
`;

export const ContainerScroll = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  width: 100%;
  background-color: ${Colors.GREY_BACKGROUND};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: ${getStatusBarHeight() + 16}px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: ${Colors.GREY_BACKGROUND};
`;

export const BalanceBox = styled.View`
  height: 99px;
  width: 100%;
  background-color: ${Colors.WHITE};
  padding: 17px 18px;
  justify-content: space-between;
  flex-direction: row;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_18};
  color: ${Colors.BLUE};
  align-self: center;
`;

export const Footer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  height: 53px;
`;

export const Currency = styled.Text`
  font-size: 25px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.BLUE};
  align-self: flex-end;
  padding-bottom: 5px;
`;

export const Balance = styled.Text`
  font-size: 40px;
  margin-left: 5px;
  color: ${Colors.BLUE};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const DescriptionOfBalance = styled.View`
  height: 125px;
  width: 100%;
  background-color: ${Colors.GREY_BACKGROUND};
  align-items: center;
  justify-content: center;
`;

export const TextDescription = styled.Text`
  color: ${Colors.BLUE};
  font-size: ${Typography.FONT_SIZE_13};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  text-align: center;
  width: 268px;
  height: 60px;
`;

export const CancelFooter = styled.View`
  width: 100%;
  height: 83px;
  bottom: 0;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
`;

export const TextTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  text-align: center;
  font-size: 15px;
  width: 284px;
  color: ${Colors.GRAY};
  align-self: center;
  margin-top: 19px;
  margin-bottom: 40px;
`;

export const StatementBox = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  width: 100%;
  height: 59px;
  background-color: ${Colors.BLUE};
  justify-content: center;
  padding-left: 18px;
`;

export const TitleStatment = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: 15px;
  color: ${Colors.WHITE};
`;
