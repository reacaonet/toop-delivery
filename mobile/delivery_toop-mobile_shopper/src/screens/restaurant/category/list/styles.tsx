import styled from 'styled-components/native';

import {Colors} from '../../../../styles';
import {TouchableOpacity} from 'react-native';

export const Container = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
`;

export const Image = styled.Image`
  width: 20px;
  height: 20px;
  margin-top: 25px;
  margin-left: 30px;
  position: absolute;
  z-index: 999;
`;

export const TextInput = styled.TextInput`
  width: 90%;
  height: 45px;
  margin-top: 10px;
  margin-left: 20px;
  padding-top: 12px;
  padding-left: 40px;
  padding-bottom: 10px;
  background-color: ${Colors.BACKGROUND};
  border-color: ${Colors.PRIMARY};
  color: ${Colors.TEXT_INPUT};
  border-width: 1px;
  border-radius: 8px;
  border-style: solid;
`;

export const Title = styled.Text`
  font-size: 20px;
  margin-top: 20px;
  margin-left: 20px;
  color: ${Colors.PRIMARY};
  padding-bottom: 10px;
`;
export const Contain = styled.TouchableOpacity`
  width: 90%;
  padding: 5px;

  margin-top: 20px;
  border-radius: 8px;
  align-self: center;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  background-color: ${Colors.BACKGROUND};
`;

export const Text = styled.Text`
  font-size: 18px;
  margin-left: 10px;
  color: ${Colors.TEXT_INPUT};
  flex: 1;
`;
export const IconOrd = styled.Image`
  width: 18px;
  height: 18px;
  margin-right: 10px;
`;

export const ContainFooter = styled.View`
  width: 100%;
  height: 100px;
  position: absolute;
  bottom: 0;
  background-color: ${Colors.BACKGROUND};
`;
export const Button = styled.TouchableOpacity`
  background-color: ${Colors.PRIMARY};
  width: 90%;
  height: 40px;
  margin-top: 10px;
  align-self: center;
  border-radius: 8px;
`;
export const ButtonText = styled.Text`
  font-size: 16px;
  text-align: center;
  margin-top: 8px;
  color: ${Colors.WHITE};
`;
export const ButtonSecond = styled.TouchableOpacity`
  background-color: ${Colors.WHITE};
  border-color: ${Colors.PRIMARY};
  border-width: 1px;
  margin-top: 5px;
  width: 90%;
  height: 40px;
  align-self: center;
  border-radius: 8px;
`;
export const ButtonTextSecond = styled.Text`
  font-size: 16px;
  text-align: center;
  margin-top: 8px;
  color: ${Colors.PRIMARY};
`;
