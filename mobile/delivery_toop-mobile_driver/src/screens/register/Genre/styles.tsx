import styled from 'styled-components/native';
import { Colors, Typography } from '../../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.SafeAreaView`
  flex-direction: column;
  width: 100%;
  background-color: ${Colors.WHITE};
`;

export const MenuButton = styled.TouchableOpacity`
  /* margin-bottom: 10px; */
  padding: 10px;
`;

export const Content = styled.ScrollView`
  flex: 1;
  margin-left: 20px;
  margin-right: 20px;
  background-color: ${Colors.WHITE};
`;

export const Title = styled.Text`
  font-size: ${Typography.FONT_SIZE_16}px;
  font-family: ${Typography.FONT_FAMILY_BOLD};
  color: ${Colors.BLACK};
  margin-top: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

export const List = styled.FlatList`
  flex: 1;
`;

export const FlatContent = styled.TouchableOpacity<{ select?: boolean }>`
  justify-content: center;
  padding: 20px 10px;
  border-bottom-width: 0.5px;
  background-color: ${props =>
    props.select ? Colors.GRAY_LIGHT : Colors.WHITE};
`;

export const FlatName = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
`;

export const ContentBtn = styled.View`
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
`;

export const BtnNext = styled.TouchableOpacity<{ select?: boolean }>`
  padding: 10px;
  background-color: ${props =>
    props.select ? Colors.GRAY_LIGHT : Colors.PRIMARY};
  width: 90%;
  margin-bottom: 10px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
`;

export const BtnTitle = styled.Text`
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_BOLD};
  color: ${Colors.WHITE};
`;
