import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const Container = styled.View`
  flex-grow: 1;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: ${Typography.FONT_SIZE_20}px;
  color: ${Colors.BLACK};
  margin-bottom: 15px;
`;

export const SubTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.GRAY_TEXT};
  margin-bottom: 20px;
`;

export const ListItem = styled.TouchableOpacity<{
  background?: string;
}>`
  padding: 20px;
  margin-bottom: 10px;
  /* background-color: ${Colors.GRAY_LIGHT}; */
  background-color: ${props =>
    props?.background ? props?.background : Colors.GRAY_LIGHT};
  border-radius: 5px;
`;

export const ListItemText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.BLACK};
`;

export const ListItemSubText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
`;

export const ContentInputFilter = styled.View`
  background-color: ${Colors.WHITE};
  flex-direction: column;
  border-radius: 5px;
  border-width: 0.7px;
  border-color: ${Colors.DARK_LIGHT};
  margin-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
  elevation: 3;
`;
