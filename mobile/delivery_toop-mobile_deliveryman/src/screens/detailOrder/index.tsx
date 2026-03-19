/* eslint-disable react-hooks/exhaustive-deps */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import styles from './styles';
import NetInfo from '@react-native-community/netinfo';
import { formatMoney } from '../../utils';

import cartCustomer from '../../services/provider/shopping/cart/list';

type ProductProps = {
  modal: Function;
  cartItem: any;
  shopper: any;
  order: any;
  refresh: Function;
  navigation: any;
};

const Products: FunctionComponent<ProductProps> = ({
  navigation,
  cartItem,
  order,
}: ProductProps) => {
  const [itens, setItens] = useState(cartItem);
  const [cartUser, setCartUser]: any = useState([]);

  const CheckConnectivity = () => {
    NetInfo.fetch().then((state: any) => {
      if (!state.isConnected) {
        navigation.navigate('Connectivity');
      }
    });
  };

  useEffect(() => {
    CheckConnectivity();
  }, []);

  useEffect(() => {
    getCartCustomer();
    setItens(cartItem);
  }, [cartItem]);

  const getCartCustomer = async () => {
    if (order && order.shoppingCart) {
      let respCartUser: any = await cartCustomer(order.shoppingCart, {
        delivery: 'true',
        type: order.company.type,
      });
      if (respCartUser) {
        setCartUser(respCartUser);
      }
    }
  };

  const itemCart = (item: any) => {
    let product = null;

    if (item.product) {
      product = item.product;
    } else if (item.foodProduct) {
      product = item.foodProduct;
    }

    //console.log('Itens Product', product);
    if (!product) {
      return product;
    }

    return (
      <>
        <View style={styles.cartItemProduct}>
          <View style={styles.productImageContainer}>
            <Image
              source={{ uri: product.images[0] }}
              resizeMode="contain"
              style={styles.productImage}
            />
          </View>

          <View style={styles.productInfo}>
            <Text>{`${item.amount} x ${product.name}`}</Text>
          </View>
        </View>

        {/* <View key={`${item._id}`} style={styles.imageContainer}>
          {item && product && product.images && (
            <Image
              style={styles.imageProduct}
              source={{uri: product.images[0]}}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={styles.txtNameProd}>
          {`${item.amount} x ${product.name}`}
        </Text> */}
      </>
    );
  };

  const flatListRender = (item: any) => {
    return (
      <>
        {/* <View key={`${item._id}`} style={styles.cartItemProduct}>
          {itemCart(item)}
          <Text style={styles.txtPrice}>{priceCurrent(item)}</Text>
          <View style={styles.checkContainer}>
            {loadCheck === true &&
            loadCurrent &&
            loadCurrent._id === item._id ? (
              <ActivityIndicator size="small" color="#3973B6" />
            ) : null}

            {item.shopperCheck === true &&
            (!loadCurrent || loadCurrent._id !== item._id) ? (
              <Icon name="check" size={40} style={styles.check} />
            ) : null}
          </View>
        </View>
        {optionsFlatList(item)} */}

        <View key={`${item._id}`} style={styles.cartItemContainer}>
          {itemCart(item)}
        </View>
      </>
    );
  };

  const totalPrice = () => {
    try {
      let total = cartUser.subTotalNormal;
      let deliveryFee = cartUser.deliveryFee ? cartUser.deliveryFee : 0;
      return formatMoney(total + deliveryFee);
    } catch (err) {
      return '';
    }
  };

  const divider = () => {
    return <View style={styles.divider} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FlatList
          style={styles.flatStyle}
          data={itens}
          keyExtractor={(item: any) => `${item._id}`}
          renderItem={({ item }) => flatListRender(item)}
          ItemSeparatorComponent={divider}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.containerBottom}>
        {cartUser && cartUser.cart ? (
          <>
            <View style={styles.listSub}>
              <Text style={styles.subTitle}>Valor do pedido</Text>
              <Text style={styles.subPrice}>{`${formatMoney(
                cartUser.subTotalNormal,
              )}`}</Text>
            </View>

            <View style={styles.listSub}>
              <Text style={styles.subTitle}>Itens do pedido</Text>
              <Text style={styles.subPrice}>{cartUser.totalItens} un</Text>
            </View>

            {cartUser.deliveryFee ? (
              <View style={styles.listSub}>
                <Text style={styles.subTitle}>Taxa de Entrega</Text>
                <Text style={styles.subPrice}>
                  {formatMoney(cartUser.deliveryFee)}
                </Text>
              </View>
            ) : null}
            {order?.note ? (
              <View style={styles.listSub}>
                <Text style={styles.subTitle}>Observação</Text>
                <Text style={styles.subPrice}>{order?.note}</Text>
              </View>
            ) : null}

            <View style={styles.listSub}>
              <Text style={styles.subTitle}>Total</Text>
              <Text style={styles.subPrice}>{totalPrice()}</Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
};

export default Products;
