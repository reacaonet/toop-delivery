import { TouchableOpacity } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper';
import styled from 'styled-components/native';
import { Typography, Colors } from '../../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const ContainerScroll = styled(ScrollView).attrs({
    showsVerticalScrollIndicator: false
})`
    flex: 1;
    width: 100%;
    background-color: ${Colors.WHITE};
    margin-top: 15px;
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

export const TitleScreen = styled.Text`
    font-size: 14px;
    font-family: ${Typography.FONT_FAMILY_MEDIUM};
    color: ${Colors.PRIMARY};
`;

export const PrimaryBox = styled.View`
    height: 56px;
    width: 100%;
    background-color: ${Colors.GRAY_LIGHT};
    align-items: center;
    padding-left: 20px;
    flex-direction: row;
    justify-content: space-between;
    padding-right: 20px;
`;

export const SecondaryBox = styled.View`
    height: 56px;
    width: 100%;
    background-color: ${Colors.WHITE};
    align-items: center;
    padding-left: 20px;
    flex-direction: row;
    justify-content: space-between;
    padding-right: 20px;
`;

export const Divider = styled.View`
    height: 2px;
    width: 100%;
    background-color: ${Colors.GRAY_LIGHT};
`;

export const Titlestatements = styled.Text`
    font-size: 12px;
    font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const MainTitle = styled.Text`
    font-size: 15px;
    font-family: ${Typography.FONT_FAMILY_REGULAR};
    color: ${Colors.PRIMARY};
`;




