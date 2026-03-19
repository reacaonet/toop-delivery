import { Linking, Alert } from 'react-native';

const isValidLatLng = (num: number, range: number) =>
  typeof num === 'number' && num <= range && num >= -1 * range;

const isValidCoordinates = (coords: any) =>
  isValidLatLng(coords.latitude, 90) && isValidLatLng(coords.longitude, 180);

const getParams = (params = []) => {
  return params
    .map(({ key, value }) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
};

const getWaypoints = (waypoints: any = []) => {
  if (waypoints.length === 0) {
    return '';
  }

  const params = waypoints
    .map((value: any) => `${value.latitude},${value.longitude}`)
    .join('|');

  return `&waypoints=${params}`;
};

const getDirections = async (
  { destination, source, params = [], waypoints = [] }: any,
  appName: string = 'waze',
): Promise<any> => {
  if (destination && isValidCoordinates(destination)) {
    params.push({
      key: 'destination',
      value: `${destination.latitude},${destination.longitude}`,
    });
  }

  params.push({
    key: 'll',
    value: `${destination.latitude},${destination.longitude}`,
  });

  params.push({
    key: 'navigate',
    value: 'yes',
  });

  if (source && isValidCoordinates(source)) {
    params.push({
      key: 'origin',
      value: `${source.latitude},${source.longitude}`,
    });
  }

  let url: string = '';

  if (appName === 'waze') {
    url = `https://waze.com/ul?${getParams(params)}${getWaypoints(waypoints)}`;
  } else if (appName === 'google') {
    url = `https://www.google.com/maps/dir/?api=1&${getParams(
      params,
    )}${getWaypoints(waypoints)}`;
  }

  return Linking.canOpenURL(url).then(supported => {
    if (!supported) {
      Alert.alert('Aplicativo', 'Por favor instale o Waze');
      return Promise.reject(new Error(`Could not open the url: ${url}`));
    } else {
      return Linking.openURL(url).then(() => {
        // setTimeout(() => {
        //   try {
        //     BackHandler.exitApp();
        //     return null;
        //   } catch (err) {
        //     Alert.alert('Aplicativo', 'Não foi possível abrir o Waze');
        //     console.log('Falha ao chamar metodo', err);
        //     return;
        //   }
        // }, 3000);
      });
    }
  });
};

export default getDirections;
