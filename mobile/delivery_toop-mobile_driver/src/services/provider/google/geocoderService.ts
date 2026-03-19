import axios from 'axios';
import config from '../../../config';

export const googleSearchAddres = async (
  address: string | null,
  latitude = null,
  longitude = null,
) => {
  try {
    const apiKey = config.apiGeoLocation.trim().toString();
    const region = 'br';
    const county = 'BR';
    let list = [];
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?';

    if (address && address.search('place_id=') !== -1) {
      url += `&${address}&key=${apiKey}`;
    } else if (address) {
      url += `address=${address}&language=pt-BR&region=${region}&key=${apiKey}`;
    } else {
      url += `latlng=${latitude},${longitude}&language=pt-BR&region=${region}&key=${apiKey}`;
    }

    const { data: response } = await axios.get(url);
    for (const item of response.results) {
      // console.log('Item', item);

      let address = '';
      let addressRoute = '';
      let addressComplement = '';
      let streetNumber = '';
      let city = '';

      try {
        let addressComponents = item.address_components;
        for (const component of addressComponents) {
          // console.log('component', component);

          let resp = component.types.findIndex((element: any) => {
            if (
              element === 'route' ||
              element === 'sublocality' ||
              element === 'administrative_area_level_2' ||
              element === 'administrative_area_level_1' ||
              element === 'country'
            ) {
              return true;
            }

            return false;
          });

          if (resp > -1) {
            address += `${component.long_name} `;
          }

          let indexRouteName = component.types.findIndex(
            (element: any) => element === 'route',
          );

          if (indexRouteName > -1) {
            addressRoute += `${component.long_name},`;
          }

          let indexComplement = component.types.findIndex((element: any) => {
            if (
              element === 'sublocality' ||
              element === 'sublocality_level_1' ||
              element === 'administrative_area_level_2' ||
              element === 'administrative_area_level_1' ||
              element === 'country'
            ) {
              return true;
            }
            return false;
          });

          if (indexComplement > -1) {
            addressComplement += `${component.long_name} `;
          }

          let isStreet = component.types.findIndex((element: any) => {
            if (element === 'street_number') {
              return true;
            }
            return false;
          });

          if (isStreet > -1) {
            streetNumber += `${component.long_name} `;
          }

          // City
          let indexCity = component.types.findIndex(
            (element: any) => element === 'administrative_area_level_2',
          );

          if (indexCity > -1) {
            city += `${component.long_name}`;
          }
        }

        address = address.replace('Brazil', 'Brasil');
        addressRoute = addressRoute.replace('Brazil', 'Brasil');
        addressComplement = addressComplement.replace('Brazil', 'Brasil');

        if (addressRoute === '') {
          addressRoute = addressComplement;
        }
      } catch (err) {
        address = item.formatted_address;
      }

      list.push({
        address: address,
        formatted_address: item.formatted_address,
        geometry: item.geometry,
        place_id: item.place_id,
        addressRoute: addressRoute,
        addressComplement: addressComplement,
        streetNumber: streetNumber,
        city: city,
      });
    }

    return list;
  } catch (err: any) {
    return {
      error: err,
      code: err?.code ?? 0,
    };
  }
};

// AutoComplete Place
export const googlePlaceAutoComplete = async (
  address: string,
  coords: any = {},
) => {
  try {
    let result = [];
    const apiKey = config.apiGeoLocation.trim().toString();

    let url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?';
    url += `input=${address.replace(' ', '+')}`;
    url += '&language=pt-BR';
    // url += `&components=country:BR&key=${apiKey}`;
    url += `&key=${apiKey}`;

    if (coords && coords.latitude && coords.longitude) {
      url += `&location=${coords.latitude},${coords.longitude}`;
      url += '&radius=500';
    }

    const { data: response } = await axios.get(url);

    for (const item of response.predictions) {
      result.push({
        place_id: item.place_id,
        description: item.description,
        addressRoute: item.structured_formatting.main_text,
        addressComplement: item.structured_formatting.secondary_text,
      });
    }

    return result;
  } catch (err) {
    console.log('Falhou', err);
    return [];
  }
};
