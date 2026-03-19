import React, {FunctionComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors, Typography} from '../../styles';

import {
  separationStatus,
  waitDeliveryManStatus,
  withdrawalStatus,
} from '../../services/provider/shopping/order';

type OrderTabsProps = {
  status: string;
};

const OrderTabs: FunctionComponent<OrderTabsProps> = ({
  status,
}: OrderTabsProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.tabs, styles.listRight]}>
        <View
          style={[
            separationStatus(status)
              ? styles.stepList
              : styles.stepListSecondary,
          ]}
        />
        <Icon
          name="circle"
          size={25}
          style={[
            separationStatus(status)
              ? styles.iconPrimary
              : styles.iconSecondary,
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabs}>
        <View
          style={[
            waitDeliveryManStatus(status)
              ? styles.stepList
              : styles.stepListSecondary,
          ]}
        />
        <Icon
          name="circle"
          size={25}
          style={[
            waitDeliveryManStatus(status)
              ? styles.iconPrimary
              : styles.iconSecondary,
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabs}>
        <View
          style={[
            status === 'FINISHED' || status === 'CANCELED'
              ? styles.stepList
              : styles.stepListSecondary,
          ]}
        />
        <Icon
          name="circle"
          size={25}
          style={[
            status === 'FINISHED' || status === 'CANCELED'
              ? styles.iconPrimary
              : styles.iconSecondary,
          ]}
        />

        {/* <Text style={styles.titleTab}>Entrega</Text> */}
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabs}>
        <View
          style={[
            status === 'FINISHED' || status === 'CANCELED'
              ? styles.stepList
              : styles.stepListSecondary,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default OrderTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabs: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  stepList: {
    flex: 1,
    height: 4,
    marginRight: -10,
    backgroundColor: Colors.PRIMARY,
  },
  stepListSecondary: {
    flex: 1,
    height: 4,
    marginRight: -10,
    backgroundColor: Colors.GRAY_MEDIUM,
  },
  iconPrimary: {
    color: Colors.PRIMARY,
  },
  iconSecondary: {
    color: Colors.GRAY_MEDIUM,
  },
  listRight: {
    //borderRightWidth: 1,
    //backgroundColor: 'orange',
  },
  titleTab: {
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: 'bold',
    color: Colors.GREY,
  },
});
