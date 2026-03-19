import styled from 'styled-components/native';

import {Colors} from '../../../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
  padding: 15px;

  justify-content: center;
`;

export const Image = styled.Image`
  width: 20px;
  height: 20px;
  top: 37px;
  left: 25px;
  position: absolute;
  z-index: 999;
`;

export const TextInput = styled.TextInput`
  height: 45px;
  margin-top: 10px;
  margin-bottom: 20px;

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
`;
export const Contain = styled.View`
  background-color: ${Colors.WHITE};
`;

export const ContainRow = styled.View`
  flex-direction: row;
`;
export const ContainColumn = styled.View`
  flex-direction: column;
  flex: 1;
  justify-content: center;

  margin-left: 10px;
`;

export const Border = styled.View`
  border-bottom-width: 2px;

  margin-top: 10px;
  margin-bottom: 15px;

  border-bottom-color: ${Colors.GRAY_LIGHT};
  justify-content: center;
`;
export const Text = styled.Text`
  font-size: 14px;
  line-height: 14px;
  color: ${Colors.TEXT_INPUT};
`;

export const Subtitle = styled.Text`
  font-size: 12px;
  line-height: 12px;
  margin-top: 3px;
  color: ${Colors.GRAY_MEDIUM};
`;
export const ContainProm = styled.View`
  flex-direction: row;
  flex: 1;
`;

export const Prom = styled.Text`
  font-size: 10px;
  line-height: 10px;
  border-radius: 8px;
  text-align: center;

  color: ${Colors.WHITE};
  background-color: ${Colors.PRIMARY};

  padding: 4px;
`;

export const Icons = styled.Image`
  width: 16px;
  height: 16px;
  margin-left: 20px;
`;

export const ContainIcons = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  position: absolute;
  z-index: 999;

  right: 0;
  top: 0;
`;

export const Price = styled.Text`
  font-size: 14px;
  line-height: 14px;
  color: ${Colors.PRIMARY};
`;

export const PriceLater = styled.Text`
  font-size: 14px;
  line-height: 14px;
  text-decoration: line-through;
  color: ${Colors.GRAY_MEDIUM};
  margin-left: 10px;
`;
export const ContainPrice = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  flex: 1;
  margin-top: 15px;
`;
export const IconOrd = styled.Image`
  height: 12px;
  align-self: flex-end;
`;
export const ImageAliment = styled.Image`
  width: 100px;
  height: 100px;

  border-radius: 8px;
`;
export const ContainFooter = styled.View`
  width: 100%;
  background-color: ${Colors.BACKGROUND};
  display: flex;
  align-items: stretch;
  flex-direction: column;

  position: absolute;
  bottom: 0;
  align-self: center;
`;

export const Button = styled.TouchableOpacity`
  background-color: ${Colors.PRIMARY};
  height: 40px;
  margin-top: 20px;
  align-self: center;
  border-radius: 8px;
  width: 100%;
  flex: 1;
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

export const ContainFlat = styled.View`
  background-color: ${Colors.WHITE};
`;

export const Safe = styled.SafeAreaView`
  background-color: ${Colors.WHITE};
`;
export const PromVoid = styled.Text`
  background-color: ${Colors.WHITE};
`;
