/* eslint-disable react-hooks/exhaustive-deps */
import React, {FunctionComponent, useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Text,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

import InputText from '../../../../components/shared/input/inputText';
import AddItem from './addItem';

import {listProduct} from '../../../../services/provider/shopping/product';
import {addCartItem} from '../../../../services/provider/shopping/cartItem';
import {chatMessage} from '../../../../services/provider/chat';
import {createLog} from '../../../../services/provider/log';
import HeaderScreen from '../../../../components/shared/header/headerScreen';

type AddProductProps = {
  modal: Function;
  shopper: any;
  order: any;
  refreshCard: Function;
};

const AddProduct: FunctionComponent<AddProductProps> = ({
  modal,
  shopper,
  order,
  refreshCard,
}: AddProductProps) => {
  const [seach, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [itemProduct, setItemProduct]: any = useState({});
  const [qtdItens, setQtdItens]: any = useState([]);

  useEffect(() => {
    if (seach && seach.length > 1) {
      getListProduct();
    }
  }, [seach]);

  useEffect(() => {
    console.log('Order Current', order);

    // order.company.images
    // order.company.name
  }, []);

  const getListProduct = async () => {
    const resp = await listProduct(shopper.company, {
      searchProduct: seach,
    });
    if (resp) {
      setProducts(resp);
    } else {
      setProducts([]);
    }
  };

  const addCardItem = async () => {
    try {
      let amount = getAmountCurrent(itemProduct);
      if (amount <= 0) {
        Alert.alert('Opps', 'Informe uma quantidade');
        return;
      }

      const resp = await addCartItem(order.shoppingCart, itemProduct._id, {
        amount: amount,
        price: itemProduct.price,
        pricePromotion: itemProduct.pricePromotion,
        type: order.company.type,
        shopper: shopper._id,
        shopperCheck: true,
      });

      if (resp && resp.errMessage) {
        await createLog({
          typeSystem: 'MOBILE',
          typeLog: 'ERROR',
          description: resp.errMessage,
          category: 'Add Product',
          originError: 'screens-shopping-product-addProduct-index',
        });
        Alert.alert('Opps', resp.errMessage);
        return;
      }

      if (resp && resp._id) {
        // avisar no chat que ouve alteração
        chatMessage({
          type: 'text_alert',
          message: `Adicionado ${amount} ${itemProduct.name}`,
          shoppingCart: order.shoppingCart,
          personId: shopper._id,
          person: 'shopper',
          personSendId: order.customer._id,
          personSend: 'customer',
        });
      }

      refreshCard();
      setTimeout(() => {
        modal(false);
      }, 200);
    } catch (err) {
      console.log('Error ao adicionar', err);
    }
  };

  const setAddModal = (item: any) => {
    setItemProduct(item);
    setModalConfirm(true);
  };

  const changeAmount = (item: any, qtd: string) => {
    let index = qtdItens.findIndex((el: any) => el._id === item._id);
    if (index > -1) {
      let change: any = qtdItens;
      change[index].amount = qtd;
      setQtdItens([...change]);
    } else {
      setQtdItens([
        ...qtdItens,
        {
          _id: item._id,
          amount: qtd,
        },
      ]);
    }
  };

  const getAmountCurrent = (item: any) => {
    let index = qtdItens.findIndex((el: any) => el._id === item._id);
    if (index >= 0) {
      return qtdItens[index].amount;
    } else {
      return 1;
    }
  };

  const flatListRender = (item: any) => {
    return (
      <>
        <View style={styles.flatRender}>
          {item.images ? (
            <Image
              style={styles.ImageProduct}
              source={{uri: item.images[0]}}
              resizeMode="contain"
            />
          ) : null}
          <View style={styles.txtInfo}>
            <Text style={styles.txtFlatProduct}>{item.name}</Text>
            <Text style={styles.txtFlatProduct}>
              Código Barra: {item.barcode}
            </Text>
            <Text style={styles.txtFlatProduct}>Preço {item.price}</Text>
            {item.pricePromotional ? (
              <Text style={styles.txtFlatProduct}>
                Promocional {item.pricePromotional}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.confirmOptions}>
          <TextInput
            value={`${getAmountCurrent(item)}`}
            onChangeText={(txt) => changeAmount(item, txt)}
            style={styles.inputAmount}
            keyboardType="numeric"
          />
          <View style={styles.confirmBtn}>
            <TouchableOpacity onPress={() => setAddModal(item)}>
              <Text style={styles.txtConfirmBtn}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalConfirm}
        onRequestClose={() => setModalConfirm(false)}>
        <AddItem modal={setModalConfirm} onConfirm={addCardItem} />
      </Modal>

      {/* <View style={styles.headerContainer} /> */}
      <HeaderScreen title={'Adicionar Produtos'} onClose={() => modal(false)} />

      <View style={styles.content}>
        <View style={styles.cardSearch}>
          {/* <TouchableOpacity style={styles.close} onPress={() => modal(false)}>
            <Icon name="cancel" size={30} />
          </TouchableOpacity> */}

          <InputText
            value={seach}
            setValue={setSearch}
            placeholder={'Nome do Produto ou Código de Barra'}
          />

          <View style={styles.cardItem}>
            {!products || products.length <= 0 ? (
              <View style={styles.containerProduct}>
                <Text>Nenhum Produto encontrado</Text>
              </View>
            ) : null}
            <FlatList
              style={styles.flatStyle}
              data={products}
              keyExtractor={(item: any) => `${item._id}`}
              renderItem={({item}) => flatListRender(item)}
            />
          </View>
        </View>
      </View>
      {/* <View style={styles.footerContainer} /> */}
    </View>
  );
};

export default AddProduct;
