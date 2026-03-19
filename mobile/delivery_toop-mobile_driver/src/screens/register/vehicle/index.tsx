import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

/** Styles */
import { Typography, Colors } from '../../../styles';

const Vehicle = () => {
  return (
    <View style={styles.container}>
      <TextInput />
    </View>
  );
};

export default Vehicle;

const styles = StyleSheet.create({
  container: {},
  inputStyle: {
    padding: 5,
    borderRadius: 5,
    borderColor: Colors.BLACK,
    backgroundColor: 'red',
    width: '100%',
    height: 50,
  },
});
