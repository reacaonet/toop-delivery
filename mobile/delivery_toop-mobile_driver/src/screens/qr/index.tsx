import React, { useState, useCallback } from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Typography, Colors } from '../../styles';

/** Service */
import { generateQrCode } from '../../services/provider/qrCode/qrCode';
import { ButtonEmbarqueDireto, ButtonEmbarqueDiretoText } from './styles';

interface Props {
  navigation: any;
}

const Qr: React.FC<Props> = ({ navigation }) => {
  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const [load, setLoad] = useState(true);
  const [codeGenerate, setCodeGenerate] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (user && user._id) {
        generateQrCode(user._id).then(result => {
          // console.log('result', result);
          setLoad(false);
          if (result && result.code) {
            setCodeGenerate(result);
          }
        });
      }
    }, [user]),
  );

  const back = () => {
    navigation.navigate('DriverMap');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={back}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>EMBARQUE RÁPIDO</Text>
      </SafeAreaView>

      <View style={styles.content}>
        {!load ? (
          <>
            <View style={styles.image}>
              <TouchableOpacity
                onPress={() => navigation.navigate('DriverMap')}>
                {codeGenerate?.qrcode ? (
                  <Image
                    style={styles.img}
                    source={{
                      uri: codeGenerate?.qrcode,
                    }}
                  />
                ) : null}
              </TouchableOpacity>
            </View>

            <View style={styles.contain}>
              <Text style={styles.code}>{codeGenerate?.code}</Text>
              <Text style={styles.text}>CÓDIGO</Text>
            </View>

            <View style={styles.containerOr}>
              <View>
                <Text style={styles.textOr}>ou</Text>
              </View>
            </View>

            <View style={styles.containEmbarqueDireto}>
              <ButtonEmbarqueDireto
                onPress={() => navigation.navigate('SelectDestiny')}>
                <ButtonEmbarqueDiretoText>
                  EMBARQUE DIRETO
                </ButtonEmbarqueDiretoText>
              </ButtonEmbarqueDireto>
            </View>
          </>
        ) : (
          <ActivityIndicator size={'large'} color={Colors.PRIMARY} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  content: {
    height: '90%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },
  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    height: '40%',
    justifyContent: 'center',
  },
  contain: {
    width: '80%',
    height: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.GRAY_LIGHT,
  },
  containEmbarqueDireto: {
    width: '89%',
    alignItems: 'center',
  },
  containerOr: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  textOr: {
    width: 50,
    textAlign: 'center',
  },
  code: {
    fontSize: Typography.FONT_SIZE_30,
    color: Colors.BLACK,
    fontWeight: 'bold',
  },
  text: {
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.BLACK,
    fontWeight: 'bold',
  },
  img: {
    height: 200,
    width: 200,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default Qr;
