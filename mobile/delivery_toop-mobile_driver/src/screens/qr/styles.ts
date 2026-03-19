import styled from 'styled-components/native';
import { StatusBar, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography } from '../../styles';
const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
  },
  map: {
    flex: 1,
  },
});

export const ContainerModal = styled.View`
  height: ${height - 47}px;
  width: 100%;
  z-index: 2;
  elevation: 10;
`;

export const Header = styled.TouchableOpacity`
  width: 100%;
  height: 59px;
  background-color: ${Colors.GREY_BACKGROUND};

  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 22px;
`;

export const TitleHeader = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 18px;
  font-weight: 700;
`;

export const ContentRice = styled.View`
  flex: 1;
  padding: 0px 20px;
`;

export const DestinyCard = styled.View`
  width: 100%;
  height: 105px;
  border-radius: 7px;
  background-color: ${Colors.GREY_BACKGROUND};
  margin-top: 11px;
  padding: 15px;
`;

export const CompassCard = styled.View`
  width: 80%;
  height: 105px;
  border-radius: 7px;
  background-color: ${Colors.GREY_BACKGROUND};
  margin-top: 11px;
  padding: 15px;
`;

export const BoxTitleCard = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TitleCard = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 18px;
  margin-left: 12px;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 18px;
  font-weight: 700;
  margin-top: 10px;
`;

export const Description = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: 15px;
  color: ${Colors.GRAY_TEXT};
  margin-top: 10px;
  margin-bottom: 12px;
  text-align: center;
`;

export const ButtonBox = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-color: ${Colors.GRAY_MEDIUM};
  padding: 18px 0px;
  width: 84%;
`;

export const IconTouchable = styled.TouchableOpacity`
  height: 20px;
  width: 20px;
  border-radius: 50px;
  border-width: 1px;
  border-color: ${Colors.GRAY_MEDIUM};
  background-color: ${Colors.WHITE};
`;

export const ButtonDescription = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: 14px;
  color: ${Colors.GRAY_TEXT};
  margin-left: 12px;
`;

export const ConfirmButton = styled.TouchableOpacity`
  height: 83px;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
`;

export const ButtonEmbarqueDireto = styled.TouchableOpacity`
  padding: 10px;
  width: 90%;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.BLACK};
  elevation: 3;
`;

export const ButtonEmbarqueDiretoText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.WHITE};
  text-transform: uppercase;
`;

export default styles;
