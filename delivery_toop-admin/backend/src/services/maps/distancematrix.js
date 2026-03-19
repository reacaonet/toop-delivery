const axios = require("axios");
// const redis = require('redis');

/** Util */
const { queryString } = require("../../utils");

// const client = redis.createClient({
//   auth_pass: process.env.REDIS_AUTH,
//   host: process.env.REDIS_HOST,
// });

const distanceMatrix = async (origins, destinations, units) => {
  try {
    if (!origins || !destinations || !units) {
      return {
        status: 400,
        message: "Informe o payload completo",
      };
    }

    // const redisMap: any = await getKeyRedis(
    //   `matrix-${origins}=${destinations}`,
    // );

    // if (redisMap) {
    //   const jsonParse: JSON = JSON.parse(redisMap);

    //   return {
    //     status: 200,
    //     data: jsonParse,
    //   };
    // }

    const parameters = `${queryString({
      ...{ origins, destinations, units },
      key: process.env.GOOGLE_MAPS,
    })}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${parameters}`;
    const { data: resp } = await axios.get(url);

    if (resp && resp.rows && resp.rows.length > 0) {
      // client.set(
      //   `matrix-${origins}=${destinations}`,
      //   JSON.stringify(resp),
      //   () => {
      //     client.expire(`matrix-${origins}=${destinations}`, 172800);
      //   },
      // );
    }

    return {
      status: 200,
      data: resp,
    };
  } catch (err) {
    return {
      status: 400,
      message: "Fail list directions",
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

module.exports = distanceMatrix;
