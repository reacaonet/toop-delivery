/* eslint-disable react-hooks/exhaustive-deps */
import React, {FunctionComponent, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Colors, Typography} from '../../styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {cartItemComplement} from '../../services/provider/shopping/food';

import {formatMoney} from '../../utils';

type modalDetailRestaurantProps = {
  modal: Function;
  cartItem: any;
};

const ModalDetailRestaurant: FunctionComponent<modalDetailRestaurantProps> = ({
  modal,
  cartItem,
}: modalDetailRestaurantProps) => {
  const [complements, setComplements] = useState([]);
  const [load, setLoad] = useState(false);

  const goBack = () => {
    modal(false);
  };

  useEffect(() => {
    return () => {
      // modal(false);
    };
  }, []);

  useEffect(() => {
    if (cartItem && cartItem._id) {
      getCartItemComplement(cartItem._id);
    }
  }, [cartItem]);

  const getCartItemComplement = async (cartItemId: string) => {
    try {
      setLoad(true);
      let listComplements = await cartItemComplement(cartItemId);
      let groups = getGroupBy(listComplements);

      if (groups) {
        setComplements(groups);
      }

      setLoad(false);
    } catch (err) {
      setLoad(false);
    }
  };

  const getGroupBy = (listComplements: any) => {
    try {
      let keyComplements: any = Object.create(null);
      return listComplements.reduce(
        (resultComplement: any, complement: any) => {
          try {
            let category = complement.foodProductComplement.name;
            let name = complement.name;

            if (keyComplements[category] >= 0) {
              keyComplements[category] = keyComplements[category] + 1;
            } else {
              keyComplements[category] = 0;
            }

            keyComplements[category];
            let item = resultComplement[`${category}`] ?? [];

            resultComplement[`${category}`] = [
              ...item,
              {
                name,
                description: complement.description,
                price: complement?.price || 0,
              },
            ];

            return resultComplement;
          } catch (err) {
            console.log('Fail', err);
            return resultComplement;
          }
        },
        Object.create(null),
      );
    } catch (err) {
      return [];
    }
  };

  const renderItem = (result: any, name: string) => {
    let keyView = `${Math.random()}`;

    return (
      <View key={keyView}>
        <Text style={styles.txtName}>{name}</Text>
        {result[name].map((complement: any) => {
          return (
            <View key={`${Math.random()}`}>
              <View style={styles.complementInfo}>
                <Text style={styles.txtComplement}> * {complement.name}</Text>
                <Text style={styles.txtComplement}>
                  {' '}
                  {formatMoney(complement?.price)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer} />
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.txtTitle}>Detalhes do Item</Text>
            <TouchableOpacity onPress={() => goBack()}>
              <Icon name="close" size={30} />
            </TouchableOpacity>
          </View>
          {!load ? (
            <View style={styles.complementContainer}>
              <Text style={styles.titleProduct}>
                {cartItem?.foodProduct?.name}
              </Text>

              {cartItem?.comment ? (
                <View style={styles.contentObservation}>
                  <Text style={styles.titleComment}>Observação: </Text>
                  <Text style={styles.txtComment}>{cartItem?.comment}</Text>
                </View>
              ) : null}

              {complements
                ? Object.keys(complements).map((name: any, _key: any) => {
                    return renderItem(complements, name);
                  })
                : null}
            </View>
          ) : (
            <View style={styles.activityIndicator}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          )}
        </ScrollView>
      </View>
      <View style={styles.footerContainer} />
    </View>
  );
};

export default ModalDetailRestaurant;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    flex: 1,
  },
  content: {
    height: '95%',
    backgroundColor: Colors.WHITE,
    marginHorizontal: 15,
    borderRadius: 10,
    elevation: 3,
  },
  footerContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  txtTitle: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.PRIMARY,
    flex: 1,
  },
  txtInfo: {
    marginTop: 10,
    fontSize: Typography.FONT_SIZE_14,
    textAlign: 'center',
  },
  complementContainer: {
    marginHorizontal: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    paddingBottom: 10,
    elevation: 3,
  },
  flatStyle: {
    flex: 1,
  },
  titleProduct: {
    fontSize: Typography.FONT_SIZE_15,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  activityIndicator: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtName: {
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.BLACK,
    fontWeight: 'bold',
  },
  txtComplement: {
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.PRIMARY,
  },
  contentObservation: {
    backgroundColor: Colors.WHITE,
    borderRadius: 5,
    marginVertical: 10,
    padding: 5,
  },
  titleComment: {
    fontWeight: 'bold',
  },
  txtComment: {
    color: Colors.PRIMARY,
  },
  complementInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
