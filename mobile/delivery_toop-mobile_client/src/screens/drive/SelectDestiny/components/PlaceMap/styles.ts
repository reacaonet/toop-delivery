import styled from 'styled-components/native';
import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../../../styles';

export const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export const Container = styled.SafeAreaView`
  flex: 1;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const MenuButton = styled.TouchableOpacity`
  padding: 10px;
`;

export const HeaderTitle = styled.Text`
  flex: 1;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
  text-align: right;
  margin-right: 20px;
`;

export const Divider = styled.View`
  position: absolute;
  top: 50px;
  width: 100%;
  height: 1px;
  background-color: ${Colors.WHITE};
  elevation: 1;
`;

export const ContainerLoad = styled.View`
  flex: 1;
  justify-content: center;
  align-content: center;
`;

export const LoadText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.GRAY_DARK};
  text-align: center;
`;

export const ContentMarker = styled.View`
  position: absolute;
  top: 0;
  bottom: 30px;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;

export const MakerInfoView = styled.View`
  padding: 5px;
  background-color: ${Colors.WHITE};
  border-radius: 5px;
  margin-bottom: 5px;
  elevation: 3;
`;

export const MarkerInfoText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.PRIMARY};
  text-align: center;
`;

export const Load = styled.ActivityIndicator``;

export const BtnConfirm = styled.TouchableOpacity<any>`
  background-color: ${Colors.PRIMARY};
  justify-content: center;
  align-items: center;
  width: 90%;
  margin-left: 5%;
  padding: 10px;
  border-radius: 5px;
  position: absolute;
  bottom: 5px;
  elevation: 3;
`;

export const BtnConfirmText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.WHITE};
  text-align: center;
`;
