
import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../../../styles';


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
  width: 90%;
  height: 40px;
  border-radius: 8px;
  margin-top: 10px;
  background-color: #e2e2e2;
  align-self: center;
`;

export const DrawerHeaderWrapper = styled.View`
  background: #000;
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
  background-color:  #992326;
  border-bottom-left-radius: 8;
  border-bottom-right-radius: 8;
  width: 100%;
`;

export const ButtonContainText = styled.Text`
  color: #fff;
  margin-left: 10px;
  margin-top: 10px;
`

export const Text = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 17px;
  
  color: #992326;
`;

export const SubText = styled.Text`
  margin-top: 5px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 15px;
  color: #992326;
`;

export const Button = styled.TouchableOpacity`
  flex-direction: row;
  width: 100%;
`;


export const ViewText = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;


export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const TextTitle = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 17px;
  color:  #992326;
`;

export const Title = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  font-weight: bold;
  font-size: 18px;
  color: #992326
`

export const ContainIndex = styled.View`
  flex: 1;
  backgroundColor: #fff
`