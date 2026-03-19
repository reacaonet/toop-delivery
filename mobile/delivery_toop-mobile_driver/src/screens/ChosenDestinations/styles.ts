import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../styles';

export const styles = StyleSheet.create({
  flatStyle: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#F8F8F8',
  },
});

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_18 + 'px'};
  color: ${Colors.GRAY_TEXT};
  margin-left: 10px;
  flex: 1;
  text-align: center;
`;

export const IconContainer = styled.TouchableOpacity`
  flex-direction: row;
  margin-left: 10px;
`;

export const InputAddress = styled.TextInput`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  flex-direction: row;
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 20px;
  border-radius: 15px;
  padding-left: 10px;
  padding-right: 10px;
  background-color: ${Colors.GRAY_LIGHT};
  color: ${Colors.BLACK};
  elevation: 2;
  height: 45px;
`;

export const Content = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const ListContent = styled.TouchableOpacity`
  margin-left: 10px;
  flex-direction: row;
  margin: 20px 20px;
  background-color: ${Colors.WHITE};
  elevation: 3;
`;

export const ListIconView = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const ListContentTitle = styled.View`
  margin-left: 10px;
  flex-direction: row;
  padding: 20px 0px;
  flex: 1;
`;

export const ListTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  color: ${Colors.GRAY_TEXT};
`;

export const ListContentSearch = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
`;

export const FlatContent = styled.TouchableOpacity`
  background-color: #f8f8f8;
  border-bottom-color: ${Colors.ALERT};
  border-bottom-width: 0.3px;
  margin: 10px 20px 10px 20px;
  padding: 15px;
`;

export const AddressRoute = styled.Text`
  font-size: ${Typography.FONT_SIZE_17 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.GRAY_DARK};
`;

export const AddressComplement = styled.Text`
  font-size: ${Typography.FONT_SIZE_16 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.GREY_LIGHT};
  margin-top: 5px;
`;

export const ContentLoad = styled.View`
  flex: 1%;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
`;
