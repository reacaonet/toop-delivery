/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  SafeAreaView,
  Platform,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableNativeFeedbackComponent,
} from 'react-native';
import {TextInputMask} from 'react-native-masked-text';
import {useTranslation} from 'react-i18next';
import SelectDropdown from 'react-native-select-dropdown';
import * as RNLocalize from 'react-native-localize';

import styles from './styles';
import {createLog} from '../../../services/service/Log';

import {pickFile} from '../../paymentStatus/ChatPayment/chatUtils';
import {uploadDocument} from '../../../services/service/sendImages';

import {
  StorageMultGet,
  StorageGet,
  StorageSet,
  StorageCleanAll,
} from '../../../services/deviceStorage';
import {validateEmail} from '../../../utils';
import {
  customerCurrent,
  updateCustomer,
  createCustomer,
  listCustomerSearch,
} from '../../../services/service/customer';

import {
  updatePersonOne,
  createPerson,
  listPersonSearch,
} from '../../../services/service/Person';
import {getUniqueId} from 'react-native-device-info';
import {connect} from 'react-redux';
import {getUser} from '../../../store/actions/user';
import {useDispatch, useSelector} from 'react-redux';
import {setUser} from '../../../store/actions/user';
import {Colors} from '../../../styles';

import profileImage from './../../../assets/images/profile.png';
import {MenuIcon} from '../../../components/Icon';

const countries = [
  {
    name: 'Brasil',
    value: '+55',
  },
  {
    name: 'Portugal',
    value: '+351',
  },
  {
    name: 'Angola',
    value: '+244',
  },
];

const NewUser = ({navigation, onUserAuth, route}) => {
  const [modalLoad, setModalLoad] = useState(false);
  const [isValidName, setIsValidName] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ddiPhone, setDdiPhone] = useState('+55');
  const [profile, setProfile] = useState('');
  const [user, setUser] = useState();
  const [type, setType] = useState('');
  const upPhoto = useRef(null);

  const widthScreen = Dimensions.get('screen').width;
  const leftLogin = useRef(new Animated.Value(200)).current;
  const leftOtherLogin = useRef(new Animated.Value(100)).current;
  const leftProfile = useRef(new Animated.Value(0)).current;
  const input_email = useRef();
  const {t} = useTranslation();

  const log = (err, originError) => {
    try {
      createLog({
        typeSystem: 'MOBILE',
        typeLog: 'ERROR',
        description: err,
        category: 'newUser',
        originError: originError,
      });
    } catch (_err) {
      return false;
    }
  };
  console.log(type.length);

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

    switch (language) {
      case 'pt':
        setDdiPhone('+351');
        break;
      case 'pt-PT':
        setDdiPhone('+351');
        break;
      case 'pt-AO':
        setDdiPhone('+244');
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    const isInfo = async () => {
      let params = await StorageMultGet([
        'nameUser',
        'phoneUser',
        'emailUser',
        'profileUser',
        '_idUser',
      ]);
      console.log(params);

      if (!params._idUser && !params.phoneUser) {
        navigation.navigate('Login', {
          screen: 'login',
        });
        return;
      }

      if (!params._idUser) {
        await newUser(params);
        // settingAnimated(0);
      }
      if (params.nameUser) {
        setName(params.nameUser);
      }

      if (params.emailUser) {
        setEmail(params.emailUser);
      }

      if (params.phoneUser) {
        setPhone(`${params.phoneUser}`.slice(-12));
      }

      if (params.profileUser) {
        setProfile(params.profileUser);
      }

      // settingAnimated(-widthScreen);

      if (validateName(params.nameUser) === false) {
        setType('name');
        setModalLoad(false);
        return;
      } else if (!validateEmail(params.emailUser)) {
        setType('email');
        setModalLoad(false);
        return;
      }

      // settingAnimated(-widthScreen);

      // if (validateName(params.nameUser) === false) {
      //   return;
      // }

      // settingAnimated(-widthScreen);

      // if (!validateEmail(params.emailUser)) {
      //   setType('email');
      //   return;
      // }

      // settingAnimated(-widthScreen);

      if (`${params.phoneUser || ''}`.length < 10) {
        setType('phone');
        setModalLoad(false);
        return;
      }

      // settingAnimated(-widthScreen * 2);

      if (!params.profileUser) {
        return;
      }

      return true;
    };

    isInfo();
  }, []);

  useEffect(() => {
    if (validateName(name)) {
      setIsValidName(true);
    } else {
      setIsValidName(false);
    }

    if (validateEmail(email.replace(/\s/g, ''))) {
      setIsValidEmail(true);
    } else {
      setIsValidEmail(false);
    }

    if (ddiPhone === '+55' && phone.length < 10) {
      setIsValidPhone(false);
    } else if (ddiPhone !== '+55' && phone.length < 9) {
      setIsValidPhone(false);
    } else {
      setIsValidPhone(true);
    }
  }, [name, email, phone]);

  const validateName = value => {
    // let regName = /^[a-zA-Z]+ [a-zA-Z]+$/;
    let regName = /^[a-zA-Z].{6,}$/;
    let validName = `${value || ''}`.replace(/[0-9]/g, '');

    if (validName.length >= 6 && regName.test(value.trim())) {
      return true;
    }

    return false;
  };

  const settingAnimated = useCallback(
    toValue => {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(leftLogin, {
          toValue: toValue,
          useNativeDriver: false,
          duration: 400,
        }),
        Animated.timing(leftOtherLogin, {
          toValue: toValue,
          useNativeDriver: false,
          duration: 400,
        }),
        Animated.timing(leftProfile, {
          toValue: toValue,
          useNativeDriver: false,
          duration: 400,
        }),
      ]).start();
    },
    [leftLogin, leftOtherLogin, leftProfile],
  );

  // useEffect(() => {
  //   settingAnimated(0);
  // }, [settingAnimated]);

  if (modalLoad) {
    return (
      <View style={[styles.container, styles.loader]}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  const saveNameNextEmail = async () => {
    if (!name) {
      return;
    }

    setModalLoad(true);

    let response = await saveinfoUser({
      name: name.trim(),
      status: true,
    });

    if (!response) {
      Alert.alert('Oops', 'Não foi possível salvar Nome');
      log('Não foi possível salvar Nome', 'newUser');
      setModalLoad(false);
      return;
    }

    setModalLoad(false);
    // settingAnimated(-widthScreen);
    if (!email) {
      setType('email');
    } else {
      await auth();
    }
  };

  const saveEmailNextPhone = async () => {
    if (!email) {
      return;
    }
    setModalLoad(true);

    let userSearch = await listCustomerSearch({
      email: email,
    });

    if (userSearch && userSearch._id) {
      setModalLoad(false);
      log('Este e-mail já se encontra cadastrado', 'newUser');

      await StorageCleanAll();

      navigation.navigate('Login', {
        screen: 'login',
      });
      return Alert.alert(
        'Oops',
        'Este endereço de e-mail já se encontra cadastrado, faça login por email',
      );
    }

    let response = await saveinfoUser({
      email: email.trim(),
      status: true,
    });

    if (!response) {
      setModalLoad(false);
      log('Não foi possível salvar E-mail', 'newUser');
      Alert.alert('Oops', 'Não foi possível salvar E-mail');
      return;
    }

    // if (isValidPhone) {
    //   console.log('entrou no auth do isValidfone');
    //   await auth();
    //   return;
    // }

    setModalLoad(false);
    // settingAnimated(-widthScreen);
    setType('profile');
  };

  const lastStep = async () => {
    if (!isValidPhone) {
      return;
    }

    setModalLoad(true);
    let phoneValue = `${ddiPhone}${phone}`.replace(/\D/g, '');

    let userSearch = await listCustomerSearch({
      ddi: encodeURIComponent(`${ddiPhone}`.trim()),
      phone: `${phone.replace(/\D/g, '')}`,
    });
    /*     isso acontece depois de logar pelo email,
    o app direciona para tela de cadastrar o Telefone
    se existir um cadastro por outro  meio vai validar que já existe. */
    /* Verificar se a busca é por um cadastro exitente com id criando
anteriormente, ou uma busca geral(no caso do gmail pode ser:
  email, _iduser, phone digitado pelo usuario. */

    if (userSearch && userSearch._id) {
      setModalLoad(false);
      log('Este número já se encontra cadastrado', 'newUser');
      await StorageCleanAll();

      navigation.navigate('Login', {
        screen: 'login',
      });
      return Alert.alert(
        'Oops',
        'Este número de telefone já se encontra cadastrado, faça login por Celular',
      );
    }

    let response = await saveinfoUser({
      ddi: encodeURIComponent(`${ddiPhone}`.trim()),
      phone: phoneValue,
      status: true,
    });

    if (!response) {
      log('Não foi possível salvar Telefone', 'newUser');
      Alert.alert('Oops', 'Não foi possível salvar Telefone');
      setModalLoad(false);
      return;
    }
    setModalLoad(false);
    setType('profile');
    // await auth();
    // settingAnimated(-widthScreen * 2);
  };

  const auth = async () => {
    let userId = await StorageGet('_idUser');
    let userResponse = await customerCurrent(userId);

    if (userResponse && userResponse._id) {
      if (phone) {
        await StorageSet('phoneUser', phone);
      }
      if (email) {
        await StorageSet('emailUser', email);
      }
      if (name) {
        await StorageSet('nameUser', name);
      }

      await StorageSet('CUSTOMER', {user: userResponse, guest: false});
      await StorageSet('@indication', {status: true});
      onUserAuth();

      setTimeout(() => {
        navigation.navigate('ReferralCode');
      }, 700);
    }

    setModalLoad(false);
    // navigation.navigate('Splash');
  };

  const saveinfoUser = async params => {
    try {
      let userResponse = null;

      if (!user || user === null || !user._id) {
        let userId = await StorageGet('_idUser');
        if (!userId) {
          log('UserId não encontrado no StorageGet', 'newUser');
          navigation.navigate('Login', {
            screen: 'login',
          });
          return;
        }

        userResponse = await customerCurrent(userId);
        setUser(userResponse);
      } else {
        userResponse = user;
      }

      if (userResponse && userResponse._id && userResponse.person) {
        let uniqueId = getUniqueId();

        if (userResponse.device !== uniqueId) {
          await updateCustomer(userResponse._id, {
            device: uniqueId,
          });

          let devices = userResponse.person?.devices ?? [];

          devices.push(uniqueId);
          await updatePersonOne(userResponse.person._id, {
            devices: devices,
            status: true,
          });
        }
        await updateCustomer(userResponse._id, params);
        // console.log(userResponse.person._id);
        await updatePersonOne(userResponse.person._id, params);
        return true;
      }

      return false;
    } catch (err) {
      log(err, 'newUser');
      return false;
    }
  };

  async function newUser(params) {
    // console.log('dentro new user', params);
    // try {
    //   setModalLoad(true);
    //   let personSearch = await listPersonSearch({
    //     phone: `${params?.phoneUser.replace(/\D/g, '')}`,
    //   });
    //   console.log(personSearch);
    //   if (personSearch && personSearch._id) {
    //     console.log('Existe person');
    //     await StorageSet('_idUser', `${personSearch._id}`);
    //     setModalLoad(false);
    //     return;
    //   }
    //   console.log('Não Existe person');
    //   let uniqueId = getUniqueId();
    //   let person = await createPerson({
    //     phone: `${params?.phoneUser.replace(/\D/g, '')}`,
    //     devices: [uniqueId],
    //     status: true,
    //   });

    //   if (!person || !person._id) {
    //     setModalLoad(false);
    //     log('Erro ao criar Person', 'newUser');
    //     navigation.navigate('Login', {
    //       screen: 'login',
    //     });
    //     return;
    //   }

    //   let userCreate = await createCustomer({
    //     device: uniqueId,
    //     person: person._id,
    //     status: true,
    //     phone: `${params?.phoneUser.replace(/\D/g, '')}`,
    //   });

    //   if (!userCreate || !userCreate._id) {
    //     setModalLoad(false);
    //     log('Erro ao criar User', 'newUser');
    //     navigation.navigate('Login', {screen: 'login'});
    //     return;
    //   }

    //   await StorageSet('_idUser', `${userCreate._id}`);
    //   setModalLoad(false);
    //   return;
    try {
      setModalLoad(true);
      let userSearch = await listCustomerSearch({
        phone: `${params?.phoneUser.replace(/\D/g, '')}`,
      });

      if (userSearch && userSearch._id) {
        await StorageSet('_idUser', `${userSearch._id}`);
        setModalLoad(false);
        return;
      }

      let uniqueId = getUniqueId();
      let person = await createPerson({
        phone: `${params?.phoneUser.replace(/\D/g, '')}`,
        devices: [uniqueId],
        status: true,
      });

      if (!person || !person._id) {
        setModalLoad(false);
        log('Erro ao criar Person', 'newUser');
        navigation.navigate('Login', {
          screen: 'login',
        });
        return;
      }

      let userCreate = await createCustomer({
        device: uniqueId,
        person: person._id,
        status: true,
        phone: `${params?.phoneUser.replace(/\D/g, '')}`,
      });

      if (!userCreate || !userCreate._id) {
        setModalLoad(false);
        log('Erro ao criar User', 'newUser');
        navigation.navigate('Login', {screen: 'login'});
        return;
      }

      await StorageSet('_idUser', `${userCreate._id}`);
      setModalLoad(false);
      return;
    } catch (err) {
      log(err, 'newUser');
      setModalLoad(false);
    }
  }

  const selectImage = async () => {
    upPhoto.current = null;
    const data = await pickFile('camera', 'photo');

    if (!data?.uri || !data?.type) {
      Alert.alert(
        'Oops',
        'Ocorreu um erro ao tirar sua foto, tente novamente.',
      );
      return;
    }

    setProfile(data?.uri);
    upPhoto.current = data;
  };

  const sendImage = async () => {
    if (!upPhoto.current || !upPhoto.current?.uri) {
      return Alert('Photo', 'por favor, envie uma foto');
    }

    setSending(true);
    const image = await uploadDocument(upPhoto.current, 'profile_customer');

    if (!image?.url) {
      Alert.alert(
        'Oops',
        'Ocorreu um erro ao salvar sua foto, tente novamente.',
      );
      setSending(false);
      return;
    }

    setProfile(image.url);

    let response = await saveinfoUser({
      image: image.url,
      status: true,
    });

    if (!response) {
      log('Não foi possível salvar Image,', 'newUser');
      Alert.alert('Oops', 'Não foi possível salvar Foto');

      setSending(false);
      return;
    }

    setSending(false);
    auth();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardBox}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {type.length <= 0 ? (
          setModalLoad(true)
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.BoxAnimated}>
                {/* <Animated.View style={[styles.boxRegister, {left: leftLogin}]}> */}
                {/* <Animated.View style={[styles.boxRegister]}> */}

                {/* <View style={styles.containerData}>
                    <View>
                      <View style={styles.boxTitle}>
                        <Text style={styles.Title}>
                          E para começar, o número do seu{' '}
                          <Text style={[styles.Title, styles.TitleMain]}>
                            {t('newUser.msgRegisterPhone')}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <View style={styles.boxPhone}>
                      <SelectDropdown
                        buttonStyle={{
                          width: 80,
                          backgroundColor: '#FFFFFF',
                        }}
                        rowTextStyle={{
                          fontSize: 13,
                        }}
                        data={countries}
                        defaultButtonText={ddiPhone}
                        defaultValue={ddiPhone}
                        onSelect={selectedItem => {
                          setDdiPhone(selectedItem.value);
                          setPhone('');
                        }}
                        buttonTextAfterSelection={selectedItem => {
                          return selectedItem.value;
                        }}
                        rowTextForSelection={(item, _index) => {
                          return item.name;
                        }}
                      />

                      <TextInputMask
                        type={ddiPhone === '+55' ? 'cel-phone' : 'custom'}
                        autoFocus={true}
                        style={styles.inputPhone}
                        value={phone}
                        includeRawValueInChangeText={true}
                        // onChangeText={setPhone}
                        onChangeText={(maskedText, rawText) => {
                          setPhone(rawText);
                        }}
                        placeholder={t('login.placeholder')}
                        placeholderTextColor="#999a99"
                        keyboardType="phone-pad"
                        options={
                          ddiPhone === '+55'
                            ? {
                                mask: '(99) 99999-9999',
                              }
                            : {
                                mask: '999999999',
                              }
                        }
                      />
                    </View>
                    <TouchableOpacity
                      disabled={!isValidPhone}
                      style={[
                        styles.btn,
                        isValidPhone ? styles.boxSave : styles.boxSaveDisable,
                      ]}
                      onPress={() => lastStep()}>
                      <Text
                        style={[
                          styles.boxSaveText,
                          isValidPhone
                            ? styles.boxSaveTextActive
                            : styles.boxSaveTextDisable,
                        ]}>
                        SALVAR
                      </Text>
                    </TouchableOpacity>
                  </View> */}
                {/* </Animated.View> */}

                {/* <Animated.View
                  style={[styles.boxRegister, {left: leftOtherLogin}]}> */}
                <Animated.View style={[styles.boxRegister]}>
                  {type === 'phone' ? (
                    <>
                      <View style={styles.containerData}>
                        <View>
                          <View style={styles.boxTitle}>
                            <Text style={styles.Title}>
                              E para começar, o número do seu{' '}
                              <Text style={[styles.Title, styles.TitleMain]}>
                                {t('newUser.msgRegisterPhone')}
                              </Text>
                            </Text>
                          </View>
                        </View>
                        <View style={styles.boxPhone}>
                          <SelectDropdown
                            buttonStyle={{
                              width: 80,
                              backgroundColor: '#FFFFFF',
                            }}
                            rowTextStyle={{
                              fontSize: 13,
                            }}
                            data={countries}
                            defaultButtonText={ddiPhone}
                            defaultValue={ddiPhone}
                            onSelect={selectedItem => {
                              setDdiPhone(selectedItem.value);
                              setPhone('');
                            }}
                            buttonTextAfterSelection={selectedItem => {
                              return selectedItem.value;
                            }}
                            rowTextForSelection={(item, _index) => {
                              return item.name;
                            }}
                          />

                          <TextInputMask
                            type={ddiPhone === '+55' ? 'cel-phone' : 'custom'}
                            // autoFocus={true}
                            style={styles.inputPhone}
                            value={phone}
                            includeRawValueInChangeText={true}
                            // onChangeText={setPhone}
                            onChangeText={(maskedText, rawText) => {
                              setPhone(rawText);
                            }}
                            placeholder={t('login.placeholder')}
                            placeholderTextColor="#999a99"
                            keyboardType="phone-pad"
                            options={
                              ddiPhone === '+55'
                                ? {
                                    mask: '(99) 99999-9999',
                                  }
                                : {
                                    mask: '999999999',
                                  }
                            }
                          />
                        </View>
                        <TouchableOpacity
                          disabled={!isValidPhone}
                          style={[
                            styles.btn,
                            isValidPhone
                              ? styles.boxSave
                              : styles.boxSaveDisable,
                          ]}
                          onPress={() => lastStep()}>
                          <Text
                            style={[
                              styles.boxSaveText,
                              isValidPhone
                                ? styles.boxSaveTextActive
                                : styles.boxSaveTextDisable,
                            ]}>
                            SALVAR
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : null}
                  {type === 'email' ? (
                    <>
                      {/* <TouchableOpacity
                      style={styles.jump}
                      onPress={() => auth()}>
                      <Text style={styles.jumpText}>Pular</Text>
                    </TouchableOpacity> */}
                      <View style={styles.containerData}>
                        <View style={styles.boxTitle}>
                          <Text style={styles.Title}>
                            E para começar, o seu
                            <Text style={[styles.Title, styles.TitleMain]}>
                              {' endereço de email'}
                            </Text>
                          </Text>
                        </View>
                        <TextInput
                          ref={input_email}
                          style={styles.textInput}
                          // autoFocus={true}
                          onChangeText={setEmail}
                          placeholder="Informe E-mail"
                          autoCapitalize="none"
                          placeholderTextColor={Colors.DARK}
                        />
                        <TouchableOpacity
                          disabled={!isValidEmail}
                          style={[
                            styles.btn,
                            isValidEmail
                              ? styles.boxSave
                              : styles.boxSaveDisable,
                          ]}
                          onPress={() => saveEmailNextPhone()}>
                          <Text
                            style={[
                              styles.boxSaveText,
                              isValidEmail
                                ? styles.boxSaveTextActive
                                : styles.boxSaveTextDisable,
                            ]}>
                            Continuar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : null}
                  {type === 'name' ? (
                    <>
                      {/* <TouchableOpacity
                      style={styles.jump}
                      onPress={() => auth()}>
                      <Text style={styles.jumpText}>Pular</Text>
                    </TouchableOpacity> */}
                      <View style={styles.containerData}>
                        <Text style={styles.Title}>
                          Falta pouco para fazer um lanchinho, antes precisamos
                          do seu
                          <Text style={[styles.Title, styles.TitleMain]}>
                            {' nome'}
                          </Text>
                        </Text>
                        <TextInput
                          style={styles.textInput}
                          onChangeText={setName}
                          // autoFocus={true}
                          placeholder={t('newUser.enterYourName')}
                          placeholderTextColor={Colors.DARK}
                        />
                        <TouchableOpacity
                          disabled={!isValidName}
                          style={[
                            styles.btn,
                            isValidName
                              ? styles.boxSave
                              : styles.boxSaveDisable,
                          ]}
                          onPress={() => saveNameNextEmail()}>
                          <Text
                            style={[
                              styles.boxSaveText,
                              isValidName
                                ? styles.boxSaveTextActive
                                : styles.boxSaveTextDisable,
                            ]}>
                            Continuar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : null}

                  {type === 'profile' ? (
                    <>
                      <TouchableOpacity
                        style={styles.jump}
                        onPress={() => auth()}>
                        <Text style={styles.jumpText}>Pular</Text>
                      </TouchableOpacity>
                      <View style={styles.containerData}>
                        <View style={{flex: 1}}>
                          {profile ? (
                            <>
                              <Text style={styles.Title}>Usar esta foto?</Text>

                              <Text style={styles.SubTitle}>
                                Fotos são usadas para autenticação de segurança
                                para proteção do cliente e do motorista. Depois
                                de enviada a foto não poderá ser trocada
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.Title}>
                                Tire e envie uma
                                <Text style={[styles.Title, styles.TitleMain]}>
                                  {' selfie'}
                                </Text>{' '}
                                ou
                                <Text style={[styles.Title, styles.TitleMain]}>
                                  {' foto'}
                                </Text>{' '}
                                pessoal
                              </Text>

                              <Text style={styles.SubTitle}>
                                • Tire a foto em um lugar iluminado
                              </Text>
                              <Text style={styles.SubTitle}>
                                • Não usar bonés ou óculos escuros
                              </Text>
                              <Text style={styles.SubTitle}>
                                • Registre seu rosto e ombros como na figura
                                abaixo
                              </Text>
                            </>
                          )}

                          <View style={styles.containerPhoto}>
                            <Image
                              source={profile ? {uri: profile} : profileImage}
                              style={styles.photo}
                              resizeMethod="scale"
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                        {profile ? (
                          <View style={styles.containerButtons}>
                            <TouchableOpacity
                              disabled={sending}
                              style={styles.btnDisable}
                              onPress={() => selectImage()}>
                              <Text
                                style={[
                                  styles.boxSaveText,
                                  sending
                                    ? styles.boxSaveTextActive
                                    : styles.boxSaveTextDisable,
                                ]}>
                                TIRAR OUTRA
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              disabled={sending}
                              style={styles.btn}
                              onPress={() => sendImage()}>
                              {sending ? (
                                <ActivityIndicator size="small" />
                              ) : (
                                <Text
                                  style={[
                                    styles.boxSaveText,
                                    sending
                                      ? styles.boxSaveTextActive
                                      : styles.boxSaveTextDisable,
                                  ]}>
                                  ENVIAR FOTO
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.containerButtons}>
                            <TouchableOpacity
                              style={[styles.btn, {flex: 1}]}
                              onPress={() => selectImage()}>
                              {sending ? (
                                <ActivityIndicator size="small" />
                              ) : (
                                <Text
                                  style={[
                                    styles.boxSaveText,
                                    sending
                                      ? styles.boxSaveTextActive
                                      : styles.boxSaveTextDisable,
                                  ]}>
                                  TIRAR FOTO
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </>
                  ) : null}
                </Animated.View>

                {/* <Animated.View
                  style={[styles.boxRegister, {left: leftProfile}]}> */}
                {/* <TouchableOpacity style={styles.jump} onPress={() => auth()}>
                    <Text style={styles.jumpText}>Pular</Text>
                  </TouchableOpacity>
                  <View style={styles.containerData}>
                    <View style={{flex: 1}}>
                      {profile ? (
                        <>
                          <Text style={styles.Title}>Usar esta foto?</Text>

                          <Text style={styles.SubTitle}>
                            Fotos são usadas para autenticação de segurança para
                            proteção do cliente e do motorista. Depois de
                            enviada a foto não poderá ser trocada
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.Title}>
                            Tire e envie uma
                            <Text style={[styles.Title, styles.TitleMain]}>
                              {' selfie'}
                            </Text>{' '}
                            ou
                            <Text style={[styles.Title, styles.TitleMain]}>
                              {' foto'}
                            </Text>{' '}
                            pessoal
                          </Text>

                          <Text style={styles.SubTitle}>
                            • Tire a foto em um lugar iluminado
                          </Text>
                          <Text style={styles.SubTitle}>
                            • Não usar bonés ou óculos escuros
                          </Text>
                          <Text style={styles.SubTitle}>
                            • Registre seu rosto e ombros como na figura abaixo
                          </Text>
                        </>
                      )}

                      <View style={styles.containerPhoto}>
                        <Image
                          source={profile ? {uri: profile} : profileImage}
                          style={styles.photo}
                          resizeMethod="scale"
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                    {profile ? (
                      <View style={styles.containerButtons}>
                        <TouchableOpacity
                          disabled={sending}
                          style={styles.btnDisable}
                          onPress={() => selectImage()}>
                          <Text
                            style={[
                              styles.boxSaveText,
                              sending
                                ? styles.boxSaveTextActive
                                : styles.boxSaveTextDisable,
                            ]}>
                            TIRAR OUTRA
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          disabled={sending}
                          style={styles.btn}
                          onPress={() => sendImage()}>
                          {sending ? (
                            <ActivityIndicator size="small" />
                          ) : (
                            <Text
                              style={[
                                styles.boxSaveText,
                                sending
                                  ? styles.boxSaveTextActive
                                  : styles.boxSaveTextDisable,
                              ]}>
                              ENVIAR FOTO
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.containerButtons}>
                        <TouchableOpacity
                          style={[styles.btn, {flex: 1}]}
                          onPress={() => selectImage()}>
                          {sending ? (
                            <ActivityIndicator size="small" />
                          ) : (
                            <Text
                              style={[
                                styles.boxSaveText,
                                sending
                                  ? styles.boxSaveTextActive
                                  : styles.boxSaveTextDisable,
                              ]}>
                              TIRAR FOTO
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View> */}
                {/* </Animated.View> */}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    onUserAuth: () => dispatch(getUser()),
  };
};

export default connect(null, mapDispatchToProps)(NewUser);
