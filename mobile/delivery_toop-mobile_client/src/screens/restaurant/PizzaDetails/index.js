/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {connect} from 'react-redux';
import {Badge} from 'react-native-elements';
import {totalItem, checkItens} from '../../../utils/screens/pizzaUtils';
import CartItemProduct from './cartItemProduct';
import {Colors} from '../../../styles';
import Cart from '../cart';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import {useSelector} from 'react-redux';
import styles from './styles';

import {getToCart} from '../../../store/actions/cart';
import {addToCartRestaurant} from '../../../store/actions/cart';
import {formatMoney} from '../../../utils';
import {TextInput} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import LootieView from 'lottie-react-native';
import loaderLootie from '../../../assets/animations/loader.json';

const PizzaDetails = ({navigation, route, onAddToCart, onGetToCart}) => {
  const {configurations = null} = useSelector(state => state);

  const [load, setLoad] = useState(true);
  const [modalCart, setModalCart] = useState(false);

  const [product, setProduct] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [dough, setDough] = useState([]);
  const [edges, setEdges] = useState([]);

  const [company, setCompany] = useState(null);
  const [cartItem, setCartItem] = useState(cartItem);

  const [check, setCheck] = useState([]);
  const [radio, setRadio] = useState([]);

  const [total, setTotal] = useState(0);
  const [totalAdd, setTotalAdd] = useState(1);
  const [comment, setComment] = useState('');
  const inputComment = useRef(null);
  const scrollView = useRef(null);

  const category = route.params?.category ?? null;
  const size = route.params?.size ?? null;

  const [complement, setComplement] = useState([
    {
      _id: 'dough',
      amountMin: 1,
      amountMax: 1,
      isRequired: true,
      isRadio: true,
    },
    {
      _id: 'edges',
      amountMin: 1,
      amountMax: 1,
      isRequired: true,
      isRadio: true,
    },
    {
      _id: 'flavors',
      amountMin: size?.flavors,
      amountMax: size?.flavors,
      isRequired: true,
      isRadio: false,
    },
  ]);

  let setIsRequired = [];
  let setMinMax = [];

  useFocusEffect(
    useCallback(() => {
      const companyParam = route.params?.company ?? null;

      setCompany(companyParam);
      onGetToCart(companyParam?._id);

      const runProduct = async () => {
        setLoad(false);

        if (route?.params?.category?.dough) {
          setDough(route?.params?.category?.dough);
        }
        if (route?.params?.category?.edges) {
          setEdges(route?.params?.category?.edges);
        }
        if (route?.params?.category?.products) {
          setFlavors(route?.params?.category?.products);
        }
      };

      runProduct();
    }, [category?.key]),
  );

  useFocusEffect(
    useCallback(() => {
      const values = getTotalPrice();
      setTotal(
        totalItem(
          totalAdd,
          {_id: '', price: values.price},
          values.check,
          radio,
        ),
      );
    }, [totalAdd, check, radio, product]),
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params && route.params.cartItem) {
        const paramsItem = route.params?.cartItem ?? null;
        if (paramsItem) {
          setCartItem(paramsItem);

          if (paramsItem?.radio) {
            setRadio(paramsItem.radio);
          }

          if (paramsItem?.check) {
            setCheck(paramsItem.check);
          }

          if (paramsItem?.amount) {
            setTotalAdd(paramsItem.amount);
          }

          if (paramsItem?.comment) {
            setComment(paramsItem.comment);
          }

          //route?.params?.cartItem?.product?.category,
        }
      }
    }, [route.params]),
  );

  const getTotalPrice = () => {
    let higherValue = 0;
    let checkEnd = check;

    if (category?.billing_mode === 'HIGHEST_VALUE') {
      // baseado no maior valor

      // obtem o maior valor entre as pizzas
      higherValue = check
        .filter(i => i.quantity > 0)
        .sort((a, b) => {
          return b.realPrice - a.realPrice;
        })[0]?.realPrice;

      // zero os valores dos sabores
      checkEnd = check.map(i => {
        i.price = 0;
        return i;
      });
    }

    return {check: checkEnd, price: higherValue};
  };

  const cartScreen = qtd => {
    const prod = check.find(c => c.group == 'flavors');

    const values = getTotalPrice();

    onAddToCart(
      company,
      {_id: prod.id, price: values.price},
      qtd,
      values.check,
      radio,
      cartItem,
      comment,
      {
        isPizza: true,
        size: size?.name,
        pieces: size?.pieces,
        flavors: size?.flavors,
        billing_mode: category?.billing_mode,
      },
    );
    closeModal();
  };

  const closeModal = () => {
    setModalCart(false);
    navigation.navigate('RestaurantProduct', {
      company: company,
    });
  };

  const goBack = () => {
    navigation.navigate('RestaurantProduct', {
      company,
    });
  };

  const seRadio = (id, groupId, priceRadio) => {
    let index = radio.findIndex(e => e.group === groupId);
    let tmpRadio = [];

    if (index > -1) {
      if (radio[index].id === id) {
        tmpRadio = [...radio];
        tmpRadio.splice(index, 1);
        setRadio([...tmpRadio]);
      } else if (radio[index].id !== id) {
        tmpRadio = [...radio];
        tmpRadio.splice(index, 1);
        tmpRadio = [...tmpRadio, {group: groupId, id, price: priceRadio}];
        setRadio(tmpRadio);
      } else {
        tmpRadio = [...radio, {group: groupId, id, price: priceRadio}];
        setRadio(tmpRadio);
      }
    } else {
      tmpRadio = [...radio, {group: groupId, id, price: priceRadio}];
      setRadio(tmpRadio);
    }
  };

  const showRadio = (id, groupId) => {
    let index = radio.findIndex(e => e.group === groupId);

    if (index > -1) {
      if (radio[index].id === id) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const showCheck = id => {
    var existCheck = check.find(e => e.id === id);

    return existCheck;
  };

  const setCheckMultile = (
    name,
    id,
    groupId,
    priceCheck,
    qtyComplement,
    qtyItem,
    realPrice,
  ) => {
    let checkIndex = check.findIndex(c => c.id === id);
    let tmpCheck = [];
    let itemQtd = 0;

    check.map(c => {
      if (c.group === groupId) {
        itemQtd += c.quantity;
      }
    });

    if (check[checkIndex]?.quantity >= qtyItem) {
      tmpCheck = [...check];
      tmpCheck[checkIndex] = {
        group: groupId,
        name,
        id,
        price: priceCheck * qtyItem,
        quantity: qtyItem,
        realPrice: realPrice,
      };
      setCheck(tmpCheck);
      return;
    }

    if (itemQtd >= qtyComplement) {
      // removeQty(id, qtyItem - 1, groupId);
      Alert.alert(
        'Máximo permitido!!',
        `Você ultrapassou o máximo de opções permitidas que é ${qtyComplement}`,
      );
      return;
    }

    if (checkIndex < 0) {
      tmpCheck = [
        ...check,
        {
          group: groupId,
          id,
          name,
          price: priceCheck * qtyItem,
          quantity: qtyItem,
          realPrice: realPrice,
        },
      ];
      setCheck(tmpCheck);
    } else {
      if (qtyItem === 0) {
        tmpCheck = [...check];
        tmpCheck.splice(checkIndex, 1);
        setCheck(tmpCheck);
        return;
      }
      tmpCheck = [...check];
      tmpCheck[checkIndex] = {
        group: groupId,
        id,
        name,
        price: priceCheck * qtyItem,
        quantity: qtyItem,
        realPrice: realPrice,
      };
      setCheck(tmpCheck);
    }
  };

  const setRequired = id => {
    setIsRequired.push(id);
  };

  const getMinMax = (groupId, min, max) => {
    setMinMax.push({group: groupId, min, max});
  };

  const addCartItem = qtd => {
    if (qtd > 0) {
      setTotalAdd(qtd);
    }
  };

  const infoQtd = (min, max) => {
    if (min === max) {
      return `(Escolha. ${max})`;
    } else if (min > 0 && min !== max) {
      return `(Min. ${min} - Max. ${max})`;
    }

    return `(Max. ${max})`;
  };

  const onChangeComment = text => {
    if (text.length > 140) {
      return;
    }
    setComment(text);
  };

  useEffect(() => {
    const currentKeyboard = Keyboard.addListener(
      'keyboardDidShow',
      _keyboardDidHide,
    );

    // cleanup function
    return () => {
      try {
        if (currentKeyboard) {
          currentKeyboard.remove();
        }

        // Keyboard.removeListener('keyboardDidShow', _keyboardDidHide);
      } catch (err) {}
    };
  }, []);

  const _keyboardDidHide = () => {
    if (!inputComment) {
      return;
    }

    if (inputComment.current.isFocused()) {
      scrollView.current.scrollToEnd({animated: true});
    }
  };

  function _getMinimumPrice() {
    const prices = route?.params?.category?.products?.map(item => {
      const price = item.pricesSizesPizzas.find(i => i.name === size.name);

      if (price) {
        return price.price;
      } else {
        return 0;
      }
    });

    if (prices) {
      if (prices.length > 0) {
        return prices.sort((a, b) => {
          return a - b;
        })[0];
      } else {
        return 0;
      }
    }
  }
  //category?.billing_mode
  function _getMaximumPrice() {
    const prices = route?.params?.category?.products?.map(item => {
      const price = item.pricesSizesPizzas.find(i => i.name === size.name);

      return price.price;
    });
    if (prices) {
      if (prices.length > 0) {
        return prices.sort((a, b) => {
          return b - a;
        })[0];
      } else {
        return 0;
      }
    }
  }

  function _getPrice(item) {
    const price = item.pricesSizesPizzas.find(i => i.name === size.name);
    return (price?.price ?? 0) / (size?.flavors ?? 0);
  }

  // valor real da pizza, ou seja sem a divisão de sabores
  function _getRealPrice(item) {
    const price = item.pricesSizesPizzas.find(i => i.name === size.name);
    return price?.price ?? 0;
  }

  return (
    <KeyboardAvoidingView
      style={{flexGrow: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalCart}
          onRequestClose={() => setModalCart(false)}>
          <Cart
            close={closeModal}
            navigation={navigation}
            companyParam={company}
          />
        </Modal>

        <TouchableOpacity style={styles.header} onPress={() => goBack()}>
          <Icon
            name="keyboard-arrow-down"
            size={50}
            style={styles.iconBefore}
          />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} ref={scrollView}>
          {load ? (
            <View style={styles.loading}>
              <LootieView
                source={loaderLootie}
                style={{height: 60}}
                resizeMode="contain"
                loop
                autoPlay
              />
            </View>
          ) : null}

          <View style={styles.descriptContent}>
            <View style={styles.cardQtd}>
              <View style={styles.boxPrice}>
                <Text numberOfLines={2} style={styles.titleProduct}>
                  PIZZA {size?.name?.toUpperCase()}{' '}
                  <Text numberOfLines={2} style={styles.subtitleProduct}>
                    (
                    {`${size?.pieces}` === '1'
                      ? '1 pedaço'
                      : `${size?.pieces} pedaços`}
                    )
                  </Text>
                </Text>
                <Text numberOfLines={10} style={styles.txtprice}>
                  {_getMinimumPrice() > 0
                    ? `A partir de ${formatMoney(
                        _getMinimumPrice(),
                        configurations?.coin,
                      )} `
                    : ''}
                </Text>
                <Text
                  numberOfLines={3}
                  style={[styles.subtitleProduct, {fontSize: 10}]}>
                  {category.billing_mode === 'HIGHEST_VALUE'
                    ? 'Atenção: Pizza com dois ou mais sabores, o valor final será o maior valor entre os sabores.'
                    : ''}
                </Text>
              </View>
            </View>
          </View>

          {dough?.length > 0 ? (
            <View style={styles.boxOptions}>
              <LinearGradient
                colors={[Colors.PRIMARY, Colors.PRIMARY, Colors.PRIMARY]}
                style={styles.boxTitle}>
                <View style={styles.boxMax}>
                  <Text style={styles.titleOption}>Massa</Text>

                  <Text style={styles.titleMax}>{infoQtd(1, 1)}</Text>
                </View>
                {getMinMax('dough', 1, 1)}

                {setRequired('dough')}
                <Badge
                  status="warning"
                  value="Campo Obrigatório"
                  badgeStyle={styles.badge}
                />
              </LinearGradient>
              <View style={styles.boxComplements}>
                {dough.map((item, index) => (
                  <View style={styles.itemList}>
                    <TouchableOpacity
                      key={`dough-${index}`}
                      style={styles.complementItem}
                      onPress={() => seRadio(item.name, 'dough', item.price)}>
                      <View style={styles.BoxTitleOption}>
                        <Text numberOfLines={5} style={styles.TitleOption}>
                          {item.name && item.name.length > 0
                            ? `${item.name}`
                            : ''}
                        </Text>
                      </View>
                      <View style={styles.boxRadio}>
                        <Text style={styles.plusPricce}>
                          + {formatMoney(item.price, configurations?.coin)}
                        </Text>
                        {showRadio(item.name, 'dough') ? (
                          <View style={styles.radio}>
                            <View style={styles.radioSelect} />
                          </View>
                        ) : (
                          <Text style={styles.radio} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {edges?.length > 0 ? (
            <View style={styles.boxOptions}>
              <LinearGradient
                colors={[Colors.PRIMARY, Colors.PRIMARY, Colors.PRIMARY]}
                style={styles.boxTitle}>
                <View style={styles.boxMax}>
                  <Text style={styles.titleOption}>Borda</Text>

                  <Text style={styles.titleMax}>{infoQtd(1, 1)}</Text>
                </View>
                {getMinMax('edges', 1, 1)}

                {setRequired('edges')}
                <Badge
                  status="warning"
                  value="Campo Obrigatório"
                  badgeStyle={styles.badge}
                />
              </LinearGradient>
              <View style={styles.boxComplements}>
                {edges.map((edge, index) => (
                  <View style={styles.itemList}>
                    <TouchableOpacity
                      key={`edges-${index}`}
                      style={styles.complementItem}
                      onPress={() => seRadio(edge.name, 'edges', edge.price)}>
                      <View style={styles.BoxTitleOption}>
                        <Text numberOfLines={5} style={styles.TitleOption}>
                          {edge.name && edge.name.length > 0
                            ? `${edge.name}`
                            : ''}
                        </Text>
                      </View>
                      <View style={styles.boxRadio}>
                        <Text style={styles.plusPricce}>
                          + {formatMoney(edge.price, configurations?.coin)}
                        </Text>
                        {showRadio(edge.name, 'edges') ? (
                          <View style={styles.radio}>
                            <View style={styles.radioSelect} />
                          </View>
                        ) : (
                          <Text style={styles.radio} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {flavors?.length > 0 ? (
            <View style={styles.boxOptions}>
              <LinearGradient
                colors={[Colors.PRIMARY, Colors.PRIMARY, Colors.PRIMARY]}
                style={styles.boxTitle}>
                <View style={styles.boxMax}>
                  <Text style={styles.titleOption}>Sabores</Text>

                  <Text style={styles.titleMax}>
                    {infoQtd(size?.flavors, size?.flavors)}
                  </Text>
                </View>
                {getMinMax('flavors', size?.flavors, size?.flavors)}

                {setRequired('flavors')}
                <Badge
                  status="warning"
                  value="Campo Obrigatório"
                  badgeStyle={styles.badge}
                />
              </LinearGradient>
              <View style={styles.boxComplements}>
                {flavors.map((item, index) => (
                  <View style={[styles.itemList, {paddingBottom: 10}]}>
                    <View
                      key={`flavors-${index}`}
                      style={styles.complementItem}>
                      <View style={styles.BoxTitleOption}>
                        {item?.images && item?.images.length > 0 ? (
                          <Image
                            source={{uri: item.images[0]}}
                            style={styles.imageOption}
                          />
                        ) : null}
                        <View style={{paddingRight: 80}}>
                          <Text numberOfLines={5} style={styles.TitleOption}>
                            {item.name && item.name.length > 0
                              ? `${item.name}`
                              : ''}
                          </Text>

                          <Text style={[styles.plusPricce, {fontSize: 12}]}>
                            +{' '}
                            {formatMoney(_getPrice(item), configurations?.coin)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.boxQtd}>
                        <View style={styles.containerQtd}>
                          <TouchableOpacity
                            style={styles.btQtd}
                            onPress={() => {
                              if ((showCheck(item._id)?.quantity ?? 0) === 0) {
                                return;
                              }

                              setCheckMultile(
                                item.name,
                                item._id,
                                'flavors',
                                _getPrice(item),
                                size?.flavors ?? 1,
                                (showCheck(item._id)?.quantity ?? 0) - 1,
                                _getRealPrice(item),
                              );
                            }}>
                            <Icon name="remove" style={styles.btQtdIcon} />
                          </TouchableOpacity>
                          <Text style={styles.txtQtd}>
                            {showCheck(item._id)?.quantity ?? 0}
                          </Text>
                          <TouchableOpacity
                            style={styles.btQtd}
                            onPress={() =>
                              setCheckMultile(
                                item.name,
                                item._id,
                                'flavors',
                                _getPrice(item),
                                size?.flavors ?? 1,
                                (showCheck(item._id)?.quantity ?? 0) + 1,
                                _getRealPrice(item),
                              )
                            }>
                            <Icon name="add" style={styles.btQtdIcon} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.BoxTitleOption, {marginTop: 5}]}>
                      <Text numberOfLines={5} style={styles.DescriptionOption}>
                        {item.description && item.description.length > 0
                          ? `${item.description}`
                          : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.viewComment}>
            <View style={styles.comment}>
              <View>
                <Text style={styles.titleComment}>
                  {<Icon name="comment" size={20} style={styles.iconComment} />}
                  {'  '}
                  Alguma observação?
                </Text>
              </View>
              <Text style={styles.qtdComment}>{comment.length}/140</Text>
            </View>

            <View style={styles.textAreaContainer}>
              <TextInput
                ref={inputComment}
                style={styles.textArea}
                underlineColorAndroid="transparent"
                placeholder="Ex: Tirar a cebola, maionese à parte, ponto da carne etc"
                placeholderTextColor={Colors.DARK}
                numberOfLines={5}
                multiline={true}
                onChangeText={text => onChangeComment(text)}
                value={comment}
                onPress={Keyboard.dismiss}
                returnKeyType="next"
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <CartItemProduct
            qtd={totalAdd}
            add={addCartItem}
            remove={addCartItem}
            total={total}
            onPress={cartScreen}
            addOK={checkItens(check, radio, setIsRequired, complement)}
            disposed={!load}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = ({cart}) => {
  let cartResult = cart.cart ? cart.cart : [];
  return {
    qtdProd: cartResult.length,
    price: cart.subTotal,
    //messageError: cart?.messageError ?? null,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onGetToCart: company =>
      dispatch(
        getToCart(company, {
          delivery: 'true',
          type: 'restaurant',
        }),
      ),
    onAddToCart: (
      company,
      product,
      qtd,
      check,
      radio,
      cartItem,
      comment,
      pizzaPayload,
    ) =>
      dispatch(
        addToCartRestaurant(
          company,
          product,
          qtd,
          check,
          radio,
          cartItem,
          comment,
          {
            type: 'restaurant',
          },
          pizzaPayload,
        ),
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PizzaDetails);
