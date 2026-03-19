/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../styles';

const DrawerContent = (props: any) => {
  return (
    <View style={styles.content}>
      <DrawerContentScrollView {...props}>
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <Icon name="home" color={Colors.PRIMARY} size={25} />}
          label="Home"
          onPress={() => {
            props.navigation.navigate('Home', {screen: 'Home'});
          }}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={({color, size}) => (
            <Icon name="exit-to-app" color={Colors.PRIMARY} size={25} />
          )}
          label="Sair"
          onPress={() => props.onCleanAuth()}
        />
      </DrawerContentScrollView>
    </View>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  label: {
    color: Colors.PRIMARY_DARK,
    fontSize: 16,
  },
});
