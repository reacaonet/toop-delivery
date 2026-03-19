import React, {FunctionComponent} from 'react';
import {View, Text, StyleSheet, Button, TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';

type BarCodeProps = {
  modal: Function;
  onBarCode: Function;
};

const BarCode: FunctionComponent<BarCodeProps> = ({
  modal,
  onBarCode,
}: BarCodeProps) => {
  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.preview}
        captureAudio={false}
        flashMode={RNCamera.Constants.FlashMode.auto}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[
          RNCamera.Constants.BarCodeType.ean13,
          RNCamera.Constants.BarCodeType.ean8,
        ]}
        onBarCodeRead={(scanResult: any) => {
          if (scanResult.data != null) {
            console.log(scanResult.type);
            //console.warn(scanResult.data);
            onBarCode(scanResult.data);
            setTimeout(() => {
              modal(false);
            }, 200);
          }
        }}>
        <View style={[styles.overlay, styles.topOverlay]}>
          <Text style={styles.scanScreenMessage}>
            Por favor, leia o código de barras
          </Text>
        </View>
        <View style={[styles.overlay, styles.bottomOverlay]}>
          <TouchableOpacity
            style={styles.enterBarcodeManualButton}
            onPress={() => {
              console.log('scan clicked');
            }}>
            <Text>Fechar</Text>
          </TouchableOpacity>
        </View>
      </RNCamera>
    </View>
  );
};

export default BarCode;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  preview: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterBarcodeManualButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  scanScreenMessage: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
