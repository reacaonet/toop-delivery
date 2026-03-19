import styled from 'styled-components/native';

import {
  StatusBar,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const {height} = Dimensions.get('window');

export const Container = styled.View`
  flex: 1;
  padding-left: 19px;

  background-color: #fff;
`;

export const ButtonTest = styled(TouchableOpacity)`
  width: 95%;
  height: 70px;
  margin-top: 10px;
  border-radius: 10px;
  background-color: #e34;
  padding-left: 15px;
  align-items: center;
  flex-direction: row;
  margin-bottom: 15px;
`;

export const TextButton = styled.Text`
  font-size: 15px;
  font-weight: bold;
  margin-left: 15px;
  padding-left: 15px;
  padding-top: 15px;
  height: 70%;
  color: #fff;

  justify-content: center;
  border-left-width: 1;
  border-color: #fff;
`;

export const ContainerDrive = styled.View`
  flex: 1;

  padding: 20px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
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
`;

export const MapContainer = styled.View`
  height: 100%;
  margin-top: 24px;
`;

export const ContainerModal = styled.View`
  height: ${height - 47}px;
  width: 100%;
  z-index: 2;
  elevation: 10;
`;
export const ContainerView = styled.View`
  flex: 1;
  height: 100%;
  align-self: center;
  background-color: #fff;
  width: 100%;
`;
export const Head = styled.TouchableOpacity`
  width: 100%;
  height: 59px;

  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 22px;
`;

export const TitleHeader = styled.Text`
  font-size: 18px;
  font-weight: 700;
`;
