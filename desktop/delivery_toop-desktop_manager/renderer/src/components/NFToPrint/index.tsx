import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { forwardRef, ForwardRefRenderFunction, Fragment } from 'react';

import { Order } from '../../@types/order';
import { removeAccents } from '../../utils';

interface DataToPrint {
  data: Order;
}

const paymentMethodLabel: Record<string, string> = {
  credit_card: 'CARTÃO',
  debit_card: 'CARTÃO DE DÉBITO',
  money: 'DINHEIRO',
  pix: 'PIX',
  CARD: 'CARTÃO',
  MONEY: 'DINHEIRO',
  PIX: 'PIX',
};

const PrintableComponent: ForwardRefRenderFunction<
  HTMLTableElement,
  DataToPrint
> = ({ data }, ref) => {
  const order = data;

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
          <th colSpan={3}>
            {removeAccents(order?.customer?.name || order?.customer?.person?.[0]?.name || 'Cliente')}
          </th>
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
        {order?.items?.map((item, idx) => (
          <Fragment key={idx}>
            <tr className="top">
              <td colSpan={3}>{removeAccents(item?.name)}</td>
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
                  minimumFractionDigits: 0,
                }).format(item?.quantity)}
              </td>
              <td>
                {new Intl.NumberFormat('pt-BR', {
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  style: 'currency',
                }).format(item?.total || item?.price * item?.quantity)}
              </td>
            </tr>
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
            }).format(order?.subtotal || 0)}
          </td>
        </tr>
        <tr className="ttu">
          <td colSpan={2}>Entrega</td>
          <td align="right">
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.deliveryFee || 0)}
          </td>
        </tr>
        {order?.discount > 0 && (
          <tr className="ttu">
            <td colSpan={2}>Descontos</td>
            <td align="right">
              -
              {new Intl.NumberFormat('pt-BR', {
                currency: 'BRL',
                minimumFractionDigits: 2,
                style: 'currency',
              }).format(order?.discount)}
            </td>
          </tr>
        )}
        <tr className="ttu">
          <td colSpan={2}>Total</td>
          <td align="right">
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.total || 0)}
          </td>
        </tr>
        <tr className="sup ttu p--0">
          <td colSpan={3}>
            <b>Pagamentos</b>
          </td>
        </tr>
        <tr className="ttu">
          <td colSpan={2}>Método</td>
          <td align="right">{paymentMethodLabel[order?.paymentMethod] || order?.paymentMethod || 'N/I'}</td>
        </tr>
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
