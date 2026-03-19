import moment, {utc} from 'moment';
import 'moment/locale/pt-br';

const isInt = (n: any) => {
  return Number(n) === n && n % 1 === 0;
};

export const isFloat = (n: any) => {
  return Number(n) === n && n % 1 !== 0;
};

export const toFloat = (text: string | number) => {
  if (isInt(text) || isFloat(text)) {
    return text;
  } else {
    return parseFloat(text.toString().replace(/\./g, '').replace(/\,/g, '.'));
  }
};

const queryString = (params: any) => {
  try {
    let getQuery = '';
    if (params && params !== undefined) {
      getQuery = Object.keys(params)
        .map(function (key: any) {
          return key + '=' + params[key];
        })
        .join('&');
    }

    return getQuery;
  } catch (err) {
    return '';
  }
};

const formatterAmount = (amount: number) => {
  try {
    const number: any = amount.toFixed(2);
    if (number >= 0) {
      return number.replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    return '';
  } catch (err) {
    return amount;
  }
};

const formatNumber = (
  amount: any,
  decimalCount = 2,
  decimal = ',',
  thousands = '.',
) => {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? '-' : '';

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)),
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : '') +
      i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : '')
    );
  } catch (e) {
    console.log(e);
  }
};

const capitalize = (s: string) => {
  if (typeof s !== 'string') {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatDate = (date: any, format: string) => {
  try {
    let resp = moment(date)
      .utc(false)
      .subtract(3, 'hours')
      .locale('pt-br')
      .format(format);

    return resp;
  } catch (err) {
    console.log('Opps error', err);
    return '';
  }
};

const formatDateLocal = (date: any, format: string) => {
  try {
    let resp = moment(date).utc(true).locale('pt-br').format(format);

    return resp;
  } catch (err) {
    console.log('Opps error', err);
    return '';
  }
};

const formatMoney = (amount: any, isSymbol = true) => {
  try {
    let money = formatterAmount(amount);
    money = money.replace('.', ',');
    return isSymbol ? `R$ ${money}` : money;
  } catch (err) {
    return '';
  }
};

const currentDate = () => {
  try {
    return moment(new Date()).utc();
  } catch (err) {
    return '';
  }
};

const dateToEng = (date: string) => {
  if (date) {
    const dt = date.toString().split('/');
    return `${dt[2]}-${dt[1]}-${dt[0]}`;
  } else return '';
};

const dateToPt = (date: string) => {
  if (date) {
    const dt = date.toString().split('-');
    return `${dt[2]}/${dt[1]}/${dt[0]}`;
  } else return '';
};

const maskHours = (value: any) => {
  let newValue: any = clearMask(value);
  if (
    parseInt(newValue) >= 0 ||
    parseInt(newValue) ||
    isInt(newValue) ||
    isFloat(newValue)
  ) {
    if (newValue >= 0 && newValue <= 2359) {
      const hour = newValue.toString().substr(0, 2);
      let minutes = newValue.toString().substr(2, 2);

      if (parseInt(minutes) > 59) newValue = `${hour}59`;

      return newValue
        .toString()
        .substr(0, 4)
        .replace(/(\d{2})(\d{2})/g, '$1:$2');
    }
  }
  return '';
};

const clearMask = (value: any) => {
  if (value) return value.replace(/\D/g, '');
};

const maskRealBeautify = (int: any, includeZero = false, symbol = '') => {
  if (!int) int = 0;

  if (includeZero) int = parseFloat(int).toFixed(2);

  int = int.toString().replace(/\D/g, '');

  int = new String(Number(int));

  var len = int.length;

  if (1 == len) int = int.replace(/(\d)/, '0,0$1');
  else if (2 == len) int = int.replace(/(\d)/, '0,$1');
  else if (len > 2 && len < 6) int = int.replace(/(\d{2})$/, ',$1');
  else if (len >= 6 && len < 9) int = int.replace(/(\d{3})(\d{2})$/, '.$1,$2');
  else if (len >= 9) int = int.replace(/(\d{3})(\d{3})(\d{2})$/, '.$1.$2,$3');
  return `${symbol ? `${symbol} ` : ''}${int}`;
};

export {
  queryString,
  capitalize,
  formatterAmount,
  formatDate,
  currentDate,
  formatMoney,
  formatNumber,
  formatDateLocal,
  maskHours,
  clearMask,
  dateToEng,
  dateToPt,
  maskRealBeautify,
  toFloat,
};
