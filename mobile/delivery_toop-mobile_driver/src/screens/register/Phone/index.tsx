/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useLayoutEffect, useCallback, useRef } from 'react';
import {
  Text,
  View,
  Image,
  Platform,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown';
import * as RNLocalize from 'react-native-localize';

import { TextInputMask } from 'react-native-masked-text';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import { useSelector, useDispatch } from 'react-redux';

import { Typography, Colors } from '../../../styles';
import { StorageGet, StorageClean } from '../../../services/deviceStorage';
import { CustomModal } from '../../../components/Modal';
import { listPreRegistration } from '../../../services/provider/preRegistration/list';
import ValidadeSMS from './Validate';

/** Services */
import { listContries } from '../../../services/provider/settings/contries';

type Props = {};

const Phone: React.FC<Props> = ({ }) => {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const state: any = useSelector((state: any) => state?.preRegistration);
  const { t } = useTranslation();

  const [countries, setCountries] = useState<any>(null);
  const [phone, setPhone] = React.useState<string>(state?.phone ?? '');
  const [ddi, setDdi] = useState('+55');
  const [currentCountrie, setCurrentCountrie] = useState<any>(null);
  const [load, setLoad] = React.useState<boolean>(false);

  const [confirmCode, setConfirmCode] = useState<any | null>();
  const [showModal, setShowModal] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [showValidate, setShowValidate] = React.useState(false);
  const selectRef = useRef<SelectDropdown>(null);

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );

  useLayoutEffect(() => {
    setConfirmCode(null);
    getPreRegister();

    auth()
      .signOut()
      .catch(_err => {
        // console.log('signOut err', err);
      });
  }, []);

  const authSMS = async () => {
    if (!phone) {
      return;
    }

    setLoad(true);
    await StorageClean('@dateSMS');

    const phoneOnlyNumbers = phone.replace(/\D/g, '');

    if (!isValidPhone()) {
      setMessage('Informe um telefone válido');
      setShowModal(true);
      return;
    }

    const phoneFormat = `${ddi}${phoneOnlyNumbers}`;
    const confirmation = await auth()
      .signInWithPhoneNumber(phoneFormat, true)
      .catch((error: any) => {
        setLoad(false);
        console.log('error firebase auth', error);
        let messageError = 'Erro na requisição, tente novamente mais tarde.';

        if (typeof error !== 'string') {
          const errorMessage = JSON.stringify(error.message);

          const search = errorMessage.indexOf(
            'blocked all requests from this device',
          );

          const quotaSearch = errorMessage.indexOf(
            "This project's quota for this operation has been exceeded",
          );

          if (Number(search) >= 0) {
            setMessage(
              'Acesso bloqueado temporariamente por comportamento anormal. Entre em contato com o suporte',
            );
            setShowModal(true);
          } else if (Number(quotaSearch) >= 0) {
            setMessage('A cota deste projeto para esta operação foi excedida');
            setShowModal(true);
          } else {
            setMessage(messageError);
            setShowModal(true);
          }
        } else {
          setMessage(messageError);
          setShowModal(true);
        }
      });

    if (confirmation) {
      setConfirmCode(confirmation);
      setLoad(false);
      setShowValidate(true);
    } else {
      setLoad(false);
    }
  };

  function handleGoBack() {
    navigation.goBack();
  }

  const getPreRegister = async (text: string | null = null) => {
    try {
      let phoneExists = text;
      let ddiExists = ddi;
      let isStorage = false;

      if (!text) {
        const preRegister = (await StorageGet('@pre_register')) || null;
        phoneExists = preRegister?.phone ?? null;
        ddiExists = preRegister?.ddi ?? null;

        if (preRegister && preRegister?.phone) {
          isStorage = true;
        }
      }

      if (phoneExists) {
        setPhone(phoneExists);
        setDdi(ddiExists);

        const data = await listPreRegistration(phoneExists, ddiExists);

        if (
          data &&
          data._id &&
          data?.status !== 'DECLINED' &&
          data?.status !== 'RESENT'
        ) {
          dispatch({
            type: 'SET_REGISTRATION',
            payload: {
              id: data._id,
              data: data,
            },
          });

          if (isStorage) {
            return navigation.navigate('Register', {
              screen: 'DynamicRegister',
            });
          }
        }
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const isValidPhone = () => {
    let min = 11;
    let max = 11;

    if (currentCountrie && currentCountrie?.mask) {
      min = currentCountrie.min;
      max = currentCountrie.max;
    }

    if (
      phone &&
      `${phone.replace(/\D/g, '')}`.length >= min &&
      `${phone.replace(/\D/g, '')}`.length <= max
    ) {
      return true;
    }

    return false;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      </SafeAreaView>
      <KeyboardAvoidingView>
        {!showValidate ? (
          <View style={styles.center}>
            <View style={styles.loginPhoneContainer}>
              <Text style={styles.title}>{t('login.informYourPhone')}</Text>
              <View style={styles.boxPhone}>
                {countries ? (
                  <SelectDropdown
                    ref={selectRef}
                    buttonStyle={styles.buttonStyle}
                    rowTextStyle={styles.rowTextStyle}
                    data={countries}
                    defaultButtonText={ddi}
                    defaultValue={ddi}
                    onSelect={selectedItem => {
                      setDdi(selectedItem.value);
                      setCurrentCountrie(selectedItem);
                      setPhone('');
                    }}
                    buttonTextAfterSelection={(selectedItem: any): any => {
                      return (
                        <>
                          <Text>{selectedItem.value}</Text>
                        </>
                      );
                    }}
                    rowTextForSelection={(item, _index) => {
                      return item.name;
                    }}
                    dropdownIconPosition="right"
                  />
                ) : null}

                {countries ? (
                  <TextInputMask
                    type={'custom'}
                    value={phone}
                    onChangeText={(value: string) => {
                      setPhone(value);
                    }}
                    style={styles.inputPhone}
                    placeholder="Seu número"
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

              {isValidPhone() ? (
                <TouchableOpacity
                  onPress={() => authSMS()}
                  disabled={load}
                  style={styles.guest}>
                  {!load ? (
                    <Text style={styles.guestText}>Enviar código por SMS</Text>
                  ) : (
                    <ActivityIndicator size="small" color={Colors.WHITE} />
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled
                  style={[styles.guest, styles.btnDisabled]}>
                  <Text style={styles.guestText}>Enviar código por SMS</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <ValidadeSMS
            ddi={ddi}
            phone={phone}
            confirmCode={confirmCode}
            setConfirmCode={setConfirmCode}
            setShowValidate={setShowValidate}
            showValidate={showValidate}
          />
        )}
      </KeyboardAvoidingView>

      {showModal === true ? (
        <CustomModal
          isVisible={showModal}
          setModalVisible={setShowModal}
          message={message}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 7,
  },
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  loginPhoneContainer: {
    width: '90%',
    marginTop: 40,
  },
  title: {
    fontSize: Typography.FONT_SIZE_14,
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
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: '#999a99',
    marginLeft: 7,
    marginRight: 12,
  },
  inputPhone: {
    color: Colors.BLACK,
    flex: 1,
    fontSize: Typography.FONT_SIZE_22,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    marginLeft: 8,
  },
  btnDisabled: {
    backgroundColor: Colors.GRAY_LIGHT,
    color: Colors.GRAY_TEXT,
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
    marginTop: 10,
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
  imageCountry: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
});

export default React.memo(Phone);
