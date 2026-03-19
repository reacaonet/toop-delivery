import {StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {Colors} from '../../../../styles';

export const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const Container = styled.View`
  width: 100%;
  height: 70%;
  margin-top: 20px;
  background-color: ${Colors.GRAY_LIGHT};
  elevation: 1;
`;
