import React, {FunctionComponent} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import {nextOrderStatus} from '../../services/provider/shopping/order';
import {Typography, Colors} from '../../styles';
import {formatMoney, capitalize} from '../../utils';

type OrderStatusBtnProps = {
  status: string;
  onPress: Function;
  load: boolean;
  cartItem: any;
  cartUser: any;
  onAdd: Function;
  typeSchedule: string;
  dispachPress: Function;
  isDispach: Boolean;
};

const OrderStatusBtn: FunctionComponent<OrderStatusBtnProps> = ({
  status,
  cartItem,
  onPress,
  load,
  cartUser,
  onAdd,
  typeSchedule,
  dispachPress,
  isDispach,
}: OrderStatusBtnProps) => {
  const titleStatus = () => {
    switch (status) {
      case 'WAIT_COMPANY':
        return 'Aceitar';
      case 'ACCEPT_SHOPPER':
        return 'Iniciar Separação';
      case 'IN_PREPARATION':
        return 'Procurar entregador';
      case 'FINISH_PREPARATION':
        return 'Liberar para o Caixa';
      case 'MARKET_CASHIER':
        return 'Procurar entregador';
      case 'WAIT_DELIVERYMAN':
        return 'Buscando entregador';
      case 'ACCEPT_DELIVERYMAN':
        return 'Liberar Entrega';
      case 'RELEASE_SHOPPER':
        return 'Aguard. confirmação';
      case 'DISPATCH':
        return 'Entregador em rota';
      case 'DELIVERY_ROUTE':
        return 'Entregador em rota';
      case 'FINISHED':
        return 'Finalizado';
      case 'CANCELED':
        return 'Cancelado';
      default:
        return '';
    }
  };

  const itensProduct = () => {
    try {
      return cartItem.length;
    } catch (err) {
      return '';
    }
  };

  const onClick = () => {
    let next: string = nextStatus();
    onPress(next);
  };

  const nextStatus = () => {
    return nextOrderStatus(status);
  };

  const totalPrice = () => {
    try {
      let total = cartUser.subTotal;
      //let deliveryFee = cartUser.deliveryFee ? cartUser.deliveryFee : 0;
      return formatMoney(total);
    } catch (err) {
      return '';
    }
  };

  return (
    <>
      {/* <TouchableOpacity style={styles.iconContainer} onPress={() => onAdd()}>
        <Icon name="add-circle" size={50} style={styles.iconAdd} />
      </TouchableOpacity> */}
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.itemContent}>
            <Text style={styles.txtItem}>{itensProduct()}</Text>
            <Text style={styles.txtItem}>Itens</Text>
          </View>

          {typeSchedule !== 'WITHDRAWAL' || status === 'WAIT_COMPANY' ? (
            <View style={styles.btnContainer}>
              {!isDispach || status === 'WAIT_COMPANY' ? (
                <View style={styles.buttonContent}>
                  {status === 'WAIT_DELIVERYMAN' ||
                  status === 'RELEASE_SHOPPER' ||
                  status === 'DELIVERY_ROUTE' ||
                  status === 'DISPATCH' ||
                  status === 'CANCELED' ||
                  status === 'FINISHED' ? (
                    <View style={styles.disabled}>
                      <Text style={styles.title}>
                        {capitalize(titleStatus())}
                      </Text>
                    </View>
                  ) : (
                    <ButtonPrimary
                      title={titleStatus()}
                      onPress={() => {
                        onClick();
                      }}
                      load={load}
                    />
                  )}
                </View>
              ) : null}

              {isDispach ? (
                <View style={[styles.buttonContent, styles.mt5]}>
                  {status === 'FINISHED' ? (
                    <View style={styles.disabled}>
                      <Text style={styles.title}>
                        {capitalize(titleStatus())}
                      </Text>
                    </View>
                  ) : (
                    <ButtonPrimary
                      title={
                        status === 'DISPATCH'
                          ? 'Finalizar'
                          : 'Entregador Próprio'
                      }
                      onPress={() => {
                        dispachPress(
                          status === 'DISPATCH' ? 'FINISHED' : 'DISPATCH',
                        );
                      }}
                      load={load}
                    />
                  )}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={[styles.buttonContent]}>
              {status === 'FINISHED' ? (
                <View style={styles.disabled}>
                  <Text style={styles.title}>{capitalize(titleStatus())}</Text>
                </View>
              ) : (
                <ButtonPrimary
                  title={'Pedido Retirado'}
                  onPress={() => {
                    dispachPress('FINISHED');
                  }}
                  load={load}
                />
              )}
            </View>
          )}

          <View style={styles.priceContent}>
            <Text style={styles.txtPrice}>{totalPrice()}</Text>
            <Text style={styles.txtPrice}>Total R$</Text>
          </View>
        </View>
      </View>
    </>
  );
};

export default OrderStatusBtn;

const styles = StyleSheet.create({
  title: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    fontWeight: 'bold',
  },
  disabled: {
    width: '100%',
    backgroundColor: Colors.GREY,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    elevation: 8,
  },
  container: {
    flex: 1,
    borderColor: Colors.PRIMARY,
    borderTopWidth: 0.7,
    zIndex: 1,
    paddingVertical: 10,
  },
  btnContainer: {
    flex: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginBottom: -20,
  },
  iconAdd: {
    color: Colors.PRIMARY,
  },
  itemContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtItem: {
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_15,
  },
  buttonContent: {
    flex: 3,
    marginHorizontal: 10,
  },
  mt5: {
    marginTop: 5,
  },
  priceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtPrice: {
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_15,
  },
});
