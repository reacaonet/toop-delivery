
import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../styles';


export const styles = StyleSheet.create({
  icon: {
    color: '#992326',
    marginRight: 10,
    marginTop: 10,
    
  
  },
  
  iconGoBack: {
    color: '#992326',
    marginLeft: 5
  },
});

export const Container = styled.View`
  width: 90%;
  height: 120px;
  border-radius: 8px;
  margin-top: 10px;
  background-color: #e2e2e2;
  align-self: center;
`;

export const Contain = styled.View`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  background-color: #e2e2e2;

`;

export const Footer = styled.View`
  width: 100%;
  height: 60px;
  position: absolute;
  bottom: 0;
  background-color: #e2e2e2;
`

export const ContainCard = styled.View`
  width: 100%;
  height: 60px;
  background-color: #e2e2e2;
  flex-direction: row
`;

export const DrawerHeaderWrapper = styled.View`
  background-color:#000;
  height: 30%;
  flex-direction: row;
`;

export const Border = styled.View`
  width: 90%;
  margin-top: 20px;
  align-self: center;
  border-color: #fff;
  border-width: 1px;
`;

export const ContainerText = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ButtonContain = styled.View`
  align-self: center; 
  height: 40px;
  background-color:  #000;
  border-bottom-left-radius: 8;
  border-bottom-right-radius: 8;
  width: 100%;
`;

export const ButtonCard = styled.TouchableOpacity`
  align-self: center; 
  height: 40px;
  margin-top: 20px;
  background-color:  #992326;
  border-radius: 8;
  width: 90%;
`;

export const ButtonContainText = styled.Text`
  color: #fff;
  margin-left: 10px;
  margin-top: 10px;
 
`
export const ButtonCardText = styled.Text`
  color: #ffff;
  margin-left: 10px;
  margin-top: 10px;
  text-align: center;
`

export const Text = styled.Text`
  margin-top: 10px;
  margin-left: 10px;
  font-size: 17px;
  color:#000;
`;

export const ImageCard = styled.Image`
  width: 20px;
  height: 20px;
  margin-top: 10px;
  margin-left: 20px;

`;

export const Cards = styled.Image`
  width: 30px;
  height: 30px;
  margin-left: 20px;
  margin-top: 5px
`;

export const SubText = styled.Text`
  margin-top: 5px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 15px;
  color:#e2e2e2;
`;

export const Button = styled.TouchableOpacity`
  flex-direction: row;
  width: 100%;
`;


export const ViewText = styled.View`
  flex-direction: row;
  width: 100%;
  justify-content: center
  margin-top: 10px;
`;

export const ViewCard = styled.View`
  flex-direction: row;
`;

export const ViewCardList = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
`;

export const Devider = styled.View`
  margin-top: 10px;
  width: 90%;
  align-self: center;
  border-bottom-width: 1px;
  border-bottom-color: #e2e2e2;
`;

export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%
`;

export const TextTitle = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 17px;
  color: #992326;
`;

export const CardContain = styled.Text`
  margin-right: 20px;
  margin-left: 20px;
  margin-bottom: 10px;
  height: 100%;
  font-size: 17px;
  color: #000;
`;


export const Title = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  font-weight: bold;
  font-size: 18px;
  color:#992326;
`

export const ContainIndex = styled.View`
  flex: 1;
  width: 100%
  background-color: #fff;
`

export const Input = styled.TextInput`
  width: 90%;
  height: 45px;
  align-self: center;
  margin-top: 10px;
  border-bottom-color: #e2e2e2;
  border-bottom-width: 1;
  padding-left: 20px;
`
export const ContainInputVal = styled.View`
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`

export const InputVal = styled.TextInput`
  width: 42%;
  height: 45px;
  align-self: center;

  margin-top: 10px;
  border-bottom-color: #e2e2e2;
  border-bottom-width: 1;
  padding-left: 20px;
`