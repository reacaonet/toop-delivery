/* eslint-disable react-hooks/exhaustive-deps */
import React, {FunctionComponent, useEffect, useState} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {connect} from 'react-redux';
import Moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import {styles, HistoryItem, TextHistory} from './styles';
import {getUserHistory} from '../../services/provider/deliveryMan';
import {formatMoney} from '../../utils';

type HistoryProps = {
  navigation: any;
  route: any;
  user: any;
};

const History: FunctionComponent<HistoryProps> = ({
  navigation,
  user,
}: HistoryProps) => {
  const [dailyHistory, setDailyHistory]: any = useState([]);
  const [currentDate, setCurrentDate] = useState(Moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [loadingMoreData, setLoadingMoreData] = useState(false);
  const LIMIT_DAYS_AGO = 90;

  const CheckConnectivity = () => {
    NetInfo.fetch().then((state: any) => {
      if (!state.isConnected) {
        navigation.navigate('Connectivity');
      }
    });
  };

  useEffect(() => {
    CheckConnectivity();
    initLoad();
  }, []);

  const getHistory = async (date: any, dateFinal: any = null) => {
    setLoading(true);

    const response = await getUserHistory(
      date,
      user.deliveryMan._id,
      dateFinal,
    );

    if (response.length > 0) {
      fetchData(response);
    }

    setLoading(false);
    setLoadingMoreData(false);
  };

  const fetchData = (data: any) => {
    setDailyHistory(data);
  };

  const initLoad = async () => {
    setLoadingMoreData(true);
    await getHistory(
      Moment(currentDate).subtract(LIMIT_DAYS_AGO, 'days').format('YYYY-MM-DD'),
      currentDate,
    );
  };

  // const loadMore = async () => {
  // setLoadingMoreData(true);
  // const previousDate = Moment(currentDate)
  //   .subtract(1, 'days')
  //   .format('YYYY-MM-DD');
  // const minDate = Moment();
  // const minDateWrapper = Moment(minDate).subtract(LIMIT_DAYS_AGO, 'days');
  // if (minDateWrapper.isBefore(previousDate)) {
  //   console.log('e antes ?');
  //   console.log('previousDate', previousDate);
  //   console.log('minDateWrapper', minDateWrapper);
  //   setCurrentDate(previousDate);
  //   getHistory(previousDate);
  // }
  // };

  const resetCurrentDate = async () => {
    setDailyHistory([]);
    const current = Moment().format('YYYY-MM-DD');
    setCurrentDate(current);

    getHistory(
      Moment(current).subtract(LIMIT_DAYS_AGO, 'days').format('YYYY-MM-DD'),
      current,
    );
  };

  const renderItem = ({item}: any) => {
    return (
      <View>
        <Text style={[styles.txtHistory, styles.txtBold, styles.txtCenter]}>
          {item.date}
        </Text>
        <Text style={[styles.txtCash, styles.txtBold, styles.txtCenter]}>
          Total: {formatMoney(item.totalValueForThisDay)}
        </Text>
        {item.rides &&
          item.rides.map((ride: any) => {
            ride.date = item?.date;
            return <View key={ride.hour}>{renderHistoryItem(ride)}</View>;
          })}
      </View>
    );
  };

  const renderHistoryItem = (ride: any) => {
    const typePaymentText = (typePayment: any) => {
      switch (typePayment) {
        case 'MONEY':
          return 'Dinheiro';
        case 'BRASPAG':
          return 'Pago Aplicativo';
        case 'CARD':
          return 'Cartão no local';
        default:
          return '';
      }
    };

    return (
      <HistoryItem
        onPress={() => navigation.navigate('EarningDetails', {ride})}
        typePayment={ride.typePayment}
        style={styles.historyItem}>
        <View>
          <TextHistory typePayment={ride.typePayment} style={styles.txtHistory}>
            Horário
          </TextHistory>
          <TextHistory typePayment={ride.typePayment} style={styles.txtHistory}>
            {ride.hour}
          </TextHistory>
        </View>
        <View>
          <TextHistory typePayment={ride.typePayment} style={styles.txtHistory}>
            {typePaymentText(ride.typePayment)}
          </TextHistory>
          <Text style={[styles.txtHistory, styles.txtCash]}>
            {formatMoney(ride.value)}
          </Text>
        </View>
      </HistoryItem>
    );
  };

  const renderEmptyHistory = () => {
    return (
      <View style={{margin: 15}}>
        <Text style={[styles.txtHistory, styles.txtBold, styles.txtCenter]}>
          Sem corridas recentes
        </Text>
      </View>
    );
  };

  const renderListHeader = () => {
    return (
      <View style={{margin: 15}}>
        <Text style={[styles.txtHistory, styles.txtBold, styles.txtCenter]}>
          Histórico de corridas{' '}
        </Text>
      </View>
    );
  };

  const renderListFooter = () => {
    if (loadingMoreData) {
      return <ActivityIndicator />;
    }
    return null;
  };

  return (
    <FlatList
      data={dailyHistory}
      keyExtractor={(item) => item.date}
      renderItem={renderItem}
      style={styles.flatStyle}
      initialNumToRender={1}
      refreshing={loading}
      onRefresh={resetCurrentDate}
      // onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={renderEmptyHistory}
      ListFooterComponent={renderListFooter}
      ListHeaderComponent={renderListHeader}
    />
  );
};

const mapStateToProps = ({authUser}: any) => {
  return {
    user: authUser?.user ?? {},
  };
};

export default connect(mapStateToProps)(History);
