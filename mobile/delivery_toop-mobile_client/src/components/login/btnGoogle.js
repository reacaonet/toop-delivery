import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Typography, Colors } from '../../styles';

import { googleConfigure, signInGoogle } from '../../utils/loginGoogle';

import Icon from '../../components/Icon/svg-files/google-logo.svg';

export default function BtnGoogle({ navigation, onPress }) {
  useEffect(() => {
    googleConfigure();
  }, []);

  const signIn = () => {
    signInGoogle(onPress);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => signIn()}>
      <Icon
        width={30}
        height={30}
      />

      <Text style={styles.text}>Entrar com Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    margin: 5,
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
