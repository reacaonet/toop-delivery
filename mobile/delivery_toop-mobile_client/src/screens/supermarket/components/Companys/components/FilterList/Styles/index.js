import { Dimensions } from 'react-native';
import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';
import { Colors, Typography } from '../../../../../../../styles';

export const View = styled.View``;

export const FlatList = styled.FlatList`
  padding-left: 20px;
  margin-top: 20px;
`;

export const TouchBox = styled.TouchableOpacity`
  margin-top: 10px;
  margin-right: 10px;
  align-items: center;
  width: ${Dimensions.get('screen').width / 4 + 'px'};
`;

export const ImageFast = styled(FastImage)`
  width: 100%;
  height: 80px;
  border-radius: 10px;
  opacity: ${props => (props.isDisabled ? '0.3' : '100')};
`;

export const Text = styled.Text`
  margin-top: 10px;
  color: ${Colors.GREY};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;
