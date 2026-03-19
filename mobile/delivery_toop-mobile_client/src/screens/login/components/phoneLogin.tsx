/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  Platform,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { useTranslation } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import { toastShow } from '../../../utils';

import auth from '@react-native-firebase/auth';
import { TextInputMask } from 'react-native-masked-text';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors } from '../../../styles';

/** Services */
import { listContries } from '../../../services/provider/settings/contries';

// const countries = [
//   {
//     name: 'Brasil',
//     value: '+55',
//   },
//   {
//     name: 'Portugal',
//     value: '+351',
//   },
//   {
//     name: 'Angola',
//     value: '+244',
//   },
// ];

const PhoneLogin = ({
  settingAnimated,
  phone,
  ddiPhone,
  setPhone,
  setModalLoad,
  log,
  setConfirmCode,
}: any) => {
  const { t } = useTranslation();
  const [ddi, setDdi] = useState('+55');
  const [countries, setCountries] = useState<any>(null);
  const [currentCountrie, setCurrentCountrie] = useState<any>(null);
  const selectRef = useRef<SelectDropdown>(null);

  useEffect(() => {
    const listLanguages = RNLocalize.getLocales();
    let language = '';

    if (
      listLanguages &&
      Array.isArray(listLanguages) &&
      listLanguages.length > 0
    ) {
      language = listLanguages[0].languageTag;
    }

    listContries({
      language: language,
    }).then(result => {
      if (result && Array.isArray(result) && result.length > 0) {
        setCountries(result);
        setDdi(result[0].value);
        setCurrentCountrie(result[0]);
      } else {
        setCountries(null);
      }
    });
  }, []);

  const authSMS = async (phoneNumber: any) => {
    try {
      if (!phoneNumber) {
        return;
      }

      if (!ddi || `${ddi}`.length < 3) {
        toastShow('Informe o código do pais', 'ALERT', 3000);
        return;
      }

      const phoneOnlyNumbers = phone.replace(/\D/g, '');

      if (ddi === '+55' && phoneOnlyNumbers.length < 11) {
        toastShow('Informe um número válido!', 'ALERT', 3000);
        return;
      }

      if (ddi !== '+55' && phoneOnlyNumbers.length < 9) {
        toastShow('Informe um número válido!', 'ALERT', 3000);
        return;
      }

      const phoneFormat = `${ddi}${phoneOnlyNumbers}`;
      setModalLoad(true);
      let messageError = 'Falha na autenticação, tente novamente mais tarde';

      let confirmation = await auth()
        .signInWithPhoneNumber(phoneFormat, true)
        .catch((error: any) => {
          setModalLoad(false);

          console.log('fail', error);
          log(error.message, 'login-authSMS');
          messageError = 'Erro na requisição 2, tente novamente mais tarde.';

          if (typeof error !== 'string') {
            const errorMessage = JSON.stringify(error.message);
            const search = errorMessage.indexOf(
              'blocked all requests from this device',
            );

            if (Number(search) >= 0) {
              toastShow(
                'Acesso bloqueado temporariamente por comportamento anormal. Entre em contato com o suporte.',
                'ALERT',
                3000,
              );
              log(
                'Acesso bloqueado temporariamente por comportamento anormal',
                'login-authSMS',
              );
            } else {
              toastShow(messageError, 'ALERT', 3000);
              log(messageError, 'login-authSMS');
            }
          } else {
            toastShow(messageError, 'ALERT', 3000);
            log(messageError, 'login-authSMS');
          }
        });

      if (confirmation) {
        setModalLoad(false);
        setConfirmCode(confirmation);
        settingAnimated(0);
        ddiPhone(ddi);
      } else {
        setModalLoad(false);
        log(confirmation, 'login-authSMS');
      }
    } catch (err) {
      log(err, 'login-authSMS');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={() => settingAnimated(0)}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      </SafeAreaView>
      <KeyboardAvoidingView
        style={styles.contentKeyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.center}>
          <View style={styles.loginPhoneContainer}>
            <Text style={styles.title}>{t('login.informYourPhone')}</Text>
            <View style={styles.boxPhone}>
              {/* <View style={styles.brazilPhone}>
                <Image source={require('../../../assets/images/br.png')} />
                <Text style={styles.phoneTag}>+55</Text>
              </View> */}

              <SelectDropdown
                ref={selectRef}
                buttonStyle={styles.buttonStyle}
                rowTextStyle={styles.rowTextStyle}
                buttonTextStyle={styles.buttonTextStyle}
                data={countries}
                defaultButtonText={currentCountrie?.name || 'Selecione'}
                defaultValue={ddi}
                onSelect={selectedItem => {
                  setDdi(selectedItem.value);
                  setCurrentCountrie(selectedItem);
                  setPhone('');
                }}
                buttonTextAfterSelection={(selectedItem: any): any => {
                  return (
                    <>
                      <Text>{selectedItem.name}</Text>
                    </>
                  );
                }}
                rowTextForSelection={(item, _index) => {
                  return item.name;
                }}
                dropdownIconPosition="right"
              />

              {countries ? (
                <TextInputMask
                  type={'custom'}
                  value={phone}
                  onChangeText={(value: string) => setPhone(value)}
                  style={styles.inputPhone}
                  placeholder={t('login.placeholder')}
                  placeholderTextColor="#999a99"
                  keyboardType="phone-pad"
                  options={{
                    mask:
                      currentCountrie && currentCountrie?.mask
                        ? `${currentCountrie?.mask}`
                        : '(99) 99999-9999',
                  }}
                />
              ) : null}
            </View>

            {currentCountrie && ddi ? (
              <TouchableOpacity
                style={styles.labelCountry}
                onPress={() => {
                  try {
                    selectRef.current?.openDropdown();
                  } catch (err) {
                    console.log('faill', err);
                  }
                }}>
                <Text style={styles.labelCountryTxt}>
                  {t('login.infoDDI')
                    .replace('{ddi}', ddi)
                    .replace('{country}', currentCountrie?.name)}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => authSMS(phone)}
              style={styles.guest}>
              <Text style={styles.guestText}>Enviar código por SMS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PhoneLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentKeyboard: {
    flex: 1,
  },
  iconGoBack: {
    color: Colors.PRIMARY,
  },
  center: {
    alignItems: 'center',
    // justifyContent: 'center',
    flexGrow: 1,
  },
  loginPhoneContainer: {
    width: '90%',
    marginTop: 40,
  },
  title: {
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    letterSpacing: 1,
    color: Colors.BLACK,
  },
  boxPhone: {
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    borderRadius: 5,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 65,
  },
  brazilPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ececec',
  },
  phoneTag: {
    fontSize: Typography.FONT_SIZE_22,
    color: '#999a99',
    marginLeft: 7,
    marginRight: 12,
  },
  inputPhone: {
    color: Colors.BLACK,
    flex: 1,
    fontSize: Typography.FONT_SIZE_22,
    marginLeft: 8,
  },
  guest: {
    flexShrink: 1,
    width: '100%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 30,
    height: 45,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
    letterSpacing: 1,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  safeAreaView: {
    marginTop: 20,
  },
  buttonStyle: {
    width: 85,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  rowTextStyle: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_13,
  },
  buttonTextStyle: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_13,
  },
  labelCountry: {
    width: '100%',
    marginTop: 5,
    marginLeft: 5,
  },
  labelCountryTxt: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    color: Colors.BLACK,
    fontSize: Typography.FONT_SIZE_12,
  },
});
