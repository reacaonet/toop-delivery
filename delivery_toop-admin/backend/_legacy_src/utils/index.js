const moment = require("moment-timezone");
const axios = require("axios");
/** MODEL */
const BookingModel = require("../models/Mobility/Booking/BookingModel");
const FranchiseModel = require("../models/Franchise/FranchiseModel");

const formatterAmount = amount => {
  try {
    const number = amount.toFixed(2);
    if (number >= 0) {
      return number.replace(/\d(?=(\d{3})+\.)/g, "$&,");
    }
    return "";
  } catch (err) {
    //console.log('Error format Amount', err);
    return amount;
  }
};

const formatMoney = (amount, isSymbol = true) => {
  try {
    let money = formatterAmount(amount);
    money = money.replace(".", ",");
    return isSymbol ? `R$ ${money}` : money;
  } catch (err) {
    return "";
  }
};

const getDate = (days = 0) => {
  try {
    let current = moment().tz("America/Sao_Paulo");

    // if (timezone > 0) {
    //   current.add(timezone, 'hours');
    // } else if (timezone < 0) {
    //  current.subtract(Math.abs(timezone), 'hour');
    // }

    if (days > 0) {
      current.subtract(days, "days");
    }

    return current;
  } catch (err) {
    console.log("fail timezone", err);
    return moment().tz("America/Sao_Paulo");
  }
};

const queryString = params => {
  try {
    let getQuery = "";

    if (params && params !== undefined) {
      getQuery = Object.keys(params)
        .map(function (key) {
          return unescape(encodeURIComponent(`${key}=${params[key]}`));
        })
        .join("&");
    }

    return getQuery;
  } catch (err) {
    return "";
  }
};

const normalizeEmail = email => {
  let normalize = `${email}`.trim();
  normalize = `${normalize}`.toLowerCase();

  return normalize;
};

const normalizeName = name => {
  let result = `${name}`.replace(/\d+/g, "");
  result = `${result}`.replace("  ", " ").trim();

  return result;
};

const capitalize = str => {
  const response = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return `${response}`.trim();
};

const getCoordinate = async address => {
  try {
    const apiKey = process.env.GOOGLE_MAPS;
    const region = "br";
    let url = "https://maps.googleapis.com/maps/api/geocode/json?";

    url += `address=${encodeURI(address)}&language=pt-BR&region=${region}&key=${apiKey}`;

    const { data: response } = await axios.get(url);

    if (!response || !response.results || response.results.length <= 0) {
      return null;
    }

    const item = response.results[0];

    if (item.geometry && item.geometry.location) {
      return item.geometry.location;
    }

    return null;
  } catch (err) {
    console.log("fail", err);
    return null;
  }
};

const uniqueID = () => {
  function chr4() {
    return Math.random().toString(16).slice(-4);
  }
  let key = chr4() + chr4() + "-" + chr4() + "-" + chr4() + "-" + chr4() + "-";
  const date = new Date().getTime().toString();
  key = key + date.substring(0, 6) + "-" + date.substring(6, 13);

  return key;
};

const round = (num, places) => {
  if (!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + places) + "e-" + places);
  } else {
    let arr = ("" + num).split("e");
    let sig = "";
    if (+arr[1] + places > 0) {
      sig = "+";
    }

    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + places)) + "e-" + places);
  }
};

/**
 * minimumRate -> Tarifa Mínima
 * hourlyPrice -> Preço/Hora
 * basePrice -> Preço Base
 * timePrice -> Preço/Minuto
 * currencyPrice -> Preço por kilometro
 * ratePerMinute -> ??
 * peakHours -> Horarios de picos
 */
const estimatedPrice = (service, infoRace, dataTime) => {
  try {
    const {
      minimumRate,
      // hourlyPrice,
      basePrice,
      timePrice,
      currencyPrice,
      peakHours,
      peakHoursInfo,
      // ratePerMinute,
    } = service;

    const kmEstimate = Number(infoRace.distance) / 1000;
    let minutes = Number(infoRace.duration) / 60;
    minutes = parseInt(`${minutes}`, 10);
    let total = 0;

    total = basePrice + timePrice * minutes + currencyPrice * kmEstimate;

    if (service?.distanceList && Array.isArray(service.distanceList) && service.distanceList.length > 0) {
      for (const item of service.distanceList) {
        try {
          if (item.min >= 0 && item.max > 0 && item.priceMinute && item.priceKM && kmEstimate >= item.min && kmEstimate <= item.max) {
            total = basePrice + item.priceMinute * minutes + item.priceKM * kmEstimate;
          }
        } catch (err) {
          //
        }
      }
    }

    let percent = 0;

    if (total < minimumRate) {
      total = minimumRate;
    }

    // horário de pico
    if (peakHoursInfo && Array.isArray(peakHoursInfo) && peakHoursInfo.length > 0) {
      const hours = dataTime.format("HH:mm");

      for (const item of peakHoursInfo) {
        if (hours >= item.start && hours <= item.end) {
          const peakItem = peakHours.find(pead => `${pead._id}`.toString() === `${item._id}`.toString());

          if (peakItem && peakItem.percent > 0) {
            percent = peakItem.percent;
          }
        }
      }

      if (percent > 0) {
        // console.log('preço com dinanmica ...', total, total);
        total += total * (percent / 100);
      }
    }

    if (infoRace && infoRace.tagCost && infoRace.tagCost > 0) {
      total += Number(infoRace.tagCost);
    }

    /**
     * verifica se a franquia/serviço tem o calculo divisor por 50, ou seja
     * quando o serviço não for divisivel por 50 deve se arrendondar para o valor mais proximo
     * sendo ele 50 ou 100
     */
    if (service.onlyMultiplesOf50) {
      /**
       * para encontrar se o valor é divisivel por 50, pega-se o mesmo e divide por 50
       * caso não seja um numero inteiro, então não é divisivel, sendo assim
       * encontramos o valor inteiro a cima e multiplica novamente por 50 econtrando assim
       * o novo valor
       */
      total = Math.ceil(total / 50) * 50;
    }

    const payloadReturn = {
      price: Number(Number(total).toFixed(2)),
      percent: percent,
    };

    return payloadReturn;
  } catch (err) {
    return 0;
  }
};

const dynamicPrice = async (service, infoRace, dataTime, origin) => {
  const { price, useDynamicsRace, franchise } = service;

  try {
    if (!useDynamicsRace) return { price, percent: 0 };

    const franchiseData = await FranchiseModel.findOne({
      _id: franchise,
      deletedAt: { $exists: false },
    })
      .select({
        _id: 1,
        settingsRace: 1,
      })
      .lean();

    // verifica se tem parametro de preço dinamico
    if (franchiseData && franchiseData.settingsRace && franchiseData.settingsRace.dynamics && franchiseData.settingsRace.dynamics.length > 0) {
      let percent = 0;

      // percoore os paramtros
      for (const dynamic of franchiseData.settingsRace.dynamics) {
        // pega or ange de horario
        const timeAfter = moment().utc(false).subtract(dynamic.timeRange, "minutes");

        // obtem a quantidade de serviços realizados no periodo e no raio do passageiro
        const servicesInRage = await BookingModel.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [Number(origin.longitude), Number(origin.latitude)],
              },
              distanceField: "distance",
              maxDistance: dynamic.ray,
              spherical: true,
              distanceMultiplier: 0.001, // convert in KM
              // includeLocs: 'dist.location',
            },
          },
          {
            $match: {
              service: service._id,
              franchise: franchiseData._id,
              createdAt: { $gte: timeAfter.toDate() },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ]);

        // obtem o preço dinamico baseado a quantidade de corridas no raio
        const selectdDynamic = franchiseData.settingsRace.dynamics.find(i => servicesInRage.length >= i.amoutStart && servicesInRage.length <= i.amoutEnd);

        if (selectdDynamic) {
          percent = selectdDynamic.percent;
        }
      }

      let total = price;

      if (percent > 0) {
        total += total * (percent / 100);
      }

      if (service.onlyMultiplesOf50) {
        total = Math.ceil(total / 50) * 50;
      }

      total = Number(Number(total).toFixed(2));

      return { price: total, percent };
    } else return { price, percent: 0 };
  } catch (err) {
    console.log(err);

    return { price, percent: 0 };
  }
};

const validatePayloadDistancePerKM = payload => {
  try {
    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      return true;
    }

    if (!Array.isArray(payload)) {
      return {
        message: "Informe um payload válido",
      };
    }

    return "";
  } catch (err) {
    return {
      message: err.message,
    };
  }
};

module.exports = {
  formatMoney,
  getDate,
  queryString,
  normalizeEmail,
  normalizeName,
  capitalize,
  uniqueID,
  getCoordinate,
  round,
  estimatedPrice,
  dynamicPrice,
  validatePayloadDistancePerKM,
};
