/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  Linking,
  Alert,
  Button,
} from 'react-native';
import {
  styles,
  ListItem,
  ListItemText,
  LeftContent,
  AcceptButton,
  AcceptButtonText,
} from './styles';
import {Colors} from '../../styles';
import CardWithShadow from '../../components/shared/CardWithShadow';
import {StorageGet, StorageClean} from '../../services/deviceStorage';
import {connect} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {listDeliveryMan} from '../../services/provider/order';
import {formatDateFromNow} from '../../utils';

type HomeProps = {
  navigation: any;
  userAuth: any;
  updateOrder: any;
};

const Home: FunctionComponent<HomeProps> = ({
  navigation,
  userAuth,
  updateOrder,
}: HomeProps) => {
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [inprogress, setInprogress] = useState([]);
  const [finish, setFinish] = useState([]);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    {key: 'Inprogress', title: 'Andamento', number: 0},
    {key: 'Finish', title: 'Concluidas', number: 0},
  ]);

  const initialLayout = {width: Dimensions.get('window').width};

  useEffect(() => {
    CheckConnectivity();
  }, []);

  const CheckConnectivity = () => {
    NetInfo.fetch().then((state: any) => {
      if (!state.isConnected) {
        navigation.navigate('Connectivity');
      }
    });
  };

  const onRefresh = async () => {
    try {
      setIsFetching(true);
      getOrders();
    } catch (err) {}
  };

  const goDetail = useCallback(
    (item: any) => {
      navigation.navigate('Detail', {
        screen: 'Detail',
        params: item,
      });
    },
    [navigation],
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={styles.tabBarStyle}
      indicatorStyle={styles.tabBarIndicatorStyle}
      activeColor={Colors.PRIMARY}
      inactiveColor="#a6a5a7"
      tabStyle={styles.tabBarTabStyle}
      renderLabel={({route, color}: any) => {
        return (
          <View style={styles.TabBarBox}>
            <Text style={{...styles.TabBarTitle, color}}>{route.title}</Text>
            <Text style={{...styles.badge, backgroundColor: color}}>
              {route.number}
            </Text>
          </View>
        );
      }}
    />
  );

  const flatListWaitRender = (item: any) => {
    if (!item?.order_number) {
      return null;
    }

    return (
      <CardWithShadow>
        <ListItem onPress={() => goDetail(item)}>
          <LeftContent>
            <ListItemText color="#707070" size={20}>
              Pedido: {item.order_number}
            </ListItemText>

            {item?.cartItem && Array.isArray(item?.cartItem) ? (
              <ListItemText color="#A3A3A3" size={17}>
                {item?.cartItem?.reduce(function (prev: any, cur: any) {
                  return prev + cur.amount;
                }, 0)}{' '}
                Itens
                {/* itens - {formatMoney(item.payment.total)} */}
              </ListItemText>
            ) : null}
            <ListItemText color="#68C471" size={17}>
              {formatDateFromNow(item.createdAt)}
            </ListItemText>
          </LeftContent>
          <AcceptButton>
            <AcceptButtonText>Visualizar</AcceptButtonText>
          </AcceptButton>
        </ListItem>
      </CardWithShadow>
    );
  };

  const renderScene = SceneMap({
    Inprogress: () => (
      <View style={styles.boxOrders}>
        {inprogress && Object.keys(inprogress).length > 0 ? (
          <FlatList
            initialScrollIndex={0}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={styles.flatStyle}
            data={inprogress}
            keyExtractor={(item: any) => `${item._id}`}
            onRefresh={() => onRefresh()}
            refreshing={isFetching}
            renderItem={({item}) => flatListWaitRender(item)}
          />
        ) : loading ? (
          <Text style={styles.textEmpty}>Carregando dados...</Text>
        ) : (
          <Text style={styles.textEmpty}>Nenhum pedido encontrado</Text>
        )}
      </View>
    ),
    Finish: () => (
      <View style={styles.boxOrders}>
        {finish && Object.keys(finish).length > 0 ? (
          <FlatList
            initialScrollIndex={0}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={styles.flatStyle}
            data={finish}
            keyExtractor={(item: any) => `${item._id}`}
            onRefresh={() => onRefresh()}
            refreshing={isFetching}
            renderItem={({item}) => flatListWaitRender(item)}
          />
        ) : loading ? (
          <Text style={styles.textEmpty}>Carregando dados...</Text>
        ) : (
          <Text style={styles.textEmpty}>Nenhum pedido encontrado</Text>
        )}
      </View>
    ),
  });

  const getOrders = useCallback(async () => {
    try {
      const listOrderProgress = await listDeliveryMan(
        userAuth?.user?.deliveryMan?._id,
        {
          status:
            'ACCEPT_SHOPPER|ACCEPT_DELIVERYMAN|RELEASE_SHOPPER|IN_PROGRESS_DELIVERYMAN|DELIVERY_ROUTE',
        },
      );
      const listOrderFinish = await listDeliveryMan(
        userAuth?.user?.deliveryMan?._id,
        {
          status: 'FINISHED',
        },
      );

      setInprogress(listOrderProgress);

      setFinish(listOrderFinish);
      setRoutes([
        {
          key: 'Inprogress',
          title: 'Andamento',
          number: listOrderProgress.length || 0,
        },
        {
          key: 'Finish',
          title: 'Concluidas',
          number: listOrderFinish.length || 0,
        },
      ]);
      setLoading(false);
      setIsFetching(false);
    } catch (err) {}
  }, [userAuth.user._id]);

  // useEffect(() => {
  //   try {
  //     getOrders();
  //   } catch (err) {}
  // }, []);

  useEffect(() => {
    try {
      const getUpdateOrder = async () => {
        // ao aceitar uma corrida redireciona para order
        let data = await StorageGet('updateListOrder');
        if (data?.update === true || data?.update === 'true') {
          StorageClean('updateListOrder');
          goDetail(data.order);
        }
      };

      getOrders();
      getUpdateOrder();
    } catch (err) {}
  }, [getOrders, updateOrder, goDetail]);

  const SendIntentButton = ({action, extras, children}) => {
    const handlePress = useCallback(async () => {
      try {
        await Linking.sendIntent(action, extras);
      } catch (e) {
        Alert.alert(e.message);
      }
    }, [action, extras]);

    return <Button title={children} onPress={handlePress} />;
  };

  const loadingData = (tabIndex: number) => {
    setIndex(tabIndex);
    getOrders();
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={(index) => loadingData(index)}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

const mapStateToProps = ({updateOrder, authUser}: any) => {
  // console.log('androidPip', androidPip);
  return {
    updateOrder: updateOrder,
    userAuth: authUser,
    // androidPip: androidPip,
  };
};

export default connect(mapStateToProps)(Home);
