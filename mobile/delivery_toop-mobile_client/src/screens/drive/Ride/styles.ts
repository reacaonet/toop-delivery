import {StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../../styles';
import styled from 'styled-components/native';

export const styles = StyleSheet.create({
  progressBar: {
    marginLeft: 10,
    marginBottom: 10,
    color: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
    borderWidth: 0,
    borderRadius: 10,
  },
});

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  margin-top: 20px;
  flex-direction: row;
  background-color: ${Colors.WHITE};
  margin-left: 5px;
`;

export const HeaderBackTouch = styled.TouchableOpacity`
  padding: 5px;
`;

export const IconBack = styled(Icon)``;

export const TouchConfirm = styled.TouchableOpacity`
  flex-direction: row;
  padding: 10px;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.PRIMARY};
  border-radius: 5px;
  elevation: 3;
`;

export const ConfirmTitle = styled.Text`
  color: ${Colors.WHITE};
  font-weight: bold;
`;
