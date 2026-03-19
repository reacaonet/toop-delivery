/* eslint-disable react-hooks/exhaustive-deps */
import React, {FunctionComponent, useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
import HeaderScreen from '../../../components/shared/header/headerScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

//import CartAdd from './cartAdd';
import {formatterAmount, formatMoney} from '../../../utils';
import ButtonPrimary from '../../../components/shared/button/ButtonPrimary';
import RemoveItem from './removeItem';
import AddProduct from './addProduct';

import {
  updateItemCheck,
  deleteCartItem,
} from '../../../services/provider/shopping/cartItem';
import {chatMessage} from '../../../services/provider/chat';
import cartCustomer from '../../../services/provider/shopping/cart/list';

type ProductProps = {
  modal: Function;
  cartItem: any;
  shopper: any;
  order: any;
  refresh: Function;
};

const Products: FunctionComponent<ProductProps> = ({
  modal,
  cartItem,
  shopper,
  order,
  refresh,
}: ProductProps) => {
  const [itens, setItens] = useState(cartItem);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalAddProduct, setModalAddProduct] = useState(false);
  const [loadCheck, setLoadCheck] = useState(false);
  const [loadCurrent, setLoadCurrent]: any = useState(null);
  const [itemSelect, setItemSelect]: any = useState({});
  const [cartUser, setCartUser]: any = useState([]);

  const close = () => {
    modal(false);
  };

  useEffect(() => {
    return () => {
      //modal(false);
      //setModalAddProduct(false);
      setModalConfirm(false);
    };
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

  const priceCurrent = (item: any) => {
    try {
      let price =
        item.pricePromotion && item.pricePromotion !== null
          ? item.pricePromotion
          : item.price;

      return formatMoney(price * item.amount);
    } catch (err) {
      return '';
    }
  };

  const remove = (item: any) => {
    setItemSelect(item);
    setModalConfirm(true);
  };

  const removeConfirmed = async () => {
    setModalConfirm(false);
    const resp = await deleteCartItem(shopper._id, itemSelect._id);

    if (resp && resp.errMessage) {
      Alert.alert('Opps', resp.errMessage);
      return;
    }

    if (resp && resp.isDeleted && resp.isDeleted === true) {
      chatMessage({
        message: `Produto Removido ${itemSelect.product.name}`,
        shoppingCart: order.shoppingCart,
        personId: shopper._id,
        person: 'shopper',
        personSendId: order.customer._id,
        personSend: 'customer',
      });
    }

    await refresh();
    //console.log('Remover Produto', itemSelect);
  };

  const checkItem = async (item: any) => {
    setLoadCurrent(item);
    setLoadCheck(true);
    const resp: any = await updateItemCheck(shopper._id, {
      itemId: item._id,
    });

    if (resp && resp.errMessage) {
      setLoadCheck(false);
      setLoadCurrent(null);
      Alert.alert('Opps', resp.errMessage);
      return;
    }

    await refresh();
    setLoadCheck(false);
    setLoadCurrent(null);
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
          <View style={styles.productIcon}>
            <TouchableOpacity onPress={() => checkItem(item)}>
              {item && item.shopperCheck ? (
                <Icon name="radio-button-checked" size={30} />
              ) : (
                <Icon name="radio-button-unchecked" size={30} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.productImageContainer}>
            <Image
              source={{uri: product.images[0]}}
              resizeMode="contain"
              style={styles.productImage}
            />
          </View>

          <View style={styles.productInfo}>
            <Text>{`${item.amount} x ${product.name}`}</Text>
          </View>

          <TouchableOpacity onPress={() => remove(item)}>
            <Icon name="clear" size={30} style={styles.productIconRemove} />
          </TouchableOpacity>
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

  const optionsFlatList = (item: any) => {
    return (
      <View style={styles.optionsFlatList}>
        <View style={styles.confirmBtn}>
          <TouchableOpacity onPress={() => checkItem(item)}>
            <Text style={styles.txtRemove}>
              {item.shopperCheck ? 'Desmarcar' : 'Confirmar'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.spacingHorizontal} />
        <View style={styles.removeBtn}>
          <TouchableOpacity onPress={() => remove(item)}>
            <Text style={styles.txtRemove}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      <HeaderScreen title={'Lista do pedido'} onClose={close} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalConfirm}
        onRequestClose={() => setModalConfirm(false)}>
        <RemoveItem modal={setModalConfirm} onConfirm={removeConfirmed} />
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAddProduct}
        onRequestClose={() => setModalAddProduct(false)}>
        <AddProduct
          modal={setModalAddProduct}
          shopper={shopper}
          order={order}
          refreshCard={refresh}
        />
      </Modal>

      <View style={styles.content}>
        <FlatList
          style={styles.flatStyle}
          data={itens}
          keyExtractor={(item: any) => `${item._id}`}
          renderItem={({item}) => flatListRender(item)}
          ItemSeparatorComponent={divider}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.containerBottom}>
        {cartUser && cartUser.cart ? (
          <>
            <TouchableOpacity
              style={styles.addProduct}
              onPress={() => setModalAddProduct(true)}>
              <Icon name="add-circle" size={50} style={styles.addProductIcon} />
            </TouchableOpacity>

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
