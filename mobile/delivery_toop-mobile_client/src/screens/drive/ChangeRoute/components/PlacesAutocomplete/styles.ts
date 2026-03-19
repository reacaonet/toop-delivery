import { Dimensions, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const styles = StyleSheet.create({
  iconStyle: {
    marginRight: 5,
  },
});

export const Container = styled.View`
  flex: 1;
  flex-direction: row;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  position: absolute;
  flex-direction: row;
  width: 100%;
  height: 50px;
  background-color: ${Colors.WHITE};
  elevation: 3;
  height: 100%;
`;

export const ViewHeaderIcon = styled.TouchableOpacity``;

export const HeaderContent = styled.View`
  width: 100%;
  height: 100%;
  margin-right: 20px;
`;

export const Divider = styled.View`
  position: absolute;
  top: 50px;
  width: 100%;
  height: 1px;
  background-color: ${Colors.WHITE};
  elevation: 3;
`;

export const TextPlace = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
`;

export const ContainerList = styled.View``;

export const ListItem = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const ListItemTouch = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const TitleListItem = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.PRIMARY};
`;
