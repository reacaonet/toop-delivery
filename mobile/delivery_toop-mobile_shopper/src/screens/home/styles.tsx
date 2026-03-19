import {
  StatusBar,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import {Colors, Typography} from '../../styles';

const {height} = Dimensions.get('window');

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  background-color: ${Colors.HEADER};
  width: 100%;
  height: 70px;
`;

export const MenuButton = styled(TouchableOpacity).attrs({
  backgroundColor: Colors.BLACK,
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderTopRightRadius: 5,
  borderBottomRightRadius: 5,
})`
  margin-top: 20px;
  margin-left: 15px;
`;

export const ContainText = styled.View`
  width: 90%;
  height: 120px;
  border-radius: 8px;
  margin-top: 10px;
  background-color: ${Colors.HEADER};
  align-self: center;
`;

export const TextName = styled.Text`
  font-size: 18px;
  margin-top: 10px;
  height: 30%;
  text-align: center;
  color: ${Colors.GREY};
`;
export const TextValue = styled.Text`
  font-size: 18px;
  height: 30%;
  text-align: center;
  color: ${Colors.PRIMARY};
`;
export const TextDetails = styled.Text`
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
  color: ${Colors.GREY};
`;
export const ContainLine = styled.View`
  margin-top: 10px;
  width: 90%;
  height: 35px;
  border-radius: 8px;
  align-self: center;
  background-color: ${Colors.HEADER};
  flex-direction: row;
  justify-content: space-between;
`;
export const TextContainLine = styled.Text`
  font-size: 16px;
  margin-top: 5px;
  margin-right: 10px;
  margin-left: 10px;
  text-align: center;
  color: ${Colors.GREY};
`;
export const ContainImage = styled.View`
  width: 90%;
  height: 90px;
  border-radius: 8px;
  margin-bottom: 10px;
  margin-top: 10px;
  align-self: center;
  background-color: ${Colors.HEADER};
`;
export const ImageGraph = styled.Image`
  width: 100%;
  height: 100%;
`;
export const ContainFooter = styled.View`
  width: 90%;
  height: 40px;
  /* margin-bottom: 10px; */
  margin-top: 10px;
  border-radius: 8px;
  align-self: center;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${Colors.HEADER};
`;
export const Dot1 = styled.Text`
  height: 8px;
  width: 8px;
  background-color: ${Colors.PRIMARY};
  margin-left: 10px;
  margin-top: 15px;
  opacity: 0.4;
  border-radius: 50px;
  color: ${Colors.PRIMARY};
`;
export const Dot = styled.Text`
  height: 8px;
  width: 8px;
  background-color: ${Colors.PRIMARY};
  margin-left: 10px;
  margin-top: 15px;
  border-radius: 50px;
  color: ${Colors.PRIMARY};
`;

export const TextFooter = styled.Text`
  font-size: 14px;
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  text-align: center;
  width: 30%;
  color: ${Colors.PRIMARY};
`;
export const TextFooterTitle = styled.Text`
  font-size: 14px;
  margin-top: 10px;
  margin-left: 10px;
  width: 30%;
  margin-right: 10px;
  color: ${Colors.GREY};
`;
