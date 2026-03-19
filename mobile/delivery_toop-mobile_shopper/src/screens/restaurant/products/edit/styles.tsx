import styled from 'styled-components/native';

import {Colors} from '../../../../styles';

export const Container = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
`;

export const Title = styled.Text`
  font-size: 18px;
  margin-left: 30px;
  color: ${Colors.GRAY};
`;
export const Input = styled.TextInput`
  width: 90%;
  margin-top: 20px;
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

export const ViewPhoto = styled.TouchableOpacity`
  margin-top: 10px;
  align-self: center;
  justify-content: center;
  align-items: center;
`;
export const Image = styled.Image`
  width: 40px;
  height: 40px;
`;
export const TextPhoto = styled.Text`
  text-align: center;
  font-size: 18px;
  color: ${Colors.GRAY};
  margin-top: 10px;
`;

export const NameTextInput = styled.TextInput`
  width: 90%;
  height: 60px;
  font-size: 18px;
  margin-top: 20px;
  padding-left: 30px;
  align-self: center;
  border-radius: 12px;
  background-color: ${Colors.GRAY_MEDIUM};
`;

export const TextContain = styled.Text`
  font-size: 18px;
  margin-top: 15px;
  margin-left: 30px;
  color: ${Colors.GRAY_DARK};
`;
export const TextInput = styled.TextInput`
  width: 90%;
  height: 60px;
  font-size: 18px;
  margin-top: 20px;
  padding-left: 30px;
  align-self: center;
  border-radius: 12px;
  background-color: ${Colors.GRAY_LIGHT};
  flex-direction: row;
  justify-content: space-between;
`;

export const Button = styled.TouchableOpacity`
  width: 90%;
  height: 60px;
  margin-top: 20px;
  padding-left: 30px;
  align-self: center;
  border-radius: 12px;
  background-color: ${Colors.GRAY_LIGHT};
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export const ButtonText = styled.Text`
  font-size: 18px;
  color: ${Colors.GRAY_DARK};
`;

export const Contain = styled.View`
  flex-direction: row;
  align-self: center;
  justify-content: space-between;
`;

export const ImageSelect = styled.Image`
  position: absolute;
  right: 20px;
  top: 50px;
`;

export const SubTitle = styled.Text`
  font-size: 16px;
  margin-top: 15px;
  margin-bottom: 15px;
  margin-left: 25px;
  color: ${Colors.PRIMARY};
`;

export const ContainItem = styled.View`
  width: 100%;
  height: 60px;
  margin-bottom: 5px;
  flex-direction: row;
  background-color: ${Colors.GRAY_LIGHT};
`;

export const TextItem = styled.Text`
  font-size: 18px;
  margin-top: 15px;
  margin-left: 45px;
  color: ${Colors.GRAY_DARK};
`;

export const ContainItemTwo = styled.View`
  width: 100%;
  height: 60px;
  flex-direction: row;
  background-color: ${Colors.WHITE};
`;

export const PassKey = styled.View`
  width: 100%;
  flex-direction: column;
  margin-top: 10px;
`;

export const Pass = styled.View`
  border-color: ${Colors.PRIMARY};
  border-width: 1px;
  border-radius: 20px;
  margin-top: 10px;
  flex-direction: row;
  height: 25px;
  margin-left: 25px;
  width: 25%;
`;

export const TextPass = styled.Text`
  font-size: 16px;
  margin-left: 20px;
  width: 50%;
  color: ${Colors.GRAY};
`;

export const Icon = styled.Image`
  margin-top: 8px;
  margin-left: 10px;
  width: 8px;
  height: 8px;
`;

export const IconRemove = styled.Image`
  width: 12px;
  height: 12px;
`;
