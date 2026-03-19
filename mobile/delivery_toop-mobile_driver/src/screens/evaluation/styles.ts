import { TouchableOpacity } from 'react-native';
import {
  RectButton,
  ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import { Colors, Typography } from '../../styles';
import * as fonts from '../../styles/typography';

export const Container = styled.View.attrs({
  paddingHorizontal: 20,
})`
  flex: 1;
  background-color: ${Colors.GREY_BACKGROUND};
  align-items: center;
  padding-top: 20px;
  padding-bottom: 20px;
`;

export const ContainerScroll = styled(ScrollView).attrs({
  bounces: false,
  showsVerticalScrollIndicator: false,
})`
  width: 100%;
  margin-top: 20px;
`;

export const ContainerInfo = styled.View`
  padding-top: 10px;
`;

export const TextFormPayment = styled.Text`
  font-size: ${Typography.FONT_SIZE_20}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.PRIMARY_DARK};
`;

export const TextPrice = styled.Text`
  font-size: ${Typography.FONT_SIZE_20}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.PRIMARY_DARK};
`;

export const TextBookingPay = styled.Text`
  font-size: ${Typography.FONT_SIZE_20}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.PRIMARY_DARK};
`;

export const TextInfoBold = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
`;

export const TitleMain = styled.Text`
  margin-bottom: 5px;
  font-size: ${fonts.FONT_SIZE_20}px;
  font-family: ${fonts.FONT_FAMILY_MEDIUM};
  color: ${Colors.BLACK};
  text-transform: uppercase;
`;

export const EvaluationBoxWithStar = styled.View`
  border-radius: 7px;
  background-color: ${Colors.WHITE};
  padding-top: 28px;
  padding-bottom: 31px;
  width: 100%;
  margin-top: 32px;
  margin-bottom: 20px;
  align-items: center;
  height: 132px;
`;

export const TitleText = styled.Text`
  font-size: ${fonts.FONT_SIZE_20}px;
  font-family: ${fonts.FONT_FAMILY_LIGHT};
  color: ${Colors.BLACK};
  margin-top: -3px;
`;

export const Star = styled(TouchableOpacity)`
  margin-top: 20px;
  margin-left: 9px;
  margin-right: 9px;
`;

export const StarBox = styled.View`
  flex-direction: row;
`;

export const DonationButton = styled<any>(RectButton)`
  height: 42px;
  background-color: ${Colors.PRIMARY};
  width: 100%;
  border-radius: 7px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 12px;
  padding-right: 12px;
`;

export const MoneyIcon = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  border-width: 2px;
  border-color: ${Colors.WHITE};
  height: 26px;
  width: 26px;
`;

export const CommentsBox = styled(TextInput)`
  border-radius: 7px;
  width: 100%;
  height: 90px;
  background-color: ${Colors.WHITE};
  padding-top: 13px;
  padding-left: 18px;
  margin-top: 20px;
  font-size: ${fonts.FONT_SIZE_20}px;
  font-family: ${fonts.FONT_FAMILY_LIGHT};
  color: ${Colors.BLACK};
`;

export const FavoriteDriverBox = styled.View`
  border-radius: 7px;
  width: 100%;
  margin-top: 20px;
  background-color: ${Colors.WHITE};
  padding-top: 15px;
  padding-left: 18px;
  padding-right: 28px;
  padding-bottom: 10px;
`;

export const HeaderDriverFavorite = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;

export const ButtonBox = styled.View.attrs({
  paddingHorizontal: 29,
})`
  width: 100%;
  height: 55px;
  flex-direction: row;
  justify-content: space-between;
  align-self: baseline;
  background-color: ${Colors.GREY_BACKGROUND};
`;

export const ButtonAfter = styled(RectButton)`
  border-radius: 7px;
  height: 45px;
  width: 145px;
  background-color: ${Colors.GRAY_LIGHT};
  align-items: center;
  justify-content: center;
`;

export const ButtonEvaluate = styled(RectButton)`
  border-radius: 7px;
  height: 45px;
  width: 145px;
  background-color: ${Colors.PRIMARY};
  align-items: center;
  justify-content: center;
`;

export const SpaceBottom = styled.View`
  height: 18px;
`;
