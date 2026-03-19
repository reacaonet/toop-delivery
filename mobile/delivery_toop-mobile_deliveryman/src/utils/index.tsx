import moment from 'moment';
import 'moment/locale/pt-br';

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

const capitalize = (s: string) => {
  if (typeof s !== 'string') {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatDate = (date: any, format: string) => {
  try {
    return moment(date, 'YY-MM-DD hh:mm:ss')
      .utc()
      .subtract(3, 'hours')
      .locale('pt-br')
      .format(format);
  } catch (err) {
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

const formatPhone = (phone: any) => {
  try {
    const length: any = phone.toString().length;
    let newFormat;
    if (length === 10) {
      const parte1 = phone.toString().slice(0, 2);
      const parte2 = phone.toString().slice(2, 6);
      const parte3 = phone.toString().slice(6, 10);
      newFormat = `(${parte1})${parte2}-${parte3}`;
    } else {
      const parte1 = phone.toString().slice(0, 2);
      const parte2 = phone.toString().slice(2, 7);
      const parte3 = phone.toString().slice(7, 11);
      newFormat = `(${parte1})${parte2}-${parte3}`;
    }
    return newFormat;
  } catch (err) {
    return '';
  }
};

const formatDateFromNow = (date: any) => {
  try {
    let dataCurrent = moment(date);
    let dateFormat = dataCurrent.locale('pt-br').fromNow();
    return dateFormat;
  } catch (err) {
    return '';
  }
};

const replaceSpecialChars = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/([^\w]+|\s+)/g, '') // Substitui espaço e outros caracteres por hífen
    .replace(/\-\-+/g, '-') // Substitui multiplos hífens por um único hífen
    .replace(/(^-+|-+$)/, ''); // Remove hífens extras do final ou do inicio da string
};

const formatAddress = (delivery: any) => {
  try {
    let address = delivery ? delivery : delivery?.address;
    let strAddress = '';

    if (delivery?.addressRoute && delivery?.addressRoute.length > 3) {
      strAddress = delivery.addressRoute;

      if (delivery?.streetNumber) {
        strAddress += ` ${delivery?.streetNumber}`;
      }

      if (delivery?.city) {
        strAddress += ` ${delivery?.city}`;
      }

      if (delivery?.state) {
        strAddress += ` ${delivery?.state}`;
      }
    } else if (delivery?.address) {
      address = delivery?.address;
    }

    return strAddress === '' ? address : strAddress;
  } catch (err) {
    return ' - ';
  }
};

export {
  queryString,
  capitalize,
  formatterAmount,
  formatDate,
  currentDate,
  formatMoney,
  formatPhone,
  formatDateFromNow,
  replaceSpecialChars,
  formatAddress,
};
