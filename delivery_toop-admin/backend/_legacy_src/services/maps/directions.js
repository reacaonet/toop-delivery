const axios = require("axios");
// import redis from 'redis';

// const client = redis.createClient({
//   auth_pass: process.env.REDIS_AUTH,
//   host: process.env.REDIS_HOST
// })

/**
 * origin=41.43206,-81.38992 || origin=place_id:xxx || origin=xxx
 */
const directions = async (origin, destination, waypoints = null) => {
  try {
    if (!origin || !destination) {
      return {
        status: 400,
        message: "Informe o payload completo",
      };
    }

    const addrOrigin = encodeURI(`${origin}`);
    const addrDestiny = encodeURI(`${destination}`);

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${addrOrigin}8&destination=${addrDestiny}&key=${process.env.GOOGLE_MAPS}`;

    url += "&units=metric&alternatives=true&language=pt-BR&mode=driving";

    if (waypoints && `${waypoints}`.length > 5) {
      url += `&waypoints=${encodeURI(waypoints)}`;
    }

    const { data: resp } = await axios.get(url);

    let distance = 0;
    let duration = 0;
    let overviewPolyline = null;
    let steps = null;

    if (resp.routes && Array.isArray(resp.routes) && resp.routes.length > 0) {
      const routes = resp.routes;

      if (!waypoints) {
        for (let i = 0; i <= routes.length - 1; i++) {
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
        const legs = resp.routes[0].legs;
        // overviewPolyline = resp.routes[0].overview_polyline;

        for (let i = 0; i <= legs.length - 1; i++) {
          distance += legs[i].distance.value;
          duration += legs[i].duration.value;

          if (legs[i].steps && Array.isArray(legs[i].steps) && legs[i].steps.length > 0) {
            if (!steps || steps === null) {
              steps = legs[i].steps;
            } else if (steps && Array.isArray(steps)) {
              steps = steps.concat(legs[i].steps);
            }
          }
        }
      }
    }

    return {
      status: 200,
      data: resp,
      distance,
      duration,
      overviewPolyline,
      steps,
    };
  } catch (err) {
    console.log("err", err);

    return {
      status: 400,
      message: "Fail list directions",
      err: err.message,
    };
  }
};

/**
 * with toll price
 */
const directionsTool = async (apiParams, origin, destination, waypoints = null, vehicleType = "2AxlesAuto") => {
  try {
    let distance = 0;
    let duration = 0;
    let overviewPolyline = null;
    let tagCost = 0;

    const payload = {
      from: {
        lat: origin.latitude,
        lng: origin.longitude,
      },
      to: {
        lat: destination.latitude,
        lng: destination.longitude,
      },
      vehicleType: vehicleType,
      fuelPrice: 2,
      fuelPriceCurrency: apiParams.priceCurrency,
    };

    if (waypoints) {
      payload.waypoints = waypoints;
    }

    const { data: resp } = await axios.post("https://dev.TollGuru.com/v1/calc/gmaps", payload, {
      headers: {
        "content-type": "application/json",
        "x-api-key": apiParams.key,
      },
    });

    if (resp && resp.routes && Array.isArray(resp.routes) && resp.routes.length > 0) {
      const routes = resp.routes;

      if (!waypoints) {
        for (let i = 0; i <= routes.length - 1; i++) {
          if (distance === 0 || distance > routes[i].summary.distance.value) {
            distance = routes[i].summary.distance.value;
            duration = routes[i].summary.duration.value;

            if (routes[i].costs && routes[i].costs.tag) {
              tagCost = routes[i].costs.tag;
            } else {
              tagCost = 0;
            }

            if (routes[i].polyline) {
              overviewPolyline = routes[i].polyline;
            } else {
              overviewPolyline = null;
            }
          }
        }
      } else {
        if (routes[0].costs && routes[0].costs.tag) {
          tagCost = routes[0].costs.tag;
        }

        if (routes[0].polyline) {
          overviewPolyline = routes[0].polyline;
        } else {
          overviewPolyline = null;
        }

        distance += routes[0].summary.distance.value;
        duration += routes[0].summary.duration.value;
      }
    }

    return {
      status: 200,
      data: resp,
      distance,
      duration,
      overviewPolyline,
      tagCost: tagCost,
    };
  } catch (err) {
    // console.log('err directionsTool', err);

    return {
      status: 400,
      message: "Fail directionsTool",
      err: err.message,
    };
  }
};

// const getKeyRedis = async (key) => {
//   return new Promise((resolve, reject) => {
//     try {
//       client.get(key, (err, reply) => {
//         if (err) {
//           return resolve(null);
//         }

//         resolve(reply);
//       });
//     } catch (err) {
//       resolve(null);
//     }
//   });
// };

module.exports = { directions, directionsTool };
