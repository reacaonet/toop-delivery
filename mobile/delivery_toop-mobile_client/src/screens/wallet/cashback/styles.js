
import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../../styles';



export const styles = StyleSheet.create({
  icon: {
    color:  '#992326',
    marginRight: 10,
    marginTop: 10,
    
  
  },
  
  iconGoBack: {
    color:  '#992326',
    marginLeft: 5
  },
});

export const ContainIndex = styled.View`
  flex: 1;
  backgroundColor:  #fff;
`

export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const ImageEmpresa = styled.Image`
  width: 90px;
  height: 90px;
  align-self: center;
`;

export const SubText = styled.Text`
  margin-top: 5px;
  top: 10;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color:  #992326;
`;

export const LongText = styled.Text`
  font-size: 15px;
  margin-top: 30px;
  text-align: center;
  color:  #747474;
`;

export const ContainSubTitle = styled.View`
  width: 100%;
  height: 90px;
  margin-top: 10px;
  justify-content: space-between;
  background-color:  #e2e2e2;
  align-self: center;
`;

export const ViewCard = styled.View`
  flex-direction: row;
  justify-content: space-between
`;

export const ImageCard = styled.Image`
  width: 40px;
  height: 40px;
  margin-top: 25px;
  margin-left: 20px;
`;

export const TextCard = styled.Text`
  margin-top: 30px;
  margin-right: 15px; 
  font-size: 18px;
  color:  #992326;
`;

export const TextFooter = styled.Text`
  font-size: 15px;
  margin-top: 30px;
  text-align: center;
  color:  #992326;
`;

export const ContainFooter = styled.View`
  width: 100%;
  height: 80px;
  bottom: 0px;
  position: absolute;
  justify-content: center;
  background-color:  #e2e2e2;
  align-items: center;
`;

export const TextContainFooter = styled.Text`
  margin-bottom: 10px;
  font-size: 13px;
  text-align: center;
  color:  #747474;
`;

export const Title = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  font-weight: bold;
  font-size: 18px;
  color:  #000;
`
export const Devider = styled.View`
  margin-top: 20px;
`;

export const Input = styled.TextInput`
  width: 90%;
  height: 45px;
  align-self: center;
  margin-top: 10px;
  border-color:  #e2e2e2;
  border-width: 1;
  border-radius: 8px;
  padding-left: 20px;
`
export const SubTitle = styled.Text`
  margin-top: 5px;
  margin-left: 30px;
  top: 10;
  text-align: left;
  font-size: 18px;
  color:  #000;
`
export const Sub = styled.Text`
  margin-top: 5px;
  margin-left: 30px;
  top: 10;
  text-align: left;
  font-size: 18px;

  color:  #e2e2e2;
`;

export const ViewInput = styled.View`
  flex-direction: row;
  justify-content: space-between
  margin-right: 40px;
`;

export const InputAddress = styled.TextInput`
  width: 60%;
  height: 45px;
  margin-left: 20px;
  margin-top: 10px;
  border-color:  #e2e2e2;
  border-width: 1;
  border-radius: 8px;
  padding-left: 20px;
`

export const InputNum = styled.TextInput`
  width: 35%;
  height: 45px;
  margin-left: 20px;
  margin-top: 10px;
  border-color:  #e2e2e2;
  border-width: 1;
  border-radius: 8px;
  padding-left: 20px;
`


export const Button = styled.TouchableOpacity`
  width: 90%;
  height: 50px;
  border-radius: 10px;
  align-self: center;
  background-color:  #000;
`;

export const ViewCheck = styled.View`
  flex-direction: row;
`;

export const Check = styled.Text`
  margin-top: 5px;
  top: 10;
  text-align: left;
  font-size: 18px;
  color:  #992326;
`

export const Numb = styled.Text`
  margin-top: 20px;
  margin-right: 10px;
  text-align: right;
  font-size: 30px;
  color:  #992326;
`;

export const ContainPrice = styled.View`
  flex-direction: row;
  justify-content: space-between
`
export const Text = styled.Text`
  margin-top: 30px;
  margin-left: 10px;
  font-size: 17px;
  color:  #992326;
`;

export const R = styled.Text`
  margin-top: 30px;
  font-size: 17px;
  color: #992326;
`;

export const Container = styled.View`
  width: 90%;
  height: 80px;
  margin-top: 10px;
  background-color:  #e2e2e2;
  align-self: center;
`;