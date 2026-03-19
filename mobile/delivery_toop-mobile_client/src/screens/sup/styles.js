
import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../styles';
import { GRAY_DARK, GRAY_LIGHT } from '../../styles/colors';


export const styles = StyleSheet.create({
  icon: {
    color: '#992336',
    marginRight: 10,
    marginTop: 10,
    
  
  },
  
  iconGoBack: {
    color: '#992336',
    marginLeft: 5
  },
});

export const Container = styled.View`
  width: 90%;
  height: 120px;
  margin-top: 10px;
  background-color: #e2e2e2;
  align-self: center;
`;

export const ContainSubTitle = styled.View`
  width: 90%;
  height: 120px;
  background-color: #e2e2e2;
  align-self: center;
`;

export const Contain = styled.View`
  width: 90%;
  height: 60px;
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
  background-color:  #000;
  border-bottom-left-radius: 8;
  border-bottom-right-radius: 8;
  width: 100%;
`;

export const ButtonContainText = styled.Text`
  color:#fff;
  margin-left: 10px;
  margin-top: 10px;
`

export const Text = styled.Text`
  margin-top: 10px;
  margin-left: 10px;
  font-size: 17px;
  color: #000;
`;

export const LongText = styled.Text`
  font-size: 15px;
  margin-top: 20px;
  text-align: center;
  color: #e2e2e2;
`;




export const ImageCard = styled.Image`
  width: 20px;
  height: 20px;
  margin-top: 10px;
  margin-left: 20px;

`;
export const ContainPrice = styled.View`
  flex-direction: row;
  align-self: flex-end
`


export const SubText = styled.Text`
  margin-top: 5px;
  top: 30;
  margin-right: 10px;
  text-align: right;
  font-size: 30px;
  color: #000;
`;

export const Numb = styled.Text`
  margin-top: 5px;
  top: 18;
  margin-right: 10px;
  text-align: right;
  font-size: 42px;
  color: #000;
`;

export const BlackContain = styled.View`
  background-color: #000;
  align-self: center;  
  width: 90%;
  height: 60px
`
export const ContainText = styled.View`
  flex-direction: row;
  justify-content: space-between
`

export const TextBlackContain = styled.Text`
  color: #fff;
  font-size: 18px;
  margin-top: 15px;
  margin-left: 20px;
  margin-right: 10px;
`

export const Button = styled.TouchableOpacity`
  flex-direction: row;
  width: 100%;
`;


export const ViewText = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px
`;

export const ViewCard = styled.View`
  flex-direction: row;
`;

export const ViewCardList = styled.View`
  flex-direction: row;
  margin-left: 10px;
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

export const Separator = styled.View`
  height: 60px;
`;

export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 15px;
`;

export const TextTitle = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 17px;
  color: #000;
`;

export const Title = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  font-weight: bold;
  font-size: 18px;
  color: #992336;
`

export const ContainIndex = styled.View`
  flex: 1;
  backgroundColor: #fff;
`