// import * as turf from '@turf/turf';
const moment = require("moment");
const { encode } = require("@googlemaps/polyline-codec");
/** Util */
const distanceLatLonInKm = require("../../utils/kmDistance");

const routeCompleted = async (listPositions, startDate, endDate, booking) => {
  try {
    let distance = 0;
    let index = 0;
    const path = [];
    let isToRecalculate = true;

    if (!listPositions || !Array.isArray(listPositions)) {
      return { status: false, message: 'Nenhuma posição encontrada', isToRecalculate: false };
    }

    const totalList = listPositions?.length || 0;

    if (totalList < 10) {
      return { status: false, message: 'quantidade de coordenadas insuficiente', isToRecalculate: false };
    }

    const totalIndex = totalList || 0;
    let locRef = null;
    let distOld = 0;
    let longTimeInterval = 0;

    for await (const item of listPositions) {
      if (index < totalIndex) {
        const nextItem = listPositions[index + 1];

        if (locRef === null) {
          locRef = item;
        }

        if (locRef?.location?.coordinates && nextItem?.location?.coordinates) {
          let distPoints = 0;

          if (locRef?.createdAt) {
            try {
              const startD = moment(nextItem?.createdAt);
              const endD = moment(locRef?.createdAt);
              const diffSeconds = endD.diff(startD, 'seconds');

              // tempo longo sem uma coordenada manter o preço
              if (diffSeconds > 0 && diffSeconds > longTimeInterval) {
                longTimeInterval = diffSeconds;
              }

              if (longTimeInterval >= 240) {
                if (isToRecalculate !== false) {
                  console.log(
                    'longo tempo sem envio de coordenadas: ',
                    longTimeInterval,
                    `start: ${startD}`,
                    `end: ${endD}`,
                    `booking: ${booking?._id}`,
                  );
                }

                isToRecalculate = false;
              }
            } catch (err) {
              isToRecalculate = false;

              console.log(
                'não foi possível identificar o intervalo de tempo: ',
                `booking: ${booking?._id}`,
              );
            }
          }

          distPoints = distanceLatLonInKm(
            {
              latitude: locRef.location.coordinates[1],
              longitude: locRef.location.coordinates[0],
            },
            {
              latitude: nextItem.location.coordinates[1],
              longitude: nextItem.location.coordinates[0],
            },
          ); //em quilometros

          // quebra de GPS
          if (distPoints && distPoints > 1) {
            if (isToRecalculate !== false) {
              const startD = moment(nextItem?.createdAt);
              const endD = moment(locRef?.createdAt);
              const diffSeconds = Math.abs(endD.diff(startD, 'seconds'));
              const velMediaKmH = distPoints / (diffSeconds / 3600);

              if (
                diffSeconds > 0 &&
                velMediaKmH !== Infinity &&
                velMediaKmH < 220
              ) {
                const distStreet = await OSMDistance(
                  {
                    latitude: locRef.location.coordinates[1],
                    longitude: locRef.location.coordinates[0],
                  },
                  {
                    latitude: nextItem.location.coordinates[1],
                    longitude: nextItem.location.coordinates[0],
                  },
                  5000,
                );

                if (distStreet && distStreet.distance > 0) {
                  distPoints = Number(distStreet.distance) / 1000;
                } else {
                  console.log(
                    'quebra de gps: ',
                    distPoints,
                    `booking: ${booking?._id}`,
                    {
                      latitude: locRef.location.coordinates[1],
                      longitude: locRef.location.coordinates[0],
                    },
                    {
                      latitude: nextItem.location.coordinates[1],
                      longitude: nextItem.location.coordinates[0],
                    },
                  );

                  isToRecalculate = false;
                }
              } else {
                distPoints = 0;
                locRef = null;
              }
            }
          }

          if (distPoints && distPoints > 0 && distPoints > 0.009) {
            distance = distance + distPoints;
            distOld = distOld + distance;

            // 100 metros
            if (distOld >= 0.1 || totalIndex === index + 1) {
              path.push([
                locRef.location.coordinates[1],
                locRef.location.coordinates[0],
              ]);

              distOld = 0;
            }

            locRef = null;
          }
        }
      }

      index++;
    }

    const startD = moment(startDate);
    const endD = moment(endDate);
    const diffSeconds = endD.diff(startD, 'seconds');
    const polylineEnd = encode(path);

    return {
      distance: Number(distance.toFixed(7)),
      time: diffSeconds || 0,
      polylineEnd: polylineEnd || '',
      isToRecalculate: isToRecalculate,
      status: true,
    };
  } catch (err) {
    console.log('err', err);

    return {
      status: false,
      message: err.message(),
      isToRecalculate: false,
    };
  }
};

module.exports = routeCompleted;
