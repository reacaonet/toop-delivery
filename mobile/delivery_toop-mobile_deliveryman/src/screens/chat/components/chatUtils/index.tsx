import ImagePicker from 'react-native-image-picker';

const launchImageLibrary = () => {
  let options = {
    takePhotoButtonTitle: 'Tirar uma Foto',
    chooseFromLibraryButtonTitle: 'Abrir Galeria',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
    quality: 0.5,
  };
  ImagePicker.launchImageLibrary(options, (response: any) => {
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    } else {
      const source = {uri: response.uri};
      console.log('Source', source);
      console.log('response', JSON.stringify(response));
      /*
      this.setState({
        filePath: response,
        fileData: response.data,
        fileUri: response.uri,
      });
      */
    }
  });
};

const chooseImage = async () => {
  return new Promise((resolve, reject) => {
    try {
      let options: any = {
        title: 'Selecione uma Imagem',
        takePhotoButtonTitle: 'Tirar uma Foto',
        chooseFromLibraryButtonTitle: 'Abrir Galeria',
        cancelButtonTitle: 'Cancelar',
        quality: 0.5,
        maxWidth: 650,
        maxHeight: 650,
        mediaType: 'photo',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      ImagePicker.showImagePicker(options, (response: any) => {
        if (response.didCancel) {
          reject({type: 'cancel', message: 'User cancelled image picker'});
        } else if (response.error) {
          reject({type: 'error', message: response.error});
        } else if (response.customButton) {
          //console.log('User tapped custom button: ', response.customButton);
        } else {
          //console.log('Cheguei aqui ...');
          const source = {
            uri: `data:${response.type};base64, ${response.data}`,
          };

          resolve({
            type: response.type,
            source,
          });
        }
      });
    } catch (err) {
      reject({
        type: 'ERR_ALL',
        error: err,
      });
    }
  });
};

export {launchImageLibrary, chooseImage};
