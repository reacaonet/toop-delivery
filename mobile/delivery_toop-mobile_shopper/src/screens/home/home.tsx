/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useContext} from 'react';
import {ReactReduxContext, connect} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';

import {View} from 'react-native';
import {
  Container,
  ContainText,
  TextName,
  TextValue,
  TextDetails,
  ContainFooter,
  Dot,
  Dot1,
  TextFooterTitle,
  TextFooter,
} from './styles';

import {salesLast30Days} from '../../services/provider/shopping/cart/report';
import {listDeliveryOne} from '../../services/provider/company';
import {formatNumber} from '../../utils/index';

import {StorageSet} from '../../services/deviceStorage';
/** Components */

interface Props {
  _id?: number;
  totalOrder?: number;
  totalSale?: number;
}

const CompHome: React.FC<Props> = ({_id}: any) => {
  const isFocused = useIsFocused();
  const {store} = useContext(ReactReduxContext);
  const company: any = store.getState()?.authUser?.user?.company;

  const [loading, setLoading] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [averageTickets, setAverageTickets] = useState(0);
  const [countCard, setCountCard] = useState(0);
  const [countSale, setCountSale] = useState(0);

  const getData = async (comp: any) => {
    setLoading(true);
    const response = await salesLast30Days(comp._id);

    let countCard = 0;
    let countSale = 0;
    let tickets = 0;

    let totalSales = 0;
    let totalApproved = 0;

    response.forEach((item: any) => {
      totalSales = totalSales + Number(item.totalSales ?? 0);
      totalApproved = totalApproved + Number(item.totalApproved ?? 0);
      tickets += Number(item.totalOrder);

      countCard += Number(item.total);
      countSale += Number(item.totalOrder);
    });

    setTotalSales(totalSales);
    setTotalApproved(totalApproved);
    setAverageTickets(totalSales ? Number(totalSales.toFixed(2)) / tickets : 0);

    setCountCard(countCard);
    setCountSale(countSale);

    setLoading(false);
  };

  const getCompanyDelivery = () => {
    listDeliveryOne(company?._id).then((response) =>
      StorageSet('companyDelivery', response),
    );
  };

  useEffect(() => {
    getData(company);
  }, [company?._id]);

  useEffect(() => {
    getCompanyDelivery();
  }, [isFocused]);

  return (
    <Container>
      <View>
        <ContainText>
          <TextName>TOTAL EM VENDAS</TextName>
          {loading ? (
            <TextValue>carregando...</TextValue>
          ) : (
            <TextValue>R$ {formatNumber(totalSales)}</TextValue>
          )}
          <TextDetails>Últimos 30 dias</TextDetails>
        </ContainText>

        <ContainText>
          <TextName>TOTAL EM VENDAS CONCLUÍDAS</TextName>
          {loading ? (
            <TextValue>carregando...</TextValue>
          ) : (
            <TextValue>R$ {formatNumber(totalApproved)}</TextValue>
          )}

          <TextDetails>Últimos 30 dias</TextDetails>
        </ContainText>

        <ContainText>
          <TextName>TICKET MÉDIO</TextName>
          {loading ? (
            <TextValue>carregando...</TextValue>
          ) : (
            <TextValue>R$ {formatNumber(averageTickets)}</TextValue>
          )}

          <TextDetails>Últimos 30 dias</TextDetails>
        </ContainText>
      </View>

      {/* <ContainLine>
        <TextContainLine>
          {moment().utc().subtract(3, 'hours').format('DD/MM/YYYY')}
        </TextContainLine>
        <TextContainLine>HOJE</TextContainLine>
      </ContainLine> */}

      {/* <ContainImage>
        <ImageGraph source={require('../../assets/images/graphic.png')} />
      </ContainImage> */}

      <ContainFooter>
        <Dot1 />
        <TextFooterTitle>Carrinhos</TextFooterTitle>
        <TextFooter>{loading ? '...' : countCard}</TextFooter>
      </ContainFooter>
      <ContainFooter>
        <Dot />
        <TextFooterTitle>Pedidos</TextFooterTitle>
        <TextFooter>{loading ? '...' : countSale}</TextFooter>
      </ContainFooter>
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

export default connect(mapStateToProps, mapDispatchToProps)(CompHome);
