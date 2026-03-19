type latLng = {
  latitude: number;
  longitude: number;
} | null;

export const getDestinyMap = (item: any): latLng => {
  if (item.status === 'accepted' && item.origin && item.origin.coordinates) {
    return {
      latitude: item.origin.coordinates[1],
      longitude: item.origin.coordinates[0],
    };
  } else if (item.destiny && Array.isArray(item.destiny)) {
    return {
      latitude: item.destiny[item.destiny.length - 1].coordinates[1],
      longitude: item.destiny[item.destiny.length - 1].coordinates[0],
    };
  }

  return null;
};

export const getOriginMap = (item: any): latLng => {
  if (!item.driver || !item.driver.location) {
    return null;
  }

  return {
    latitude: item.driver.location.coordinates[1],
    longitude: item.driver.location.coordinates[0],
  };
};

export const getAdditionalStops = (item: any): latLng[] | [] => {
  try {
    if (
      item?.additionalStops &&
      item?.additionalStops &&
      Array.isArray(item?.additionalStops) &&
      item?.additionalStops.length > 0 &&
      item?.additionalStops.length > item?.arrivedStops
    ) {
      return item?.additionalStops.map((stop: any) => {
        return {
          latitude: stop.coordinates[1],
          longitude: stop.coordinates[0],
          address: stop?.address || '',
        };
      });
    }

    return [];
  } catch (err) {
    return [];
  }
};
