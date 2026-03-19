import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Colors, Typography } from '../../styles';
import config from '../../config';

import LootieView from 'lottie-react-native';
import * as attencionLootie from '../../assets/animations/attencion.json';

const SandBox: React.FC = () => {
  const [isSandBox, setIsSandBox] = useState(false);

  useEffect(() => {
    if (config.environment !== 'Production') {
      setIsSandBox(true);
    }
  }, []);

  return (
    <>
      {isSandBox === true ? (
        <View style={styles.container}>
          <View style={styles.content}>
            {/* <LootieView
              source={attencionLootie}
              style={styles.animatedStyle}
              resizeMode="cover"
              loop
              autoPlay
            /> */}
            <Text style={styles.title}>
              {config.environment === 'Development' ? 'Develop' : 'Homolog'}
            </Text>
          </View>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // width: '100%',
    height: StatusBar.currentHeight,
    top: 0,
    right: 0,
  },
  content: {
    backgroundColor: Colors.WARNING,
    borderRadius: 3,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_10,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  animatedStyle: {
    width: 100,
    height: 100,
  },
});

export default SandBox;
