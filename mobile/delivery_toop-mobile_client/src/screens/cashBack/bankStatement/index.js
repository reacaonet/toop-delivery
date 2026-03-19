/* eslint-disable react-hooks/rules-of-hooks */
import React, {useState, useEffect} from 'react';
import {Image, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../styles';
import {useSelector} from 'react-redux';
import moment from 'moment';
moment.locale('pt');

moment.updateLocale('pt', {
  months: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
    ,
  ],
});

import {
  Container,
  ContainerScroll,
  Header,
  PrimaryBox,
  SecondaryBox,
  Divider,
  Titlestatements,
  MainTitle,
  TitleScreen,
} from './styles';

/** Services */
import {
  cashBackCustomer,
  cashBackMouthTotal,
} from '../../../services/service/cashback/list';

/** Util */
import {formatMoney} from '../../../utils';

const bankStatement = () => {
  const user = useSelector(state => state?.user?.user);
  const {configurations = null} = useSelector(state => state);
  const {goBack} = useNavigation();
  const [list, setList] = useState(null);
  const [listTotal, setListTotal] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      cashBackCustomer(user._id).then(async result => {
        try {
          if (!result || result.length <= 0) {
            return setList(null);
          }
          const listToMouth = await getList(result);
          setList(listToMouth);
        } catch (err) {
          console.log('err', err);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      cashBackMouthTotal(user._id).then(result => {
        if (!result || result.length <= 0) {
          return setListTotal(null);
        }

        let listPrice = {};

        result.map(item => {
          listPrice[`${item._id.year}${item._id.month}`] = item._id;
        });
        setListTotal(listPrice);
      });
    }
  }, [user]);

  const getList = async result => {
    let listToMouth = {};

    await result.map(item => {
      const month = moment(item.createdAt).format('M');
      const year = moment(item.createdAt).format('YYYY');
      item.month = moment(item.createdAt).format('MMMM YYYY');
      item.index = `${year}${month}`;

      if (listToMouth[`${year}${month}`]) {
        listToMouth[`${year}${month}`].push(item);
      } else {
        listToMouth[`${year}${month}`] = [item];
      }
    });

    return listToMouth;
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Container>
        <Header>
          <Icon
            name="chevron-left"
            size={20}
            onPress={goBack}
            color={Colors.BLUE}
          />
          <TitleScreen>EXTRATO</TitleScreen>
        </Header>
        <ContainerScroll>
          {list && Object.keys(list).length > 0 ? (
            Object.values(list).map((item, key) => {
              return (
                <>
                  <PrimaryBox>
                    <MainTitle>{item[0].month}</MainTitle>
                    {listTotal ? (
                      <MainTitle>
                        {formatMoney(
                          listTotal[item[0]?.index]?.cash || 0,
                          configurations?.coin,
                        )}
                      </MainTitle>
                    ) : null}
                  </PrimaryBox>
                  {item.map(cashback => {
                    return (
                      <>
                        <SecondaryBox>
                          {cashback.cash < 0 ? (
                            <>
                              <Titlestatements style={{color: item.color}}>
                                {`Usado no pedido nº ${cashback.order.order_number}`}
                              </Titlestatements>
                              <Titlestatements style={{color: 'red'}}>
                                {formatMoney(
                                  cashback.cash,
                                  configurations?.coin,
                                )}
                              </Titlestatements>
                            </>
                          ) : (
                            <>
                              <Titlestatements style={{color: item.color}}>
                                {`Ganho pedido nº ${cashback.order.order_number}`}
                              </Titlestatements>
                              <Titlestatements style={{color: item.color}}>
                                {formatMoney(
                                  cashback.cash,
                                  configurations?.coin,
                                )}
                              </Titlestatements>
                            </>
                          )}
                        </SecondaryBox>
                        <Divider />
                      </>
                    );
                  })}
                </>
              );
            })
          ) : (
            <PrimaryBox>
              <MainTitle>Voce ainda não possui registro cashback</MainTitle>
            </PrimaryBox>
          )}
        </ContainerScroll>
      </Container>
    </>
  );
};

export default bankStatement;
