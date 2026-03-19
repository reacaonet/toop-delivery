import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import { Colors } from '../../../../styles';

export const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  iconDimesion: {
    width: 32,
    height: 32,
  },
});

export const Container = styled.View`
  flex: 1;
`;

export const ContainerLoad = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const Load = styled.ActivityIndicator``;
