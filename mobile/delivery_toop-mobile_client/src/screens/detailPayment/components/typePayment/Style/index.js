import styled from 'styled-components/native';
import {Colors, Typography} from '../../../../../styles';

export const Header = styled.SafeAreaView`
  height: 70px;
  background-color: ${Colors.GREY_BACKGROUND};
`;

export const HeaderBody = styled.View.attrs({marginHorizontal: 30})`
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const TextHeader = styled.Text`
  color: ${Colors.PRIMARY};
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
`;

export const Image = styled.Image`
  width: 21px;
  height: 16px;
`;

export const Body = styled.View.attrs({marginHorizontal: 30})`
  height: 80px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const TextLoading = styled.Text`
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_15 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const TouchChange = styled.TouchableOpacity`
  width: 20%;
  height: 100%;
  align-items: flex-end;
  justify-content: center;
`;

export const TextChange = styled.Text`
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_13 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const ViewPayment = styled.View`
  align-items: center;
  flex-direction: row;
`;

export const StreakView = styled.View`
  width: 90%;
  margin-left: 5%;
  border-color: ${Colors.GREY};
  border-width: 0.5px;
`;

export const WinCashBack = styled.View`
  flex: 1;
  flex-direction: row;
  padding-top: 25px;
  margin-left: 20px;
  margin-right: 20px;
`;

export const WinCashBackText = styled.Text`
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_15 + 'px'};
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  margin-left: 10px;
`;

export const WinCashBackPrice = styled.Text`
  flex: 1;
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_15 + 'px'};
  font-family: ${Typography.FONT_FAMILY_BOLD};
  text-align: right;
`;
