import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ReactReduxContext} from 'react-redux';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import {Colors} from '../../styles';
import App from './components/navigation';

import {listDeliveryOne} from '../../services/provider/company';
import {StorageSet} from '../../services/deviceStorage';

const Order = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {store} = React.useContext(ReactReduxContext);
  const company: any = store.getState()?.authUser?.user?.company;

  const getCompanyDelivery = () => {
    listDeliveryOne(company?._id).then((response) =>
      StorageSet('companyDelivery', response),
    );
  };

  React.useEffect(() => {
    getCompanyDelivery();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <App
        order={(params: any) =>
          navigation.navigate('Shopper', {
            screen: 'Detail',
            params,
          })
        }
        onPress={(params: any) =>
          navigation.navigate('Shopper', {
            screen: 'DetailDelivery',
            params,
          })
        }
        onConcl={(params: any) =>
          navigation.navigate('Shopper', {
            screen: 'DetailConcl',
            params,
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
});

export default Order;
