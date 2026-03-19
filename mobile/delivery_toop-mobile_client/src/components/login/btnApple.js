import React from 'react';
import { Typography, Colors } from '../../styles';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

import signInApple from '../../services/appleLogin';
import Icon from '../../components/Icon/svg-files/apple-logo.svg';

export default function BtnApple({ navigation, onPress }) {
  const signIn = async () => {
    await signInApple(onPress);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => signIn()}>
      <Icon
        width={30}
        height={30}
        fill={Colors.BLACK}
      />

      <Text style={styles.text}>Entrar com Apple Id</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    margin: 5,
    marginBottom: 2,
    padding: '2%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dddee1',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    color: Colors.BLACK,
    marginLeft: 10
  }
});
