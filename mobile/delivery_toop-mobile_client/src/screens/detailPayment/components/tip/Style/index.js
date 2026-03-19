import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const Header = styled.View`
  height: 110px;
  justify-content: center;
  background-color: ${Colors.GREY_BACKGROUND};
`;

export const HeaderBody = styled.View.attrs({ marginHorizontal: 30 })`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const TextHeader = styled.Text`
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
`;

export const Image = styled.Image`
  width: 21px;
  height: 21px;
`;

export const Body = styled.View.attrs({ marginHorizontal: 30 })`
  height: 100px;
  flex-direction: row;
  align-items: center;
`;

export const TextBody = styled.Text`
  margin-top: 10px;
  margin-left: 30px;
  margin-right: 80px;
  color: ${Colors.DARK};
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  font-size: ${Typography.FONT_SIZE_12 + 'px'};
`;

export const ScrollView = styled.ScrollView``;

export const RowTip = styled.View`
  flex-shrink: 1;
  flex-direction: row;
  margin-bottom: 15px;
  justify-content: space-between;
`;

export const ViewTip = styled.View``;

export const TouchTip = styled.TouchableOpacity`
  height: 30px;
  margin-left: 5px;
  border-radius: 6px;
  text-align: center;
  margin-right: 15px;
  border-width: 0.3px;
  align-items: center;
  justify-content: center;
  border-color: ${Colors.GRAY_MEDIUM};
  background-color: ${props =>
    props.selected ? Colors.PRIMARY : Colors.WHITE};
  width: ${props => (props.otherValue ? '110px' : '30px')};
`;

export const TextTip = styled.Text`
  font-size: ${props =>
    props.otherValue
      ? Typography.FONT_SIZE_16 + 'px'
      : Typography.FONT_SIZE_18 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${props => (props.selected ? Colors.WHITE : Colors.DARK)};
`;
