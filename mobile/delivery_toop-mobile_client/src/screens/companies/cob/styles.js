
import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../../styles';

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

export const ContainIndex = styled.View`
  flex: 1;
  background-color: #fff;
`

export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const Input = styled.TextInput`
  width: 90%;
  height: 45px;
  
  margin-left: 25px;
  align-self: flex-start;
  font-size: 18px;
  margin-top: 30px;

`
export const SubTitle = styled.Text`
  margin-top: 5px;
  margin-left: 30px;
  top: 10;
  text-align: left;
  font-size: 18px;
  font-weight: bold;
  color: #992326;
`;

export const Title = styled.Text`
  margin-top: 5px;
  margin-left: 30px;
  top: 10;
  text-align: left;
  font-size: 18px;
  color: #992326;
`;

export const ViewInput = styled.View`
  flex-direction: row;
  justify-content: space-between
  margin-right: 40px;
`;



export const Button = styled.TouchableOpacity`
  width: 90%;
  height: 50px;
  border-radius: 10px;
  align-self: center;
  background-color: #000;
`;

