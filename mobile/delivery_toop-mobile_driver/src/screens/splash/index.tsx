/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/core';

/** styles */
import { LoadActivity, Container, ImageContent } from './styles';
import { Colors } from '../../styles';
import logo from '../../assets/images/logo.png';

/** Service */
import { StorageGet } from '../../services/deviceStorage';

import config from '../../config';

const Splash = () => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: 'GET_USER_SAGA',
      });

      isAuthenticated();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (user && user._id) {
        if (user.email) {
          return navigation.reset({
            index: 0,
            routes: [
              {
                name: 'DriverMap',
              },
            ],
          });
        }

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
            },
          ],
        });
      }
    }, [user]),
  );

  const isAuthenticated = async () => {
    try {
      const userAuth = await StorageGet(config.tokenAuth);
      if (!userAuth || !userAuth._id) {
        return navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
            },
          ],
        });
      }
    } catch (err) {
      return false;
    }
  };

  return (
    <Container>
      <ImageContent source={logo} resizeMode={'contain'} />
      <LoadActivity size={'large'} color={Colors.PRIMARY_DARK} />
    </Container>
  );
};

export default Splash;
