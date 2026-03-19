/* eslint-disable react-hooks/exhaustive-deps */
import React, {FunctionComponent, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {connect} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import {styles} from './styles';
import {formatMoney} from '../../utils';

type EarningDetailsProps = {
  navigation: any;
  route: any;
  user: any;
};

const EarningDetails: FunctionComponent<EarningDetailsProps> = ({
  navigation,
  route: Route,
}: EarningDetailsProps) => {
  const [ride] = useState(() => {
    return Route.params.ride;
  });

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

  const renderDots = () => (
    <View style={{marginHorizontal: 10}}>
      <Text>•</Text>
      <Text>•</Text>
      <Text>•</Text>
      <Text>•</Text>
      <Text>•</Text>
      <Text>•</Text>
      <Text>•</Text>
      <Text>•</Text>
      <Text>•</Text>
    </View>
  );

  const typePaymentText = (typePayment: any) => {
    switch (typePayment) {
      case 'MONEY':
        return 'Dinheiro';
      case 'BRASPAG':
        return 'Pago Aplicativo';
      case 'PIX':
        return 'Pago Aplicativo';
      case 'CARD':
        return 'Cartão no local';
      default:
        return '';
    }
  };

  const renderFooter = () => (
    <View style={styles.footerDetail}>
      <Text style={[styles.txtCenter, styles.m15, styles.txtWhiteBold]}>
        {typePaymentText(ride.typePayment)}
      </Text>
      <Text style={[styles.txtCenter, styles.m15, styles.txtWhiteBold]}>
        {formatMoney(ride.value)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.txtCenter, styles.txtTitleGray]}>Data</Text>
      <Text style={[styles.txtCenter, styles.txtTitleGray]}>{ride?.date}</Text>
      <Text style={styles.txtHourBlue}>Horário: {ride.hour}</Text>
      <View style={styles.row}>
        <View>{renderDots()}</View>
        <View style={[styles.innerContainer, styles.m15]}>
          <Text style={[styles.txtHistory, styles.txtBold]}>Empresa:</Text>
          <Text style={[styles.txtHistory]}>{ride.origin}</Text>
          <Text style={[styles.txtHistory, styles.txtBold]}>Entregue em:</Text>
          <Text style={[styles.txtHistory]}>{ride.destiny}</Text>
        </View>
      </View>
      {renderFooter()}
    </View>
  );
};

const mapStateToProps = ({authUser}: any) => {
  return {
    user: authUser?.user ?? {},
  };
};

export default connect(mapStateToProps)(EarningDetails);
