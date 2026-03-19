import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../styles';

export const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
  },
});

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
`;

export const IconContainer = styled.TouchableOpacity`
  flex-direction: row;
  margin-left: 10px;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_18 + 'px'};
  color: ${Colors.GRAY_TEXT};
  margin-left: 10px;
  flex: 1;
  text-align: center;
`;

export const ContentLoad = styled.View`
  flex: 1%;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
`;

export const ContainerBtn = styled.SafeAreaView`
  width: 100%;
  position: absolute;
  bottom: 0;
  margin-bottom: 5px;
  align-items: center;
  justify-content: center;
`;

export const BtnConfirm = styled.TouchableOpacity`
  background-color: ${Colors.PRIMARY};
  margin: 0 20px;
  margin-bottom: 10px;
  min-height: 50px;
  border-radius: 10px;
  width: 80%;
  align-items: center;
  justify-content: center;
`;

export const TextBtn = styled.Text`
  color: ${Colors.WHITE};
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: ${Typography.FONT_SIZE_15 + 'px'};
  padding: 20px 0px;
  text-align: center;
`;
