import styled from 'styled-components/native';

import {Colors, Typography} from '../../../../styles';

export const Container = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;

export const Title = styled.Text`
  font-size: 18px;
  color: ${Colors.PRIMARY};
  padding: 30px;
  padding-left: 20px;
  background-color: ${Colors.GREY_LIGHT};
`;

export const ContainDay = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
`;

export const Divider = styled.View`
  border-bottom-color: ${Colors.GRAY_LIGHT};
  border-bottom-width: 1px;
  width: 90%;
  align-self: center;
  margin-top: 12px;
  margin-bottom: 12px;
`;

export const DividerContain = styled.View`
  margin-bottom: 90px;
`;

export const TextContain = styled.Text`
  font-size: 14px;
  color: ${Colors.GRAY};
  font-weight: bold;
`;

export const TextContainHour = styled.Text`
  font-size: 14px;
  color: ${Colors.GRAY};
  margin-right: 10px;
`;

export const Input = styled.TextInput`
  color: ${Colors.GREY};
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_BOLD};

  border-radius: 5px;

  border-color: ${Colors.GRAY_LIGHT};
  border-width: 1px;

  background-color: ${Colors.GREY_BACKGROUND};
`;

export const Image = styled.Image.attrs({
  resizeMode: 'contain',
  transform: [{rotate: '180deg'}],
})`
  width: 18px;
  height: 18px;
`;

export const Contain = styled.View`
  flex-direction: row;
  flex: 1;
`;
export const Button = styled.TouchableOpacity`
  position: absolute;
  bottom: 0;
  width: 90%;
  height: 45px;
  background-color: ${Colors.PRIMARY};
  border-radius: 8px;
  align-self: center;
`;
export const TextButton = styled.Text`
  font-size: 16px;
  color: ${Colors.WHITE};
  text-align: center;
  margin-top: 12px;
`;
