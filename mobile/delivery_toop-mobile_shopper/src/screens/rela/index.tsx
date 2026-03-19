import React, {useState} from 'react';
import {FlatList, View, ActivityIndicator} from 'react-native';
import {connect} from 'react-redux';
import DatePicker from 'react-native-datepicker';

import moment from 'moment';

import {
  listBalance,
  listBalancePaginate,
} from './../../services/provider/report/finance';

import {dateToEng, formatMoney} from './../../utils/index';

import {
  Container,
  ContainTop,
  Box,
  TitleBox,
  TextBox,
  ContainFilter,
  TitleFilter,
} from './styles';

import Flat from './flat';
import {Colors} from '../../styles';

const pageOut = 20;

const Rela: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState(0);
  const [receive, setReceive] = useState(0);
  const [pageIn, setPageIn] = useState(0);
  const [total, setTotal] = useState(0);

  const [items, setItems] = useState<any>([]);

  const [startDate, setStartDate] = useState(
    moment()
      .utc()
      .subtract(3, 'hours')
      .subtract(1, 'month')
      .format('DD/MM/YYYY'),
  );
  const [endDate, setEndDate] = useState(
    moment().utc().subtract(3, 'hours').format('DD/MM/YYYY'),
  );

  const loadBalance = () => {
    try {
      const params = {
        startDate: dateToEng(startDate),
        endDate: dateToEng(endDate),
        pageIn: 0,
        pageOut,
      };

      setLoading(true);
      listBalance(params).then((response) => {
        setTransfer(
          response?.passAlongFranchise ??
            0 + response?.passAlongFranchiseDelivery ??
            0,
        );
        setReceive(response?.receiveFranchise ?? 0);

        setLoading(false);
      });

      listBalancePaginate(params).then((response) => {
        setItems(response.list);
        setPageIn(1);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const loadPaginate = () => {
    try {
      const params = {
        startDate: dateToEng(startDate),
        endDate: dateToEng(endDate),
        pageIn,
        pageOut,
      };

      // setLoading(true);
      listBalancePaginate(params).then((response) => {
        setTotal(response.total);
        const data = [...items, ...response.list];
        setItems(data);
        setPageIn(pageIn + 1);
        // setLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderFooter = () => {
    if (total >= items?.length) return null;
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={Colors.ALERT} />
      </View>
    );
  };

  React.useEffect(() => {
    loadBalance();
  }, [startDate, endDate]);

  return (
    <Container>
      <ContainFilter>
        <View style={{width: '48%'}}>
          <TitleFilter>Data inicial</TitleFilter>
          <DatePicker
            style={{width: '100%'}}
            date={startDate}
            mode="date"
            placeholder="select date"
            format="DD/MM/YYYY"
            confirmBtnText="Confirmar"
            cancelBtnText="Cancelar"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              dateInput: {
                backgroundColor: Colors.BACKGROUND,
                borderColor: Colors.GREY,
                color: Colors.TEXT_INPUT,
                borderWidth: 0.5,
                padding: 5,
                borderRadius: 4,
                borderStyle: 'solid',
              },
            }}
            onDateChange={(date: string) => setStartDate(date)}
          />
        </View>
        <View style={{width: '48%'}}>
          <TitleFilter>Data final</TitleFilter>
          <DatePicker
            style={{width: '100%'}}
            date={endDate}
            mode="date"
            placeholder="select date"
            format="DD/MM/YYYY"
            confirmBtnText="Confirmar"
            cancelBtnText="Cancelar"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              dateInput: {
                backgroundColor: Colors.BACKGROUND,
                borderColor: Colors.GREY,
                color: Colors.TEXT_INPUT,
                borderWidth: 0.5,
                padding: 5,
                borderRadius: 4,
                borderStyle: 'solid',
              },
            }}
            onDateChange={(date: string) => setEndDate(date)}
          />
        </View>
      </ContainFilter>

      <ContainTop>
        <Box>
          <TitleBox>Repasse</TitleBox>
          {!loading ? (
            <TextBox>R$ {formatMoney(transfer, false)}</TextBox>
          ) : (
            <TextBox>...</TextBox>
          )}
        </Box>

        <Box>
          <TitleBox>Receber</TitleBox>
          {!loading ? (
            <TextBox>R$ {formatMoney(receive, false)}</TextBox>
          ) : (
            <TextBox>...</TextBox>
          )}
        </Box>
      </ContainTop>
      {/* <ContainInput>
        <Image
          source={require('../../assets/images/Busca.png')}
          resizeMode="contain"
        />
        <TextInput placeholder="Buscar por mês, forma de pagamento" />
      </ContainInput> */}

      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        style={{marginBottom: 5, marginTop: 10}}
        renderItem={Flat}
        onEndReached={loadPaginate}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onGetAuth: () => dispatch({type: 'GET_USER_SAGA'}),
    onCleanAuth: () => dispatch({type: 'CLEAN_USER_SAGA'}),
  };
};

const mapStateToProps = ({authUser}: any) => {
  return {
    userAuth: authUser,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Rela);
