import {StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {Colors, Typography} from '../../styles';

export const Container = styled.View`
  flex: 1;
  background: ${Colors.WHITE};
`;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
    alignContent: 'center',
  },
  title: {
    color: Colors.BLACK,
    fontSize: 20,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginBottom: 5,
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  description: {
    color: Colors.GREY,
    fontSize: 20,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginBottom: 5,
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  link: {
    color: Colors.PRIMARY,
    fontSize: 20,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginBottom: 5,
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
});
