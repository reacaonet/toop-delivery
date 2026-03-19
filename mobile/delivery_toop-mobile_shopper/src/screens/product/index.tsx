import React, {FunctionComponent, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import InputText from '../../components/shared/input/inputText';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import AddItem from '../../components/shared/alert/addItem';
import BarCode from './barCode';
import {formatMoney} from '../../utils';
import {TextInputMask} from 'react-native-masked-text';

import {searchBarCode} from './../../services/provider/shopping/product';
import {addCartItem} from '../../services/provider/shopping/cartItem';
import {addProductItem} from '../../services/provider/shopping/product';

type ProductProps = {
  navigation: any;
  route: any;
};

const Product: FunctionComponent<ProductProps> = ({
  navigation,
  route,
}: ProductProps) => {
  const [barCode, setBarCode] = useState('');
  const [product, setProduct]: any = useState([]);
  const [nameProduct, setNameProduct] = useState('');
  const [price, setPrice]: any = useState('0,00');
  const [priceField, setPriceField]: any = useState('');
  const [priceProduct, setPriceProduct] = useState(0);
  const [amount, setAmount] = useState(0);
  const [modalBarCode, setModalBarCode] = useState(false);
  const [order] = useState(route.params?.order ?? null);
  const [modalAddItem, setModalAddItem] = useState(false);

  //console.log('ShoppingCart', route.params?.order.shoppingCart);

  const alterAmount = (qtd: number) => {
    try {
      let total = amount + qtd;
      if (total < 0) {
        return;
      }

      setAmount(total);
    } catch (_err) {
      //
    }
  };

  const consultProduct = (code: string) => {
    try {
      setBarCode(code);
    } catch (err) {
      console.log('Fail consult Product', err);
    }
  };

  const seachProduct = async (code: string) => {
    if (!code || code.length < 4) {
      Alert.alert(
        'Oops',
        'Informe um código de barra com pelo menos 4 caracteres',
      );
      return;
    }

    let compay = order.company?._id ?? null;

    let resp = await searchBarCode(compay, code);
    if (resp) {
      setPrice(getPrice(resp));
      setAmount(1);
      setNameProduct(resp.name);
      setProduct(resp);
    } else {
      Alert.alert(
        'Oops',
        'Nenhum produto localizado com este código de barra, por favor adicione este novo produto :)',
      );
    }
  };

  const getPrice = (item: any) => {
    if (item && item.pricePromotion) {
      setPriceProduct(item.pricePromotion);
      return formatMoney(item.pricePromotion, false);
    } else {
      setPriceProduct(item.price);
      return formatMoney(item.price, false);
    }
  };

  const addProduct = async () => {
    try {
      let priceValid = priceField.isValid();
      if (!priceValid || priceProduct <= 0) {
        Alert.alert('Oops', 'Informe um preço válido');
        return;
      }

      if (!amount || amount <= 0) {
        Alert.alert('Oops', 'Informe uma quantidade');
        return;
      }

      if (!nameProduct || nameProduct.length <= 10) {
        Alert.alert(
          'Oops',
          'Informe o nome do produto com pelo menos 10 caracteres',
        );
        return;
      }

      let productAdd: any = null;
      if (!product || !product._id) {
        productAdd = await createProduct();
      } else {
        productAdd = product;
      }

      if (productAdd === null || productAdd === false || !productAdd._id) {
        Alert.alert('Oops', 'Não foi possível adicionar produto');
        return;
      }

      // Adicionar no Carrinho
      // Produto Existe Altear valor no Carrinho ?
      let respAddCart = await addToCartItem(productAdd);
      if (!respAddCart) {
        Alert.alert(
          'Oops',
          'Não foi possível adicionar produto no carrinho :(',
        );
        return;
      }

      //Alert.alert('Sucesso', 'Produto Adicionado com sucesso!!');
      navigation.goBack();
    } catch (err) {
      console.log('Fail Add Product', err);
      Alert.alert('Oops', 'Não possível adicionar produto');
    }
  };

  const createProduct = async () => {
    try {
      let resp = await addProductItem({
        name: nameProduct,
        barcode: barCode,
        price: priceProduct,
        company: order?.company?._id ?? null,
        active: false,
      });

      if (resp && resp.errMessage) {
        console.log('createProduct Error', resp.errMessage);
        return false;
      }

      return resp.product;
    } catch (err) {
      return false;
    }
  };

  const addToCartItem = async (productAdd: any) => {
    try {
      let cartId = order?.shoppingCart ?? null;
      let type = order?.company.type ?? null;
      const resp = await addCartItem(cartId, productAdd._id, {
        amount: amount,
        price: priceProduct,
        //pricePromotion: priceProduct,
        type,
      });

      if (resp && resp.errMessage) {
        return false;
      }

      return resp;
    } catch (err) {
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroolContainer}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalBarCode}
          onRequestClose={() => setModalBarCode(false)}>
          <BarCode modal={setModalBarCode} onBarCode={consultProduct} />
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalAddItem}
          onRequestClose={() => setModalAddItem(false)}>
          <AddItem modal={setModalAddItem} onConfirm={addProduct} />
        </Modal>

        <View style={styles.barcodeContent}>
          <View style={styles.barcode}>
            <InputText
              value={barCode}
              setValue={setBarCode}
              placeholder="Código de barras"
              submitEditing={seachProduct}
            />
          </View>
          <TouchableOpacity
            style={styles.barcodeIcon}
            onPress={() => setModalBarCode(true)}>
            <Icon name="reorder" size={50} />
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity
          style={styles.btnSearchCodeContainer}
          onPress={() => {}}>
          <Text style={styles.btnSearchCodeTxt}>Pesquisar Código</Text>
        </TouchableOpacity> */}

        <View>
          <InputText
            value={nameProduct}
            setValue={setNameProduct}
            placeholder="Nome do produto"
          />
        </View>

        <View>
          {/* <InputText
            value={price}
            setValue={setPrice}
            placeholder="Valor do Produto"
          /> */}

          <TextInputMask
            type={'money'}
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: 'R$ ',
              suffixUnit: '',
            }}
            value={price}
            includeRawValueInChangeText={true}
            onChangeText={(maskedText, rawText: any) => {
              setPrice(maskedText);
              setPriceProduct(rawText);
            }}
            ref={setPriceField}
            style={styles.textInput}
          />
        </View>

        <View style={styles.addProduct}>
          <TouchableOpacity
            style={styles.btQtd}
            onPress={() => {
              alterAmount(-1);
            }}>
            <Icon name="remove" size={30} />
          </TouchableOpacity>
          <Text style={styles.txtQtd}>
            {amount > 0 ? amount : 'Quantidade'}
          </Text>
          <TouchableOpacity
            style={styles.btQtd}
            onPress={() => {
              alterAmount(+1);
            }}>
            <Icon name="add" size={30} />
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <ButtonPrimary
            title="Adicionar Produto"
            onPress={() => setModalAddItem(true)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Product;
