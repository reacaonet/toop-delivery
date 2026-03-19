import React from 'react';
import {View, StyleSheet, Image, ImageSourcePropType} from 'react-native';
import imgLoad from '../../../../assets/images/image_load.png';

const ChatImage = ({item}: any) => {
  const imageBase64 = (): ImageSourcePropType => {
    try {
      if (item.urlFile) {
        return {uri: item.urlFile};
      }

      return {};
    } catch (err) {
      console.log('Fail ImageBase64', err);
      return {};
    }
  };

  return (
    <View style={styles.container}>
      <Image
        defaultSource={imgLoad}
        style={styles.iconPersonContainer}
        source={imageBase64()}
        resizeMode="contain"
      />
    </View>
  );
};

export default ChatImage;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  iconPersonContainer: {
    width: 150,
    height: 150,
  },
});
