import { TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import styled from 'styled-components/native';
import { Typography, Colors } from '../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const ContainerScroll = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  background-color: ${Colors.WHITE};
  margin-top: 37px;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: ${getStatusBarHeight() + 16}px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: ${Colors.WHITE};
`;

export const HeaderTitle = styled.Text`
  font-size: 15px;
  color: ${Colors.PRIMARY};
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
`;

export const BalanceBox = styled.View`
  height: 135px;
  /* margin-top: 37px; */
  width: 100%;
  background-color: ${Colors.GREY_BACKGROUND};
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  padding: 17px 18px;
  justify-content: space-between;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_18};
  color: ${Colors.BLUE};
`;

export const Footer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  padding-right: 7px;
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
  align-self: flex-end;
  margin-left: 5px;
  color: ${Colors.BLUE};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const AddValue = styled(TouchableOpacity).attrs({
  activeOpacity: 0.6,
})`
  background-color: ${Colors.BLUE};
  height: 58px;
  width: 100%;
  justify-content: center;
  padding-left: 18px;
  padding-right: 23px;
`;
export const BoxButtonInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const TextButtonAdd = styled.Text`
  color: ${Colors.WHITE};
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  align-self: flex-start;
`;

export const DescriptionOfBalance = styled.View`
  height: 149px;
  width: 100%;
  background-color: ${Colors.GREY_BACKGROUND};
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  align-items: center;
  justify-content: center;
  margin-bottom: 24%;
`;

export const TextDescription = styled.Text`
  color: ${Colors.GRAY_DARK};
  font-size: ${Typography.FONT_SIZE_13};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  text-align: center;
  width: 281px;
`;

export const InputCoupon = styled.TextInput`
  color: ${Colors.BLACK};
  height: 58px;
  width: 100%;
  justify-content: center;
  width: 90%;
  padding: 5px;
  margin-left: 15px;
  margin-bottom: 5px;
  margin-top: 10px;
  border-color: ${Colors.PRIMARY};
  border-width: 1px;
  border-radius: 8px;
  border-style: solid;
  background-color: ${Colors.WHITE};
`;

export const ErrorMessage = styled.Text`
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_13}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  text-align: center;
  width: 281px;
`;

export const SuccessMessage = styled.Text`
  color: ${Colors.SUCCESS};
  font-size: ${Typography.FONT_SIZE_13}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  text-align: center;
  width: 281px;
`;

export const FooterButton = styled(TouchableOpacity)`
  width: 100%;
  justify-content: space-between;
  flex-direction: row;
`;

export const Divider = styled.View`
  background-color: ${Colors.GREY_LIGHT};
  height: 1px;
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
`;

export const IconTitle = styled.View`
  flex-direction: row;
`;

export const FooterButtonBox = styled.View`
  bottom: 0;
  width: 100%;
  margin-bottom: 16px;
`;

export const TitleFooter = styled.Text`
  color: ${Colors.DARK};
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  margin-left: 14px;
  padding-top: 2px;
`;
