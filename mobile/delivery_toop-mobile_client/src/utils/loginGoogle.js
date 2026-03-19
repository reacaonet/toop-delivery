import {GoogleSignin, statusCodes} from 'react-native-google-signin';

const googleConfigure = () => {
  GoogleSignin.configure({
    iosClientId:
      '611821503010-fb9dho4cbvi7rrdnnq701nhnp5r8pif2.apps.googleusercontent.com',
    webClientId:
      '611821503010-tsm6fp8dcpmv3tie2hobnp234hnclgah.apps.googleusercontent.com',
    offlineAccess: true,
    hostsDomain: '',
  });
};

const signInGoogle = async callBack => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    userInfo.user.idToken = userInfo?.idToken;
    userInfo.user.serverAuthCode = userInfo?.serverAuthCode;

    callBack(userInfo.user, 'google');
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('SIGN_IN_CANCELLED', error.code);
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('IN_PROGRESS', error.code);
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('PLAY_SERVICES_NOT_AVAILABLE', error.code);
    } else {
      console.log('Error Auth Goole All', error);
    }
  }
};

const getCurrentUserInfo = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      console.log('Not User Status SIGN_IN_REQUIRED');
      return false;
    } else {
      console.log('Error All getCurrentUserInfo', error);
      return false;
    }
  }
};

const signOutGoogle = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    // remover usuário Storage
  } catch (error) {
    console.error('signOutGoogle', error);
  }
};

export {googleConfigure, signInGoogle, signOutGoogle, getCurrentUserInfo};
