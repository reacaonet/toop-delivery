/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Typography } from '../../styles';

export default function Toast() {
  const { appMessage }: any = useSelector((state: any) => state);
  const fadeAnim = useRef<any>(new Animated.Value(0)).current;

  useEffect(() => {
    if (appMessage?.description) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [appMessage?.description]);

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 3 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      {appMessage?.description ? (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
            },
          ]}>
          {/* <Text style={styles.title}>Título da Mensagem</Text> */}
          <Text style={styles.message}>{appMessage?.description}</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    width: '90%',
    marginLeft: '5%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.WHITE,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  title: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.PRIMARY,
  },
  message: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.PRIMARY,
  },
});
