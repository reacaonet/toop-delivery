import {
  StatusBar,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import {Colors, Typography} from '../../styles';

const {height} = Dimensions.get('window');
const {width} = Dimensions.get('window');

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
`;

export const ButtonImage = styled.View`
  flex-direction: row;
  justify-content: flex-end;
`;

export const ImageIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

export const MenuButton = styled(TouchableOpacity).attrs({
  backgroundColor: Colors.BLACK,
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderTopRightRadius: 5,
  borderBottomRightRadius: 5,
})`
  margin-bottom: 10px;
`;

export const ButtonBoard = styled.TouchableOpacity`
  width: 60%;
  height: 25px;
  border-radius: 8px;
  margin-right: 15px;
  justify-content: center;
  background-color: ${Colors.BUTTON_EMBARQUE};
`;

export const TextButton = styled.Text`
  color: ${Colors.WHITE};
  font-size: 12px;
  text-align: center;
  width: 100%;
`;

export const MapContainer = styled(View).attrs({})`
  margin-top: 5px;
  height: 72%;
  align-self: center;
  width: ${Dimensions.get('window').width}px;
`;

export const ContainerModal = styled.View`
  height: ${height - 47}px;
  width: 100%;
  z-index: 2;
  elevation: 5;
`;

export const Head = styled.TouchableOpacity`
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

export const ViewSlider = styled.View`
  width: 100%;
  position: absolute;
  bottom: 2px;
`;

export const Image = styled.Image`
  width: 200px;
  height: 70px;
`;
