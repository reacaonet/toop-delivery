/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { forwardRef, ForwardRefRenderFunction, Fragment } from 'react';

import { NewOrder } from '../../@types/dashboard';
/** Util */
import { removeAccents } from '../../utils';

interface DataToPrint {
  data: NewOrder;
}

const PrintableComponent: ForwardRefRenderFunction<
  HTMLTableElement,
  DataToPrint
> = ({ data }, ref) => {
  const { cart, order } = data;

  return (
    <table ref={ref} className="printer-ticket">
      <thead>
        <tr>
          <td align="center" colSpan={3}>
            <img src="/images/icon.png" alt="Toop Logo" />
          </td>
        </tr>
        <tr>
          <th colSpan={3}>
            {format(new Date(), "dd 'de' MMMM 'de' yyyy - hh:mm:ss", {
              locale: ptBR,
            })}
          </th>
        </tr>
        <tr>
          <th colSpan={3}>{removeAccents(order?.customer?.person[0].name)}</th>
        </tr>
        <tr>
          <th className="ttu" colSpan={3}>
            <b>Cupom Fiscal</b>
            <br />
            <small>
              **Não substitui e nem tem o mesmo valor da Nota Fiscal
            </small>
          </th>
        </tr>
      </thead>
      <tbody>
        {cart?.map(item => (
          <Fragment key={item?._id}>
            <tr className="top">
              <td colSpan={3}>{removeAccents(item?.foodProduct?.name)}</td>
            </tr>
            <tr>
              <td>
                {new Intl.NumberFormat('pt-BR', {
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  style: 'currency',
                }).format(item?.price || 0)}
              </td>
              <td>
                {new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 1,
                }).format(item?.amount)}
              </td>
              <td>
                {new Intl.NumberFormat('pt-BR', {
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  style: 'currency',
                }).format(item?.price * item?.amount)}
              </td>
            </tr>
            {item?.complements?.map(complement => (
              <Fragment key={complement?._id}>
                <tr>
                  <td className="complement-text" colSpan={2}>
                    {complement?.foodProductComplement.name.trim()}:{' '}
                    {complement?.name}
                  </td>
                  <td align="right">
                    {new Intl.NumberFormat('pt-BR', {
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                      style: 'currency',
                    }).format(complement?.price)}
                  </td>
                </tr>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </tbody>
      <tfoot>
        <tr className="sup ttu p--0">
          <td colSpan={3}>
            <b>Totais</b>
          </td>
        </tr>
        <tr className="ttu">
          <td colSpan={2}>Sub-total</td>
          <td align="right">
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.payment?.totalCompany)}
          </td>
        </tr>
        {order?.payment?.serviceCharge > 0 && (
          <tr className="ttu">
            <td colSpan={2}>Taxa de serviço</td>
            <td align="right">
              {new Intl.NumberFormat('pt-BR', {
                currency: 'BRL',
                minimumFractionDigits: 2,
                style: 'currency',
              }).format(order?.payment?.serviceCharge)}
            </td>
          </tr>
        )}
        <tr className="ttu">
          <td colSpan={2}>Entrega</td>
          <td align="right">
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.payment?.priceDelivery)}
          </td>
        </tr>
        <tr className="ttu">
          <td colSpan={2}>Gorjeta</td>
          <td align="right">
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.payment?.valueTip)}
          </td>
        </tr>
        <tr className="ttu">
          <td colSpan={2}>Descontos</td>
          <td align="right">
            -
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.payment?.couponPrice)}
          </td>
        </tr>
        <tr className="ttu">
          <td colSpan={2}>Total</td>
          <td align="right">
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.payment?.total)}
          </td>
        </tr>
        <tr className="sup ttu p--0">
          <td colSpan={3}>
            <b>Pagamentos</b>
          </td>
        </tr>
        {order?.payment?.typePayment === 'MONEY' && (
          <>
            <tr className="ttu">
              <td colSpan={2}>Método</td>
              <td align="right">Dinheiro</td>
            </tr>
            <tr className="ttu">
              <td colSpan={2}>Total Pago</td>
              <td align="right">
                {new Intl.NumberFormat('pt-BR', {
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  style: 'currency',
                }).format(order?.payment?.cashChange)}
              </td>
            </tr>
            {order?.payment?.cashChange - order?.payment?.total > 0 && (
              <tr className="ttu">
                <td colSpan={2}>Troco</td>
                <td align="right">
                  {new Intl.NumberFormat('pt-BR', {
                    currency: 'BRL',
                    minimumFractionDigits: 2,
                    style: 'currency',
                  }).format(order?.payment?.cashChange - order?.payment?.total)}
                </td>
              </tr>
            )}
          </>
        )}
        {order?.payment?.typePayment === 'CARD' && (
          <tr className="ttu">
            <td colSpan={2}>Método</td>
            <td align="right">Cartão</td>
          </tr>
        )}
        <tr className="sup">
          <td colSpan={3} align="center">
            <b>Obrigado!</b>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export const NFToPrint = forwardRef(PrintableComponent);
