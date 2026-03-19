import React, {FunctionComponent, useState, useContext} from 'react';
import {StyleSheet, Image, Switch, View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Colors} from '../../../styles';
import {ReactReduxContext} from 'react-redux';

import {
  updateAvailability,
  listDeliveryOne,
} from '../../../services/provider/company';

type HeaderIconProps = {
  navigation?: any;
};

const HeaderIcon: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  const openMenu = () => {
    navigation.toggleDrawer();
  };

  return <Icon name="menu" size={30} style={styles.icon} onPress={openMenu} />;
};

const Back: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  return (
    <Icon
      name="navigate-before"
      size={30}
      style={styles.icon}
      onPress={() => navigation.navigate('Orders')}
    />
  );
};

const BackStore: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  return (
    <Icon
      name="navigate-before"
      size={50}
      style={styles.icon}
      onPress={() => navigation.goBack()}
    />
  );
};

const HeaderSearch: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  return (
    <Image
      source={require('../../../assets/images/searchred.png')}
      style={{marginRight: 20}}
    />
  );
};

const HeaderSwitch: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <Switch
      trackColor={{false: '#767577', true: Colors.PRIMARY}}
      thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
      ios_backgroundColor="#3e3e3e"
      onValueChange={toggleSwitch}
      style={{marginRight: 20}}
      value={isEnabled}
    />
  );
};

const HeaderAvailability: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  const {store} = useContext(ReactReduxContext);

  const company = store.getState()?.authUser?.user?.company;
  const [isEnabled, setIsEnabled] = React.useState(false);

  const toggleSwitch = () => {
    setIsEnabled((previousState) => {
      updateAvailability(company._id, !previousState);
      return !previousState;
    });
  };

  const getCompany = async () => {
    const data = await listDeliveryOne(company._id);
    if (data) setIsEnabled(data.isOpen);
  };

  React.useEffect(() => {
    getCompany();
  }, [company]);

  return (
    <View style={styles.menuContainer}>
      <View style={styles.viewSwitch}>
        {isEnabled ? (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>ABERTO</Text>
        ) : (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>FECHADO</Text>
        )}
        <Switch
          trackColor={{
            false: Colors.BLACK,
            true: Colors.SUCCESS,
          }}
          thumbColor={isEnabled ? Colors.SUCCESS : Colors.ALERT}
          ios_backgroundColor="#FFFFFF"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
    </View>
  );
};

const HeaderBack: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  const back = () => {
    try {
      navigation.goBack();
    } catch (err) {
      console.log('Fail goBack');
    }
  };

  return (
    <Icon
      name="navigate-before"
      size={30}
      style={styles.icon}
      onPress={() => back()}
    />
  );
};

export default HeaderIcon;
export {
  HeaderIcon,
  HeaderBack,
  HeaderSearch,
  HeaderSwitch,
  Back,
  BackStore,
  HeaderAvailability,
};

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: Colors.PRIMARY,

    position: 'absolute',
    marginLeft: 5,
  },
  viewSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    marginRight: 10,
  },
  txtSwitch: {
    fontSize: 8,
  },
});
