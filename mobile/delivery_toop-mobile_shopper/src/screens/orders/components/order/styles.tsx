import styled from 'styled-components/native';
import {StyleSheet} from 'react-native';

import {Colors} from '../../../../styles';

export const styles = StyleSheet.create({
  checkStyle: {},
});

export const PriceText = styled.Text`
  font-size: 12px;
  color: ${Colors.PRIMARY};
`;

export const PriceSmallText = styled.Text`
  font-size: 8px;
  color: ${Colors.PRIMARY};
`;

export const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;

export const ContainerModal = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;

export const Contain = styled.View`
  width: 90%;
  height: 60px;
  align-self: center;
  background-color: ${Colors.GRAY_LIGHT};
  border-radius: 40px;
  flex-direction: row;
  justify-content: space-between;
`;
export const AvatarContain = styled.View`
  flex-direction: row;
  width: 85%;
`;

export const Avatar = styled.Image`
  border-radius: 40px;
  margin-left: 5px;
  margin-top: 5px;
  height: 55px;
  width: 55px;
`;

export const TextContain = styled.View`
  flex-direction: column;
  flex: 1;
`;
export const Text = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-left: 5px;
  margin-top: 10px;
  color: ${Colors.GRAY_DARK};
`;
export const SubText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-left: 5px;
  color: ${Colors.PRIMARY};
`;

export const Image = styled.Image`
  width: 100%;
  margin-top: 20px;
  height: 50px;
`;

export const SubContain = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding-left: 20px;
  padding-right: 20px;
`;

export const TextSubContain = styled.Text`
  font-size: 14px;
  text-transform: uppercase;
  font-weight: bold;
  color: ${Colors.PRIMARY};
`;

export const TextCancel = styled.Text`
  font-size: 12px;
  color: ${Colors.PRIMARY};
  margin-left: 2px;
`;

export const ImageContain = styled.Image`
  width: 15px;
  height: 15px;
`;

export const ImageMessage = styled.Image`
  width: 24px;
  height: 24px;
  margin-right: 20px;
  margin-top: 20px;
`;

export const TextAndImage = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const TitleList = styled.Text`
  font-size: 14px;
  color: ${Colors.BLACK};
  font-weight: bold;

  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;
`;

export const Footer = styled.View`
  width: 100%;
  height: 50px;
  position: absolute;
  bottom: 0;
  background-color: #eee;
  /* elevation: 3; */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  flex-direction: row;
`;

export const ButtonFooter = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const TextButtonFooter = styled.Text`
  font-size: 14px;
  color: ${Colors.BLACK};
  text-align: center;
  font-weight: bold;
`;

export const ButtonCenter = styled.TouchableOpacity`
  width: 40%;
  elevation: 3;
  border-color: ${Colors.BLACK};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  background-color: ${Colors.PRIMARY};
`;
export const TextButtonCenter = styled.Text`
  font-size: 16px;
  margin-top: 15px;
  color: ${Colors.WHITE};
  text-align: center;
`;

export const ContainInput = styled.View`
  flex-direction: row;
  align-self: center;
`;

export const BarCode = styled.View`
  border-color: ${Colors.GRAY};
  border-width: 1px;
  border-radius: 12px;
  margin-left: 10px;
  width: 20%;
`;

export const ImageCode = styled.Image`
  width: 30px;
  height: 30px;
  align-self: center;
  margin-top: 10px;
`;

export const InputModal = styled.TextInput`
  width: 60%;
  border-radius: 12px;
  border-color: ${Colors.GRAY};
  border-width: 1px;
  background-color: ${Colors.WHITE};
  color: ${Colors.GRAY};
`;

export const Inputqtd = styled.TextInput`
  height: 40px;
  background-color: ${Colors.WHITE};
  border-left-color: ${Colors.GRAY};
  border-left-width: 1px;
  border-right-color: ${Colors.GRAY};
  border-right-width: 1px;
  color: ${Colors.GRAY};
`;

export const Button = styled.TouchableOpacity`
  width: 90%;
  height: 60px;
  align-self: center;
  position: absolute;
  bottom: 0;
  elevation: 3;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: ${Colors.WHITE};
`;

export const TitleButton = styled.Text`
  font-size: 18px;
  margin-top: 15px;
  text-align: center;
  color: ${Colors.GRAY};
`;

export const List = styled.View`
  margin-top: 10px;
  flex-direction: row;
  border-color: ${Colors.GRAY};
  border-width: 0.5px;
  border-style: dashed;
  border-radius: 10px;
  padding: 10px;
`;

export const TextView = styled.View`
  width: 100%;
  padding-right: 40px;
`;

export const TextList = styled.Text`
  color: ${(props: any) => (props.red ? `${Colors.PRIMARY}` : Colors.GRAY)};
  font-size: 14px;
  margin-left: 10px;
  margin-right: 10px;
`;

export const ComplementText = styled.Text`
  font-size: 10px;
  margin-left: 10px;
  margin-right: 0px;
  color: ${Colors.GRAY};
`;

export const Check = styled.View`
  border-right-color: #ddd;
  border-right-width: 1px;
  /* width: 20%; */
  justify-content: center;
  align-items: center;
  padding-right: 10px;
`;

export const ImageX = styled.Image`
  width: 10px;
  height: 10px;
`;

export const ViewContent = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding-left: 5px;
`;

export const ViewImage = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

export const Icon = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 5px;
  background-color: ${Colors.GRAY_LIGHT};
  border: 1px;
  border-style: solid;
  border-width: 1px;
  border-color: ${Colors.GRAY_LIGHT};
`;

export const InputView = styled.View`
  border-color: ${Colors.GRAY};
  border-width: 1px;
  border-radius: 12px;
  flex-direction: row;
  width: 82%;
  height: 44px;
  margin-top: 10px;
  align-self: center;
`;

export const Plus = styled.TouchableOpacity`
  width: 20%;
`;
export const Minus = styled.TouchableOpacity`
  width: 20%;
`;
export const Sinal = styled.Text`
  font-size: 30px;
  text-align: center;
  color: ${Colors.GRAY};
`;

export const ContentTabs = styled.View`
  width: 100%;
  height: 60px;
`;

export const TouchMsg = styled.TouchableOpacity`
  flex: 1;
`;
