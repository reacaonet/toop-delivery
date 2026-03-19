import React, {useEffect} from 'react';
import {ReactReduxContext, connect} from 'react-redux';

import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {ActivityIndicator, Alert, Modal, View} from 'react-native';

import {
  Container,
  Image,
  ImageAliment,
  TextInput,
  ContainIcons,
  Icons,
  Contain,
  ContainProm,
  Border,
  PromVoid,
  ContainFooter,
  Button,
  ButtonText,
  Subtitle,
  Prom,
  Text,
  Price,
  PriceLater,
  ContainPrice,
  ContainColumn,
  IconOrd,
  ContainRow,
} from './styles';

import RemoveItem from '../../../../components/shared/alert/removeItem';

import {
  paginatorProduct,
  deleteProduct,
} from './../../../../services/provider/shopping/product';
import {Colors} from './../../../../styles';

import {formatMoney} from './../../../../utils';

const pageOut = 20;
const Component = ({item}: any) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {params: paramRoute}: any = useRoute();

  const {store} = React.useContext(ReactReduxContext);
  const company = store.getState()?.authUser?.user?.company;

  const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
  const [term, setTerm] = React.useState('');
  const [pageIn, setPageIn] = React.useState(0);
  const [pageTotal, setPageTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [removeId, setRemoveId] = React.useState('');
  const [items, setItems] = React.useState<any>([]);

  const handleRemove = () => {
    setShowConfirm(false);
    setLoading(true);
    deleteProduct(removeId)
      .then((response) => {
        loadData(company._id);
        setRemoveId('');
      })
      .catch((error) =>
        Alert.alert('Tente novamente', 'Não foi possivel consultar produtos'),
      );
  };

  const loadData = (company: string) => {
    try {
      const params = {
        name: term,
        pageIn: 0,
        pageOut,
        images: 'all',
        link: 'all',
        department: paramRoute?.department?._id,
      };

      setLoading(true);

      paginatorProduct(company, params).then((response) => {
        setItems(response.list);
        setPageTotal(response.total);
        setLoading(false);
        setPageIn(1);
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Tente novamente', 'Não foi possivel consultar produtos');
    }
  };

  const loadPaginate = (company: string) => {
    try {
      const params = {
        name: term,
        pageIn,
        pageOut,
        images: 'all',
        link: 'all',
        department: paramRoute?.department?._id,
      };

      setLoading(true);
      paginatorProduct(company, params).then((response) => {
        const data = [...items, ...response.list];
        setItems(data);
        setPageIn(pageIn + 1);
        setLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderFooter = () => {
    if (loading || pageTotal <= pageOut) return null;
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={Colors.ALERT} />
      </View>
    );
  };

  useEffect(() => {
    if (paramRoute?.department) {
      navigation.setOptions({title: paramRoute?.department?.name});
      loadData(company._id);
    } else {
      navigation.goBack();
    }
  }, [company?._id, isFocused]);

  const renderItem = ({item}: any) => {
    const image = item.images && item.images.length > 0 ? item.images[0] : '';
    let department = '';
    if (item.department && item.department.length > 0) {
      department = item.department[0].name;

      if (item.department.length > 1) {
        department = department + ` +${item.department.length - 1}`;
      }
    }
    return (
      <Contain>
        <ContainRow>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('EditProduct', {product: item});
            }}>
            {image ? <ImageAliment source={{uri: image}} /> : null}
          </TouchableOpacity>
          <ContainColumn>
            <ContainIcons>
              <TouchableOpacity
                onPress={() => {
                  setRemoveId(item._id);
                  setShowConfirm(true);
                }}>
                <Icons
                  source={require('../../../../assets/images/delete.png')}
                />
              </TouchableOpacity>
            </ContainIcons>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('EditProduct', {product: item});
              }}>
              <Text>{item.name}</Text>
              <Subtitle>Departamento: {department}</Subtitle>
              <Subtitle>Descrição: {item.description}</Subtitle>
              <ContainPrice>
                {item.pricePromotion ? (
                  <>
                    <Price>{formatMoney(item.pricePromotion, true)}</Price>
                    <PriceLater>{formatMoney(item.price, true)}</PriceLater>
                  </>
                ) : (
                  <Price>{formatMoney(item.price, true)}</Price>
                )}
              </ContainPrice>
            </TouchableOpacity>
          </ContainColumn>
        </ContainRow>
        <Border />
      </Contain>
    );
  };

  return (
    <Container>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirm}
        onRequestClose={() => setShowConfirm(false)}>
        <RemoveItem modal={setShowConfirm} onConfirm={handleRemove} />
      </Modal>

      <Image
        source={require('../../../../assets/images/Busca.png')}
        resizeMode="contain"
      />

      <TextInput
        value={term}
        onChangeText={setTerm}
        onEndEditing={() => loadData(company._id)}
        underlineColorAndroid="transparent"
        placeholder="Nome do produto, Código barra"
      />

      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        style={{marginBottom: 30}}
        renderItem={renderItem}
        onEndReached={() => loadPaginate(company._id)}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />

      <ContainFooter>
        <Button
          disabled={loading}
          onPress={() =>
            navigation.navigate('NewProduct', {
              department: paramRoute?.department,
            })
          }>
          {loading ? (
            <ButtonText>
              <ActivityIndicator size="small" color={Colors.WHITE} />
            </ButtonText>
          ) : (
            <ButtonText>Novo produto</ButtonText>
          )}
        </Button>
      </ContainFooter>
    </Container>
  );
};

// export default Component;

const mapDispatchToProps = (dispatch: any) => {
  return {
    onGetAuth: () => dispatch({type: 'GET_USER_SAGA'}),
  };
};

const mapStateToProps = ({authUser}: any) => {
  return {
    userAuth: authUser,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
