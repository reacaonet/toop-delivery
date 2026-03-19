import styled from 'styled-components/native';

import {Colors} from '../../../../styles';

export const Container = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
  padding: 30px;
  padding-top: 15px;
`;

export const Title = styled.Text`
  font-size: 14px;
  color: ${Colors.GRAY};
  margin-top: 15px;
`;
export const Input = styled.TextInput`
  width: 100%;
  margin-bottom: 15px;
  align-self: center;
  background-color: ${Colors.WHITE};
  border-bottom-color: ${Colors.GRAY};
  border-bottom-width: 1px;
  color: ${Colors.GRAY};
`;

export const Touch = styled.TouchableOpacity`
  width: 90%;
  height: 50px;
  margin-bottom: 20px;
  position: absolute;
  bottom: 0;
  background-color: ${Colors.PRIMARY};
  align-self: center;
  border-radius: 12px;
`;
export const TitleTouch = styled.Text`
  font-size: 18px;
  margin-top: 10px;
  text-align: center;
  color: ${Colors.WHITE};
`;
