/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useState, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import LootieView from 'lottie-react-native';

/** Components */
import Input from './components/Input';
import Button from './components/Button';
import DocPhoto from './components/DocPhoto';
import Document from './components/Document';
import List from './components/List';
import Radio from './components/Radio';

/** Styles */
import {
  styles,
  Container,
  Content,
  ContentItem,
  ScrollView,
  Footer,
  ContainerLoad,
  Header,
  HeaderIcon,
} from './styles';
import { Colors } from '../../../styles';
import * as loaderAnimation from '../../../assets/animations/loader.json';

/** Service */
import { listDynamicRegister } from '../../../services/provider/preRegistration/dynamic/list';
import { updatePreRegistration } from '../../../services/provider/preRegistration/dynamic/updateRegister';

const DynamicRegister = () => {
  const dispatch = useDispatch();
  const state: any = useSelector((state: any) => state?.preRegistration);
  const navigation = useNavigation<any>();

  const scrollRef = useRef<any>();
  const [dinamic, setDinamic] = useState<any>();
  const [gobackView, setGobackView] = useState<string | null>(null);
  const payload = useRef<any>({});
  const [load, setLoad] = useState(false);
  const [loadPage, setLoadPage] = useState(false);
  const [footer, setFooter] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (state?.id) {
        getCurrentRegister();
      }
    }, [state?.id]),
  );

  const getCurrentRegister = async (params: any = {}) => {
    setFooter(null);
    setDinamic(null);
    setLoadPage(true);
    setGobackView(null);
    payload.current = null;

    const result = await listDynamicRegister({
      id: state?.id,
      ...params,
    });
    setLoadPage(false);

    if (result && result?.user && result?.user?.viewNextRegister === 'Terms') {
      return navigation.navigate('TermsStack');
    }

    if (result?.gobackView && `${result?.gobackView}`.length > 2) {
      setGobackView(result?.gobackView);
    }

    if (
      result &&
      result?.view &&
      Array.isArray(result?.view) &&
      result?.view.length > 0
    ) {
      setDinamic(result?.view);

      if (result?.footer) {
        setFooter(result?.footer);
      } else {
        if (footer) {
          setFooter(null);
        }
      }
    } else {
      if (footer) {
        setFooter(null);
      }

      if (dinamic) {
        setDinamic(null);
      }
    }
  };

  const sendRegister = async () => {
    try {
      if (!payload.current || typeof payload.current !== 'object') {
        return Alert.alert('Insira as informações');
      }

      const { isValid = true, itemPayload = null } = await getValidator();

      if (isValid === false) {
        return Alert.alert(
          itemPayload?.validator?.title || '',
          itemPayload?.validator?.message ||
          'Não foi possível validar informações',
        );
      }

      setLoad(true);
      const token = await refreshToken();
      const response = await updatePreRegistration(state.id, {
        ...payload.current,
        viewStopRegister: dinamic[0]?.view,
        viewNextRegister: dinamic[0]?.nextView,
        token: token,
      });

      if (!response || response?.errMessage) {
        setLoad(false);
        return dispatch({
          type: 'SET_MESSAGE_SAGA',
          payload: {
            title: '',
            description: response?.errMessage || 'Não foi possível salvar',
          },
        });
      }

      await getCurrentRegister();
      setLoad(false);
    } catch (err) {
      setLoad(false);
    }
  };

  const getValidator = async () => {
    try {
      let itemPayload: any = null;
      let isValid = true;
      let addPromise: any = null;

      addPromise = dinamic.forEach((item: any) => {
        try {
          if (item?.inputGroup) {
            if (
              item?.validator &&
              item?.validator?.min &&
              item?.validator?.max
            ) {
              if (
                !payload.current[`${item?.inputGroup}`] ||
                !payload.current[`${item?.inputGroup}`][`${item?.inputName}`] ||
                `${payload.current[`${item?.inputGroup}`][`${item?.inputName}`]
                  }`.length < item?.validator?.min ||
                `${payload.current[`${item?.inputGroup}`][`${item?.inputName}`]
                  }`.length > item?.validator?.max
              ) {
                isValid = false;
                itemPayload = item;
              }
            }
          } else if (
            item?.validator &&
            item?.validator?.min &&
            item?.validator?.max
          ) {
            if (
              `${payload.current[`${item?.inputName}`]}`.length <
              item?.validator?.min ||
              `${payload.current[`${item?.inputName}`]}`.length >
              item?.validator?.max
            ) {
              isValid = false;
              itemPayload = item;
            }
          }
        } catch (err) {
          return {
            isValid: false,
            itemPayload: null,
          };
        }
      });

      await Promise.all([addPromise]);

      return {
        isValid,
        itemPayload,
      };
    } catch (err) {
      return {
        isValid: false,
        itemPayload: null,
      };
    }
  };

  const refreshToken = async () => {
    try {
      return await messaging().getToken();
    } catch (err) {
      return '';
    }
  };

  return (
    <Container>
      {gobackView ? (
        <Header>
          <HeaderIcon
            name="chevron-left"
            size={42}
            onPress={() => {
              getCurrentRegister({
                gobackView,
              });
            }}
          />
        </Header>
      ) : null}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <Content behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {loadPage === true ? (
            <ContainerLoad>
              <LootieView
                source={loaderAnimation}
                style={styles.animatedStyle}
                resizeMode="contain"
                loop
                autoPlay
              />
            </ContainerLoad>
          ) : null}

          {loadPage === false &&
            dinamic &&
            Array.isArray(dinamic) &&
            dinamic.length > 0
            ? dinamic.map(item => (
              <ContentItem key={item._id}>
                {item?.inputType === 'text' ? (
                  <Input
                    name={item?.inputName}
                    placeholder={item?.inputPlaceholder}
                    payload={payload}
                    item={item}
                  />
                ) : null}

                {item?.inputType === 'radio' ? (
                  <Radio
                    name={item?.inputName}
                    item={item}
                    payload={payload}
                  />
                ) : null}

                {item?.inputType === 'doc' ? (
                  <Document
                    name={item?.inputName}
                    item={item}
                    payload={payload}
                    scrollRef={scrollRef}
                  />
                ) : null}

                {item?.inputType === 'list' ? (
                  <List
                    name={item?.inputName}
                    item={item}
                    payload={payload}
                    scrollRef={scrollRef}
                  />
                ) : null}

                {item?.uploadDocPhoto ? (
                  <DocPhoto
                    item={item}
                    getCurrentRegister={getCurrentRegister}
                  />
                ) : null}
              </ContentItem>
            ))
            : null}
        </Content>
      </ScrollView>

      {loadPage === false && footer && footer?.inputType === 'footerBtn' ? (
        <Footer>
          <Button
            text={footer?.title}
            textColor={Colors.WHITE}
            color={Colors.BUTTOM_PRIMARY}
            onPress={sendRegister}
            load={load}
          />
        </Footer>
      ) : null}
    </Container>
  );
};

export default DynamicRegister;
