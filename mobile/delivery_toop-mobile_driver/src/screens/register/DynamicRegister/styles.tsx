import styled from 'styled-components/native';
import { Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../styles';

export const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: 90,
  },
  animatedStyle: {
    width: '100%',
    height: '100%',
    // flex: 1,
  },
});

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  width: 100%;
  height: 59px;
  background-color: ${Colors.GREY_BACKGROUND};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  padding-right: 20px;
  elevation: 3;
`;

export const HeaderIcon = styled(Icon)`
  color: ${Colors.BLACK};
`;

export const Content = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const ScrollView = styled.ScrollView`
  flex-grow: 1;
  background-color: ${Colors.WHITE};
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
`;

export const ContentItem = styled.View`
  background-color: ${Colors.WHITE};
`;

export const Footer = styled.View`
  margin-top: 10px;
  flex-direction: column;
  position: absolute;
  bottom: 10px;
  margin-left: 20px;
  margin-right: 20px;
  width: ${Dimensions.get('window').width - 40}px;
`;

export const ContainerLoad = styled.View`
  width: 100%;
  height: ${Dimensions.get('window').height * 0.8}px;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
`;
