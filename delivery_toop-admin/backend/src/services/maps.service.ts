import axios from 'axios';
import { env } from '../config';
import { AppError } from '../middleware/errorHandler';

interface LatLng {
  latitude: number;
  longitude: number;
}

function key(): string | null {
  const k = `${env.GOOGLE_MAPS || ''}`.trim();
  return k.length > 0 ? k : null;
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

class MapsService {
  async autoComplete(address: string, language = 'pt_BR') {
    const k = key();
    if (!k) throw new AppError('Sem token de mapa (GOOGLE_MAPS) configurado', 400);
    if (!address) throw new AppError('Insira os dados corretamente', 400);

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURI(
      address
    )}&language=${language}&key=${k}`;
    const { data: response } = await axios.get(url);
    if (!response || !Array.isArray(response?.predictions)) {
      throw new AppError('Não foi possível encontrar o endereço', 400);
    }
    return response.predictions.map((item: any) => ({
      description: item.description,
      place_id: item.place_id,
    }));
  }

  async geoCode(latitude: number | string, longitude: number | string) {
    const k = key();
    if (!k) throw new AppError('Sem token de mapa (GOOGLE_MAPS) configurado', 400);
    if (!latitude || !longitude) throw new AppError('Informe as coordenadas corretamente', 400);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=pt-BR&region=br&key=${k}`;
    const { data: response } = await axios.get(url);
    if (!response || !response.results || response.results.length <= 0) {
      throw new AppError('Não foi possível encontrar o endereço', 400);
    }
    return this.getInfo(response.results[0]);
  }

  async geoCodePlaceId(placeId: string) {
    const k = key();
    if (!k) throw new AppError('Sem token de mapa (GOOGLE_MAPS) configurado', 400);
    if (!placeId) throw new AppError('Informe o placeId corretamente', 400);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&language=pt-BR&key=${k}`;
    const { data: response } = await axios.get(url);
    if (!response || !response.results || response.results.length <= 0) {
      throw new AppError('Não foi possível encontrar o endereço', 400);
    }
    return this.getInfo(response.results[0]);
  }

  private getInfo(item: any) {
    const formattedAddress = item.formatted_address;
    let city: string | null = null;
    let country = 'BR';
    let district = '-';
    let state = '-';
    let street = '-';
    let streetNumber = '0';
    let zipcode = '-';

    const latitude = item?.geometry?.location?.lat;
    const longitude = item?.geometry?.location?.lng;
    const geometry = item?.geometry;

    for (const component of item.address_components) {
      if (component.types.findIndex((t: string) => t === 'administrative_area_level_2') > -1) {
        city = `${component.long_name}`;
      }
      if (component.types.findIndex((t: string) => t === 'country') > -1) country = `${component.short_name}`;
      if (component.types.findIndex((t: string) => t === 'sublocality_level_1') > -1) district = `${component.long_name}`;
      if (component.types.findIndex((t: string) => t === 'administrative_area_level_1') > -1) state = `${component.short_name}`;
      if (component.types.findIndex((t: string) => t === 'route') > -1) street = `${component.short_name}`;
      if (component.types.findIndex((t: string) => t === 'street_number') > -1) streetNumber = `${component.short_name}`;
      if (component.types.findIndex((t: string) => t === 'postal_code') > -1) zipcode = `${component.short_name}`;
    }

    zipcode = zipcode.padEnd(8, '0');

    return {
      address: formattedAddress,
      formatted_address: formattedAddress,
      city,
      country,
      district,
      state,
      street,
      streetNumber,
      zipcode,
      latitude,
      longitude,
      geometry,
    };
  }

  async directions(origin: string, destination: string, waypoints: string | null = null) {
    const k = key();
    if (!k) throw new AppError('Sem token de mapa (GOOGLE_MAPS) configurado', 400);
    if (!origin || !destination) return { status: 400, message: 'Informe o payload completo' };

    const addrOrigin = encodeURI(origin);
    const addrDestiny = encodeURI(destination);
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${addrOrigin}&destination=${addrDestiny}&key=${k}`;
    url += '&units=metric&alternatives=true&language=pt-BR&mode=driving';
    if (waypoints && `${waypoints}`.length > 5) url += `&waypoints=${encodeURI(waypoints)}`;

    const { data: resp } = await axios.get(url);

    let distance = 0;
    let duration = 0;
    let overviewPolyline: string | null = null;
    let steps: any = null;

    if (resp.routes && Array.isArray(resp.routes) && resp.routes.length > 0) {
      const routes = resp.routes;
      if (!waypoints) {
        for (let i = 0; i < routes.length; i++) {
          if (distance === 0 || distance > routes[i].legs[0].distance.value) {
            distance = routes[i].legs[0].distance.value;
            duration = routes[i].legs[0].duration.value;
            overviewPolyline = routes[i].overview_polyline;
            if (routes[i].legs[0].steps && Array.isArray(routes[i].legs[0].steps) && routes[i].legs[0].steps.length > 0) {
              steps = routes[i].legs[0].steps;
            }
          }
        }
      } else {
        const legs = routes[0].legs;
        for (let i = 0; i < legs.length; i++) {
          distance += legs[i].distance.value;
          duration += legs[i].duration.value;
          if (legs[i].steps && Array.isArray(legs[i].steps) && legs[i].steps.length > 0) {
            if (!steps || steps === null) steps = legs[i].steps;
            else if (Array.isArray(steps)) steps = steps.concat(legs[i].steps);
          }
        }
      }
    }

    return { status: 200, data: resp, distance, duration, overviewPolyline, steps };
  }

  async distanceMatrix(origins: string, destinations: string, units = 'metric') {
    const k = key();
    if (!k) throw new AppError('Sem token de mapa (GOOGLE_MAPS) configurado', 400);
    if (!origins || !destinations || !units) return { status: 400, message: 'Informe o payload completo' };

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURI(
      origins
    )}&destinations=${encodeURI(destinations)}&units=${units}&key=${k}`;
    const { data: resp } = await axios.get(url);
    return { status: 200, data: resp };
  }

  /** Estimativa de tempo de corrida (minutos) — fallback local via haversine, sem API. */
  raceTime(origin: LatLng, destiny: LatLng, service = 'system') {
    try {
      if (service === 'system') {
        const distance = haversineKm(origin, destiny);
        return Math.round((distance / 35) * 60);
      }
      return 0;
    } catch {
      return false;
    }
  }
}

export default new MapsService();
