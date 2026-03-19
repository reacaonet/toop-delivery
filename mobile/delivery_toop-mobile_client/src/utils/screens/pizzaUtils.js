import {formatterAmount} from '../index';

const checkItens = (check, radio, required, complements) => {
  let validator = {
    status: true,
  };

  if (!required || Object.keys(required).length <= 0) {
    return validator;
  }

  complements.forEach(itemComplement => {
    let complement = itemComplement;
    let id = complement._id;
    let qtdMin = complement.amountMin;
    let qtdMax = complement.amountMax;
    let isRadio = complement.isRadio;
    let isRequired = complement.isRequired;

    if (isRadio) {
      let hasItemRadio = radio.findIndex(itemRadio => itemRadio.group === id);

      if (isRequired && hasItemRadio === -1) {
        validator = setMessageFail(
          'Escolha todos os itens obrigatórios antes de adicionar',
        );
        return;
      }
    } else {
      // Check
      if (isRequired && (!check || check.length <= 0)) {
        validator = setMessageFail(
          'Escolha todos os itens obrigatórios antes de adicionar',
        );
        return;
      }

      let isCheck = check.findIndex(itemCheck => itemCheck.group === id);

      if (isCheck > -1 && isRequired) {
        let totalCheck = check.reduce((total, item) => {
          if (item.group === id && item.quantity > 0) {
            total += item.quantity;
          }
          return total;
        }, 0);

        if (totalCheck < qtdMin || totalCheck > qtdMax) {
          validator = setMessageFail(
            'É preciso escolher todos os itens obrigatórios antes de adicionar.',
          );
          return;
        }

        if (totalCheck > qtdMax) {
          validator = setMessageFail('Item máximo atingido');
          return;
        }
      } else if (isCheck === -1 && isRequired) {
        validator = setMessageFail(
          'É preciso escolher todos os itens obrigatórios antes de adicionar',
        );
        return;
      }
    }
  });

  return validator;
};

const setMessageFail = message => {
  return {
    status: false,
    title: 'Oops',
    message: message,
  };
};

const increment = (check, radio, required, getMax, setMinMax) => {
  try {
    if (required && !check && radio) {
      return {
        status: false,
        title: 'Oops',
        message:
          'É preciso escolher todos os itens obrigatórios antes de adicionar',
      };
    }

    let totalSet = Object.keys(check).length + Object.keys(radio).length;

    if (required && Object.keys(required).length > 0) {
      for (var r in required) {
        let radioIndex = radio.findIndex(ra => ra.group === required[r]);

        if (radioIndex === -1) {
          let checkIndex = check.findIndex(ch => ch.group === required[r]);

          if (checkIndex === -1) {
            return {
              status: false,
              title: 'Campos obrigatórios!!',
              message: 'Você precisa preencher todos os campos obrigatórios',
            };
          } else {
            let {min, max} = setMinMax.find(mm => mm.group === required[r]);

            if (Object.keys(check).length > max) {
              return {
                status: false,
                title: 'Máximo permitido!!',
                message: `Você ultrapassou o máximo de opções permitidas que é ${max}`,
              };
            }
            if (Object.keys(check).length < min) {
              return {
                status: false,
                title: 'Mínimo permitido!!',
                message: `Você não selecionou o mínimo obrigatório que é ${min}`,
              };
            }
          }
        }
      }
    } else {
      if (totalSet > getMax) {
        return {
          status: false,
          title: 'Máximo permitido!!',
          message: `Você ultrapassou o máximo de opções permitidas que é ${getMax}`,
        };
      }
    }
    return {status: true};
  } catch (err) {
    return {
      status: false,
      title: 'Oops',
      message: 'Não foi possível adicionar Item',
    };
  }
};

const decrement = qtd => {
  try {
    let itemQtd = qtd - 1;
    itemQtd = itemQtd < 0 ? 0 : itemQtd;
    return {
      status: true,
      payload: itemQtd,
    };
  } catch (err) {
    return {
      status: false,
      title: 'Oops',
      message: 'Não foi possível remover Item',
    };
  }
};

const totalItem = (qtd, product, check, radio) => {
  try {
    if (!qtd || qtd <= 0) {
      return '0,00';
    }

    let total = 0;

    if (check) {
      // if (isPizza(product)) {
      //   var greater = 0;
      //   var numChecks = 0;
      //   check.map(c => {
      //     numChecks++;
      //     if (c.price > greater) {
      //       greater = c.price;
      //     }
      //   });

      //   total = greater * numChecks;
      // } else {
      check.map(c => {
        total = total + c.price;
      });
      // }
    }

    if (radio) {
      radio.map(r => {
        total += r.price;
      });
    }

    if (product.pricePromotion) {
      total += product.pricePromotion;
    } else {
      total += product.price;
    }

    total = total * qtd;
    return formatterAmount(total);
  } catch (err) {
    console.log('Error gerado', err);
    return '';
  }
};

const isPizza = product => {
  switch (product.category) {
    case '601ae0b80d1cd8208b52134c':
      return true;

    case '601b24200d1cd890b9521569':
      return true;

    case '601c38d60d1cd830ba52197e':
      return true;

    case '601b50960d1cd86183521621':
      return true;

    case '6019c2b00d1cd86c47520add':
      return true;

    case '601b0e170d1cd837ce5214ce':
      return true;

    case '601b57850d1cd8460d521656':
      return true;

    default:
      return false;
  }
};

const priceNormal = item => {
  try {
    let total = 0;
    total += item.price;

    if (item.radio) {
      item.radio.map(r => {
        total += r.price;
      });
    }

    if (item.check) {
      if (isPizza(item.product)) {
        var greater = 0;
        var numChecks = 0;
        item.check.map(c => {
          numChecks++;
          if (c.price > greater) {
            greater = c.price;
          }
        });

        total = greater * numChecks;
      } else {
        item.check.map(r => {
          total += r.price;
        });
      }
    }

    total *= item.amount;
    return formatterAmount(total);
  } catch (err) {
    return '';
  }
};

const pricePromotion = item => {
  try {
    if (!item || !item.pricePromotion) {
      return null;
    }

    let total = 0;
    total += item.pricePromotion;

    if (item.radio) {
      item.radio.map(r => {
        total += r.price;
      });
    }

    if (item.check) {
      item.check.map(r => {
        total += r.price;
      });
    }

    total *= item.amount;
    return formatterAmount(total);
  } catch (err) {
    return '';
  }
};

export {
  checkItens,
  increment,
  decrement,
  totalItem,
  priceNormal,
  pricePromotion,
};
