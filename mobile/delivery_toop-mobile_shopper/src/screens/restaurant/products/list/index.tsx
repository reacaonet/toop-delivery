import React, {useEffect} from 'react';
import {ReactReduxContext, connect} from 'react-redux';

import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {ActivityIndicator, Alert, Modal, View, Pressable} from 'react-native';

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
import PauseItem from '../../../../components/shared/alert/pauseItem';

import {
  deleteProduct,
  updateStatusProduct,
} from './../../../../services/provider/shopping/food/product';
import {listCategory} from './../../../../services/provider/shopping/category';
import {Colors} from './../../../../styles';

import {formatMoney} from './../../../../utils';

const pageOut = 20;
const Component = ({}: any) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {params: paramRoute}: any = useRoute();

  const {store} = React.useContext(ReactReduxContext);
  const company = store.getState()?.authUser?.user?.company;

  const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
  const [showConfirmPause, setShowConfirmPause] =
    React.useState<boolean>(false);
  const [term, setTerm] = React.useState('');
  const [pageIn, setPageIn] = React.useState(0);
  const [pageTotal, setPageTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [removeId, setRemoveId] = React.useState('');
  const [pauseId, setPauseId] = React.useState('');
  const [isPaused, setIsPaused] = React.useState('');
  const [items, setItems] = React.useState<any>([]);

  const loadData = async () => {
    setLoading(true);
    listCategory(company._id, '').then((response: any) => {
      setItems(
        response.find((i: any) => i._id === paramRoute?.category?._id).products,
      );
      setLoading(false);
    });
  };

  const handleRemove = () => {
    setShowConfirm(false);
    setLoading(true);
    deleteProduct(company._id, removeId)
      .then((response) => {
        loadData();
        setRemoveId('');
      })
      .catch((error) =>
        Alert.alert('Tente novamente', 'Não foi possivel remover produto'),
      );
  };

  const handlePause = () => {
    setShowConfirmPause(false);
    setLoading(true);
    updateStatusProduct(company._id, pauseId, {isPaused: !isPaused})
      .then((response) => {
        setLoading(false);
        loadData();
        setPauseId('');
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        Alert.alert('Tente novamente', 'Não foi possivel atualizar o status');
      });
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
    if (paramRoute?.category) {
      navigation.setOptions({title: paramRoute?.category?.name});
      loadData();
    } else {
      navigation.goBack();
    }
  }, [company?._id, isFocused, paramRoute?.category?.product?.length]);

  const renderItem = ({item}: any) => {
    const image = item.images && item.images.length > 0 ? item.images[0] : '';

    return (
      <Contain>
        <ContainRow>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('RestaurantEditProduct', {
                product: item,
              });
            }}>
            {image ? <ImageAliment source={{uri: image}} /> : null}
          </TouchableOpacity>
          <ContainColumn>
            <ContainIcons>
              {/* <Icons
                    source={require('../../../../assets/images/lapis.png')}
                  /> */}

              <TouchableOpacity
                style={{zIndex: 9999}}
                onPress={() => {
                  setPauseId(item._id);
                  setIsPaused(item.isPaused);
                  setShowConfirmPause(true);
                }}>
                {item.isPaused ? (
                  <Icons
                    source={require('../../../../assets/images/play.png')}
                  />
                ) : (
                  <Icons
                    source={require('../../../../assets/images/pause.png')}
                  />
                )}
              </TouchableOpacity>

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
                navigation.navigate('RestaurantEditProduct', {
                  product: item,
                });
              }}>
              <Text>{item.name}</Text>
              <Subtitle>{item.description}</Subtitle>

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

      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmPause}
        onRequestClose={() => setShowConfirmPause(false)}>
        <PauseItem modal={setShowConfirmPause} onConfirm={handlePause} />
      </Modal>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={items}
        keyExtractor={(item, index) => index.toString()}
        style={{marginBottom: 30}}
        renderItem={renderItem}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />

      <ContainFooter>
        <Button
          disabled={loading}
          onPress={() =>
            navigation.navigate('RestaurantAddProduct', {
              category: paramRoute?.category,
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
