import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { signInFacebook } from '../../services/facebookLogin';
import Icon from '../../components/Icon/svg-files/facebook-logo.svg';
import { Typography } from '../../styles';
import { Colors } from 'react-native-paper';

export default function BtnFacebook({ navigation, onPress }) {
  const signIn = async () => {
    await signInFacebook(onPress);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => signIn()}>
      <Icon
        width={30}
        height={30}
        fill={'#385398'}
      />

      <Text style={styles.text}>Entrar com Facebook</Text>
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
