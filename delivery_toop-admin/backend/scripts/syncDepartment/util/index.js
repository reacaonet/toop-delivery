const getKeywords = (name) => {
  try {
    if (name === null || name === '') {
      return [];
    }

    name = name.trim();
    let list = name.split(" ");

    if (typeof list !== "object" || list.length <= 0 ) {
      return [];
    }

    let keywords = [];

    for (const item of list) {
      let add = true;
      if ( `${item}`.length > 2 ) {
        Array.prototype.map.call(item, (char) => {
          if (/^-?\d+$/.test(char)) {
            add = false;
          }
        });
      } else {
        add = false;
      }

      if (add) {
        keywords.push(slugify(item.trim().toLowerCase()));
      }
    }

    return keywords;
  } catch (err) {
    return [];
  };
};

const slugify = (str) => {
  var map = {
      '-' : ' ',
      '-' : '_',
      'a' : 'á|à|ã|â|À|Á|Ã|Â',
      'e' : 'é|è|ê|É|È|Ê',
      'i' : 'í|ì|î|Í|Ì|Î',
      'o' : 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
      'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
      'c' : 'ç|Ç',
      'n' : 'ñ|Ñ'
  };

  for (var pattern in map) {
      str = str.replace(new RegExp(map[pattern], 'g'), pattern);
  };

  return str;
};

const getBarcode = (barcode) => {
  try {
    let totalZero = 0;
    let disableSum = false;
    let strBarcode = barcode;

    Array.prototype.map.call(barcode, (char) => {
      if (char == 0 && disableSum === false ) {
        totalZero += 1;
      } else if (char != 0) {
        disableSum = true;
      }
    });

    if (totalZero >= 2 && totalZero <= 5) {
      strBarcode = barcode.substring(totalZero)
    }

    return strBarcode.trim();
  } catch (err) {
    return barcode;
  }
}

const getName = (name) => {
  if (!name || name.length <= 0) {
    return name;
  }

  let str = name.trim().toLowerCase();
  str = str.charAt(0).toUpperCase() + str.slice(1);

  return str;
};

module.exports = {
  getKeywords,
  slugify,
  getBarcode,
  getName
};
