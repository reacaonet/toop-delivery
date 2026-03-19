import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import { Colors } from '../../../../../styles';

export const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '70%',
  },
  iconDimesion: {
    width: 32,
    height: 32,
  },
});

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const ContentMarker = styled.View`
  position: absolute;
  top: 0;
  bottom: 30px;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;
