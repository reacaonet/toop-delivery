import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  Image,
  Text,
  ScrollView,
} from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import CalenderComponent from './CalenderComponent';
import DeliveryTimeComponent from './DeliveryTimeComponent';
import TimesComponent from './TimesComponent';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

const SupermarketDetails = ({navigation, route}) => {
  const {configurations = null} = useSelector(state => state);
  const {t} = useTranslation();
  const imgHeader = require('../../../assets/images/product/background.jpg');
  const [company, setCompany] = useState({});
  const [dataActual, setDataActual] = useState('');

  const [infoBtn, setInfoBtn] = useState(true);
  const [time, setTime] = useState(false);

  useEffect(() => {
    const companyParam = route.params?.company ?? null;
    setCompany(companyParam);
  }, [route.params]);

  const goBack = () => {
    navigation.navigate('Product', {
      company,
    });
  };

  const infoOnPress = () => {
    setInfoBtn(true);
    setTime(false);
  };

  const timeOnPress = () => {
    setTime(true);
    setInfoBtn(false);
  };

  const dataCurrent = dayWeek => {
    setDataActual(dayWeek);
  };

  return (
    <>
      <View style={styles.container}>
        <ImageBackground
          style={styles.background}
          source={
            company?.imageAppHeader &&
            Array.isArray(company?.imageAppHeader) &&
            company?.imageAppHeader?.length > 0
              ? {uri: company?.imageAppHeader[0]}
              : imgHeader
          }>
          <TouchableOpacity style={styles.header} onPress={() => goBack()}>
            <Icon
              name="keyboard-arrow-down"
              size={40}
              style={styles.iconBefore}
            />
          </TouchableOpacity>
        </ImageBackground>
        <View style={styles.logoContainer}>
          {company && company.images && (
            <Image
              source={{uri: company.images[0]}}
              resizeMode="contain"
              style={styles.logoSupermarket}
            />
          )}
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerInfo}>
            <Text>Mínimo: RS 20,00</Text>
            <Text>Taxa de entrega {configurations?.coin} 15,00</Text>
            <Text>Entrega: Agendada</Text>
          </View>

          <View style={styles.cartBtnContainer}>
            <TouchableOpacity
              onPress={() => infoOnPress()}
              style={[styles.cartBtn, infoBtn ? styles.cartBtnBlue : null]}>
              <Text
                style={[
                  infoBtn ? styles.txtcartBtnBlue : styles.txtcartBtnWhite,
                ]}>
                Informações
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => timeOnPress()}
              style={[styles.cartBtn, time ? styles.cartBtnBlue : null]}>
              <Text
                style={[time ? styles.txtcartBtnBlue : styles.txtcartBtnWhite]}>
                Tempo de entrega
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarComponent}>
            {time ? <CalenderComponent dataCurrent={dataCurrent} /> : null}
          </View>

          <View style={styles.content}>
            {infoBtn ? <TimesComponent /> : null}
            {time ? <DeliveryTimeComponent dayWeek={dataActual} /> : null}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default SupermarketDetails;
