/* eslint-disable @typescript-eslint/class-name-casing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable curly */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/camelcase */

/** services */
import axios from 'axios';

/** helpers */

/** models */

export default class CustomerServices {
  public options: {
    method: 'POST' | 'PUT' | 'GET' | 'DELETE';
    headers: any;
    data: any;
    url: string;
    base_url: string;
  };

  constructor() {
    this.options = {
      url: `${process.env.IUGU_API}/customers`,
      base_url: `${process.env.IUGU_API}/`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          process.env.IUGU_TOKEN_API ?? '',
        ).toString('base64')}`,
      },
      data: {},
    };
  }

  public async saveInCustomer(record: iPayloadSave) {
    if (!record.customer_payment_id || !record.token) return false;

    try {
      this.options.method = 'POST';
      this.options.url = `${this.options.url}/${record.customer_payment_id}/payment_methods`;
      this.options.data = {
        description: record.name,
        token: record.token,
        set_as_default: true,
      };

      return await axios
        .request(this.options)
        .then(async (response) => {
          console.log('response.data',response.data);
          if (response.data && response.data.id) {
            return response.data;
          } else {
            return false;
          }
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao criar cartão do cliente na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async store(record: iPayloadStore) {
    try {
      this.options.method = 'POST';
      this.options.url = `${this.options.base_url}/payment_token`;
      this.options.data = {
        account_id: process.env.IUGU_ACCOUNT_ID,
        method: 'credit_card',
        test: `${process.env.PRODUCTION}` === 'true' ? false : true,
        data: record,
      };

      return await axios
        .request(this.options)
        .then(async (response) => {
          if (response.data && response.data.id) {
            return response.data;
          } else {
            return false;
          }
        })
        .catch(async (err) => {
          let error;
          if (err.response && err.response.data && err.response.data.errors) {
            error = err.response.data.errors;
          } else {
            error = err;
            console.error(err);
          }

          return error;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao criar cartão do cliente na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async destroy(record: iPayloadSave) {
    if (!record.customer_payment_id || !record.payment_id) return false;

    try {
      this.options.method = 'DELETE';
      this.options.url = `${this.options.url}/${record.customer_payment_id}/payment_methods/${record.payment_id}`;

      return await axios
        .request(this.options)
        .then(async (response: any) => {
          if (response.data && response.data.id) {
            return true;
          } else {
            return false;
          }
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao deletar cartão do cliente na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }
}

interface iPayloadSave {
  payment_id?: string;
  customer_payment_id?: string;
  name: string;
  token: string;
}

interface iPayloadStore {
  number: string;
  verification_value: string;
  first_name: string;
  last_name: string;
  month: string;
  year: string;
}
